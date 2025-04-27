import { Router } from 'express';
import { createProductoRouter } from './producto.routes';
import { createUsuarioRouter } from './usuario.routes';
import { createPedidoRouter } from './pedido.routes';
import { createCulturaRouter } from './cultura.routes';
import { createAuthRouter } from './auth.routes';
import { MySQLCulturaRepository } from '../repositories/MySQLCulturaRepository';
import { MySQLUsuarioRepository } from '../repositories/MySQLUsuarioRepository';
import { MySQLPedidoRepository } from '../repositories/MySQLPedidoRepository';
import { MySQLProductoRepository } from '../repositories/MySQLProductoRepository';
import { CulturaService } from '../../application/services/CulturaService';
import { UsuarioService } from '../../application/services/UsuarioService';
import { PedidoService } from '../../application/services/PedidoService';
import { ProductoService } from '../../application/services/ProductoService';
import { elasticsearchService } from '../config/elasticsearch';
// import { cacheService } from '../config/redis';
import { cacheService } from '../config/mockCache';

const router = Router();

// Inicializar servicios
const culturaRepository = new MySQLCulturaRepository();
const culturaService = new CulturaService(culturaRepository);

// Inicializar servicios de usuario
const usuarioRepository = new MySQLUsuarioRepository();
const usuarioService = new UsuarioService(usuarioRepository, cacheService);

// Inicializar servicios de pedido
const pedidoRepository = new MySQLPedidoRepository();
const pedidoService = new PedidoService(pedidoRepository);

// Inicializar servicios de producto
const productoRepository = new MySQLProductoRepository();
const productoService = new ProductoService(productoRepository, elasticsearchService, cacheService);

// Configuración de rutas
router.use('/productos', createProductoRouter(productoService));
router.use('/usuarios', createUsuarioRouter(usuarioService));
router.use('/pedidos', createPedidoRouter(pedidoService));
router.use('/cultura', createCulturaRouter(culturaService));
router.use('/auth', createAuthRouter());

// Ruta para verificar que la API está funcionando
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;