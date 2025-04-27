import { Request, Response } from 'express';
import { IUsuarioService } from '../../domain/services/interfaces/IUsuarioService';
import { AuthResponseDTO, CreateUsuarioDTO, LoginUsuarioDTO, UpdateUsuarioDTO, UsuarioResponseDTO } from '../../application/dtos/UsuarioDTO';
import { Usuario } from '../../domain/entities/Usuario';
import { validate } from 'class-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from '../config/logger';

export class UsuarioController {
  private readonly usuarioService: IUsuarioService;

  constructor(usuarioService: IUsuarioService) {
    this.usuarioService = usuarioService;
  }

  /**
   * Genera un token JWT
   * @param usuario Objeto Usuario o payload para generar el token
   */
  private generateToken(usuario: Usuario | any): string {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    // Crear un payload adecuado según el tipo de entrada
    let payload: any;

    if (usuario instanceof Usuario) {
      // Si es una instancia de Usuario, extraer solo las propiedades necesarias
      payload = {
        id: usuario.getId,
        email: usuario.getEmail,
        nombre: usuario.getNombre,
        apellido: usuario.getApellido,
        roles: usuario.getRoles
      };
    } else {
      // Si ya es un objeto plano, usarlo directamente
      payload = usuario;
    }

    // Convertir expiresIn a un tipo compatible con SignOptions
    const options: SignOptions = { expiresIn: expiresIn as any };

    return jwt.sign(payload, secret, options);
  }

  /**
   * @swagger
   * /api/usuarios:
   *   get:
   *     summary: Obtiene todos los usuarios
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de usuarios
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error del servidor
   */
  public async getUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await this.usuarioService.getAllUsuarios();
      const usuariosDTO = usuarios.map(usuario => new UsuarioResponseDTO(usuario));
      res.status(200).json(usuariosDTO);
    } catch (error) {
      logger.error(`Error al obtener usuarios: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al obtener usuarios', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   get:
   *     summary: Obtiene un usuario por su ID
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     responses:
   *       200:
   *         description: Usuario encontrado
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error del servidor
   */
  public async getUsuarioById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const usuario = await this.usuarioService.getUsuarioById(id);

      if (!usuario) {
        res.status(404).json({ message: `Usuario con ID ${id} no encontrado` });
        return;
      }

      const usuarioDTO = new UsuarioResponseDTO(usuario);
      res.status(200).json(usuarioDTO);
    } catch (error) {
      logger.error(`Error al obtener usuario: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al obtener usuario', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/usuarios/registro:
   *   post:
   *     summary: Registra un nuevo usuario
   *     tags: [Usuarios]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUsuarioDTO'
   *     responses:
   *       201:
   *         description: Usuario creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       500:
   *         description: Error del servidor
   */
  public async registro(req: Request, res: Response): Promise<void> {
    try {
      const createUsuarioDTO = new CreateUsuarioDTO();
      Object.assign(createUsuarioDTO, req.body);

      // Validar DTO
      const errors = await validate(createUsuarioDTO);
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Convertir DTO a entidad
      const usuario = await createUsuarioDTO.toEntity();

      // Guardar usuario
      const savedUsuario = await this.usuarioService.createUsuario(usuario);

      // Generar token JWT
      const token = this.generateToken(savedUsuario);

      // Convertir entidad guardada a DTO de respuesta
      const authResponseDTO = new AuthResponseDTO(savedUsuario, token);

      res.status(201).json(authResponseDTO);
    } catch (error) {
      logger.error(`Error al registrar usuario: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al registrar usuario', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/usuarios/login:
   *   post:
   *     summary: Inicia sesión de usuario
   *     tags: [Usuarios]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginUsuarioDTO'
   *     responses:
   *       200:
   *         description: Login exitoso
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: Credenciales inválidas
   *       500:
   *         description: Error del servidor
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const loginUsuarioDTO = new LoginUsuarioDTO();
      Object.assign(loginUsuarioDTO, req.body);

      // Validar DTO
      const errors = await validate(loginUsuarioDTO);
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Validar credenciales
      const usuario = await this.usuarioService.validatePassword(
        loginUsuarioDTO.email,
        loginUsuarioDTO.password
      );

      if (!usuario) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      // Generar token JWT
      const token = this.generateToken(usuario);

      // Crear respuesta
      const authResponseDTO = new AuthResponseDTO(usuario, token);

      res.status(200).json(authResponseDTO);
    } catch (error) {
      logger.error(`Error en login: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error en login', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   put:
   *     summary: Actualiza un usuario existente
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUsuarioDTO'
   *     responses:
   *       200:
   *         description: Usuario actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error del servidor
   */
  public async updateUsuario(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateUsuarioDTO = new UpdateUsuarioDTO();
      Object.assign(updateUsuarioDTO, req.body);

      // Validar DTO
      const errors = await validate(updateUsuarioDTO);
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Obtener usuario existente
      const existingUsuario = await this.usuarioService.getUsuarioById(id);
      if (!existingUsuario) {
        res.status(404).json({ message: `Usuario con ID ${id} no encontrado` });
        return;
      }

      // Actualizar propiedades
      if (updateUsuarioDTO.email) {
        existingUsuario.setEmail = updateUsuarioDTO.email;
      }
      if (updateUsuarioDTO.password) {
        existingUsuario.setPassword = updateUsuarioDTO.password;
      }
      if (updateUsuarioDTO.nombre) {
        existingUsuario.setNombre = updateUsuarioDTO.nombre;
      }
      if (updateUsuarioDTO.apellido) {
        existingUsuario.setApellido = updateUsuarioDTO.apellido;
      }
      if (updateUsuarioDTO.roles) {
        existingUsuario.setRoles = updateUsuarioDTO.roles;
      }

      // Guardar cambios
      const updatedUsuario = await this.usuarioService.updateUsuario(existingUsuario);

      // Convertir entidad actualizada a DTO de respuesta
      const usuarioResponseDTO = new UsuarioResponseDTO(updatedUsuario);

      res.status(200).json(usuarioResponseDTO);
    } catch (error) {
      logger.error(`Error al actualizar usuario: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al actualizar usuario', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   delete:
   *     summary: Elimina un usuario
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     responses:
   *       204:
   *         description: Usuario eliminado exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error del servidor
   */
  public async deleteUsuario(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      // Verificar si el usuario existe
      const existingUsuario = await this.usuarioService.getUsuarioById(id);
      if (!existingUsuario) {
        res.status(404).json({ message: `Usuario con ID ${id} no encontrado` });
        return;
      }

      // Eliminar usuario
      await this.usuarioService.deleteUsuario(id);

      res.status(204).send();
    } catch (error) {
      logger.error(`Error al eliminar usuario: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al eliminar usuario', error: (error as Error).message });
    }
  }

}