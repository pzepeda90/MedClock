import express from 'express';
import * as LicenciaController from '../controllers/licencia.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear una nueva licencia médica
router.post('/', LicenciaController.crearLicencia);

// Obtener una licencia por su ID
router.get('/:id', LicenciaController.obtenerLicenciaPorId);

// Obtener todas las licencias de un paciente
router.get('/paciente/:id_paciente', LicenciaController.obtenerLicenciasPorPaciente);

// Obtener todas las licencias emitidas por un profesional
router.get('/profesional/:id_profesional', LicenciaController.obtenerLicenciasPorProfesional);

// Obtener la licencia asociada a una cita
router.get('/cita/:id_cita', LicenciaController.obtenerLicenciaPorCita);

// Obtener licencias médicas vigentes
router.get('/vigentes', LicenciaController.obtenerLicenciasVigentes);

// Actualizar una licencia médica
router.put('/:id', LicenciaController.actualizarLicencia);

// Eliminar una licencia médica
router.delete('/:id', LicenciaController.eliminarLicencia);

// Generar PDF de la licencia
router.get('/:id/pdf', LicenciaController.generarPDFLicencia);

export default router; 