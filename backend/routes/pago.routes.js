import express from 'express';
import * as PagoController from '../controllers/pago.controller.js';
import { verifyToken, hasRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo pago
router.post('/', hasRole(['admin', 'recepcionista']), PagoController.crearPago);

// Obtener todos los pagos (con filtros opcionales)
router.get('/', PagoController.obtenerPagos);

// Para evitar conflictos con otras rutas que usan parámetros, debemos definir las rutas específicas primero
// Obtener pagos por paciente
router.get('/paciente/:id_paciente', PagoController.obtenerPagosPorPaciente);

// Obtener pago por cita
router.get('/cita/:id_cita', PagoController.obtenerPagoPorCita);

// Generar reporte de pagos
router.get('/reporte', hasRole(['admin', 'recepcionista']), PagoController.generarReportePagos);

// Obtener pagos por médico
router.get('/medico/:id_medico', hasRole(['admin', 'medico']), PagoController.obtenerPagosPorMedico);

// Obtener historial de auditoría de un pago
router.get('/:id/auditoria', hasRole(['admin', 'medico', 'recepcionista']), PagoController.obtenerAuditoriaPago);

// Obtener un pago por su ID
router.get('/:id', PagoController.obtenerPagoPorId);

// Actualizar un pago
router.put('/:id', hasRole(['admin', 'recepcionista']), PagoController.actualizarPago);

// Actualizar estado de un pago
router.patch('/:id/estado', hasRole(['admin', 'recepcionista']), PagoController.actualizarEstadoPago);

// Registrar pago (cuando se confirma un pago pendiente)
router.post('/:id/registrar', hasRole(['admin', 'recepcionista']), PagoController.registrarPago);

// Asignar código de procedimiento a un pago
router.post('/:id/codigo-procedimiento', hasRole(['admin', 'medico', 'recepcionista']), PagoController.asignarCodigoProcedimiento);

export default router; 