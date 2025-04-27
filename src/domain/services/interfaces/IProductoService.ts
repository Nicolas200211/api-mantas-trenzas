import { Producto } from "../../entities/Producto";

export interface ProductoFilters {
  categoria?: string;
  precioMin?: number;
  precioMax?: number;
  artesano?: string;
}

export interface IProductoService {
  getAllProductos(): Promise<Producto[]>;
  getProductoById(id: number): Promise<Producto | null>;
  getProductosByCategoria(categoria: string): Promise<Producto[]>;
  getProductosByFilters(filters: ProductoFilters): Promise<Producto[]>;
  createProducto(producto: Producto): Promise<Producto>;
  updateProducto(producto: Producto): Promise<Producto>;
  deleteProducto(id: number): Promise<void>;
}