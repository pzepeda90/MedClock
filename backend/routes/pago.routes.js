import express from 'express';
import * as PagoController from '../controllers/pago.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo pago
router.post('/', PagoController.crearPago);

// Obtener todos los pagos (con filtros opcionales)
router.get('/', PagoController.obtenerPagos);

// Obtener un pago por su ID
router.get('/:id', PagoController.obtenerPagoPorId);

// Obtener pagos por paciente
router.get('/paciente/:id_paciente', PagoController.obtenerPagosPorPaciente);

// Obtener pago por cita
router.get('/cita/:id_cita', PagoController.obtenerPagoPorCita);

// Actualizar un pago
router.put('/:id', PagoController.actualizarPago);

// Actualizar estado de un pago
router.patch('/:id/estado', PagoController.actualizarEstadoPago);

// Registrar pago (cuando se confirma un pago pendiente)
router.patch('/:id/registrar', PagoController.registrarPago);

// Generar reporte de pagos
router.get('/reportes/periodo', PagoController.generarReportePagos);

export default router; 