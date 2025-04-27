import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { IPedidoService } from '../../domain/services/interfaces/IPedidoService';
import { verifyToken, checkRole } from '../middlewares/authMiddleware';

/**
 * Crea y configura el router para las rutas de pedidos
 */
export const createPedidoRouter = (pedidoService: IPedidoService): Router => {
  const router = Router();
  const pedidoController = new PedidoController(pedidoService);

  /**
   * @swagger
   * tags:
   *   name: Pedidos
   *   description: API para gestionar pedidos
   */

  // Rutas protegidas - requieren autenticación
  router.get('/', verifyToken, checkRole(['admin']), pedidoController.getPedidos.bind(pedidoController));
  router.get('/:id', verifyToken, pedidoController.getPedidoById.bind(pedidoController));
  router.get('/usuario/:usuarioId', verifyToken, pedidoController.getPedidosByUsuarioId.bind(pedidoController));
  router.post('/', verifyToken, pedidoController.createPedido.bind(pedidoController));
  router.put('/:id', verifyToken, pedidoController.updatePedido.bind(pedidoController));
  router.delete('/:id', verifyToken, checkRole(['admin']), pedidoController.deletePedido.bind(pedidoController));
  router.post('/:id/pago', verifyToken, pedidoController.procesarPago.bind(pedidoController));
  router.patch('/:id/estado', verifyToken, checkRole(['admin']), pedidoController.updateEstado.bind(pedidoController));

  return router;
};