import express from 'express';
import * as HistorialController from '../controllers/historial.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo registro en el historial médico
router.post('/', HistorialController.crearHistorial);

// Obtener un registro del historial por su ID
router.get('/:id', HistorialController.obtenerHistorialPorId);

// Obtener todo el historial médico de un paciente
router.get('/paciente/:id_paciente', HistorialController.obtenerHistorialPorPaciente);

// Obtener historiales médicos creados por un profesional
router.get('/profesional/:id_profesional', HistorialController.obtenerHistorialPorProfesional);

// Obtener el historial asociado a una cita
router.get('/cita/:id_cita', HistorialController.obtenerHistorialPorCita);

// Buscar en el historial por diagnóstico o tratamiento
router.get('/buscar', HistorialController.buscarHistorial);

// Actualizar un registro del historial
router.put('/:id', HistorialController.actualizarHistorial);

// Eliminar un registro del historial
router.delete('/:id', HistorialController.eliminarHistorial);

// Obtener todas las recetas asociadas a un historial
router.get('/:id/recetas', HistorialController.obtenerRecetasHistorial);

export default router; 