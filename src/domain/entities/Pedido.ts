export interface PedidoProps {
  id?: number;
  usuarioId: number;
  estado: EstadoPedido;
  total: number;
  direccionEnvio: string;
  metodoPago: MetodoPago;
  referenciaPago?: string;
  items: PedidoItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PedidoItem {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado'
}

export enum MetodoPago {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  TRANSFERENCIA = 'transferencia'
}

export class Pedido {
  private readonly id?: number;
  private usuarioId: number;
  private estado: EstadoPedido;
  private total: number;
  private direccionEnvio: string;
  private metodoPago: MetodoPago;
  private referenciaPago?: string;
  private items: PedidoItem[];
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: PedidoProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.estado = props.estado || EstadoPedido.PENDIENTE;
    this.total = props.total;
    this.direccionEnvio = props.direccionEnvio;
    this.metodoPago = props.metodoPago;
    this.referenciaPago = props.referenciaPago;
    this.items = props.items || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get getId(): number | undefined {
    return this.id;
  }

  get getUsuarioId(): number {
    return this.usuarioId;
  }

  get getEstado(): EstadoPedido {
    return this.estado;
  }

  get getTotal(): number {
    return this.total;
  }

  get getDireccionEnvio(): string {
    return this.direccionEnvio;
  }

  get getMetodoPago(): MetodoPago {
    return this.metodoPago;
  }

  get getReferenciaPago(): string | undefined {
    return this.referenciaPago;
  }

  get getItems(): PedidoItem[] {
    return [...this.items];
  }

  get getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  get getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  // Setters
  set setUsuarioId(usuarioId: number) {
    this.usuarioId = usuarioId;
    this.updatedAt = new Date();
  }

  set setEstado(estado: EstadoPedido) {
    this.estado = estado;
    this.updatedAt = new Date();
  }

  set setTotal(total: number) {
    this.total = total;
    this.updatedAt = new Date();
  }

  set setDireccionEnvio(direccionEnvio: string) {
    this.direccionEnvio = direccionEnvio;
    this.updatedAt = new Date();
  }

  set setMetodoPago(metodoPago: MetodoPago) {
    this.metodoPago = metodoPago;
    this.updatedAt = new Date();
  }

  set setReferenciaPago(referenciaPago: string) {
    this.referenciaPago = referenciaPago;
    this.updatedAt = new Date();
  }

  // Métodos
  public addItem(item: PedidoItem): void {
    this.items.push(item);
    this.recalcularTotal();
    this.updatedAt = new Date();
  }

  public removeItem(productoId: number): void {
    this.items = this.items.filter(item => item.productoId !== productoId);
    this.recalcularTotal();
    this.updatedAt = new Date();
  }

  public updateItemCantidad(productoId: number, cantidad: number): void {
    const item = this.items.find(item => item.productoId === productoId);
    if (item) {
      item.cantidad = cantidad;
      item.subtotal = item.precioUnitario * cantidad;
      this.recalcularTotal();
      this.updatedAt = new Date();
    }
  }

  private recalcularTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      estado: this.estado,
      total: this.total,
      direccionEnvio: this.direccionEnvio,
      metodoPago: this.metodoPago,
      referenciaPago: this.referenciaPago,
      items: this.items,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}