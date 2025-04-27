import { Pedido, EstadoPedido } from "../../entities/Pedido";

export interface IPedidoService {
  /**
   * Obtiene todos los pedidos
   */
  getAllPedidos(): Promise<Pedido[]>;

  /**
   * Obtiene un pedido por su ID
   * @param id ID del pedido
   */
  getPedidoById(id: number): Promise<Pedido | null>;

  /**
   * Obtiene todos los pedidos de un usuario
   * @param usuarioId ID del usuario
   */
  getPedidosByUsuarioId(usuarioId: number): Promise<Pedido[]>;

  /**
   * Obtiene pedidos por estado
   * @param estado Estado del pedido
   */
  getPedidosByEstado(estado: EstadoPedido): Promise<Pedido[]>;

  /**
   * Crea un nuevo pedido
   * @param pedido Pedido a crear
   */
  createPedido(pedido: Pedido): Promise<Pedido>;

  /**
   * Actualiza un pedido existente
   * @param pedido Pedido con los datos actualizados
   */
  updatePedido(pedido: Pedido): Promise<Pedido>;

  /**
   * Elimina un pedido
   * @param id ID del pedido a eliminar
   */
  deletePedido(id: number): Promise<void>;

  /**
   * Actualiza el estado de un pedido
   * @param id ID del pedido
   * @param estado Nuevo estado del pedido
   */
  updateEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido>;

  /**
   * Procesa el pago de un pedido
   * @param pedidoId ID del pedido
   * @param paymentInfo Información del pago
   */
  procesarPago(pedidoId: number, paymentInfo: any): Promise<{ success: boolean; referenciaPago?: string; error?: string }>;
}