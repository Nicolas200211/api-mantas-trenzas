import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mantas_trenzas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos y crear tablas si no existen
export const initDatabase = async (): Promise<void> => {
  try {
    // Crear tabla de productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        artesano VARCHAR(255) NOT NULL,
        stock INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(100),
        apellido VARCHAR(100),
        roles JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        estado ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de detalles de pedido
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedido_productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
      )
    `);

    // Crear tabla de cultura
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cultura (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        region VARCHAR(100) NOT NULL,
        pais VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla para tradiciones de culturas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cultura_tradiciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cultura_id INT NOT NULL,
        tradicion VARCHAR(255) NOT NULL,
        FOREIGN KEY (cultura_id) REFERENCES cultura(id) ON DELETE CASCADE
      )
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

export default pool;