import { IsNotEmpty, IsNumber, IsString, IsEnum, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Pedido, PedidoItem, EstadoPedido, MetodoPago } from '../../domain/entities/Pedido';

export class PedidoItemDTO {
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  productoId!: number;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  cantidad!: number;

  @IsNotEmpty({ message: 'El precio unitario es requerido' })
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precioUnitario!: number;

  @IsNotEmpty({ message: 'El subtotal es requerido' })
  @IsNumber({}, { message: 'El subtotal debe ser un número' })
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  subtotal!: number;
}

export class CreatePedidoDTO {
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId!: number;

  @IsNotEmpty({ message: 'La dirección de envío es requerida' })
  @IsString({ message: 'La dirección de envío debe ser un texto' })
  direccionEnvio!: string;

  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsEnum(MetodoPago, { message: 'Método de pago inválido' })
  metodoPago!: MetodoPago;

  @IsOptional()
  @IsString({ message: 'La referencia de pago debe ser un texto' })
  referenciaPago?: string;

  @IsNotEmpty({ message: 'Los items del pedido son requeridos' })
  @IsArray({ message: 'Los items deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDTO)
  items!: PedidoItemDTO[];

  toEntity(): Pedido {
    // Calcular el total basado en los items
    const total = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    return new Pedido({
      usuarioId: this.usuarioId,
      estado: EstadoPedido.PENDIENTE,
      total,
      direccionEnvio: this.direccionEnvio,
      metodoPago: this.metodoPago,
      referenciaPago: this.referenciaPago,
      items: this.items
    });
  }
}

export class UpdatePedidoDTO {
  @IsOptional()
  @IsString({ message: 'La dirección de envío debe ser un texto' })
  direccionEnvio?: string;

  @IsOptional()
  @IsEnum(EstadoPedido, { message: 'Estado inválido' })
  estado?: EstadoPedido;

  @IsOptional()
  @IsEnum(MetodoPago, { message: 'Método de pago inválido' })
  metodoPago?: MetodoPago;

  @IsOptional()
  @IsString({ message: 'La referencia de pago debe ser un texto' })
  referenciaPago?: string;
}

export class PedidoResponseDTO {
  id: number | undefined;
  usuarioId: number;
  estado: EstadoPedido;
  total: number;
  direccionEnvio: string;
  metodoPago: MetodoPago;
  referenciaPago?: string;
  items: PedidoItem[];
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  constructor(pedido: Pedido) {
    this.id = pedido.getId;
    this.usuarioId = pedido.getUsuarioId;
    this.estado = pedido.getEstado;
    this.total = pedido.getTotal;
    this.direccionEnvio = pedido.getDireccionEnvio;
    this.metodoPago = pedido.getMetodoPago;
    this.referenciaPago = pedido.getReferenciaPago;
    this.items = pedido.getItems;
    this.createdAt = pedido.getCreatedAt;
    this.updatedAt = pedido.getUpdatedAt;
  }
}

export class ProcesarPagoDTO {
  @IsNotEmpty({ message: 'La información de pago es requerida' })
  paymentInfo!: any;
}