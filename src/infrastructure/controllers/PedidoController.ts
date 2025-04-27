import { Request, Response } from 'express';
import { IPedidoService } from '../../domain/services/interfaces/IPedidoService';
import { CreatePedidoDTO, PedidoResponseDTO, UpdatePedidoDTO, ProcesarPagoDTO } from '../../application/dtos/PedidoDTO';
import { EstadoPedido } from '../../domain/entities/Pedido';
import { validate } from 'class-validator';
import { logger } from '../config/logger';

export class PedidoController {
  private readonly pedidoService: IPedidoService;

  constructor(pedidoService: IPedidoService) {
    this.pedidoService = pedidoService;
  }

  /**
   * @swagger
   * /api/pedidos:
   *   get:
   *     summary: Obtiene todos los pedidos
   *     description: Retorna una lista de todos los pedidos en el sistema. Solo accesible para administradores.
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de pedidos obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Pedido'
   *             example:
   *               - id: 1
   *                 usuarioId: 2
   *                 estado: "pagado"
   *                 total: 125000
   *                 direccionEnvio: "Calle 123 #45-67, Bogotá, Colombia"
   *                 metodoPago: "stripe"
   *                 referenciaPago: "ch_1234567890"
   *                 items: [
   *                   {
   *                     productoId: 1,
   *                     cantidad: 2,
   *                     precioUnitario: 50000,
   *                     subtotal: 100000
   *                   },
   *                   {
   *                     productoId: 3,
   *                     cantidad: 1,
   *                     precioUnitario: 25000,
   *                     subtotal: 25000
   *                   }
   *                 ]
   *                 createdAt: "2023-05-15T14:30:00Z"
   *                 updatedAt: "2023-05-15T15:45:00Z"
   *       401:
   *         description: No autorizado - Token JWT inválido o expirado
   *       403:
   *         description: Prohibido - El usuario no tiene rol de administrador
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             example:
   *               message: "Error al obtener pedidos"
   *               error: "Error de conexión a la base de datos"
   */
  public async getPedidos(req: Request, res: Response): Promise<void> {
    try {
      const pedidos = await this.pedidoService.getAllPedidos();
      const pedidosDTO = pedidos.map(pedido => new PedidoResponseDTO(pedido));
      res.status(200).json(pedidosDTO);
    } catch (error) {
      logger.error(`Error al obtener pedidos: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al obtener pedidos', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/pedidos/{id}:
   *   get:
   *     summary: Obtiene un pedido por su ID
   *     description: |
   *       Retorna los detalles completos de un pedido específico según su ID.
   *       El usuario debe estar autenticado y ser el propietario del pedido o un administrador.
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único del pedido a consultar
   *     responses:
   *       200:
   *         description: Pedido encontrado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Pedido'
   *             example:
   *               id: 1
   *               usuarioId: 2
   *               estado: "pagado"
   *               total: 125000
   *               direccionEnvio: "Calle 123 #45-67, Bogotá, Colombia"
   *               metodoPago: "stripe"
   *               referenciaPago: "ch_1234567890"
   *               items: [
   *                 {
   *                   productoId: 1,
   *                   cantidad: 2,
   *                   precioUnitario: 50000,
   *                   subtotal: 100000
   *                 },
   *                 {
   *                   productoId: 3,
   *                   cantidad: 1,
   *                   precioUnitario: 25000,
   *                   subtotal: 25000
   *                 }
   *               ]
   *               createdAt: "2023-05-15T14:30:00Z"
   *               updatedAt: "2023-05-15T15:45:00Z"
   *       401:
   *         description: No autorizado - Token JWT inválido o expirado
   *       403:
   *         description: Prohibido - No tienes permisos para ver este pedido
   *       404:
   *         description: Pedido no encontrado
   *         content:
   *           application/json:
   *             example:
   *               message: "Pedido con ID 123 no encontrado"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             example:
   *               message: "Error al obtener pedido"
   *               error: "Error de conexión a la base de datos"
   */
  public async getPedidoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const pedido = await this.pedidoService.getPedidoById(id);

      if (!pedido) {
        res.status(404).json({ message: `Pedido con ID ${id} no encontrado` });
        return;
      }

      const pedidoDTO = new PedidoResponseDTO(pedido);
      res.status(200).json(pedidoDTO);
    } catch (error) {
      logger.error(`Error al obtener pedido: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al obtener pedido', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/pedidos/usuario/{usuarioId}:
   *   get:
   *     summary: Obtiene los pedidos de un usuario
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: usuarioId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     responses:
   *       200:
   *         description: Lista de pedidos del usuario
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error del servidor
   */
  public async getPedidosByUsuarioId(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = parseInt(req.params.usuarioId);
      const pedidos = await this.pedidoService.getPedidosByUsuarioId(usuarioId);
      const pedidosDTO = pedidos.map(pedido => new PedidoResponseDTO(pedido));
      res.status(200).json(pedidosDTO);
    } catch (error) {
      logger.error(`Error al obtener pedidos del usuario: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al obtener pedidos del usuario', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/pedidos:
   *   post:
   *     summary: Crea un nuevo pedido
   *     description: |
   *       Crea un nuevo pedido en el sistema con los productos seleccionados.
   *       El usuario debe estar autenticado para realizar esta operación.
   *       
   *       **Importante:**
   *       - El campo `usuarioId` debe corresponder al ID del usuario autenticado o un administrador.
   *       - Cada item debe incluir el cálculo correcto del subtotal (precioUnitario × cantidad).
   *       - El sistema asignará automáticamente el estado "pendiente" al nuevo pedido.
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - usuarioId
   *               - direccionEnvio
   *               - metodoPago
   *               - items
   *             properties:
   *               usuarioId:
   *                 type: integer
   *                 description: ID del usuario que realiza el pedido
   *               direccionEnvio:
   *                 type: string
   *                 description: Dirección completa donde se entregará el pedido
   *               metodoPago:
   *                 type: string
   *                 enum: [stripe, paypal, transferencia]
   *                 description: Método de pago seleccionado
   *               referenciaPago:
   *                 type: string
   *                 description: Referencia del pago (opcional en la creación)
   *               items:
   *                 type: array
   *                 description: Lista de productos incluidos en el pedido
   *                 items:
   *                   type: object
   *                   required:
   *                     - productoId
   *                     - cantidad
   *                     - precioUnitario
   *                     - subtotal
   *                   properties:
   *                     productoId:
   *                       type: integer
   *                       description: ID del producto
   *                     cantidad:
   *                       type: integer
   *                       description: Cantidad del producto
   *                       minimum: 1
   *                     precioUnitario:
   *                       type: number
   *                       description: Precio unitario del producto
   *                     subtotal:
   *                       type: number
   *                       description: Subtotal (precio × cantidad)
   *           example:
   *             usuarioId: 2
   *             direccionEnvio: "Calle 123 #45-67, Bogotá, Colombia"
   *             metodoPago: "stripe"
   *             items: [
   *               {
   *                 productoId: 1,
   *                 cantidad: 2,
   *                 precioUnitario: 50000,
   *                 subtotal: 100000
   *               },
   *               {
   *                 productoId: 3,
   *                 cantidad: 1,
   *                 precioUnitario: 25000,
   *                 subtotal: 25000
   *               }
   *             ]
   *     responses:
   *       201:
   *         description: Pedido creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Pedido'
   *             example:
   *               id: 5
   *               usuarioId: 2
   *               estado: "pendiente"
   *               total: 125000
   *               direccionEnvio: "Calle 123 #45-67, Bogotá, Colombia"
   *               metodoPago: "stripe"
   *               items: [
   *                 {
   *                   productoId: 1,
   *                   cantidad: 2,
   *                   precioUnitario: 50000,
   *                   subtotal: 100000
   *                 },
   *                 {
   *                   productoId: 3,
   *                   cantidad: 1,
   *                   precioUnitario: 25000,
   *                   subtotal: 25000
   *                 }
   *               ]
   *               createdAt: "2023-06-10T09:15:32Z"
   *               updatedAt: "2023-06-10T09:15:32Z"
   *       400:
   *         description: Datos inválidos
   *         content:
   *           application/json:
   *             example:
   *               message: "Datos inválidos"
   *               errors: [
   *                 {
   *                   property: "items",
   *                   constraints: {
   *                     isNotEmpty: "Los items del pedido son requeridos"
   *                   }
   *                 }
   *               ]
   *       401:
   *         description: No autorizado - Token JWT inválido o expirado
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             example:
   *               message: "Error al crear pedido"
   *               error: "Error al procesar la solicitud"
   */
  public async createPedido(req: Request, res: Response): Promise<void> {
    try {
      const createPedidoDTO = new CreatePedidoDTO();
      Object.assign(createPedidoDTO, req.body);

      // Validar DTO
      const errors = await validate(createPedidoDTO);
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Convertir DTO a entidad
      const pedido = createPedidoDTO.toEntity();

      // Guardar pedido
      const savedPedido = await this.pedidoService.createPedido(pedido);

      // Convertir entidad guardada a DTO de respuesta
      const pedidoResponseDTO = new PedidoResponseDTO(savedPedido);

      res.status(201).json(pedidoResponseDTO);
    } catch (error) {
      logger.error(`Error al crear pedido: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al crear pedido', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/pedidos/{id}:
   *   put:
   *     summary: Actualiza un pedido existente
   *     description: |
   *       Actualiza los datos de un pedido existente según su ID.
   *       El usuario debe estar autenticado y ser el propietario del pedido o un administrador.
   *       Solo se actualizarán los campos proporcionados en la solicitud.
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único del pedido a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               direccionEnvio:
   *                 type: string
   *                 description: Nueva dirección de entrega del pedido
   *               estado:
   *                 type: string
   *                 enum: [pendiente, pagado, enviado, entregado, cancelado]
   *                 description: Nuevo estado del pedido
   *               metodoPago:
   *                 type: string
   *                 enum: [stripe, paypal, transferencia]
   *                 description: Nuevo método de pago
   *               referenciaPago:
   *                 type: string
   *                 description: Nueva referencia de pago
   *           example:
   *             direccionEnvio: "Nueva Calle 456 #78-90, Medellín, Colombia"
   *             estado: "enviado"
   *     responses:
   *       200:
   *         description: Pedido actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Pedido'
   *             example:
   *               id: 1
   *               usuarioId: 2
   *               estado: "enviado"
   *               total: 125000
   *               direccionEnvio: "Nueva Calle 456 #78-90, Medellín, Colombia"
   *               metodoPago: "stripe"
   *               referenciaPago: "ch_1234567890"
   *               items: [
   *                 {
   *                   productoId: 1,
   *                   cantidad: 2,
   *                   precioUnitario: 50000,
   *                   subtotal: 100000
   *                 },
   *                 {
   *                   productoId: 3,
   *                   cantidad: 1,
   *                   precioUnitario: 25000,
   *                   subtotal: 25000
   *                 }
   *               ]
   *               createdAt: "2023-05-15T14:30:00Z"
   *               updatedAt: "2023-06-20T10:15:30Z"
   *       400:
   *         description: Datos inválidos
   *         content:
   *           application/json:
   *             example:
   *               message: "Datos inválidos"
   *               errors: [
   *                 {
   *                   property: "estado",
   *                   constraints: {
   *                     isEnum: "Estado inválido"
   *                   }
   *                 }
   *               ]
   *       401:
   *         description: No autorizado - Token JWT inválido o expirado
   *       403:
   *         description: Prohibido - No tienes permisos para actualizar este pedido
   *       404:
   *         description: Pedido no encontrado
   *         content:
   *           application/json:
   *             example:
   *               message: "Pedido con ID 123 no encontrado"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             example:
   *               message: "Error al actualizar pedido"
   *               error: "Error de conexión a la base de datos"
   */
  public async updatePedido(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updatePedidoDTO = new UpdatePedidoDTO();
      Object.assign(updatePedidoDTO, req.body);

      // Validar DTO
      const errors = await validate(updatePedidoDTO);
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Obtener pedido existente
      const existingPedido = await this.pedidoService.getPedidoById(id);
      if (!existingPedido) {
        res.status(404).json({ message: `Pedido con ID ${id} no encontrado` });
        return;
      }

      // Actualizar propiedades
      if (updatePedidoDTO.direccionEnvio) {
        existingPedido.setDireccionEnvio = updatePedidoDTO.direccionEnvio;
      }
      if (updatePedidoDTO.estado) {
        existingPedido.setEstado = updatePedidoDTO.estado;
      }
      if (updatePedidoDTO.metodoPago) {
        existingPedido.setMetodoPago = updatePedidoDTO.metodoPago;
      }
      if (updatePedidoDTO.referenciaPago) {
        existingPedido.setReferenciaPago = updatePedidoDTO.referenciaPago;
      }

      // Guardar cambios
      const updatedPedido = await this.pedidoService.updatePedido(existingPedido);

      // Convertir entidad actualizada a DTO de respuesta
      const pedidoResponseDTO = new PedidoResponseDTO(updatedPedido);

      res.status(200).json(pedidoResponseDTO);
    } catch (error) {
      logger.error(`Error al actualizar pedido: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al actualizar pedido', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/pedidos/{id}:
   *   delete:
   *     summary: Elimina un pedido
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pedido
   *     responses:
   *       204:
   *         description: Pedido eliminado exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Pedido no encontrado
   *       500:
   *         description: Error del servidor
   */
  public async deletePedido(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      // Verificar si el pedido existe
      const existingPedido = await this.pedidoService.getPedidoById(id);
      if (!existingPedido) {
        res.status(404).json({ message: `Pedido con ID ${id} no encontrado` });
        return;
      }

      // Eliminar pedido
      await this.pedidoService.deletePedido(id);

      res.status(204).send();
    } catch (error) {
      logger.error(`Error al eliminar pedido: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al eliminar pedido', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/pedidos/{id}/pago:
   *   post:
   *     summary: Procesa el pago de un pedido
   *     description: |
   *       Procesa el pago de un pedido existente utilizando la información de pago proporcionada.
   *       El usuario debe estar autenticado y ser el propietario del pedido o un administrador.
   *       
   *       **Nota:** La estructura de paymentInfo varía según el método de pago seleccionado:
   *       - Para Stripe: Se requiere token de pago y datos del cliente
   *       - Para PayPal: Se requiere ID de transacción de PayPal
   *       - Para Transferencia: Se requiere comprobante de transferencia
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pedido a procesar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - paymentInfo
   *             properties:
   *               paymentInfo:
   *                 type: object
   *                 description: Información del pago según el método seleccionado
   *           examples:
   *             Stripe:
   *               value:
   *                 paymentInfo:
   *                   type: "stripe"
   *                   token: "tok_visa_1234567890"
   *                   customer:
   *                     name: "Juan Pérez"
   *                     email: "juan@ejemplo.com"
   *             PayPal:
   *               value:
   *                 paymentInfo:
   *                   type: "paypal"
   *                   transactionId: "PAY-1AB23456CD789012EF34GHIJ"
   *             Transferencia:
   *               value:
   *                 paymentInfo:
   *                   type: "transferencia"
   *                   comprobante: "TR-20230610-123456"
   *                   banco: "Banco XYZ"
   *                   fecha: "2023-06-10"
   *     responses:
   *       200:
   *         description: Pago procesado exitosamente
   *         content:
   *           application/json:
   *             example:
   *               message: "Pago procesado exitosamente"
   *               referenciaPago: "ch_1234567890"
   *       400:
   *         description: Datos inválidos o error en el procesamiento del pago
   *         content:
   *           application/json:
   *             examples:
   *               DatosInválidos:
   *                 value:
   *                   message: "Datos inválidos"
   *                   errors: [
   *                     {
   *                       property: "paymentInfo",
   *                       constraints: {
   *                         isNotEmpty: "La información de pago es requerida"
   *                       }
   *                     }
   *                   ]
   *               ErrorPago:
   *                 value:
   *                   message: "Error al procesar el pago"
   *                   error: "Tarjeta rechazada"
   *       401:
   *         description: No autorizado - Token JWT inválido o expirado
   *       404:
   *         description: Pedido no encontrado
   *         content:
   *           application/json:
   *             example:
   *               message: "Pedido con ID 123 no encontrado"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             example:
   *               message: "Error al procesar pago"
   *               error: "Error de conexión con el servicio de pagos"
   */
  public async procesarPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const procesarPagoDTO = new ProcesarPagoDTO();
      Object.assign(procesarPagoDTO, req.body);

      // Validar DTO
      const errors = await validate(procesarPagoDTO);
      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Verificar si el pedido existe
      const existingPedido = await this.pedidoService.getPedidoById(id);
      if (!existingPedido) {
        res.status(404).json({ message: `Pedido con ID ${id} no encontrado` });
        return;
      }

      // Procesar pago
      const resultado = await this.pedidoService.procesarPago(id, procesarPagoDTO.paymentInfo);

      if (!resultado.success) {
        res.status(400).json({ message: 'Error al procesar el pago', error: resultado.error });
        return;
      }

      res.status(200).json({
        message: 'Pago procesado exitosamente',
        referenciaPago: resultado.referenciaPago
      });
    } catch (error) {
      logger.error(`Error al procesar pago: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al procesar pago', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/pedidos/{id}/estado:
   *   patch:
   *     summary: Actualiza el estado de un pedido
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pedido
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - estado
   *             properties:
   *               estado:
   *                 type: string
   *                 enum: [pendiente, pagado, enviado, entregado, cancelado]
   *     responses:
   *       200:
   *         description: Estado actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Pedido no encontrado
   *       500:
   *         description: Error del servidor
   */
  public async updateEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { estado } = req.body;

      // Validar estado
      if (!estado || !Object.values(EstadoPedido).includes(estado as EstadoPedido)) {
        res.status(400).json({ message: 'Estado inválido' });
        return;
      }

      // Verificar si el pedido existe
      const existingPedido = await this.pedidoService.getPedidoById(id);
      if (!existingPedido) {
        res.status(404).json({ message: `Pedido con ID ${id} no encontrado` });
        return;
      }

      // Actualizar estado
      const updatedPedido = await this.pedidoService.updateEstadoPedido(id, estado as EstadoPedido);

      // Convertir entidad actualizada a DTO de respuesta
      const pedidoResponseDTO = new PedidoResponseDTO(updatedPedido);

      res.status(200).json(pedidoResponseDTO);
    } catch (error) {
      logger.error(`Error al actualizar estado del pedido: ${(error as Error).message}`);
      res.status(500).json({ message: 'Error al actualizar estado del pedido', error: (error as Error).message });
    }
  }
}