import winston from 'winston';
import path from 'path';

// Configuración de niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determinar el nivel de log según el entorno
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Configuración de colores para los niveles
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Formato personalizado para los logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Definir los transportes (destinos) para los logs
const transports = [
  // Consola para desarrollo
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    ),
  }),
  // Archivo para todos los logs
  new winston.transports.File({
    filename: path.join('logs', 'all.log'),
    format,
  }),
  // Archivo específico para errores
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format,
  }),
];

// Crear y exportar el logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});