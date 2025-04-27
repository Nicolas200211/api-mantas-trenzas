export interface CulturaProps {
  id?: number;
  nombre: string;
  descripcion: string;
  region: string;
  pais: string;
  tradiciones?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Cultura {
  private readonly id?: number;
  private nombre: string;
  private descripcion: string;
  private region: string;
  private pais: string;
  private tradiciones: string[];
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: CulturaProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion;
    this.region = props.region;
    this.pais = props.pais;
    this.tradiciones = props.tradiciones || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get getId(): number | undefined {
    return this.id;
  }

  get getNombre(): string {
    return this.nombre;
  }

  get getDescripcion(): string {
    return this.descripcion;
  }

  get getRegion(): string {
    return this.region;
  }

  get getPais(): string {
    return this.pais;
  }

  get getTradiciones(): string[] {
    return [...this.tradiciones];
  }

  get getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  get getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  // Setters
  set setNombre(nombre: string) {
    this.nombre = nombre;
    this.updatedAt = new Date();
  }

  set setDescripcion(descripcion: string) {
    this.descripcion = descripcion;
    this.updatedAt = new Date();
  }

  set setRegion(region: string) {
    this.region = region;
    this.updatedAt = new Date();
  }

  set setPais(pais: string) {
    this.pais = pais;
    this.updatedAt = new Date();
  }

  set setTradiciones(tradiciones: string[]) {
    this.tradiciones = [...tradiciones];
    this.updatedAt = new Date();
  }

  // Métodos para manipular tradiciones
  addTradicion(tradicion: string): void {
    if (!this.tradiciones.includes(tradicion)) {
      this.tradiciones.push(tradicion);
      this.updatedAt = new Date();
    }
  }

  removeTradicion(tradicion: string): void {
    this.tradiciones = this.tradiciones.filter(t => t !== tradicion);
    this.updatedAt = new Date();
  }

  // Método para serializar a JSON
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      region: this.region,
      pais: this.pais,
      tradiciones: this.tradiciones,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}