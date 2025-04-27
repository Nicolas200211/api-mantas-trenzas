import { Producto } from "../../entities/Producto";

export interface IProductoRepository {
  findAll(): Promise<Producto[]>;
  findById(id: number): Promise<Producto | null>;
  findByCategoria(categoria: string): Promise<Producto[]>;
  findByFilters(filters: {
    categoria?: string;
    precioMin?: number;
    precioMax?: number;
    artesano?: string;
  }): Promise<Producto[]>;
  save(producto: Producto): Promise<Producto>;
  update(producto: Producto): Promise<Producto>;
  delete(id: number): Promise<void>;
}