import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { createProductoRouter } from './routes/producto.routes';
import { createAuthRouter } from './routes/auth.routes';
import { createUsuarioRouter } from './routes/usuario.routes';
import { createPedidoRouter } from './routes/pedido.routes';
import { ProductoController } from './controllers/ProductoController';
import { ProductoService } from '../application/services/ProductoService';
import { UsuarioService } from '../application/services/UsuarioService';
import { PedidoService } from '../application/services/PedidoService';
import { MySQLProductoRepository } from './repositories/MySQLProductoRepository';
import { MySQLUsuarioRepository } from './repositories/MySQLUsuarioRepository';
import { MySQLPedidoRepository } from './repositories/MySQLPedidoRepository';
import { initDatabase } from './config/database';
// Importamos solo el servicio mock de Elasticsearch sin la función de inicialización
import { elasticsearchService } from './config/elasticsearch';
// Eliminamos completamente cualquier referencia a Redis
// import { cacheService } from './config/redis';
// Usamos exclusivamente el servicio de caché mock
import { cacheService } from './config/mockCache';
import { logger } from './config/logger';

export class Server {
  private app: Application;
  private port: string | number;
  private apiPaths = {
    productos: '/api/productos',
    usuarios: '/api/usuarios',
    pedidos: '/api/pedidos',
    cultura: '/api/cultura'
  };

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    // Inicializar base de datos
    this.initDB();

    // Middlewares
    this.middlewares();

    // Definir rutas
    this.routes();

    // Configurar Swagger
    this.setupSwagger();
  }

  private async initDB(): Promise<void> {
    try {
      // Inicializar MySQL
      await initDatabase();

      // Inicializar ElasticSearch
      // Comentamos la inicialización de Elasticsearch para evitar mensajes de error
      // await initElasticsearch();

      logger.info('Servicios de base de datos inicializados correctamente');
    } catch (error) {
      logger.error(`Error al inicializar servicios de base de datos: ${(error as Error).message}`);
    }
  }

  private middlewares(): void {
    // CORS
    this.app.use(cors());

    // Seguridad con Helmet
    this.app.use(helmet());

    // Lectura y parseo del body
    this.app.use(express.json());

    // Carpeta pública
    this.app.use(express.static('public'));
  }

  private routes(): void {
    // Método 1: Usar el router centralizado (recomendado)
    this.app.use('/api', routes);

    // Método 2: Configuración manual de rutas (legacy)
    // Crear instancias necesarias para productos
    const productoRepository = new MySQLProductoRepository();
    const productoService = new ProductoService(productoRepository, elasticsearchService, cacheService);
    const productoController = new ProductoController(productoService);

    // Crear instancias necesarias para usuarios
    const usuarioRepository = new MySQLUsuarioRepository();
    const usuarioService = new UsuarioService(usuarioRepository, cacheService);

    // Crear instancias necesarias para pedidos
    const pedidoRepository = new MySQLPedidoRepository();
    const pedidoService = new PedidoService(pedidoRepository);

    // Configurar rutas (legacy)
    this.app.use(this.apiPaths.productos, createProductoRouter(productoService));
    this.app.use(this.apiPaths.usuarios, createUsuarioRouter(usuarioService));
    this.app.use(this.apiPaths.pedidos, createPedidoRouter(pedidoService));
    this.app.use('/api/auth', createAuthRouter());

    // Ruta para verificar estado de la API
    this.app.get('/api/health', (_, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }

  private setupSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API Mantas y Trenzas',
          version: '1.0.0',
          description: 'API para tienda de productos artesanales de la cultura Wayuu. Esta documentación proporciona información detallada sobre cómo utilizar cada endpoint, los parámetros requeridos y ejemplos de solicitudes y respuestas.',
          contact: {
            name: 'Soporte Técnico',
            email: 'soporte@mantasytrenzas.com'
          }
        },
        servers: [
          {
            url: `http://localhost:${this.port}`,
            description: 'Servidor de desarrollo'
          }
        ],
        components: {
          schemas: {
            // Esquemas de Producto
            Producto: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'ID único del producto' },
                nombre: { type: 'string', description: 'Nombre del producto' },
                descripcion: { type: 'string', description: 'Descripción detallada del producto' },
                precio: { type: 'number', description: 'Precio del producto en pesos colombianos' },
                categoria: { type: 'string', description: 'Categoría del producto (ropa, cultura, llaveros, utensilios)' },
                artesano: { type: 'string', description: 'Nombre del artesano que elaboró el producto' },
                stock: { type: 'integer', description: 'Cantidad disponible del producto' },
                createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación del registro' },
                updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización' }
              }
            },
            // Esquemas de Pedido
            Pedido: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'ID único del pedido' },
                usuarioId: { type: 'integer', description: 'ID del usuario que realizó el pedido' },
                estado: {
                  type: 'string',
                  enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'],
                  description: 'Estado actual del pedido'
                },
                total: { type: 'number', description: 'Monto total del pedido' },
                direccionEnvio: { type: 'string', description: 'Dirección de entrega del pedido' },
                metodoPago: {
                  type: 'string',
                  enum: ['stripe', 'paypal', 'transferencia'],
                  description: 'Método de pago utilizado'
                },
                referenciaPago: { type: 'string', description: 'Referencia o identificador del pago' },
                items: {
                  type: 'array',
                  items: { '$ref': '#/components/schemas/PedidoItem' },
                  description: 'Productos incluidos en el pedido'
                },
                createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación del pedido' },
                updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización' }
              }
            },
            PedidoItem: {
              type: 'object',
              properties: {
                productoId: { type: 'integer', description: 'ID del producto' },
                cantidad: { type: 'integer', description: 'Cantidad del producto' },
                precioUnitario: { type: 'number', description: 'Precio unitario del producto' },
                subtotal: { type: 'number', description: 'Subtotal (precio × cantidad)' }
              }
            },
            // Esquemas de Usuario y Autenticación
            Usuario: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'ID único del usuario' },
                nombre: { type: 'string', description: 'Nombre completo del usuario' },
                email: { type: 'string', format: 'email', description: 'Correo electrónico del usuario' },
                rol: {
                  type: 'string',
                  enum: ['cliente', 'admin'],
                  description: 'Rol del usuario en el sistema'
                },
                createdAt: { type: 'string', format: 'date-time', description: 'Fecha de registro' },
                updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización' }
              }
            }
          },
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Ingresa el token JWT obtenido al iniciar sesión. Formato: Bearer [token]'
            }
          }
        },
        security: [
          { bearerAuth: [] }
        ]
      },
      apis: ['./src/infrastructure/routes/*.ts', './src/infrastructure/controllers/*.ts']
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        syntaxHighlight: {
          activate: true,
          theme: 'monokai'
        }
      },
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API Mantas y Trenzas - Documentación',
      customfavIcon: '/favicon.ico'
    }));
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`Servidor corriendo en puerto ${this.port}`);
    });
  }
}