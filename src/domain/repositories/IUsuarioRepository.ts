import { Usuario } from "../entities/Usuario";

export interface IUsuarioRepository {
  /**
   * Obtiene todos los usuarios
   */
  findAll(): Promise<Usuario[]>;

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   */
  findById(id: number): Promise<Usuario | null>;

  /**
   * Obtiene un usuario por su email
   * @param email Email del usuario
   */
  findByEmail(email: string): Promise<Usuario | null>;

  /**
   * Obtiene usuarios por rol
   * @param role Rol de los usuarios
   */
  findByRole(role: string): Promise<Usuario[]>;

  /**
   * Crea un nuevo usuario
   * @param usuario Usuario a crear
   */
  create(usuario: Usuario): Promise<Usuario>;

  /**
   * Actualiza un usuario existente
   * @param usuario Usuario con los datos actualizados
   */
  update(usuario: Usuario): Promise<Usuario>;

  /**
   * Elimina un usuario
   * @param id ID del usuario a eliminar
   */
  delete(id: number): Promise<void>;
}