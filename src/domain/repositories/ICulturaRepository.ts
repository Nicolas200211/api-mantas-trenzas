import { Cultura } from "../entities/Cultura";

export interface ICulturaRepository {
  findAll(): Promise<Cultura[]>;
  findById(id: number): Promise<Cultura | null>;
  findByRegion(region: string): Promise<Cultura[]>;
  findByPais(pais: string): Promise<Cultura[]>;
  create(cultura: Cultura): Promise<Cultura>;
  update(cultura: Cultura): Promise<Cultura>;
  delete(id: number): Promise<void>;
}