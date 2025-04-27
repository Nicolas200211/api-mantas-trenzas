import { Usuario } from "../../entities/Usuario";

export interface IUsuarioRepository {
  findAll(): Promise<Usuario[]>;
  findById(id: number): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findByRole(role: string): Promise<Usuario[]>;
  save(usuario: Usuario): Promise<Usuario>;
  update(usuario: Usuario): Promise<Usuario>;
  delete(id: number): Promise<void>;
}