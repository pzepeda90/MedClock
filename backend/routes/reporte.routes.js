import express from 'express';
import ReporteController from '../controllers/reporte.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Dashboard general de indicadores
router.get('/dashboard', ReporteController.getDashboard);

// Estadísticas generales
router.get('/estadisticas-generales', ReporteController.getEstadisticasGenerales);

// Obtener estadísticas de citas por período (día, semana, mes, año)
router.get('/citas-por-periodo', ReporteController.getCitasPorPeriodo);

// Diagnósticos más frecuentes
router.get('/diagnosticos-frecuentes', ReporteController.getDiagnosticosFrecuentes);

export default router; 