import { Router } from 'express';
import { ProductoController } from '../controllers/ProductoController';
import { IProductoService } from '../../domain/services/interfaces/IProductoService';
import { verifyToken, checkRole } from '../middlewares/authMiddleware';

export const createProductoRouter = (productoService: IProductoService): Router => {
  const router = Router();
  const productoController = new ProductoController(productoService);
  /**
   * @swagger
   * tags:
   *   name: Productos
   *   description: API para gestionar productos
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     CreateProductoDTO:
   *       type: object
   *       required:
   *         - nombre
   *         - descripcion
   *         - precio
   *         - categoria
   *         - artesano
   *         - stock
   *       properties:
   *         nombre:
   *           type: string
   *           description: Nombre del producto
   *         descripcion:
   *           type: string
   *           description: Descripción detallada del producto
   *         precio:
   *           type: number
   *           description: Precio del producto
   *         categoria:
   *           type: string
   *           description: Categoría del producto (ropa, cultura, llaveros, utensilios)
   *         artesano:
   *           type: string
   *           description: Nombre del artesano que elaboró el producto
   *         stock:
   *           type: integer
   *           description: Cantidad disponible del producto
   *     UpdateProductoDTO:
   *       type: object
   *       properties:
   *         nombre:
   *           type: string
   *           description: Nombre del producto
   *         descripcion:
   *           type: string
   *           description: Descripción detallada del producto
   *         precio:
   *           type: number
   *           description: Precio del producto
   *         categoria:
   *           type: string
   *           description: Categoría del producto (ropa, cultura, llaveros, utensilios)
   *         artesano:
   *           type: string
   *           description: Nombre del artesano que elaboró el producto
   *         stock:
   *           type: integer
   *           description: Cantidad disponible del producto
   */

  // Rutas públicas
  router.get('/', productoController.getProductos.bind(productoController));
  router.get('/:id', productoController.getProductoById.bind(productoController));
  router.get('/categoria/:categoria', productoController.getProductosByCategoria.bind(productoController));

  // Rutas protegidas (requieren autenticación)
  router.post('/', verifyToken, productoController.createProducto.bind(productoController));
  router.put('/:id', verifyToken, productoController.updateProducto.bind(productoController));
  router.delete('/:id', verifyToken, checkRole(['admin']), productoController.deleteProducto.bind(productoController));

  return router;
};