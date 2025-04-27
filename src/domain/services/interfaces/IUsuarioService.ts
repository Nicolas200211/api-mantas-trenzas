import { Usuario } from "../../entities/Usuario";

export interface IUsuarioService {
  getAllUsuarios(): Promise<Usuario[]>;
  getUsuarioById(id: number): Promise<Usuario | null>;
  getUsuarioByEmail(email: string): Promise<Usuario | null>;
  getUsuariosByRole(role: string): Promise<Usuario[]>;
  createUsuario(usuario: Usuario): Promise<Usuario>;
  updateUsuario(usuario: Usuario): Promise<Usuario>;
  deleteUsuario(id: number): Promise<void>;
  validatePassword(email: string, password: string): Promise<Usuario | null>;
}