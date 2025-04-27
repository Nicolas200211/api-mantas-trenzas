import { Cultura } from "../../domain/entities/Cultura";
import { ICulturaRepository } from "../../domain/repositories/ICulturaRepository";
import { ICulturaService } from "../../domain/services/interfaces/ICulturaService";
import { CulturaDTO, CulturaDTOMapper } from "../dtos/CulturaDTO";
import { logger } from "../../infrastructure/config/logger";

export class CulturaService implements ICulturaService {
  constructor(
    private readonly culturaRepository: ICulturaRepository
  ) { }

  async getAllCulturas(): Promise<CulturaDTO[]> {
    try {
      const culturas = await this.culturaRepository.findAll();
      return CulturaDTOMapper.toDTOList(culturas);
    } catch (error) {
      logger.error(`Error en servicio al obtener todas las culturas: ${(error as Error).message}`);
      throw error;
    }
  }

  async getCulturaById(id: number): Promise<CulturaDTO | null> {
    try {
      const cultura = await this.culturaRepository.findById(id);
      return cultura ? CulturaDTOMapper.toDTO(cultura) : null;
    } catch (error) {
      logger.error(`Error en servicio al obtener cultura por ID ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getCulturasByRegion(region: string): Promise<CulturaDTO[]> {
    try {
      const culturas = await this.culturaRepository.findByRegion(region);
      return CulturaDTOMapper.toDTOList(culturas);
    } catch (error) {
      logger.error(`Error en servicio al obtener culturas por región ${region}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getCulturasByPais(pais: string): Promise<CulturaDTO[]> {
    try {
      const culturas = await this.culturaRepository.findByPais(pais);
      return CulturaDTOMapper.toDTOList(culturas);
    } catch (error) {
      logger.error(`Error en servicio al obtener culturas por país ${pais}: ${(error as Error).message}`);
      throw error;
    }
  }

  async createCultura(culturaDTO: CulturaDTO): Promise<CulturaDTO> {
    try {
      const cultura = CulturaDTOMapper.toEntity(culturaDTO);
      const nuevaCultura = await this.culturaRepository.create(cultura);
      return CulturaDTOMapper.toDTO(nuevaCultura);
    } catch (error) {
      logger.error(`Error en servicio al crear cultura: ${(error as Error).message}`);
      throw error;
    }
  }

  async updateCultura(id: number, culturaDTO: CulturaDTO): Promise<CulturaDTO | null> {
    try {
      const culturaExistente = await this.culturaRepository.findById(id);
      if (!culturaExistente) {
        return null;
      }

      // Actualizar propiedades
      if (culturaDTO.nombre) culturaExistente.setNombre = culturaDTO.nombre;
      if (culturaDTO.descripcion) culturaExistente.setDescripcion = culturaDTO.descripcion;
      if (culturaDTO.region) culturaExistente.setRegion = culturaDTO.region;
      if (culturaDTO.pais) culturaExistente.setPais = culturaDTO.pais;
      if (culturaDTO.tradiciones) culturaExistente.setTradiciones = culturaDTO.tradiciones;

      const culturaActualizada = await this.culturaRepository.update(culturaExistente);
      return CulturaDTOMapper.toDTO(culturaActualizada);
    } catch (error) {
      logger.error(`Error en servicio al actualizar cultura ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteCultura(id: number): Promise<boolean> {
    try {
      const culturaExistente = await this.culturaRepository.findById(id);
      if (!culturaExistente) {
        return false;
      }

      await this.culturaRepository.delete(id);
      return true;
    } catch (error) {
      logger.error(`Error en servicio al eliminar cultura ${id}: ${(error as Error).message}`);
      throw error;
    }
  }
}