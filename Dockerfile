# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript a JavaScript
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar archivos compilados desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]