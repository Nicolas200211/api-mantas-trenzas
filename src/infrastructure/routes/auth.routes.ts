import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { verifyToken } from '../middlewares/authMiddleware';
import passport from 'passport';

/**
 * Crea y configura el router para las rutas de autenticación
 */
export const createAuthRouter = (): Router => {
  const router = Router();
  const authController = new AuthController();

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Registra un nuevo usuario
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - nombre
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               nombre:
   *                 type: string
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
   *       400:
   *         description: Datos inválidos
   *       500:
   *         description: Error del servidor
   */
  router.post('/register', authController.register.bind(authController));

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Inicia sesión con un usuario existente
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Inicio de sesión exitoso
   *       401:
   *         description: Credenciales inválidas
   *       500:
   *         description: Error del servidor
   */
  router.post('/login', authController.login.bind(authController));

  /**
   * @swagger
   * /api/auth/profile:
   *   get:
   *     summary: Obtiene el perfil del usuario autenticado
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil obtenido exitosamente
   *       401:
   *         description: No autenticado
   *       500:
   *         description: Error del servidor
   */
  router.get('/profile', verifyToken, authController.getProfile.bind(authController));

  /**
   * @swagger
   * /api/auth/google:
   *   get:
   *     summary: Inicia el flujo de autenticación con Google
   *     tags: [Autenticación]
   *     responses:
   *       302:
   *         description: Redirección a Google para autenticación
   */
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  /**
   * @swagger
   * /api/auth/google/callback:
   *   get:
   *     summary: Callback para la autenticación con Google
   *     tags: [Autenticación]
   *     responses:
   *       302:
   *         description: Redirección al frontend con token
   *       500:
   *         description: Error del servidor
   */
  router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    authController.googleCallback.bind(authController)
  );

  /**
   * @swagger
   * /api/auth/facebook:
   *   get:
   *     summary: Inicia el flujo de autenticación con Facebook
   *     tags: [Autenticación]
   *     responses:
   *       302:
   *         description: Redirección a Facebook para autenticación
   */
  router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
  }));

  /**
   * @swagger
   * /api/auth/facebook/callback:
   *   get:
   *     summary: Callback para la autenticación con Facebook
   *     tags: [Autenticación]
   *     responses:
   *       302:
   *         description: Redirección al frontend con token
   *       500:
   *         description: Error del servidor
   */
  router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    authController.facebookCallback.bind(authController)
  );

  return router;
};