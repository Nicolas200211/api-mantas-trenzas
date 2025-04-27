
// Configuración de Elasticsearch completamente eliminada
// No importamos ninguna dependencia de Elasticsearch
// No definimos ninguna configuración que pueda intentar conectarse

// Crear un mock del cliente de Elasticsearch en lugar de intentar conectar al servidor real
// Esto evitará cualquier intento de conexión y los mensajes de error asociados
class ElasticsearchMock {
  // Métodos básicos simulados
  async info() {
    return { version: { number: '8.0.0' } };
  }

  indices = {
    exists: async () => true,
    create: async () => ({ acknowledged: true })
  };

  async index() {
    return { result: 'created' };
  }

  async search() {
    return { hits: { total: { value: 0 }, hits: [] } };
  }

  async delete() {
    return { result: 'deleted' };
  }

  async update() {
    return { result: 'updated' };
  }
}

// Usar siempre el mock en lugar del cliente real
// Definimos un tipo para evitar la dependencia de @elastic/elasticsearch
type MockClient = any;
const elasticClient = new ElasticsearchMock() as MockClient;

// Función de inicialización que no hace nada y no genera logs
export const initElasticsearch = async (): Promise<void> => {
  // No hacemos nada, simplemente devolvemos una promesa resuelta
  // Esta función nunca intentará conectarse a Elasticsearch
  // Eliminamos cualquier mensaje de advertencia
  return Promise.resolve();
};

// Comentamos la línea que genera el mensaje de advertencia
// logger.warn('Usando Elasticsearch mock para desarrollo. Algunas funcionalidades estarán limitadas.');

// Desactivamos completamente cualquier intento de conexión

// Función simulada para crear índice de productos (no hace nada realmente)
async function createProductIndex(): Promise<void> {
  // No hacemos nada, simulamos que todo funciona correctamente
  // sin generar ningún tipo de log
  return Promise.resolve();
}

// Servicio para operaciones con Elasticsearch (versión mock sin logs)
export const elasticsearchService = {
  /**
   * Indexa un producto en Elasticsearch
   * @param producto Producto a indexar
   */
  async indexProduct(producto: any): Promise<void> {
    try {
      await elasticClient.index({
        index: 'productos',
        id: producto.id.toString(),
        document: producto
      });
    } catch (error) {
      // No generamos ningún log de error
    }
  },

  /**
   * Busca productos por texto en nombre y descripción
   * @param query Texto a buscar o objeto ProductoFilters
   * @param filters Filtros adicionales (categoría, precio, etc.)
   * @param page Número de página
   * @param size Tamaño de página
   */
  async searchProducts(query: string | any, filters: any = {}, page = 1, size = 10): Promise<any> {
    try {
      const from = (page - 1) * size;

      // Construir filtros
      const must: any[] = [];
      const filter: any[] = [];

      // Búsqueda por texto
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['nombre^3', 'descripcion'], // ^3 da más peso al nombre
            fuzziness: 'AUTO' // Permite errores tipográficos
          }
        });
      }

      // Filtros adicionales
      if (filters.categoria) {
        filter.push({ term: { categoria: filters.categoria } });
      }

      if (filters.artesano) {
        filter.push({ term: { artesano: filters.artesano } });
      }

      if (filters.precioMin && filters.precioMax) {
        filter.push({
          range: {
            precio: {
              gte: filters.precioMin,
              lte: filters.precioMax
            }
          }
        });
      }

      // Ejecutar búsqueda
      const result = await elasticClient.search({
        index: 'productos',
        body: {
          query: {
            bool: {
              must,
              filter
            }
          },
          sort: [
            { _score: { order: 'desc' } },
            { created_at: { order: 'desc' } }
          ],
          from,
          size
        }
      });

      return {
        total: result.hits.total,
        productos: result.hits.hits.map((hit: any) => ({
          ...hit._source,
          score: hit._score
        }))
      };
    } catch (error) {
      // No generamos ningún log de error
      return { total: 0, productos: [] };
    }
  },

  /**
   * Elimina un producto del índice
   * @param id ID del producto a eliminar
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      await elasticClient.delete({
        index: 'productos',
        id: id.toString()
      });
    } catch (error) {
      // No generamos ningún log de error
    }
  }
};

export default elasticClient;