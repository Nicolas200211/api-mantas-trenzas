import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logger } from '../config/logger';

export class AuthController {
  /**
   * Genera un token JWT
   */
  private generateToken(payload: any): string {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    // Convertir expiresIn a un tipo compatible con SignOptions
    const options: SignOptions = { expiresIn: expiresIn as any };

    return jwt.sign(payload, secret, options);
  }

  /**
   * Registra un nuevo usuario
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre } = req.body;

      // Aquí normalmente verificarías si el usuario ya existe
      // y guardarías el nuevo usuario en la base de datos

      // Ejemplo de hash de contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Simulamos un usuario creado (en producción, esto vendría de la base de datos)
      const usuario = {
        id: Math.floor(Math.random() * 1000),
        email,
        nombre,
        // No incluir la contraseña en la respuesta
      };

      // Generar token JWT
      const token = this.generateToken(usuario);

      res.status(201).json({
        success: true,
        data: {
          usuario,
          token
        }
      });
    } catch (error) {
      logger.error(`Error en registro: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: (error as Error).message
      });
    }
  }

  /**
   * Inicia sesión con un usuario existente
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Aquí normalmente verificarías las credenciales contra la base de datos
      // Ejemplo simulado:
      const usuario = {
        id: 1,
        email,
        nombre: 'Usuario Ejemplo',
        password: await bcrypt.hash('password123', 10) // Simulación
      };

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, usuario.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }

      // Generar token JWT
      const token = this.generateToken({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre
      });

      res.status(200).json({
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre
          },
          token
        }
      });
    } catch (error) {
      logger.error(`Error en login: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: (error as Error).message
      });
    }
  }

  /**
   * Callback para autenticación con Google
   */
  public googleCallback(req: Request, res: Response): void {
    try {
      // El usuario ya está autenticado por Passport
      const user = req.user as any;

      // Generar token JWT
      const token = this.generateToken(user);

      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      logger.error(`Error en callback de Google: ${(error as Error).message}`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  /**
   * Callback para autenticación con Facebook
   */
  public facebookCallback(req: Request, res: Response): void {
    try {
      // El usuario ya está autenticado por Passport
      const user = req.user as any;

      // Generar token JWT
      const token = this.generateToken(user);

      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      logger.error(`Error en callback de Facebook: ${(error as Error).message}`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  public getProfile(req: Request, res: Response): void {
    try {
      // El usuario ya está autenticado por el middleware de JWT
      const user = req.user;

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Error al obtener perfil: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: (error as Error).message
      });
    }
  }
}