import { Producto, ProductoProps } from "../../domain/entities/Producto";
import { IProductoRepository } from "../../domain/repositories/interfaces/IProductoRepository";
import pool from "../config/database";

export class MySQLProductoRepository implements IProductoRepository {
  async findAll(): Promise<Producto[]> {
    try {
      const [rows] = await pool.query('SELECT * FROM productos');
      return (rows as any[]).map(row => this.mapToEntity(row));
    } catch (error) {
      console.error('Error al obtener todos los productos:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Producto | null> {
    try {
      const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
      const productos = rows as any[];

      if (productos.length === 0) {
        return null;
      }

      return this.mapToEntity(productos[0]);
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${id}:`, error);
      throw error;
    }
  }

  async findByCategoria(categoria: string): Promise<Producto[]> {
    try {
      const [rows] = await pool.query('SELECT * FROM productos WHERE categoria = ?', [categoria]);
      return (rows as any[]).map(row => this.mapToEntity(row));
    } catch (error) {
      console.error(`Error al obtener productos de la categoría ${categoria}:`, error);
      throw error;
    }
  }

  async findByFilters(filters: {
    categoria?: string;
    precioMin?: number;
    precioMax?: number;
    artesano?: string;
  }): Promise<Producto[]> {
    try {
      let query = 'SELECT * FROM productos WHERE 1=1';
      const params: any[] = [];

      if (filters.categoria) {
        query += ' AND categoria = ?';
        params.push(filters.categoria);
      }

      if (filters.precioMin !== undefined) {
        query += ' AND precio >= ?';
        params.push(filters.precioMin);
      }

      if (filters.precioMax !== undefined) {
        query += ' AND precio <= ?';
        params.push(filters.precioMax);
      }

      if (filters.artesano) {
        query += ' AND artesano = ?';
        params.push(filters.artesano);
      }

      const [rows] = await pool.query(query, params);
      return (rows as any[]).map(row => this.mapToEntity(row));
    } catch (error) {
      console.error('Error al filtrar productos:', error);
      throw error;
    }
  }

  async save(producto: Producto): Promise<Producto> {
    try {
      const productoData = producto.toJSON();
      const [result] = await pool.query(
        'INSERT INTO productos (nombre, descripcion, precio, categoria, artesano, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [
          productoData.nombre,
          productoData.descripcion,
          productoData.precio,
          productoData.categoria,
          productoData.artesano,
          productoData.stock
        ]
      );

      const insertId = (result as any).insertId;
      return this.findById(insertId) as Promise<Producto>;
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      throw error;
    }
  }

  async update(producto: Producto): Promise<Producto> {
    try {
      const productoData = producto.toJSON();
      await pool.query(
        'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, artesano = ?, stock = ? WHERE id = ?',
        [
          productoData.nombre,
          productoData.descripcion,
          productoData.precio,
          productoData.categoria,
          productoData.artesano,
          productoData.stock,
          productoData.id
        ]
      );

      return this.findById(productoData.id as number) as Promise<Producto>;
    } catch (error) {
      console.error(`Error al actualizar el producto con ID ${producto.getId}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Error al eliminar el producto con ID ${id}:`, error);
      throw error;
    }
  }

  private mapToEntity(row: any): Producto {
    const props: ProductoProps = {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      precio: parseFloat(row.precio),
      categoria: row.categoria,
      artesano: row.artesano,
      stock: row.stock,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return new Producto(props);
  }
}