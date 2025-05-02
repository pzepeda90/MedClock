import express from 'express';
import * as EspecialidadController from '../controllers/especialidad.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear una nueva especialidad
router.post('/', EspecialidadController.crearEspecialidad);

// Obtener todas las especialidades
router.get('/', EspecialidadController.obtenerEspecialidades);

// Obtener una especialidad por su ID
router.get('/:id', EspecialidadController.obtenerEspecialidadPorId);

// Actualizar una especialidad
router.put('/:id', EspecialidadController.actualizarEspecialidad);

// Eliminar una especialidad
router.delete('/:id', EspecialidadController.eliminarEspecialidad);

// Obtener profesionales de una especialidad
router.get('/:id/profesionales', EspecialidadController.obtenerProfesionalesEspecialidad);

export default router; 