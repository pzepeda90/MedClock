const express = require('express');
const router = express.Router();
const ServicioController = require('../controllers/servicio.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { body, query, param } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para crear servicio
const createServicioValidators = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('duracion_minutos')
    .notEmpty().withMessage('La duración en minutos es obligatoria')
    .isInt({ min: 5 }).withMessage('La duración debe ser un número entero mayor a 5 minutos'),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isNumeric().withMessage('El precio debe ser un número')
    .custom(value => value >= 0).withMessage('El precio no puede ser negativo'),
  body('especialidad_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de especialidad inválido'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
  body('requiere_autorizacion')
    .optional()
    .isBoolean().withMessage('Requiere autorización debe ser un valor booleano')
];

// Validadores para actualizar servicio
const updateServicioValidators = [
  body('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('duracion_minutos')
    .optional()
    .isInt({ min: 5 }).withMessage('La duración debe ser un número entero mayor a 5 minutos'),
  body('precio')
    .optional()
    .isNumeric().withMessage('El precio debe ser un número')
    .custom(value => value >= 0).withMessage('El precio no puede ser negativo'),
  body('especialidad_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de especialidad inválido'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
  body('requiere_autorizacion')
    .optional()
    .isBoolean().withMessage('Requiere autorización debe ser un valor booleano')
];

// Rutas públicas
// Obtener servicios por especialidad
router.get(
  '/especialidad/:especialidad_id',
  [
    param('especialidad_id').isInt({ min: 1 }).withMessage('ID de especialidad inválido'),
    validationMiddleware
  ],
  ServicioController.getByEspecialidad
);

// Rutas protegidas - Requieren autenticación
// Algunos endpoints permiten acceso solo a roles específicos

// Obtener todos los servicios (con filtros opcionales)
router.get(
  '/',
  isAuthenticated,
  ServicioController.getAll
);

// Obtener un servicio por ID
router.get(
  '/:id',
  isAuthenticated,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de servicio inválido'),
    validationMiddleware
  ],
  ServicioController.getById
);

// Crear un nuevo servicio (admin)
router.post(
  '/',
  isAuthenticated,
  hasRole(['admin']),
  createServicioValidators,
  validationMiddleware,
  ServicioController.create
);

// Actualizar un servicio (admin)
router.put(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  updateServicioValidators,
  validationMiddleware,
  ServicioController.update
);

// Eliminar un servicio (admin)
router.delete(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de servicio inválido'),
    validationMiddleware
  ],
  ServicioController.delete
);

module.exports = router; 