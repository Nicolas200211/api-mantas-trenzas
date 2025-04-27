import { Producto } from "../../domain/entities/Producto";
import { IProductoRepository } from "../../domain/repositories/interfaces/IProductoRepository";
import { IProductoService, ProductoFilters } from "../../domain/services/interfaces/IProductoService";
import { logger } from "../../infrastructure/config/logger";
// import { cacheService } from "../../infrastructure/config/redis";
import { cacheService } from "../../infrastructure/config/mockCache";
import { elasticsearchService } from "../../infrastructure/config/elasticsearch";

// Definir interfaces para los servicios externos para evitar referencias circulares
interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

interface IElasticsearchService {
  indexProduct(producto: any): Promise<void>;
  searchProducts(query: string, filters?: any, page?: number, size?: number): Promise<any>;
  deleteProduct(id: number): Promise<void>;
}

export class ProductoService implements IProductoService {
  private readonly productoRepository: IProductoRepository;
  private readonly elasticsearchService: IElasticsearchService;
  private readonly cacheService: ICacheService;

  constructor(
    productoRepository: IProductoRepository,
    elasticsearchService: IElasticsearchService,
    cacheService: ICacheService
  ) {
    this.productoRepository = productoRepository;
    this.elasticsearchService = elasticsearchService;
    this.cacheService = cacheService;
  }

  async getAllProductos(): Promise<Producto[]> {
    try {
      // Intentar obtener de caché primero
      const cachedProductos = await this.cacheService.get('all_productos');
      if (cachedProductos && cachedProductos !== '') {
        logger.info('Productos obtenidos desde caché');
        return JSON.parse(cachedProductos).map((p: any) => new Producto(p));
      }

      // Si no está en caché, obtener de la base de datos
      const productos = await this.productoRepository.findAll();

      // Guardar en caché por 5 minutos
      await this.cacheService.set(
        'all_productos',
        JSON.stringify(productos.map(p => this.productoToObject(p))),
        300
      );

      return productos;
    } catch (error) {
      logger.error(`Error al obtener todos los productos: ${(error as Error).message}`);
      throw error;
    }
  }

  async getProductoById(id: number): Promise<Producto | null> {
    try {
      // Intentar obtener de caché primero
      const cacheKey = `producto_${id}`;
      const cachedProducto = await this.cacheService.get(cacheKey);

      if (cachedProducto && cachedProducto !== '') {
        logger.info(`Producto ${id} obtenido desde caché`);
        return new Producto(JSON.parse(cachedProducto));
      }

      // Si no está en caché, obtener de la base de datos
      const producto = await this.productoRepository.findById(id);

      if (producto) {
        // Guardar en caché por 5 minutos
        await this.cacheService.set(
          cacheKey,
          JSON.stringify(this.productoToObject(producto)),
          300
        );
      }

      return producto;
    } catch (error) {
      logger.error(`Error al obtener producto por ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getProductosByCategoria(categoria: string): Promise<Producto[]> {
    try {
      // Intentar obtener de caché primero
      const cacheKey = `productos_categoria_${categoria}`;
      const cachedProductos = await this.cacheService.get(cacheKey);

      if (cachedProductos && cachedProductos !== '') {
        logger.info(`Productos de categoría ${categoria} obtenidos desde caché`);
        return JSON.parse(cachedProductos).map((p: any) => new Producto(p));
      }

      // Si no está en caché, obtener de la base de datos
      const productos = await this.productoRepository.findByCategoria(categoria);

      // Guardar en caché por 5 minutos
      await this.cacheService.set(
        cacheKey,
        JSON.stringify(productos.map(p => this.productoToObject(p))),
        300
      );

      return productos;
    } catch (error) {
      logger.error(`Error al obtener productos por categoría ${categoria}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getProductosByFilters(filters: ProductoFilters): Promise<Producto[]> {
    try {
      // Usamos directamente MySQL para evitar errores con Elasticsearch
      // El servicio mock de Elasticsearch nunca devolverá resultados
      return await this.productoRepository.findByFilters(filters);
    } catch (error) {
      logger.error(`Error al obtener productos por filtros: ${(error as Error).message}`);
      return [];
    }
  }

  async createProducto(producto: Producto): Promise<Producto> {
    try {
      // Guardar en la base de datos
      const savedProducto = await this.productoRepository.save(producto);

      // Invalidar caché de todos los productos
      await this.cacheService.del('all_productos');

      // Comentamos la indexación en ElasticSearch para evitar errores de conexión
      // await this.elasticsearchService.indexProduct(this.productoToObject(savedProducto));

      return savedProducto;
    } catch (error) {
      logger.error(`Error al crear producto: ${(error as Error).message}`);
      throw error;
    }
  }

  async updateProducto(producto: Producto): Promise<Producto> {
    try {
      const existingProducto = await this.productoRepository.findById(producto.getId as number);

      if (!existingProducto) {
        throw new Error(`Producto con ID ${producto.getId} no encontrado`);
      }

      // Actualizar en la base de datos
      const updatedProducto = await this.productoRepository.update(producto);

      // Invalidar cachés
      const id = producto.getId;
      if (id) {
        await this.cacheService.del(`producto_${id}`);
      }
      await this.cacheService.del('all_productos');

      // Comentamos la actualización en ElasticSearch para evitar errores de conexión
      // await this.elasticsearchService.indexProduct(this.productoToObject(updatedProducto));

      return updatedProducto;
    } catch (error) {
      logger.error(`Error al actualizar producto: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteProducto(id: number): Promise<void> {
    try {
      const existingProducto = await this.productoRepository.findById(id);

      if (!existingProducto) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      // Eliminar de la base de datos
      await this.productoRepository.delete(id);

      // Invalidar cachés
      await this.cacheService.del(`producto_${id}`);
      await this.cacheService.del('all_productos');

      // Comentamos la eliminación en ElasticSearch para evitar errores de conexión
      // await this.elasticsearchService.deleteProduct(id);
    } catch (error) {
      logger.error(`Error al eliminar producto con ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  // Método auxiliar para convertir un objeto Producto a un objeto plano
  private productoToObject(producto: Producto): Record<string, any> {
    return {
      id: producto.getId,
      nombre: producto.getNombre,
      descripcion: producto.getDescripcion,
      precio: producto.getPrecio,
      categoria: producto.getCategoria,
      artesano: producto.getArtesano,
      stock: producto.getStock,
      createdAt: producto.getCreatedAt,
      updatedAt: producto.getUpdatedAt
    };
  }
}