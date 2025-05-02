const express = require('express');
const router = express.Router();
const ConsultorioController = require('../controllers/consultorio.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para crear consultorio
const createConsultorioValidators = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('direccion')
    .notEmpty().withMessage('La dirección es obligatoria')
    .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres'),
  body('telefono')
    .optional()
    .matches(/^\+?[0-9]{6,15}$/).withMessage('Formato de teléfono inválido'),
  body('email')
    .optional()
    .isEmail().withMessage('Debe proporcionar un email válido'),
  body('coordenadas')
    .optional()
    .isObject().withMessage('Las coordenadas deben ser un objeto con latitud y longitud'),
  body('coordenadas.latitud')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('coordenadas.longitud')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('horario_atencion')
    .optional()
    .isObject().withMessage('El horario de atención debe ser un objeto'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('Estado inválido, debe ser activo o inactivo')
];

// Validadores para actualizar consultorio (menos restrictivos)
const updateConsultorioValidators = [
  body('nombre')
    .optional()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('direccion')
    .optional()
    .notEmpty().withMessage('La dirección no puede estar vacía')
    .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres'),
  body('telefono')
    .optional()
    .matches(/^\+?[0-9]{6,15}$/).withMessage('Formato de teléfono inválido'),
  body('email')
    .optional()
    .isEmail().withMessage('Debe proporcionar un email válido'),
  body('coordenadas')
    .optional()
    .isObject().withMessage('Las coordenadas deben ser un objeto con latitud y longitud'),
  body('coordenadas.latitud')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('coordenadas.longitud')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('horario_atencion')
    .optional()
    .isObject().withMessage('El horario de atención debe ser un objeto'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('Estado inválido, debe ser activo o inactivo')
];

// Rutas públicas

// Obtener todos los consultorios (pública)
router.get('/', ConsultorioController.getAll);

// Buscar consultorios (pública)
router.get('/search', ConsultorioController.search);

// Obtener un consultorio por ID (pública)
router.get('/:id', ConsultorioController.getById);

// Obtener profesionales que atienden en un consultorio (pública)
router.get('/:id/profesionales', ConsultorioController.getProfesionales);

// Obtener horarios disponibles en un consultorio (pública)
router.get('/:id/horarios-disponibles', ConsultorioController.getHorariosDisponibles);

// Rutas protegidas - Requieren autenticación
// Algunos endpoints permiten acceso solo a roles específicos

// Crear un nuevo consultorio (solo admin)
router.post(
  '/',
  isAuthenticated,
  hasRole(['admin']),
  createConsultorioValidators,
  validationMiddleware,
  ConsultorioController.create
);

// Actualizar un consultorio (solo admin)
router.put(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  updateConsultorioValidators,
  validationMiddleware,
  ConsultorioController.update
);

// Eliminar un consultorio (solo admin)
router.delete(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  ConsultorioController.delete
);

module.exports = router; 