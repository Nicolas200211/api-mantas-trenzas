# API Mantas y Trenzas

API robusta para tienda de productos artesanales utilizando arquitectura hexagonal con TypeScript, Node.js y Express.

## Tecnologías Utilizadas

- **Lenguaje**: TypeScript
- **Framework**: Express
- **Base de datos**: MySQL + Redis (caché)
- **Autenticación**: JWT + OAuth (Google, Facebook)
- **Documentación**: Swagger/OpenAPI
- **Arquitectura**: Hexagonal (Domain-Driven Design)

## Estructura del Proyecto

El proyecto sigue una arquitectura hexagonal (puertos y adaptadores) con las siguientes capas:

```
api-mantas-trenzas/
├── src/
│   ├── domain/           # Reglas y entidades de negocio
│   ├── application/      # Casos de uso y servicios de aplicación
│   ├── infrastructure/   # Adaptadores externos (DB, API, etc.)
│   └── shared/           # Utilidades compartidas
├── tests/                # Pruebas unitarias e integración
└── ...                   # Archivos de configuración
```

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- MySQL (v8.0 o superior)
- Redis (opcional para caché)

## Instalación

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd api-mantas-trenzas
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Crear la base de datos en MySQL:

```sql
CREATE DATABASE mantas_trenzas;
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

La API estará disponible en http://localhost:3000

### Producción

```bash
npm run build
npm start
```

## Documentación API

La documentación de la API está disponible en:

```
http://localhost:3000/api-docs
```

## Docker

### Desarrollo

```bash
docker-compose up -d
```

### Producción

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Endpoints Principales

### Productos

- `GET /api/productos`: Obtener todos los productos
- `GET /api/productos?categoria=ropa&precioMin=20`: Filtrar productos
- `GET /api/productos/:id`: Obtener un producto por ID
- `POST /api/productos`: Crear un nuevo producto
- `PUT /api/productos/:id`: Actualizar un producto
- `DELETE /api/productos/:id`: Eliminar un producto

## Pruebas

```bash
npm test
```

Para ver la cobertura de pruebas:

```bash
npm run test:coverage
```

## Licencia

ISC