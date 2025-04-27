export interface UsuarioProps {
  id?: number;
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
  roles: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Usuario {
  private readonly id?: number;
  private email: string;
  private password: string;
  private nombre?: string;
  private apellido?: string;
  private roles: string[];
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: UsuarioProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.nombre = props.nombre;
    this.apellido = props.apellido;
    this.roles = props.roles || ['usuario'];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get getId(): number | undefined {
    return this.id;
  }

  get getEmail(): string {
    return this.email;
  }

  get getPassword(): string {
    return this.password;
  }

  get getNombre(): string | undefined {
    return this.nombre;
  }

  get getApellido(): string | undefined {
    return this.apellido;
  }

  get getRoles(): string[] {
    return [...this.roles];
  }

  get getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  get getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  // Setters
  set setEmail(email: string) {
    this.email = email;
    this.updatedAt = new Date();
  }

  set setPassword(password: string) {
    this.password = password;
    this.updatedAt = new Date();
  }

  set setNombre(nombre: string) {
    this.nombre = nombre;
    this.updatedAt = new Date();
  }

  set setApellido(apellido: string) {
    this.apellido = apellido;
    this.updatedAt = new Date();
  }

  set setRoles(roles: string[]) {
    this.roles = [...roles];
    this.updatedAt = new Date();
  }

  // Métodos de negocio
  public addRole(role: string): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  public removeRole(role: string): void {
    if (role !== 'usuario') { // No permitir eliminar el rol básico
      this.roles = this.roles.filter(r => r !== role);
      this.updatedAt = new Date();
    }
  }

  public hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      apellido: this.apellido,
      roles: this.roles,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}