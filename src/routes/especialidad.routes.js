const express = require('express');
const router = express.Router();
const EspecialidadController = require('../controllers/especialidad.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para crear/actualizar especialidad
const especialidadValidators = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no debe exceder los 500 caracteres')
];

// Obtener todas las especialidades
router.get('/', EspecialidadController.getAll);

// Buscar especialidades por nombre
router.get('/search', EspecialidadController.search);

// Obtener una especialidad por ID
router.get('/:id', EspecialidadController.getById);

// Crear una nueva especialidad (solo admin)
router.post(
  '/',
  isAuthenticated,
  hasRole(['admin']),
  especialidadValidators,
  validationMiddleware,
  EspecialidadController.create
);

// Actualizar una especialidad (solo admin)
router.put(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  especialidadValidators,
  validationMiddleware,
  EspecialidadController.update
);

// Eliminar una especialidad (solo admin)
router.delete(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  EspecialidadController.delete
);

module.exports = router; 