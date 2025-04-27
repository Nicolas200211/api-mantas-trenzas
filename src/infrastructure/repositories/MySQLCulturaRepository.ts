import { Cultura } from "../../domain/entities/Cultura";
import { ICulturaRepository } from "../../domain/repositories/ICulturaRepository";
import pool from "../config/database";
import { logger } from "../config/logger";

export class MySQLCulturaRepository implements ICulturaRepository {
  async findAll(): Promise<Cultura[]> {
    try {
      const connection = pool;
      const [rows] = await connection.execute('SELECT * FROM cultura');

      const culturas = [];
      for (const row of rows as any[]) {
        culturas.push(await this.mapToEntity(row));
      }
      return culturas;
    } catch (error) {
      logger.error(`Error al obtener todas las culturas: ${(error as Error).message}`);
      throw error;
    }
  }

  async findById(id: number): Promise<Cultura | null> {
    try {
      const connection = pool;
      const [rows] = await connection.execute('SELECT * FROM cultura WHERE id = ?', [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return await this.mapToEntity((rows as any[])[0]);
    } catch (error) {
      logger.error(`Error al obtener cultura por ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async findByRegion(region: string): Promise<Cultura[]> {
    try {
      const connection = pool;
      const [rows] = await connection.execute('SELECT * FROM cultura WHERE region = ?', [region]);

      const culturas = [];
      for (const row of rows as any[]) {
        culturas.push(await this.mapToEntity(row));
      }
      return culturas;
    } catch (error) {
      logger.error(`Error al obtener culturas por región ${region}: ${(error as Error).message}`);
      throw error;
    }
  }

  async findByPais(pais: string): Promise<Cultura[]> {
    try {
      const connection = pool;
      const [rows] = await connection.execute('SELECT * FROM cultura WHERE pais = ?', [pais]);

      const culturas = [];
      for (const row of rows as any[]) {
        culturas.push(await this.mapToEntity(row));
      }
      return culturas;
    } catch (error) {
      logger.error(`Error al obtener culturas por país ${pais}: ${(error as Error).message}`);
      throw error;
    }
  }

  async create(cultura: Cultura): Promise<Cultura> {
    const connection = await pool.getConnection();
    try {
      // Iniciar transacción
      await connection.beginTransaction();

      // Insertar cultura
      const [result] = await connection.execute(
        'INSERT INTO cultura (nombre, descripcion, region, pais, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          cultura.getNombre,
          cultura.getDescripcion,
          cultura.getRegion,
          cultura.getPais,
          new Date(),
          new Date()
        ]
      );

      const culturaId = (result as any).insertId;

      // Insertar tradiciones si existen
      if (cultura.getTradiciones && cultura.getTradiciones.length > 0) {
        for (const tradicion of cultura.getTradiciones) {
          await connection.execute(
            'INSERT INTO cultura_tradiciones (cultura_id, tradicion) VALUES (?, ?)',
            [culturaId, tradicion]
          );
        }
      }

      // Confirmar transacción
      await connection.commit();

      return this.findById(culturaId) as Promise<Cultura>;
    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      logger.error(`Error al crear cultura: ${(error as Error).message}`);
      throw error;
    }
  }

  async update(cultura: Cultura): Promise<Cultura> {
    const connection = await pool.getConnection();
    try {
      // Iniciar transacción
      await connection.beginTransaction();

      // Actualizar cultura
      await connection.execute(
        'UPDATE cultura SET nombre = ?, descripcion = ?, region = ?, pais = ?, updated_at = ? WHERE id = ?',
        [
          cultura.getNombre,
          cultura.getDescripcion,
          cultura.getRegion,
          cultura.getPais,
          new Date(),
          cultura.getId
        ]
      );

      // Eliminar tradiciones existentes
      await connection.execute('DELETE FROM cultura_tradiciones WHERE cultura_id = ?', [cultura.getId]);

      // Insertar nuevas tradiciones
      if (cultura.getTradiciones && cultura.getTradiciones.length > 0) {
        for (const tradicion of cultura.getTradiciones) {
          await connection.execute(
            'INSERT INTO cultura_tradiciones (cultura_id, tradicion) VALUES (?, ?)',
            [cultura.getId, tradicion]
          );
        }
      }

      // Confirmar transacción
      await connection.commit();

      return this.findById(cultura.getId as number) as Promise<Cultura>;
    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      logger.error(`Error al actualizar cultura ${cultura.getId}: ${(error as Error).message}`);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      // Iniciar transacción
      await connection.beginTransaction();

      // Eliminar tradiciones de la cultura
      await connection.execute('DELETE FROM cultura_tradiciones WHERE cultura_id = ?', [id]);

      // Eliminar cultura
      await connection.execute('DELETE FROM cultura WHERE id = ?', [id]);

      // Confirmar transacción
      await connection.commit();
    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      logger.error(`Error al eliminar cultura ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  private async mapToEntity(row: any): Promise<Cultura> {
    // Obtener tradiciones de la cultura
    const connection = await pool.getConnection();
    try {
      const [tradicionRows] = await connection.execute(
        'SELECT tradicion FROM cultura_tradiciones WHERE cultura_id = ?',
        [row.id]
      );
      const tradiciones = (tradicionRows as any[]).map(tr => tr.tradicion);

      return new Cultura({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        region: row.region,
        pais: row.pais,
        tradiciones: tradiciones,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    } catch (error) {
      logger.error(`Error al mapear cultura ${row.id}: ${(error as Error).message}`);
      throw error;
    } finally {
      connection.release();
    }
  }
}