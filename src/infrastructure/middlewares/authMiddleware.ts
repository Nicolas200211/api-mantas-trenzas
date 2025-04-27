import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';

/**
 * Middleware para verificar el token JWT
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token'
      });
      return;
    }

    // Verificar formato del token (Bearer <token>)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
      return;
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, secret);

    // Añadir el usuario decodificado a la request
    req.user = decoded;

    next();
  } catch (error) {
    logger.error(`Error en verificación de token: ${(error as Error).message}`);

    if ((error as Error).name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: (error as Error).message
    });
  }
};

/**
 * Middleware para verificar roles de usuario
 */
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as any;

      if (!user || !user.role) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. No tiene permisos suficientes'
        });
        return;
      }

      if (roles.includes(user.role)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. No tiene el rol requerido'
        });
      }
    } catch (error) {
      logger.error(`Error en verificación de rol: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: (error as Error).message
      });
    }
  };
};

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}