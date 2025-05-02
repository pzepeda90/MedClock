import express from 'express';
import * as HorarioController from '../controllers/horario.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo horario disponible
router.post('/', HorarioController.crearHorario);

// Obtener todos los horarios (con filtros opcionales)
router.get('/', HorarioController.obtenerHorarios);

// Obtener un horario por su ID
router.get('/:id', HorarioController.obtenerHorarioPorId);

// Actualizar un horario
router.put('/:id', HorarioController.actualizarHorario);

// Eliminar un horario
router.delete('/:id', HorarioController.eliminarHorario);

// Verificar disponibilidad
router.get('/verificar/disponibilidad', HorarioController.verificarDisponibilidad);

export default router; 