import express from 'express';
import * as ProfesionalController from '../controllers/profesional.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo profesional
router.post('/', ProfesionalController.crearProfesional);

// Obtener todos los profesionales (con filtros opcionales por especialidad)
router.get('/', ProfesionalController.obtenerProfesionales);

// Obtener un profesional por su ID
router.get('/:id', ProfesionalController.obtenerProfesionalPorId);

// Actualizar un profesional
router.put('/:id', ProfesionalController.actualizarProfesional);

// Eliminar un profesional
router.delete('/:id', ProfesionalController.eliminarProfesional);

// Obtener servicios de un profesional
router.get('/:id/servicios', ProfesionalController.obtenerServiciosProfesional);

// Asignar un servicio a un profesional
router.post('/:id/servicios', ProfesionalController.asignarServicioProfesional);

// Eliminar un servicio de un profesional
router.delete('/:id/servicios/:id_servicio', ProfesionalController.eliminarServicioProfesional);

export default router; 