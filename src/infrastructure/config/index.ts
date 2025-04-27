import dotenv from 'dotenv';
import { logger } from './logger';
import pool, { initDatabase } from './database';
// import redisClient, { cacheService } from './redis';
// Importamos solo el servicio mock de Elasticsearch sin el cliente ni la función de inicialización
import { elasticsearchService } from './elasticsearch';
import passport, { configurePassport } from './auth';

// Asegurar que las variables de entorno estén cargadas
dotenv.config();

// Función para inicializar todas las configuraciones
export const initConfig = async (): Promise<void> => {
  try {
    // Inicializar base de datos
    await initDatabase();

    // Eliminamos completamente la inicialización de Elasticsearch
    // No hay necesidad de intentar conectar a Elasticsearch

    // Configurar Passport para autenticación
    configurePassport();

    logger.info('Configuración inicializada correctamente');
  } catch (error) {
    logger.error(`Error al inicializar configuración: ${(error as Error).message}`);
    throw error;
  }
};

// Exportar todas las configuraciones
export {
  logger,
  pool,
  // redisClient,
  // cacheService,
  // Exportamos solo el servicio mock sin el cliente
  elasticsearchService,
  passport
};

// Exportar función de inicialización por defecto
export default initConfig;