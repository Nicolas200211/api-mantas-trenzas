import { Usuario, UsuarioProps } from "../../domain/entities/Usuario";
import { IUsuarioRepository } from "../../domain/repositories/interfaces/IUsuarioRepository";
import pool from "../config/database";
import { logger } from "../config/logger";
import bcrypt from "bcryptjs";

export class MySQLUsuarioRepository implements IUsuarioRepository {
  async findAll(): Promise<Usuario[]> {
    try {
      const [rows] = await pool.query('SELECT * FROM usuarios');
      return (rows as any[]).map(row => this.mapToEntity(row));
    } catch (error) {
      logger.error(`Error al obtener todos los usuarios: ${(error as Error).message}`);
      throw error;
    }
  }

  async findById(id: number): Promise<Usuario | null> {
    try {
      const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
      const usuarios = rows as any[];

      if (usuarios.length === 0) {
        return null;
      }

      return this.mapToEntity(usuarios[0]);
    } catch (error) {
      logger.error(`Error al obtener el usuario con ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      const usuarios = rows as any[];

      if (usuarios.length === 0) {
        return null;
      }

      return this.mapToEntity(usuarios[0]);
    } catch (error) {
      logger.error(`Error al obtener usuario por email ${email}: ${(error as Error).message}`);
      throw error;
    }
  }

  async findByRole(role: string): Promise<Usuario[]> {
    try {
      // Buscar usuarios que tengan el rol específico (almacenado como JSON en MySQL)
      const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE JSON_CONTAINS(roles, ?)',
        [JSON.stringify(role)]
      );
      return (rows as any[]).map(row => this.mapToEntity(row));
    } catch (error) {
      logger.error(`Error al obtener usuarios por rol ${role}: ${(error as Error).message}`);
      throw error;
    }
  }

  async save(usuario: Usuario): Promise<Usuario> {
    try {
      // Encriptar contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(usuario.getPassword, 10);

      const [result] = await pool.query(
        'INSERT INTO usuarios (email, password, nombre, apellido, roles, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          usuario.getEmail,
          hashedPassword,
          usuario.getNombre,
          usuario.getApellido,
          JSON.stringify(usuario.getRoles),
          new Date(),
          new Date()
        ]
      );

      const insertId = (result as any).insertId;
      return new Usuario({
        id: insertId,
        email: usuario.getEmail,
        password: hashedPassword, // Guardamos la contraseña hasheada
        nombre: usuario.getNombre,
        apellido: usuario.getApellido,
        roles: usuario.getRoles,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      logger.error(`Error al guardar usuario: ${(error as Error).message}`);
      throw error;
    }
  }

  async update(usuario: Usuario): Promise<Usuario> {
    try {
      const id = usuario.getId;
      if (!id) {
        throw new Error('No se puede actualizar un usuario sin ID');
      }

      // Si la contraseña no está hasheada (comienza con $2a$ o $2b$), hashearla
      let password = usuario.getPassword;
      if (!password.startsWith('$2a$') && !password.startsWith('$2b$')) {
        password = await bcrypt.hash(password, 10);
      }

      await pool.query(
        'UPDATE usuarios SET email = ?, password = ?, nombre = ?, apellido = ?, roles = ?, updated_at = ? WHERE id = ?',
        [
          usuario.getEmail,
          password,
          usuario.getNombre,
          usuario.getApellido,
          JSON.stringify(usuario.getRoles),
          new Date(),
          id
        ]
      );

      return new Usuario({
        id,
        email: usuario.getEmail,
        password, // Contraseña ya hasheada
        nombre: usuario.getNombre,
        apellido: usuario.getApellido,
        roles: usuario.getRoles,
        createdAt: usuario.getCreatedAt,
        updatedAt: new Date()
      });
    } catch (error) {
      logger.error(`Error al actualizar usuario: ${(error as Error).message}`);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    } catch (error) {
      logger.error(`Error al eliminar usuario con ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  private mapToEntity(row: any): Usuario {
    return new Usuario({
      id: row.id,
      email: row.email,
      password: row.password,
      nombre: row.nombre,
      apellido: row.apellido,
      roles: JSON.parse(row.roles),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }
}