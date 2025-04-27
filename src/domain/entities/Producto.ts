export interface ProductoProps {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  artesano: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Producto {
  private readonly id?: number;
  private nombre: string;
  private descripcion: string;
  private precio: number;
  private categoria: string;
  private artesano: string;
  private stock: number;
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: ProductoProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion;
    this.precio = props.precio;
    this.categoria = props.categoria;
    this.artesano = props.artesano;
    this.stock = props.stock;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get getId(): number | undefined {
    return this.id;
  }

  get getNombre(): string {
    return this.nombre;
  }

  get getDescripcion(): string {
    return this.descripcion;
  }

  get getPrecio(): number {
    return this.precio;
  }

  get getCategoria(): string {
    return this.categoria;
  }

  get getArtesano(): string {
    return this.artesano;
  }

  get getStock(): number {
    return this.stock;
  }

  get getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  get getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  // Setters
  set setNombre(nombre: string) {
    this.nombre = nombre;
    this.updatedAt = new Date();
  }

  set setDescripcion(descripcion: string) {
    this.descripcion = descripcion;
    this.updatedAt = new Date();
  }

  set setPrecio(precio: number) {
    this.precio = precio;
    this.updatedAt = new Date();
  }

  set setCategoria(categoria: string) {
    this.categoria = categoria;
    this.updatedAt = new Date();
  }

  set setArtesano(artesano: string) {
    this.artesano = artesano;
    this.updatedAt = new Date();
  }

  set setStock(stock: number) {
    this.stock = stock;
    this.updatedAt = new Date();
  }

  // Métodos de negocio
  public decrementarStock(cantidad: number): void {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor que cero');
    }

    if (this.stock < cantidad) {
      throw new Error('Stock insuficiente');
    }

    this.stock -= cantidad;
    this.updatedAt = new Date();
  }

  public incrementarStock(cantidad: number): void {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor que cero');
    }

    this.stock += cantidad;
    this.updatedAt = new Date();
  }

  // Método para convertir la entidad a un objeto plano
  public toJSON(): ProductoProps {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      categoria: this.categoria,
      artesano: this.artesano,
      stock: this.stock,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}