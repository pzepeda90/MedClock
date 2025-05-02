const express = require('express');
const router = express.Router();
const CitaController = require('../controllers/cita.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { body, query, param } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para crear cita
const createCitaValidators = [
  body('horario_id')
    .notEmpty().withMessage('El ID del horario es obligatorio')
    .isInt({ min: 1 }).withMessage('ID de horario inválido'),
  body('paciente_id')
    .notEmpty().withMessage('El ID del paciente es obligatorio')
    .isInt({ min: 1 }).withMessage('ID de paciente inválido'),
  body('servicio_id')
    .notEmpty().withMessage('El ID del servicio es obligatorio')
    .isInt({ min: 1 }).withMessage('ID de servicio inválido'),
  body('motivo_consulta')
    .optional()
    .isString().withMessage('El motivo de consulta debe ser texto'),
  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser texto')
];

// Validadores para actualizar cita
const updateCitaValidators = [
  body('horario_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de horario inválido'),
  body('paciente_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de paciente inválido'),
  body('servicio_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de servicio inválido'),
  body('motivo_consulta')
    .optional()
    .isString().withMessage('El motivo de consulta debe ser texto'),
  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser texto')
];

// Validadores para cancelar cita
const cancelCitaValidators = [
  body('motivo')
    .notEmpty().withMessage('El motivo de cancelación es obligatorio')
    .isString().withMessage('El motivo debe ser texto')
];

// Validadores para completar cita
const completarCitaValidators = [
  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser texto')
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

// Validador de ID
const idValidator = param('id')
  .isInt({ min: 1 }).withMessage('ID de cita inválido');

// Rutas PÚBLICAS
// Ninguna ruta de citas es pública, todas requieren autenticación

// Rutas PROTEGIDAS
// Obtener todas las citas (con filtros opcionales)
router.get(
  '/',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  CitaController.getAll
);

// Obtener una cita por ID
router.get(
  '/:id',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario', 'paciente']),
  [idValidator, validationMiddleware],
  CitaController.getById
);

// Obtener citas para un paciente
router.get(
  '/paciente/:paciente_id',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario', 'paciente']),
  [
    param('paciente_id').isInt({ min: 1 }).withMessage('ID de paciente inválido'),
    validationMiddleware
  ],
  CitaController.getByPaciente
);

// Obtener citas para un profesional en un rango de fechas
router.get(
  '/profesional/:id_profesional',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  [
    param('id_profesional').isInt({ min: 1 }).withMessage('ID de profesional inválido'),
    ...dateRangeValidators,
    validationMiddleware
  ],
  CitaController.getByProfesionalAndDateRange
);

// Crear una nueva cita
router.post(
  '/',
  isAuthenticated,
  hasRole(['admin', 'médico', 'secretario', 'paciente']),
  createCitaValidators,
  validationMiddleware,
  CitaController.create
);

// Actualizar una cita
router.put(
  '/:id',
  isAuthenticated,
  hasRole(['admin', 'médico', 'secretario']),
  [idValidator, ...updateCitaValidators, validationMiddleware],
  CitaController.update
);

// Cancelar una cita
router.patch(
  '/:id/cancelar',
  isAuthenticated,
  hasRole(['admin', 'médico', 'secretario', 'paciente']),
  [idValidator, ...cancelCitaValidators, validationMiddleware],
  CitaController.cancelar
);

// Completar una cita
router.patch(
  '/:id/completar',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens']),
  [idValidator, ...completarCitaValidators, validationMiddleware],
  CitaController.completar
);

// Eliminar una cita (solo admin)
router.delete(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  [idValidator, validationMiddleware],
  CitaController.delete
);

module.exports = router; 