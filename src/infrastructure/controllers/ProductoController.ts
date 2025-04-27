import { Request, Response } from 'express';
import { IProductoService } from '../../domain/services/interfaces/IProductoService';
import { CreateProductoDTO, ProductoResponseDTO, UpdateProductoDTO } from '../../application/dtos/ProductoDTO';
import { Producto } from '../../domain/entities/Producto';
import { validate } from 'class-validator';

export class ProductoController {
  private readonly productoService: IProductoService;

  constructor(productoService: IProductoService) {
    this.productoService = productoService;
  }

  /**
   * @swagger
   * /api/productos:
   *   get:
   *     summary: Obtiene todos los productos o filtra por parámetros
   *     description: |
   *       Retorna una lista de productos disponibles en la tienda.
   *       Puedes utilizar los parámetros de consulta para filtrar los resultados según tus necesidades.
   *       
   *       **Ejemplos de uso:**
   *       - Obtener todos los productos: `/api/productos`
   *       - Filtrar por categoría: `/api/productos?categoria=accesorios`
   *       - Filtrar por rango de precio: `/api/productos?precioMin=50000&precioMax=150000`
   *       - Filtrar por artesano: `/api/productos?artesano=María%20Pushaina`
   *       - Combinar filtros: `/api/productos?categoria=accesorios&precioMin=50000`
   *     tags: [Productos]
   *     parameters:
   *       - in: query
   *         name: categoria
   *         schema:
   *           type: string
   *         description: Filtrar productos por categoría (ropa, accesorios, cultura, llaveros, utensilios)
   *       - in: query
   *         name: precioMin
   *         schema:
   *           type: number
   *         description: Precio mínimo para filtrar productos (en pesos colombianos)
   *       - in: query
   *         name: precioMax
   *         schema:
   *           type: number
   *         description: Precio máximo para filtrar productos (en pesos colombianos)
   *       - in: query
   *         name: artesano
   *         schema:
   *           type: string
   *         description: Filtrar productos por nombre del artesano
   *     responses:
   *       200:
   *         description: Lista de productos obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Producto'
   *             example:
   *               - id: 1
   *                 nombre: "Mochila Wayuu"
   *                 descripcion: "Mochila artesanal de la cultura Wayuu con diseños tradicionales"
   *                 precio: 120000
   *                 categoria: "accesorios"
   *                 artesano: "María Pushaina"
   *                 stock: 10
   *                 createdAt: "2023-05-10T14:30:00Z"
   *                 updatedAt: "2023-05-10T14:30:00Z"
   *               - id: 2
   *                 nombre: "Pulsera Wayuu"
   *                 descripcion: "Pulsera tejida a mano con motivos tradicionales"
   *                 precio: 35000
   *                 categoria: "accesorios"
   *                 artesano: "Carlos Ipuana"
   *                 stock: 25
   *                 createdAt: "2023-05-12T10:15:00Z"
   *                 updatedAt: "2023-05-12T10:15:00Z"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             example:
   *               message: "Error al obtener productos"
   *               error: "Error de conexión a la base de datos"
   */
  public async getProductos(req: Request, res: Response): Promise<void> {
    try {
      const { categoria, precioMin, precioMax, artesano } = req.query;

      // Si hay filtros, usamos el método de filtrado
      if (categoria || precioMin || precioMax || artesano) {
        const filters = {
          categoria: categoria as string | undefined,
          precioMin: precioMin ? parseFloat(precioMin as string) : undefined,
          precioMax: precioMax ? parseFloat(precioMax as string) : undefined,
          artesano: artesano as string | undefined
        };

        const productos = await this.productoService.getProductosByFilters(filters);
        const productosDTO = productos.map(producto => new ProductoResponseDTO(producto));
        res.status(200).json(productosDTO);
        return;
      }

      // Si no hay filtros, obtenemos todos los productos
      const productos = await this.productoService.getAllProductos();
      const productosDTO = productos.map(producto => new ProductoResponseDTO(producto));
      res.status(200).json(productosDTO);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ message: 'Error al obtener productos', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/productos/{id}:
   *   get:
   *     summary: Obtiene un producto por su ID
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del producto
   *     responses:
   *       200:
   *         description: Producto encontrado
   *       404:
   *         description: Producto no encontrado
   *       500:
   *         description: Error del servidor
   */
  public async getProductoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const producto = await this.productoService.getProductoById(id);

      if (!producto) {
        res.status(404).json({ message: `Producto con ID ${id} no encontrado` });
        return;
      }

      const productoDTO = new ProductoResponseDTO(producto);
      res.status(200).json(productoDTO);
    } catch (error) {
      console.error(`Error al obtener producto:`, error);
      res.status(500).json({ message: 'Error al obtener producto', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/productos:
   *   post:
   *     summary: Crea un nuevo producto
   *     tags: [Productos]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateProductoDTO'
   *     responses:
   *       201:
   *         description: Producto creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       500:
   *         description: Error del servidor
   */
  public async createProducto(req: Request, res: Response): Promise<void> {
    try {
      const createProductoDTO = new CreateProductoDTO();
      Object.assign(createProductoDTO, req.body);

      // Validar DTO
      const errors = await validate(createProductoDTO);
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Convertir DTO a entidad
      const producto = createProductoDTO.toEntity();

      // Guardar producto
      const savedProducto = await this.productoService.createProducto(producto);

      // Convertir entidad guardada a DTO de respuesta
      const productoResponseDTO = new ProductoResponseDTO(savedProducto);

      res.status(201).json(productoResponseDTO);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ message: 'Error al crear producto', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/productos/{id}:
   *   put:
   *     summary: Actualiza un producto existente
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del producto
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateProductoDTO'
   *     responses:
   *       200:
   *         description: Producto actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Producto no encontrado
   *       500:
   *         description: Error del servidor
   */
  public async updateProducto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      // Verificar si el producto existe
      const existingProducto = await this.productoService.getProductoById(id);
      if (!existingProducto) {
        res.status(404).json({ message: `Producto con ID ${id} no encontrado` });
        return;
      }

      // Crear y validar DTO
      const updateProductoDTO = new UpdateProductoDTO();
      Object.assign(updateProductoDTO, { ...req.body, id });

      const errors = await validate(updateProductoDTO);
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Convertir DTO a entidad
      const productoToUpdate = updateProductoDTO.toEntity(existingProducto);

      // Actualizar producto
      const updatedProducto = await this.productoService.updateProducto(productoToUpdate);

      // Convertir entidad actualizada a DTO de respuesta
      const productoResponseDTO = new ProductoResponseDTO(updatedProducto);

      res.status(200).json(productoResponseDTO);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ message: 'Error al actualizar producto', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/productos/{id}:
   *   delete:
   *     summary: Elimina un producto
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del producto
   *     responses:
   *       204:
   *         description: Producto eliminado exitosamente
   *       404:
   *         description: Producto no encontrado
   *       500:
   *         description: Error del servidor
   */
  /**
   * @swagger
   * /api/productos/categoria/{categoria}:
   *   get:
   *     summary: Obtiene productos por categoría
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: categoria
   *         required: true
   *         schema:
   *           type: string
   *         description: Categoría de productos
   *     responses:
   *       200:
   *         description: Lista de productos por categoría
   *       500:
   *         description: Error del servidor
   */
  public async getProductosByCategoria(req: Request, res: Response): Promise<void> {
    try {
      const categoria = req.params.categoria;

      // Utilizamos el método de filtrado existente con solo la categoría
      const filters = {
        categoria: categoria,
        precioMin: undefined,
        precioMax: undefined,
        artesano: undefined
      };

      const productos = await this.productoService.getProductosByFilters(filters);
      const productosDTO = productos.map(producto => new ProductoResponseDTO(producto));

      res.status(200).json(productosDTO);
    } catch (error) {
      console.error(`Error al obtener productos por categoría:`, error);
      res.status(500).json({ message: 'Error al obtener productos por categoría', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/productos/{id}:
   *   delete:
   *     summary: Elimina un producto
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del producto
   *     responses:
   *       204:
   *         description: Producto eliminado exitosamente
   *       404:
   *         description: Producto no encontrado
   *       500:
   *         description: Error del servidor
   */
  public async deleteProducto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      // Verificar si el producto existe
      const existingProducto = await this.productoService.getProductoById(id);
      if (!existingProducto) {
        res.status(404).json({ message: `Producto con ID ${id} no encontrado` });
        return;
      }

      // Eliminar producto
      await this.productoService.deleteProducto(id);

      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ message: 'Error al eliminar producto', error: (error as Error).message });
    }
  }
}