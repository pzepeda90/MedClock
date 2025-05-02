const express = require('express');
const router = express.Router();
const HorarioController = require('../controllers/horario.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { body, query, param } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para crear horario disponible
const createHorarioValidators = [
  body('id_profesional')
    .notEmpty().withMessage('El ID del profesional es obligatorio')
    .isInt({ min: 1 }).withMessage('ID de profesional inválido'),
  body('consultorio_id')
    .notEmpty().withMessage('El ID del consultorio es obligatorio')
    .isInt({ min: 1 }).withMessage('ID de consultorio inválido'),
  body('fecha')
    .notEmpty().withMessage('La fecha es obligatoria')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('hora_inicio')
    .notEmpty().withMessage('La hora de inicio es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Formato de hora inválido (HH:MM:SS)'),
  body('hora_fin')
    .notEmpty().withMessage('La hora de fin es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Formato de hora inválido (HH:MM:SS)'),
  body('estado')
    .optional()
    .isIn(['disponible', 'no_disponible', 'reservado']).withMessage('Estado inválido')
];

// Validadores para crear horarios en bloque
const createBulkHorarioValidators = [
  body('horarios')
    .isArray().withMessage('Se debe proporcionar un array de horarios')
    .notEmpty().withMessage('El array de horarios no puede estar vacío'),
  body('horarios.*.id_profesional')
    .notEmpty().withMessage('El ID del profesional es obligatorio')
    .isInt({ min: 1 }).withMessage('ID de profesional inválido'),
  body('horarios.*.consultorio_id')
    .notEmpty().withMessage('El ID del consultorio es obligatorio')
    .isInt({ min: 1 }).withMessage('ID de consultorio inválido'),
  body('horarios.*.fecha')
    .notEmpty().withMessage('La fecha es obligatoria')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('horarios.*.hora_inicio')
    .notEmpty().withMessage('La hora de inicio es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Formato de hora inválido (HH:MM:SS)'),
  body('horarios.*.hora_fin')
    .notEmpty().withMessage('La hora de fin es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Formato de hora inválido (HH:MM:SS)'),
  body('horarios.*.estado')
    .optional()
    .isIn(['disponible', 'no_disponible', 'reservado']).withMessage('Estado inválido')
];

// Validadores para actualizar horario
const updateHorarioValidators = [
  body('id_profesional')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de profesional inválido'),
  body('consultorio_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de consultorio inválido'),
  body('fecha')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('hora_inicio')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Formato de hora inválido (HH:MM:SS)'),
  body('hora_fin')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Formato de hora inválido (HH:MM:SS)'),
  body('estado')
    .optional()
    .isIn(['disponible', 'no_disponible', 'reservado']).withMessage('Estado inválido')
];

// Validadores para filtros en consultas de fechas
const dateRangeValidators = [
  query('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha de inicio inválido (YYYY-MM-DD)'),
  query('fecha_fin')
    .notEmpty().withMessage('La fecha de fin es obligatoria')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato de fecha de fin inválido (YYYY-MM-DD)')
];

// Rutas públicas
// Obtener horarios disponibles por especialidad en un rango de fechas
router.get(
  '/especialidad/:especialidad_id',
  [
    param('especialidad_id').isInt({ min: 1 }).withMessage('ID de especialidad inválido'),
    ...dateRangeValidators,
    validationMiddleware
  ],
  HorarioController.getByEspecialidadAndDateRange
);

// Rutas protegidas - Requieren autenticación
// Algunos endpoints permiten acceso solo a roles específicos

// Obtener todos los horarios disponibles (con filtros opcionales)
router.get(
  '/',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  HorarioController.getAll
);

// Obtener un horario por ID
router.get(
  '/:id',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  HorarioController.getById
);

// Obtener horarios disponibles para un profesional en un rango de fechas
router.get(
  '/profesional/:id_profesional',
  isAuthenticated,
  [
    param('id_profesional').isInt({ min: 1 }).withMessage('ID de profesional inválido'),
    ...dateRangeValidators,
    validationMiddleware
  ],
  HorarioController.getByProfesionalAndDateRange
);

// Obtener horarios disponibles para un consultorio en un rango de fechas
router.get(
  '/consultorio/:consultorio_id',
  isAuthenticated,
  [
    param('consultorio_id').isInt({ min: 1 }).withMessage('ID de consultorio inválido'),
    ...dateRangeValidators,
    validationMiddleware
  ],
  HorarioController.getByConsultorioAndDateRange
);

// Crear un nuevo horario disponible (admin, médico, secretario)
router.post(
  '/',
  isAuthenticated,
  hasRole(['admin', 'médico', 'secretario']),
  createHorarioValidators,
  validationMiddleware,
  HorarioController.create
);

// Crear múltiples horarios disponibles en bloque (admin, médico, secretario)
router.post(
  '/bulk',
  isAuthenticated,
  hasRole(['admin', 'médico', 'secretario']),
  createBulkHorarioValidators,
  validationMiddleware,
  HorarioController.createBulk
);

// Actualizar un horario (admin, médico, secretario)
router.put(
  '/:id',
  isAuthenticated,
  hasRole(['admin', 'médico', 'secretario']),
  updateHorarioValidators,
  validationMiddleware,
  HorarioController.update
);

// Eliminar un horario (admin, médico, secretario)
router.delete(
  '/:id',
  isAuthenticated,
  hasRole(['admin', 'médico', 'secretario']),
  HorarioController.delete
);

module.exports = router; 