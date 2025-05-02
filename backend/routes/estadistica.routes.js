import express from 'express';
import * as EstadisticaController from '../controllers/estadistica.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Obtener estadísticas generales para el dashboard
router.get('/general', EstadisticaController.obtenerEstadisticasGenerales);

// Obtener estadísticas de citas por mes
router.get('/citas/mensual', EstadisticaController.obtenerEstadisticasCitasPorMes);

// Obtener estadísticas de ingresos por mes
router.get('/ingresos/mensual', EstadisticaController.obtenerEstadisticasIngresosPorMes);

// Obtener ranking de profesionales por citas
router.get('/profesionales/ranking', EstadisticaController.obtenerRankingProfesionales);

// Obtener estadísticas por especialidad
router.get('/especialidades', EstadisticaController.obtenerEstadisticasPorEspecialidad);

// Obtener tiempos de espera promedio por especialidad
router.get('/tiempos-espera', EstadisticaController.obtenerTiemposEsperaPromedio);

export default router; 