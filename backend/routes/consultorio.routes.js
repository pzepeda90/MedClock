import express from 'express';
import * as ConsultorioController from '../controllers/consultorio.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo consultorio
router.post('/', ConsultorioController.crearConsultorio);

// Obtener todos los consultorios (con filtros opcionales por comuna o región)
router.get('/', ConsultorioController.obtenerConsultorios);

// Obtener un consultorio por su ID
router.get('/:id', ConsultorioController.obtenerConsultorioPorId);

// Actualizar un consultorio
router.put('/:id', ConsultorioController.actualizarConsultorio);

// Eliminar un consultorio
router.delete('/:id', ConsultorioController.eliminarConsultorio);

// Obtener citas programadas en un consultorio
router.get('/:id/citas', ConsultorioController.obtenerCitasConsultorio);

// Obtener profesionales que atienden en un consultorio
router.get('/:id/profesionales', ConsultorioController.obtenerProfesionalesConsultorio);

export default router; 