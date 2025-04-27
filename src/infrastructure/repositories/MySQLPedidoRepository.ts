import { Pedido, EstadoPedido, PedidoItem } from "../../domain/entities/Pedido";
import { IPedidoRepository } from "../../domain/repositories/IPedidoRepository";
import pool from "../config/database";
import { logger } from "../config/logger";

export class MySQLPedidoRepository implements IPedidoRepository {
  async findAll(): Promise<Pedido[]> {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM pedidos');

      return await Promise.all((rows as any[]).map(async row => this.mapToEntity(row)));
    } catch (error) {
      logger.error(`Error al obtener todos los pedidos: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async findById(id: number): Promise<Pedido | null> {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM pedidos WHERE id = ?', [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return await this.mapToEntity((rows as any[])[0]);
    } catch (error) {
      logger.error(`Error al obtener pedido por ID ${id}: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async findByUsuarioId(usuarioId: number): Promise<Pedido[]> {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM pedidos WHERE usuario_id = ?', [usuarioId]);

      return await Promise.all((rows as any[]).map(async row => this.mapToEntity(row)));
    } catch (error) {
      logger.error(`Error al obtener pedidos del usuario ${usuarioId}: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async findByEstado(estado: EstadoPedido): Promise<Pedido[]> {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM pedidos WHERE estado = ?', [estado]);

      return await Promise.all((rows as any[]).map(async row => this.mapToEntity(row)));
    } catch (error) {
      logger.error(`Error al obtener pedidos por estado ${estado}: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async create(pedido: Pedido): Promise<Pedido> {
    let connection;
    try {
      connection = await pool.getConnection();
      // Iniciar transacción
      await connection.beginTransaction();

      // Insertar pedido
      const [result] = await connection.execute(
        'INSERT INTO pedidos (usuario_id, estado, total, direccion_envio, metodo_pago, referencia_pago, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          pedido.getUsuarioId,
          pedido.getEstado,
          pedido.getTotal,
          pedido.getDireccionEnvio,
          pedido.getMetodoPago,
          pedido.getReferenciaPago,
          new Date(),
          new Date()
        ]
      );

      const pedidoId = (result as any).insertId;

      // Insertar items del pedido
      for (const item of pedido.getItems) {
        await connection.execute(
          'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
          [
            pedidoId,
            item.productoId,
            item.cantidad,
            item.precioUnitario,
            item.subtotal
          ]
        );
      }

      // Confirmar transacción
      await connection.commit();

      return this.findById(pedidoId) as Promise<Pedido>;
    } catch (error) {
      // Revertir transacción en caso de error
      if (connection) await connection.rollback();
      logger.error(`Error al crear pedido: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async update(pedido: Pedido): Promise<Pedido> {
    let connection;
    try {
      connection = await pool.getConnection();
      // Iniciar transacción
      await connection.beginTransaction();

      // Actualizar pedido
      await connection.execute(
        'UPDATE pedidos SET usuario_id = ?, estado = ?, total = ?, direccion_envio = ?, metodo_pago = ?, referencia_pago = ?, updated_at = ? WHERE id = ?',
        [
          pedido.getUsuarioId,
          pedido.getEstado,
          pedido.getTotal,
          pedido.getDireccionEnvio,
          pedido.getMetodoPago,
          pedido.getReferenciaPago,
          new Date(),
          pedido.getId
        ]
      );

      // Eliminar items existentes
      await connection.execute('DELETE FROM pedido_items WHERE pedido_id = ?', [pedido.getId]);

      // Insertar nuevos items
      for (const item of pedido.getItems) {
        await connection.execute(
          'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
          [
            pedido.getId,
            item.productoId,
            item.cantidad,
            item.precioUnitario,
            item.subtotal
          ]
        );
      }

      // Confirmar transacción
      await connection.commit();

      return this.findById(pedido.getId as number) as Promise<Pedido>;
    } catch (error) {
      // Revertir transacción en caso de error
      if (connection) await connection.rollback();
      logger.error(`Error al actualizar pedido ${pedido.getId}: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async delete(id: number): Promise<void> {
    let connection;
    try {
      connection = await pool.getConnection();
      // Iniciar transacción
      await connection.beginTransaction();

      // Eliminar items del pedido
      await connection.execute('DELETE FROM pedido_items WHERE pedido_id = ?', [id]);

      // Eliminar pedido
      await connection.execute('DELETE FROM pedidos WHERE id = ?', [id]);

      // Confirmar transacción
      await connection.commit();
    } catch (error) {
      // Revertir transacción en caso de error
      if (connection) await connection.rollback();
      logger.error(`Error al eliminar pedido ${id}: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async updateEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.execute(
        'UPDATE pedidos SET estado = ?, updated_at = ? WHERE id = ?',
        [estado, new Date(), id]
      );

      return this.findById(id) as Promise<Pedido>;
    } catch (error) {
      logger.error(`Error al actualizar estado del pedido ${id}: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async updateReferenciaPago(id: number, referenciaPago: string): Promise<Pedido> {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.execute(
        'UPDATE pedidos SET referencia_pago = ?, updated_at = ? WHERE id = ?',
        [referenciaPago, new Date(), id]
      );

      return this.findById(id) as Promise<Pedido>;
    } catch (error) {
      logger.error(`Error al actualizar referencia de pago del pedido ${id}: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  private async mapToEntity(row: any): Promise<Pedido> {
    // Obtener items del pedido
    let connection;
    try {
      connection = await pool.getConnection();
      const [itemRows] = await connection.execute(
        'SELECT * FROM pedido_items WHERE pedido_id = ?',
        [row.id]
      );

      const items: PedidoItem[] = (itemRows as any[]).map(itemRow => ({
        productoId: itemRow.producto_id,
        cantidad: itemRow.cantidad,
        precioUnitario: itemRow.precio_unitario,
        subtotal: itemRow.subtotal
      }));


      return new Pedido({
        id: row.id,
        usuarioId: row.usuario_id,
        estado: row.estado as EstadoPedido,
        total: row.total,
        direccionEnvio: row.direccion_envio,
        metodoPago: row.metodo_pago,
        referenciaPago: row.referencia_pago,
        items,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    } catch (error) {
      logger.error(`Error al mapear pedido ${row.id}: ${(error as Error).message}`);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}