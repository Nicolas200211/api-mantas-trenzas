import { Usuario } from "../../domain/entities/Usuario";
import { IUsuarioRepository } from "../../domain/repositories/interfaces/IUsuarioRepository";
import { IUsuarioService } from "../../domain/services/interfaces/IUsuarioService";
import { logger } from "../../infrastructure/config/logger";
// import { cacheService } from "../../infrastructure/config/redis";
import { cacheService } from "../../infrastructure/config/mockCache";
import bcrypt from "bcryptjs";

// Definir interfaz para el servicio de caché para evitar referencias circulares
interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class UsuarioService implements IUsuarioService {
  private readonly usuarioRepository: IUsuarioRepository;
  private readonly cacheService: ICacheService;

  constructor(
    usuarioRepository: IUsuarioRepository,
    cacheService: ICacheService
  ) {
    this.usuarioRepository = usuarioRepository;
    this.cacheService = cacheService;
  }

  async getAllUsuarios(): Promise<Usuario[]> {
    try {
      // Intentar obtener de caché primero
      const cachedUsuarios = await this.cacheService.get('all_usuarios');
      if (cachedUsuarios && cachedUsuarios !== '') {
        logger.info('Usuarios obtenidos desde caché');
        return JSON.parse(cachedUsuarios).map((u: any) => new Usuario(u));
      }

      // Si no está en caché, obtener de la base de datos
      const usuarios = await this.usuarioRepository.findAll();

      // Guardar en caché por 5 minutos
      await this.cacheService.set(
        'all_usuarios',
        JSON.stringify(usuarios.map(u => this.usuarioToObject(u))),
        300
      );

      return usuarios;
    } catch (error) {
      logger.error(`Error al obtener todos los usuarios: ${(error as Error).message}`);
      throw error;
    }
  }

  async getUsuarioById(id: number): Promise<Usuario | null> {
    try {
      // Intentar obtener de caché primero
      const cacheKey = `usuario_${id}`;
      const cachedUsuario = await this.cacheService.get(cacheKey);

      if (cachedUsuario && cachedUsuario !== '') {
        logger.info(`Usuario ${id} obtenido desde caché`);
        return new Usuario(JSON.parse(cachedUsuario));
      }

      // Si no está en caché, obtener de la base de datos
      const usuario = await this.usuarioRepository.findById(id);

      if (usuario) {
        // Guardar en caché por 5 minutos
        await this.cacheService.set(
          cacheKey,
          JSON.stringify(this.usuarioToObject(usuario)),
          300
        );
      }

      return usuario;
    } catch (error) {
      logger.error(`Error al obtener usuario por ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getUsuarioByEmail(email: string): Promise<Usuario | null> {
    try {
      // Para búsquedas por email no usamos caché por seguridad
      return await this.usuarioRepository.findByEmail(email);
    } catch (error) {
      logger.error(`Error al obtener usuario por email ${email}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getUsuariosByRole(role: string): Promise<Usuario[]> {
    try {
      // Intentar obtener de caché primero
      const cacheKey = `usuarios_role_${role}`;
      const cachedUsuarios = await this.cacheService.get(cacheKey);

      if (cachedUsuarios && cachedUsuarios !== '') {
        logger.info(`Usuarios con rol ${role} obtenidos desde caché`);
        return JSON.parse(cachedUsuarios).map((u: any) => new Usuario(u));
      }

      // Si no está en caché, obtener de la base de datos
      const usuarios = await this.usuarioRepository.findByRole(role);

      // Guardar en caché por 5 minutos
      await this.cacheService.set(
        cacheKey,
        JSON.stringify(usuarios.map(u => this.usuarioToObject(u))),
        300
      );

      return usuarios;
    } catch (error) {
      logger.error(`Error al obtener usuarios por rol ${role}: ${(error as Error).message}`);
      throw error;
    }
  }

  async createUsuario(usuario: Usuario): Promise<Usuario> {
    try {
      // Verificar si ya existe un usuario con el mismo email
      const existingUsuario = await this.usuarioRepository.findByEmail(usuario.getEmail);
      if (existingUsuario) {
        throw new Error(`Ya existe un usuario con el email ${usuario.getEmail}`);
      }

      // Guardar en la base de datos
      const savedUsuario = await this.usuarioRepository.save(usuario);

      // Invalidar caché de todos los usuarios
      await this.cacheService.del('all_usuarios');

      return savedUsuario;
    } catch (error) {
      logger.error(`Error al crear usuario: ${(error as Error).message}`);
      throw error;
    }
  }

  async updateUsuario(usuario: Usuario): Promise<Usuario> {
    try {
      const id = usuario.getId;
      if (!id) {
        throw new Error('No se puede actualizar un usuario sin ID');
      }

      const existingUsuario = await this.usuarioRepository.findById(id);
      if (!existingUsuario) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }

      // Actualizar en la base de datos
      const updatedUsuario = await this.usuarioRepository.update(usuario);

      // Invalidar cachés
      await this.cacheService.del(`usuario_${id}`);
      await this.cacheService.del('all_usuarios');

      return updatedUsuario;
    } catch (error) {
      logger.error(`Error al actualizar usuario: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteUsuario(id: number): Promise<void> {
    try {
      const existingUsuario = await this.usuarioRepository.findById(id);
      if (!existingUsuario) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }

      // Eliminar de la base de datos
      await this.usuarioRepository.delete(id);

      // Invalidar cachés
      await this.cacheService.del(`usuario_${id}`);
      await this.cacheService.del('all_usuarios');
    } catch (error) {
      logger.error(`Error al eliminar usuario con ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async validatePassword(email: string, password: string): Promise<Usuario | null> {
    try {
      const usuario = await this.usuarioRepository.findByEmail(email);
      if (!usuario) {
        return null;
      }

      // Verificar contraseña
      const isValid = await bcrypt.compare(password, usuario.getPassword);
      if (!isValid) {
        return null;
      }

      return usuario;
    } catch (error) {
      logger.error(`Error al validar contraseña: ${(error as Error).message}`);
      throw error;
    }
  }

  // Método auxiliar para convertir un objeto Usuario a un objeto plano
  private usuarioToObject(usuario: Usuario): Record<string, any> {
    return {
      id: usuario.getId,
      email: usuario.getEmail,
      password: usuario.getPassword,
      nombre: usuario.getNombre,
      apellido: usuario.getApellido,
      roles: usuario.getRoles,
      createdAt: usuario.getCreatedAt,
      updatedAt: usuario.getUpdatedAt
    };
  }
}