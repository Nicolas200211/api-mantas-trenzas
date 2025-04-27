/**
 * Mock de Redis para desarrollo sin dependencias externas
 * Este archivo proporciona una implementación de caché en memoria
 * que no requiere conexión a Redis ni genera logs
 * 
 * IMPORTANTE: Esta versión está completamente aislada y no intentará
 * conectarse a Redis ni generará ningún tipo de mensaje de error o advertencia
 */

// Clase para simular Redis cuando no está disponible
class RedisMock {
  private cache: Map<string, { value: string; expiry?: number }> = new Map();

  async set(key: string, value: string, expiryMode?: string, time?: number): Promise<'OK'> {
    let expiry: number | undefined = undefined;
    if (expiryMode === 'EX' && time) {
      expiry = Date.now() + time * 1000;
    }
    this.cache.set(key, { value, expiry });
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async del(key: string): Promise<number> {
    const deleted = this.cache.delete(key);
    return deleted ? 1 : 0;
  }

  async flushall(): Promise<'OK'> {
    this.cache.clear();
    return 'OK';
  }

  // Método on que no hace absolutamente nada
  on(event: string, callback: Function): this {
    // Intencionalmente vacío para evitar cualquier intento de conexión o generación de eventos
    return this;
  }

  // Añadimos métodos adicionales para evitar errores con otras funciones de Redis
  disconnect(): void { }
  quit(): void { }
  connect(): Promise<void> { return Promise.resolve(); }
}

// Eliminamos la configuración de Redis real para evitar intentos de conexión
// const redisConfig = {
//   host: process.env.REDIS_HOST || 'localhost',
//   port: parseInt(process.env.REDIS_PORT || '6379', 10),
//   password: process.env.REDIS_PASSWORD || undefined,
//   retryStrategy: (times: number) => {
//     // Estrategia de reconexión: esperar más tiempo entre intentos
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   }
// };

// Eliminamos la variable de control y creamos directamente la instancia de RedisMock
// No hay necesidad de intentar conectar a Redis real

/**
 * IMPORTANTE: Configuración de mock sin intentos de conexión
 * Esta implementación está completamente aislada y no intentará
 * conectarse a Redis ni generará ningún tipo de mensaje de error o advertencia
 */

// Crear instancia de RedisMock directamente sin intentos de conexión
const redisClient = new RedisMock();
// No hay intentos de conexión ni logs


// Funciones de utilidad para trabajar con caché
export const cacheService = {
  /**
   * Almacena un valor en caché
   * @param key Clave para almacenar el valor
   * @param value Valor a almacenar
   * @param ttl Tiempo de vida en segundos (opcional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Operación silenciosa, sin logs de error
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.set(key, stringValue, 'EX', ttl);
      } else {
        await redisClient.set(key, stringValue);
      }
    } catch (error) {
      // No hacemos nada con los errores para evitar cualquier log
    }
  },

  /**
   * Obtiene un valor de caché
   * @param key Clave del valor a obtener
   * @returns El valor almacenado o null si no existe
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      // No hacemos nada con los errores para evitar cualquier log
      return null;
    }
  },

  /**
   * Elimina un valor de caché
   * @param key Clave del valor a eliminar
   */
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      // No hacemos nada con los errores para evitar cualquier log
    }
  },

  /**
   * Limpia toda la caché
   */
  async flush(): Promise<void> {
    try {
      await redisClient.flushall();
    } catch (error) {
      // No hacemos nada con los errores para evitar cualquier log
    }
  }
};

export default redisClient;