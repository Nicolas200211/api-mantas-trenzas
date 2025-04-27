import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Usuario, UsuarioProps } from '../../domain/entities/Usuario';
import bcrypt from 'bcryptjs';

export class CreateUsuarioDTO {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto' })
  apellido?: string;

  @IsOptional()
  roles?: string[];

  async toEntity(): Promise<Usuario> {
    // La contraseña se encriptará en el repositorio antes de guardar
    return new Usuario({
      email: this.email,
      password: this.password,
      nombre: this.nombre,
      apellido: this.apellido,
      roles: this.roles || ['usuario']
    });
  }
}

export class UpdateUsuarioDTO {
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email no es válido' })
  email?: string;

  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto' })
  apellido?: string;

  @IsOptional()
  roles?: string[];
}

export class UsuarioResponseDTO {
  id: number;
  email: string;
  nombre?: string;
  apellido?: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(usuario: Usuario) {
    this.id = usuario.getId as number;
    this.email = usuario.getEmail;
    this.nombre = usuario.getNombre;
    this.apellido = usuario.getApellido;
    this.roles = usuario.getRoles;
    this.createdAt = usuario.getCreatedAt as Date;
    this.updatedAt = usuario.getUpdatedAt as Date;
  }
}

export class LoginUsuarioDTO {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;
}

export class AuthResponseDTO {
  usuario: UsuarioResponseDTO;
  token: string;

  constructor(usuario: Usuario, token: string) {
    this.usuario = new UsuarioResponseDTO(usuario);
    this.token = token;
  }
}