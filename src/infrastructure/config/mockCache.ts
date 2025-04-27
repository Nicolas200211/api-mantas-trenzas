// Eliminamos la importación del logger para evitar cualquier log relacionado con Redis
// import { logger } from './logger';

// Clase para simular caché en memoria cuando Redis no está disponible
class MockCacheService {
  private cache: Map<string, { value: string; expiry?: number }> = new Map();

  /**
   * Almacena un valor en caché
   * @param key Clave para almacenar el valor
   * @param value Valor a almacenar
   * @param ttl Tiempo de vida en segundos (opcional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      let expiry: number | undefined = undefined;

      if (ttl) {
        expiry = Date.now() + ttl * 1000;
      }

      this.cache.set(key, { value: stringValue, expiry });
      // Comentamos los logs para evitar mensajes innecesarios
      // logger.debug(`Valor almacenado en caché mock: ${key}`);
    } catch (error) {
      // Comentamos los logs de error para evitar mensajes innecesarios
      // logger.error(`Error al almacenar en caché mock: ${(error as Error).message}`);
    }
  }

  /**
   * Recupera un valor de la caché
   * @param key Clave del valor a recuperar
   * @returns El valor almacenado o null si no existe
   */
  async get(key: string): Promise<string | null> {
    try {
      const item = this.cache.get(key);
      if (!item) return null;

      // Verificar si el valor ha expirado
      if (item.expiry && item.expiry < Date.now()) {
        this.cache.delete(key);
        return null;
      }

      return item.value;
    } catch (error) {
      // Comentamos los logs de error para evitar mensajes innecesarios
      // logger.error(`Error al recuperar de caché mock: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Elimina un valor de la caché
   * @param key Clave del valor a eliminar
   */
  async del(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      // Comentamos los logs para evitar mensajes innecesarios
      // logger.debug(`Valor eliminado de caché mock: ${key}`);
    } catch (error) {
      // Comentamos los logs de error para evitar mensajes innecesarios
      // logger.error(`Error al eliminar de caché mock: ${(error as Error).message}`);
    }
  }

  /**
   * Limpia toda la caché
   */
  async flushall(): Promise<void> {
    try {
      this.cache.clear();
      // Comentamos los logs para evitar mensajes innecesarios
      // logger.debug('Caché mock limpiada completamente');
    } catch (error) {
      // Comentamos los logs de error para evitar mensajes innecesarios
      // logger.error(`Error al limpiar caché mock: ${(error as Error).message}`);
    }
  }
}

// Exportar una instancia del servicio de caché mock
export const cacheService = new MockCacheService();

export default cacheService;