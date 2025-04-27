import { Request, Response } from 'express';
import { Cultura } from '../../domain/entities/Cultura';
import { ICulturaService } from '../../domain/services/interfaces/ICulturaService';
import { logger } from '../config/logger';

export class CulturaController {
  constructor(private readonly culturaService: ICulturaService) { }

  /**
   * Obtiene todas las culturas
   * @route GET /api/cultura
   */
  public getAllCulturas = async (req: Request, res: Response): Promise<void> => {
    try {
      const culturas = await this.culturaService.getAllCulturas();
      res.status(200).json({
        success: true,
        data: culturas,
        count: culturas.length
      });
    } catch (error) {
      logger.error(`Error al obtener todas las culturas: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las culturas',
        error: (error as Error).message
      });
    }
  };

  /**
   * Obtiene una cultura por su ID
   * @route GET /api/cultura/:id
   */
  public getCulturaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de cultura inválido'
        });
        return;
      }

      const cultura = await this.culturaService.getCulturaById(id);
      if (!cultura) {
        res.status(404).json({
          success: false,
          message: `Cultura con ID ${id} no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cultura
      });
    } catch (error) {
      logger.error(`Error al obtener cultura por ID: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la cultura',
        error: (error as Error).message
      });
    }
  };

  /**
   * Obtiene culturas por región
   * @route GET /api/cultura/region/:region
   */
  public getCulturasByRegion = async (req: Request, res: Response): Promise<void> => {
    try {
      const region = req.params.region;
      const culturas = await this.culturaService.getCulturasByRegion(region);

      res.status(200).json({
        success: true,
        data: culturas,
        count: culturas.length
      });
    } catch (error) {
      logger.error(`Error al obtener culturas por región: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las culturas por región',
        error: (error as Error).message
      });
    }
  };

  /**
   * Obtiene culturas por país
   * @route GET /api/cultura/pais/:pais
   */
  public getCulturasByPais = async (req: Request, res: Response): Promise<void> => {
    try {
      const pais = req.params.pais;
      const culturas = await this.culturaService.getCulturasByPais(pais);

      res.status(200).json({
        success: true,
        data: culturas,
        count: culturas.length
      });
    } catch (error) {
      logger.error(`Error al obtener culturas por país: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las culturas por país',
        error: (error as Error).message
      });
    }
  };

  /**
   * Crea una nueva cultura
   * @route POST /api/cultura
   */
  public createCultura = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, descripcion, region, pais, tradiciones } = req.body;

      // Validaciones básicas
      if (!nombre || !descripcion || !region || !pais) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: nombre, descripcion, region, pais'
        });
        return;
      }

      const nuevaCultura = new Cultura({
        nombre,
        descripcion,
        region,
        pais,
        tradiciones: tradiciones || []
      });

      // Convertir la entidad Cultura a CulturaDTO antes de pasarla al servicio
      const culturaDTO = {
        nombre: nuevaCultura.getNombre,
        descripcion: nuevaCultura.getDescripcion,
        region: nuevaCultura.getRegion,
        pais: nuevaCultura.getPais,
        tradiciones: nuevaCultura.getTradiciones
      };
      const culturaCreada = await this.culturaService.createCultura(culturaDTO);

      res.status(201).json({
        success: true,
        message: 'Cultura creada exitosamente',
        data: culturaCreada
      });
    } catch (error) {
      logger.error(`Error al crear cultura: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al crear la cultura',
        error: (error as Error).message
      });
    }
  };

  /**
   * Actualiza una cultura existente
   * @route PUT /api/cultura/:id
   */
  public updateCultura = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de cultura inválido'
        });
        return;
      }

      const culturaExistente = await this.culturaService.getCulturaById(id);
      if (!culturaExistente) {
        res.status(404).json({
          success: false,
          message: `Cultura con ID ${id} no encontrada`
        });
        return;
      }

      const { nombre, descripcion, region, pais, tradiciones } = req.body;

      // Actualizar solo los campos proporcionados
      if (nombre) culturaExistente.nombre = nombre;
      if (descripcion) culturaExistente.descripcion = descripcion;
      if (region) culturaExistente.region = region;
      if (pais) culturaExistente.pais = pais;
      if (tradiciones) culturaExistente.tradiciones = tradiciones;

      const culturaActualizada = await this.culturaService.updateCultura(culturaExistente.id as number, culturaExistente);

      res.status(200).json({
        success: true,
        message: 'Cultura actualizada exitosamente',
        data: culturaActualizada
      });
    } catch (error) {
      logger.error(`Error al actualizar cultura: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la cultura',
        error: (error as Error).message
      });
    }
  };

  /**
   * Elimina una cultura
   * @route DELETE /api/cultura/:id
   */
  public deleteCultura = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de cultura inválido'
        });
        return;
      }

      const culturaExistente = await this.culturaService.getCulturaById(id);
      if (!culturaExistente) {
        res.status(404).json({
          success: false,
          message: `Cultura con ID ${id} no encontrada`
        });
        return;
      }

      await this.culturaService.deleteCultura(id);

      res.status(200).json({
        success: true,
        message: `Cultura con ID ${id} eliminada exitosamente`
      });
    } catch (error) {
      logger.error(`Error al eliminar cultura: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la cultura',
        error: (error as Error).message
      });
    }
  };
}