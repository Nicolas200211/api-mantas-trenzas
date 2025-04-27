import { Router } from 'express';
import { CulturaController } from '../controllers/CulturaController';
import { ICulturaService } from '../../domain/services/interfaces/ICulturaService';
import { verifyToken, checkRole } from '../middlewares/authMiddleware';

/**
 * Crea y configura el router para las rutas de culturas
 */
export const createCulturaRouter = (culturaService: ICulturaService): Router => {
  const router = Router();
  const culturaController = new CulturaController(culturaService);

  /**
   * @swagger
   * tags:
   *   name: Culturas
   *   description: API para gestionar culturas
   */

  // Rutas públicas
  router.get('/', culturaController.getAllCulturas.bind(culturaController));
  router.get('/region/:region', culturaController.getCulturasByRegion.bind(culturaController));
  router.get('/pais/:pais', culturaController.getCulturasByPais.bind(culturaController));
  router.get('/:id', culturaController.getCulturaById.bind(culturaController));

  // Rutas protegidas (requieren autenticación)
  router.post('/', verifyToken, culturaController.createCultura.bind(culturaController));
  router.put('/:id', verifyToken, culturaController.updateCultura.bind(culturaController));
  router.delete('/:id', verifyToken, checkRole(['admin']), culturaController.deleteCultura.bind(culturaController));

  return router;
};