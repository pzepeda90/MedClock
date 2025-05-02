import express from 'express';
import * as ServicioController from '../controllers/servicio.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo servicio
router.post('/', ServicioController.crearServicio);

// Obtener todos los servicios (con filtros opcionales por precio o duración)
router.get('/', ServicioController.obtenerServicios);

// Obtener un servicio por su ID
router.get('/:id', ServicioController.obtenerServicioPorId);

// Actualizar un servicio
router.put('/:id', ServicioController.actualizarServicio);

// Eliminar un servicio
router.delete('/:id', ServicioController.eliminarServicio);

// Obtener profesionales que ofrecen un servicio
router.get('/:id/profesionales', ServicioController.obtenerProfesionalesServicio);

// Asignar un profesional a un servicio
router.post('/:id/profesionales', ServicioController.asignarProfesionalServicio);

// Eliminar un profesional de un servicio
router.delete('/:id/profesionales/:id_profesional', ServicioController.eliminarProfesionalServicio);

export default router; 