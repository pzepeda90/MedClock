const express = require('express');
const router = express.Router();
const ReporteController = require('../controllers/reporte.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { query } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores de fechas
const fechasValidators = [
  query('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  query('fecha_fin')
    .notEmpty().withMessage('La fecha de fin es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  validationMiddleware
];

// Dashboard general (resumido)
router.get(
  '/dashboard',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  ReporteController.getDashboard
);

// Estadísticas generales
router.get(
  '/estadisticas-generales',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  ReporteController.getEstadisticasGenerales
);

// Estadísticas de citas por período
router.get(
  '/citas-por-periodo',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  fechasValidators,
  ReporteController.getCitasPorPeriodo
);

// Estadísticas de citas por especialidad
router.get(
  '/citas-por-especialidad',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  fechasValidators,
  ReporteController.getCitasPorEspecialidad
);

// Estadísticas de citas por profesional
router.get(
  '/citas-por-profesional',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  fechasValidators,
  ReporteController.getCitasPorProfesional
);

// Estadísticas de citas por paciente
router.get(
  '/citas-por-paciente',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  fechasValidators,
  ReporteController.getCitasPorPaciente
);

// Estadísticas de horarios disponibles
router.get(
  '/estadisticas-horarios',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  fechasValidators,
  ReporteController.getEstadisticasHorarios
);

// Diagnósticos más frecuentes
router.get(
  '/diagnosticos-frecuentes',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  fechasValidators,
  ReporteController.getDiagnosticosFrecuentes
);

module.exports = router; 