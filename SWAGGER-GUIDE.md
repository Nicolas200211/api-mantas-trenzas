# Guía de Uso de la API Mantas y Trenzas

Esta guía te ayudará a entender cómo utilizar la documentación de Swagger para probar y comprender nuestra API.

## Acceso a la Documentación

Para acceder a la documentación interactiva de la API:

1. Inicia el servidor con `npm run dev`
2. Abre en tu navegador: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Estructura de la Documentación

La interfaz de Swagger está organizada de la siguiente manera:

- **Endpoints**: Agrupados por categorías (Productos, Pedidos, Usuarios, etc.)
- **Modelos**: Esquemas de datos que muestran la estructura de las entidades
- **Autorización**: Sección para configurar tu token JWT

## Autenticación

La mayoría de los endpoints requieren autenticación mediante token JWT:

1. Primero, registra un usuario o inicia sesión usando los endpoints de `/api/auth`
2. Copia el token JWT recibido en la respuesta
3. Haz clic en el botón "Authorize" (🔓) en la parte superior de la página
4. Ingresa el token en formato: `Bearer tu_token_jwt`
5. Haz clic en "Authorize" y luego en "Close"

Ahora podrás acceder a los endpoints protegidos.

## Cómo Probar Endpoints

### 1. Consultar Productos

- Expande el endpoint `GET /api/productos`
- Puedes usar los parámetros de consulta para filtrar (opcional)
- Haz clic en "Try it out" y luego en "Execute"
- Verás la respuesta con los productos disponibles

### 2. Crear un Pedido

- Expande el endpoint `POST /api/pedidos`
- Haz clic en "Try it out"
- Modifica el ejemplo JSON proporcionado con tus datos:

```json
{
  "usuarioId": 2,
  "direccionEnvio": "Tu dirección",
  "metodoPago": "stripe",
  "items": [
    {
      "productoId": 1,
      "cantidad": 2,
      "precioUnitario": 50000,
      "subtotal": 100000
    }
  ]
}
```

- Haz clic en "Execute"
- Verás la respuesta con los detalles del pedido creado

### 3. Procesar un Pago

- Expande el endpoint `POST /api/pedidos/{id}/pago`
- Ingresa el ID del pedido que deseas pagar
- Selecciona el ejemplo de pago según tu método (Stripe, PayPal, Transferencia)
- Modifica los datos según sea necesario
- Haz clic en "Execute"

## Esquemas de Datos

### Producto

```json
{
  "id": 1,
  "nombre": "Mochila Wayuu",
  "descripcion": "Mochila artesanal de la cultura Wayuu",
  "precio": 120000,
  "categoria": "accesorios",
  "artesano": "María Pushaina",
  "stock": 10,
  "createdAt": "2023-05-10T14:30:00Z",
  "updatedAt": "2023-05-10T14:30:00Z"
}
```

### Pedido

```json
{
  "id": 1,
  "usuarioId": 2,
  "estado": "pendiente",
  "total": 120000,
  "direccionEnvio": "Calle 123 #45-67, Bogotá, Colombia",
  "metodoPago": "stripe",
  "items": [
    {
      "productoId": 1,
      "cantidad": 1,
      "precioUnitario": 120000,
      "subtotal": 120000
    }
  ],
  "createdAt": "2023-06-10T09:15:32Z",
  "updatedAt": "2023-06-10T09:15:32Z"
}
```

## Estados de Pedido

- **pendiente**: Pedido creado pero no pagado
- **pagado**: Pago confirmado, pendiente de envío
- **enviado**: Pedido en tránsito
- **entregado**: Pedido recibido por el cliente
- **cancelado**: Pedido cancelado

## Métodos de Pago

### Stripe

Para pagos con tarjeta de crédito/débito:

```json
{
  "paymentInfo": {
    "type": "stripe",
    "token": "tok_visa_1234567890",
    "customer": {
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com"
    }
  }
}
```

### PayPal

Para pagos a través de PayPal:

```json
{
  "paymentInfo": {
    "type": "paypal",
    "transactionId": "PAY-1AB23456CD789012EF34GHIJ"
  }
}
```

### Transferencia Bancaria

Para pagos por transferencia:

```json
{
  "paymentInfo": {
    "type": "transferencia",
    "comprobante": "TR-20230610-123456",
    "banco": "Banco XYZ",
    "fecha": "2023-06-10"
  }
}
```

## Códigos de Respuesta

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Datos inválidos o error en la solicitud
- **401**: No autorizado (token inválido o expirado)
- **403**: Prohibido (no tienes permisos suficientes)
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## Soporte

Si encuentras algún problema o tienes preguntas sobre la API, contacta a nuestro equipo de soporte en soporte@mantasytrenzas.com.