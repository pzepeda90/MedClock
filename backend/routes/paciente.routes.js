import express from 'express';
import * as PacienteController from '../controllers/paciente.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo paciente
router.post('/', PacienteController.crearPaciente);

// Obtener todos los pacientes
router.get('/', PacienteController.obtenerPacientes);

// Obtener un paciente por su ID
router.get('/:id', PacienteController.obtenerPacientePorId);

// Obtener un paciente por su RUT
router.get('/rut/:rut', PacienteController.obtenerPacientePorRut);

// Actualizar un paciente
router.put('/:id', PacienteController.actualizarPaciente);

// Eliminar un paciente
router.delete('/:id', PacienteController.eliminarPaciente);

export default router; 