import { IPedidoService } from "../../domain/services/interfaces/IPedidoService";
import { IPedidoRepository } from "../../domain/repositories/IPedidoRepository";
import { Pedido, EstadoPedido } from "../../domain/entities/Pedido";
import { logger } from "../../infrastructure/config/logger";

export class PedidoService implements IPedidoService {
  private readonly pedidoRepository: IPedidoRepository;

  constructor(pedidoRepository: IPedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  async getAllPedidos(): Promise<Pedido[]> {
    try {
      return await this.pedidoRepository.findAll();
    } catch (error) {
      logger.error(`Error al obtener todos los pedidos: ${(error as Error).message}`);
      throw error;
    }
  }

  async getPedidoById(id: number): Promise<Pedido | null> {
    try {
      return await this.pedidoRepository.findById(id);
    } catch (error) {
      logger.error(`Error al obtener pedido por ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getPedidosByUsuarioId(usuarioId: number): Promise<Pedido[]> {
    try {
      return await this.pedidoRepository.findByUsuarioId(usuarioId);
    } catch (error) {
      logger.error(`Error al obtener pedidos del usuario ${usuarioId}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getPedidosByEstado(estado: EstadoPedido): Promise<Pedido[]> {
    try {
      return await this.pedidoRepository.findByEstado(estado);
    } catch (error) {
      logger.error(`Error al obtener pedidos con estado ${estado}: ${(error as Error).message}`);
      throw error;
    }
  }

  async createPedido(pedido: Pedido): Promise<Pedido> {
    try {
      return await this.pedidoRepository.create(pedido);
    } catch (error) {
      logger.error(`Error al crear pedido: ${(error as Error).message}`);
      throw error;
    }
  }

  async updatePedido(pedido: Pedido): Promise<Pedido> {
    try {
      return await this.pedidoRepository.update(pedido);
    } catch (error) {
      logger.error(`Error al actualizar pedido ${pedido.getId}: ${(error as Error).message}`);
      throw error;
    }
  }

  async deletePedido(id: number): Promise<void> {
    try {
      await this.pedidoRepository.delete(id);
    } catch (error) {
      logger.error(`Error al eliminar pedido ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async updateEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
    try {
      return await this.pedidoRepository.updateEstado(id, estado);
    } catch (error) {
      logger.error(`Error al actualizar estado del pedido ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async procesarPago(pedidoId: number, paymentInfo: any): Promise<{ success: boolean; referenciaPago?: string; error?: string }> {
    try {
      // Obtener el pedido
      const pedido = await this.pedidoRepository.findById(pedidoId);
      if (!pedido) {
        return { success: false, error: `Pedido con ID ${pedidoId} no encontrado` };
      }

      // Verificar que el pedido esté en estado pendiente
      if (pedido.getEstado !== EstadoPedido.PENDIENTE) {
        return { success: false, error: `El pedido no está en estado pendiente` };
      }

      // Procesar el pago según el método de pago
      let referenciaPago = '';
      switch (pedido.getMetodoPago) {
        case 'stripe':
          // Aquí iría la lógica para procesar el pago con Stripe
          referenciaPago = `stripe_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          break;
        case 'paypal':
          // Aquí iría la lógica para procesar el pago con PayPal
          referenciaPago = `paypal_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          break;
        case 'transferencia':
          // Para transferencia, simplemente registramos la referencia
          referenciaPago = paymentInfo.referencia || `transfer_${Date.now()}`;
          break;
        default:
          return { success: false, error: 'Método de pago no soportado' };
      }

      // Actualizar el pedido con la referencia de pago y cambiar estado a PAGADO
      await this.pedidoRepository.updateReferenciaPago(pedidoId, referenciaPago);
      await this.pedidoRepository.updateEstado(pedidoId, EstadoPedido.PAGADO);

      return { success: true, referenciaPago };
    } catch (error) {
      logger.error(`Error al procesar pago del pedido ${pedidoId}: ${(error as Error).message}`);
      return { success: false, error: (error as Error).message };
    }
  }
}