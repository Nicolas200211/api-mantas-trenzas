import { CulturaDTO } from "../../../application/dtos/CulturaDTO";

export interface ICulturaService {
  /**
   * Obtiene todas las culturas
   */
  getAllCulturas(): Promise<CulturaDTO[]>;

  /**
   * Obtiene una cultura por su ID
   * @param id ID de la cultura
   */
  getCulturaById(id: number): Promise<CulturaDTO | null>;

  /**
   * Obtiene culturas por región
   * @param region Región de las culturas
   */
  getCulturasByRegion(region: string): Promise<CulturaDTO[]>;

  /**
   * Obtiene culturas por país
   * @param pais País de las culturas
   */
  getCulturasByPais(pais: string): Promise<CulturaDTO[]>;

  /**
   * Crea una nueva cultura
   * @param culturaDTO Datos de la cultura a crear
   */
  createCultura(culturaDTO: CulturaDTO): Promise<CulturaDTO>;

  /**
   * Actualiza una cultura existente
   * @param id ID de la cultura a actualizar
   * @param culturaDTO Datos actualizados de la cultura
   */
  updateCultura(id: number, culturaDTO: CulturaDTO): Promise<CulturaDTO | null>;

  /**
   * Elimina una cultura
   * @param id ID de la cultura a eliminar
   */
  deleteCultura(id: number): Promise<boolean>;
}