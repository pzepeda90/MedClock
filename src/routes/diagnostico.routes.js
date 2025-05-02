const express = require('express');
const router = express.Router();
const DiagnosticoController = require('../controllers/diagnostico.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { body, query, param } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para crear diagnóstico
const createDiagnosticoValidators = [
  body('codigo')
    .notEmpty().withMessage('El código es obligatorio')
    .isString().withMessage('El código debe ser texto')
    .isLength({ min: 1, max: 20 }).withMessage('El código debe tener entre 1 y 20 caracteres'),
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ min: 3, max: 200 }).withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('categoria')
    .optional()
    .isString().withMessage('La categoría debe ser texto')
];

// Validadores para actualizar diagnóstico
const updateDiagnosticoValidators = [
  body('codigo')
    .optional()
    .isString().withMessage('El código debe ser texto')
    .isLength({ min: 1, max: 20 }).withMessage('El código debe tener entre 1 y 20 caracteres'),
  body('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ min: 3, max: 200 }).withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('categoria')
    .optional()
    .isString().withMessage('La categoría debe ser texto')
];

// Validadores para asociar diagnóstico a cita
const asociarDiagnosticoValidators = [
  body('diagnosticoId')
    .notEmpty().withMessage('El ID del diagnóstico es obligatorio')
    .isInt({ min: 1 }).withMessage('ID de diagnóstico inválido'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser texto')
];

// Rutas públicas
// Búsqueda de diagnósticos
router.get(
  '/search',
  [
    query('term').notEmpty().withMessage('El término de búsqueda es obligatorio'),
    validationMiddleware
  ],
  DiagnosticoController.search
);

// Rutas protegidas - Requieren autenticación
// Algunos endpoints permiten acceso solo a roles específicos

// Obtener todos los diagnósticos (con filtros opcionales)
router.get(
  '/',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  DiagnosticoController.getAll
);

// Obtener un diagnóstico por ID
router.get(
  '/:id',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de diagnóstico inválido'),
    validationMiddleware
  ],
  DiagnosticoController.getById
);

// Obtener un diagnóstico por código
router.get(
  '/codigo/:codigo',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  DiagnosticoController.getByCodigo
);

// Crear un nuevo diagnóstico (admin, médico)
router.post(
  '/',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  createDiagnosticoValidators,
  validationMiddleware,
  DiagnosticoController.create
);

// Actualizar un diagnóstico (admin, médico)
router.put(
  '/:id',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de diagnóstico inválido'),
    ...updateDiagnosticoValidators,
    validationMiddleware
  ],
  DiagnosticoController.update
);

// Eliminar un diagnóstico (admin)
router.delete(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de diagnóstico inválido'),
    validationMiddleware
  ],
  DiagnosticoController.delete
);

// Asociar diagnóstico a cita
router.post(
  '/cita/:citaId',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  [
    param('citaId').isInt({ min: 1 }).withMessage('ID de cita inválido'),
    ...asociarDiagnosticoValidators,
    validationMiddleware
  ],
  DiagnosticoController.asociarACita
);

// Obtener diagnósticos de una cita
router.get(
  '/cita/:citaId',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario', 'paciente']),
  [
    param('citaId').isInt({ min: 1 }).withMessage('ID de cita inválido'),
    validationMiddleware
  ],
  DiagnosticoController.getDiagnosticosByCita
);

// Desasociar diagnóstico de cita
router.delete(
  '/cita/:citaId/diagnostico/:diagnosticoId',
  isAuthenticated,
  hasRole(['admin', 'médico']),
  [
    param('citaId').isInt({ min: 1 }).withMessage('ID de cita inválido'),
    param('diagnosticoId').isInt({ min: 1 }).withMessage('ID de diagnóstico inválido'),
    validationMiddleware
  ],
  DiagnosticoController.desasociarDeCita
);

module.exports = router; 