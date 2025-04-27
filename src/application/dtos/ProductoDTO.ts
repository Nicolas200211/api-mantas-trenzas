import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Producto, ProductoProps } from '../../domain/entities/Producto';

export class CreateProductoDTO {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion!: string;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  precio!: number;

  @IsNotEmpty({ message: 'La categoría es requerida' })
  @IsString({ message: 'La categoría debe ser un texto' })
  categoria!: string;

  @IsNotEmpty({ message: 'El artesano es requerido' })
  @IsString({ message: 'El artesano debe ser un texto' })
  artesano!: string;

  @IsNotEmpty({ message: 'El stock es requerido' })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock!: number;

  toEntity(): Producto {
    return new Producto({
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      categoria: this.categoria,
      artesano: this.artesano,
      stock: this.stock
    });
  }
}

export class UpdateProductoDTO {
  @IsNotEmpty({ message: 'El ID es requerido' })
  @IsNumber({}, { message: 'El ID debe ser un número' })
  id!: number;

  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  precio?: number;

  @IsString({ message: 'La categoría debe ser un texto' })
  categoria?: string;

  @IsString({ message: 'El artesano debe ser un texto' })
  artesano?: string;

  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock?: number;

  toEntity(existingProducto: Producto): Producto {
    const props: ProductoProps = {
      id: this.id,
      nombre: this.nombre || existingProducto.getNombre,
      descripcion: this.descripcion || existingProducto.getDescripcion,
      precio: this.precio || existingProducto.getPrecio,
      categoria: this.categoria || existingProducto.getCategoria,
      artesano: this.artesano || existingProducto.getArtesano,
      stock: this.stock || existingProducto.getStock
    };

    return new Producto(props);
  }
}

export class ProductoResponseDTO {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  artesano: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(producto: Producto) {
    this.id = producto.getId as number;
    this.nombre = producto.getNombre;
    this.descripcion = producto.getDescripcion;
    this.precio = producto.getPrecio;
    this.categoria = producto.getCategoria;
    this.artesano = producto.getArtesano;
    this.stock = producto.getStock;
    this.createdAt = producto.getCreatedAt as Date;
    this.updatedAt = producto.getUpdatedAt as Date;
  }
}