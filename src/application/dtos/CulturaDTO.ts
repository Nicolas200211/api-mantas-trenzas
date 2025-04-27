import { Cultura } from "../../domain/entities/Cultura";

export interface CulturaDTO {
  id?: number;
  nombre: string;
  descripcion: string;
  region: string;
  pais: string;
  tradiciones: string[];
  createdAt?: string;
  updatedAt?: string;
}

export class CulturaDTOMapper {
  /**
   * Convierte una entidad Cultura a un DTO
   */
  public static toDTO(cultura: Cultura): CulturaDTO {
    return {
      id: cultura.getId,
      nombre: cultura.getNombre,
      descripcion: cultura.getDescripcion,
      region: cultura.getRegion,
      pais: cultura.getPais,
      tradiciones: cultura.getTradiciones,
      createdAt: cultura.getCreatedAt?.toISOString(),
      updatedAt: cultura.getUpdatedAt?.toISOString()
    };
  }

  /**
   * Convierte un array de entidades Cultura a un array de DTOs
   */
  public static toDTOList(culturas: Cultura[]): CulturaDTO[] {
    return culturas.map(cultura => this.toDTO(cultura));
  }

  /**
   * Convierte un DTO a una entidad Cultura
   */
  public static toEntity(culturaDTO: CulturaDTO): Cultura {
    return new Cultura({
      id: culturaDTO.id,
      nombre: culturaDTO.nombre,
      descripcion: culturaDTO.descripcion,
      region: culturaDTO.region,
      pais: culturaDTO.pais,
      tradiciones: culturaDTO.tradiciones,
      createdAt: culturaDTO.createdAt ? new Date(culturaDTO.createdAt) : undefined,
      updatedAt: culturaDTO.updatedAt ? new Date(culturaDTO.updatedAt) : undefined
    });
  }
}