import 'reflect-metadata';
import dotenv from 'dotenv';
import { Server } from './infrastructure/server';

// Configurar variables de entorno
dotenv.config();

// Crear instancia del servidor
const server = new Server();

// Iniciar el servidor
server.listen();