import { Pedido } from "../entities/Pedido";
import { EstadoPedido } from "../entities/Pedido";

export interface IPedidoRepository {
  /**
   * Obtiene todos los pedidos
   */
  findAll(): Promise<Pedido[]>;

  /**
   * Obtiene un pedido por su ID
   * @param id ID del pedido
   */
  findById(id: number): Promise<Pedido | null>;

  /**
   * Obtiene todos los pedidos de un usuario
   * @param usuarioId ID del usuario
   */
  findByUsuarioId(usuarioId: number): Promise<Pedido[]>;

  /**
   * Obtiene pedidos por estado
   * @param estado Estado del pedido
   */
  findByEstado(estado: EstadoPedido): Promise<Pedido[]>;

  /**
   * Crea un nuevo pedido
   * @param pedido Pedido a crear
   */
  create(pedido: Pedido): Promise<Pedido>;

  /**
   * Actualiza un pedido existente
   * @param pedido Pedido con los datos actualizados
   */
  update(pedido: Pedido): Promise<Pedido>;

  /**
   * Elimina un pedido
   * @param id ID del pedido a eliminar
   */
  delete(id: number): Promise<void>;

  /**
   * Actualiza el estado de un pedido
   * @param id ID del pedido
   * @param estado Nuevo estado del pedido
   */
  updateEstado(id: number, estado: EstadoPedido): Promise<Pedido>;

  /**
   * Actualiza la referencia de pago de un pedido
   * @param id ID del pedido
   * @param referenciaPago Referencia del pago
   */
  updateReferenciaPago(id: number, referenciaPago: string): Promise<Pedido>;
}