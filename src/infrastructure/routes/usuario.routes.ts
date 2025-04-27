import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { IUsuarioService } from '../../domain/services/interfaces/IUsuarioService';
import { verifyToken, checkRole } from '../middlewares/authMiddleware';

/**
 * Crea y configura el router para las rutas de usuarios
 */
export const createUsuarioRouter = (usuarioService: IUsuarioService): Router => {
  const router = Router();
  const usuarioController = new UsuarioController(usuarioService);

  /**
   * @swagger
   * tags:
   *   name: Usuarios
   *   description: API para gestionar usuarios
   */

  // Rutas públicas
  router.post('/registro', usuarioController.registro.bind(usuarioController));
  router.post('/login', usuarioController.login.bind(usuarioController));

  // Rutas protegidas
  router.get('/', verifyToken, checkRole(['admin']), usuarioController.getUsuarios.bind(usuarioController));
  router.get('/:id', verifyToken, usuarioController.getUsuarioById.bind(usuarioController));
  router.put('/:id', verifyToken, usuarioController.updateUsuario.bind(usuarioController));
  router.delete('/:id', verifyToken, checkRole(['admin']), usuarioController.deleteUsuario.bind(usuarioController));

  return router;
};