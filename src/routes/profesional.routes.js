const express = require('express');
const router = express.Router();
const ProfesionalController = require('../controllers/profesional.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para crear profesional
const createProfesionalValidators = [
  // Datos de usuario
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Debe proporcionar un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .isIn(['médico', 'enfermera', 'tens'])
    .withMessage('Rol debe ser médico, enfermera o tens'),
  
  // Datos de profesional
  body('rut')
    .notEmpty().withMessage('El RUT es obligatorio')
    .matches(/^(\d{1,3}(?:\.\d{1,3}){2}-[\dkK])$|^(\d{7,8}-[\dkK])$/).withMessage('Formato de RUT inválido'),
  body('especialidad_id')
    .notEmpty().withMessage('La especialidad es obligatoria')
    .isInt({ min: 1 }).withMessage('ID de especialidad inválido'),
  body('telefono')
    .optional()
    .matches(/^\+?[0-9]{6,15}$/).withMessage('Formato de teléfono inválido'),
  body('numero_registro')
    .optional()
    .isString().withMessage('Formato de número de registro inválido')
];

// Validadores para actualizar profesional (menos restrictivos)
const updateProfesionalValidators = [
  // Datos de usuario
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('email').optional().isEmail().withMessage('Debe proporcionar un email válido'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isIn(['médico', 'enfermera', 'tens'])
    .withMessage('Rol debe ser médico, enfermera o tens'),
  
  // Datos de profesional
  body('rut')
    .optional()
    .matches(/^(\d{1,3}(?:\.\d{1,3}){2}-[\dkK])$|^(\d{7,8}-[\dkK])$/).withMessage('Formato de RUT inválido'),
  body('especialidad_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de especialidad inválido'),
  body('telefono')
    .optional()
    .matches(/^\+?[0-9]{6,15}$/).withMessage('Formato de teléfono inválido'),
  body('numero_registro')
    .optional()
    .isString().withMessage('Formato de número de registro inválido')
];

// Rutas públicas

// Obtener profesionales por especialidad (pública)
router.get('/especialidad/:especialidad_id', ProfesionalController.getByEspecialidad);

// Rutas protegidas - Requieren autenticación
// Algunos endpoints permiten acceso solo a roles específicos

// Obtener todos los profesionales (admin, médico, enfermera, secretario)
router.get(
  '/',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  ProfesionalController.getAll
);

// Buscar profesionales (admin, médico, enfermera, secretario)
router.get(
  '/search',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  ProfesionalController.search
);

// Obtener un profesional por ID 
// (admin, médico, enfermera, secretario o el propio profesional)
router.get(
  '/:id',
  isAuthenticated,
  (req, res, next) => {
    // Permitir al propio profesional ver su información
    const requestedId = parseInt(req.params.id);
    if (['médico', 'enfermera', 'tens'].includes(req.user.rol) && req.user.id !== requestedId) {
      return res.status(403).json({
        error: true,
        message: 'No tiene permiso para acceder a la información de este profesional'
      });
    }
    next();
  },
  ProfesionalController.getById
);

// Obtener los horarios disponibles de un profesional
// (admin, secretario, el propio profesional, o cualquier usuario autenticado)
router.get(
  '/:id/horarios-disponibles',
  isAuthenticated,
  ProfesionalController.getHorariosDisponibles
);

// Obtener las citas agendadas de un profesional
// (admin, secretario o el propio profesional)
router.get(
  '/:id/citas',
  isAuthenticated,
  (req, res, next) => {
    // Permitir al propio profesional ver sus citas
    const requestedId = parseInt(req.params.id);
    if (!['admin', 'secretario'].includes(req.user.rol) && req.user.id !== requestedId) {
      return res.status(403).json({
        error: true,
        message: 'No tiene permiso para acceder a las citas de este profesional'
      });
    }
    next();
  },
  ProfesionalController.getCitasAgendadas
);

// Crear un nuevo profesional (solo admin)
router.post(
  '/',
  isAuthenticated,
  hasRole(['admin']),
  createProfesionalValidators,
  validationMiddleware,
  ProfesionalController.create
);

// Actualizar un profesional (admin o el propio profesional)
router.put(
  '/:id',
  isAuthenticated,
  (req, res, next) => {
    // Permitir al propio profesional actualizar su información
    const requestedId = parseInt(req.params.id);
    if (!['admin'].includes(req.user.rol) && req.user.id !== requestedId) {
      return res.status(403).json({
        error: true,
        message: 'No tiene permiso para modificar la información de este profesional'
      });
    }
    next();
  },
  updateProfesionalValidators,
  validationMiddleware,
  ProfesionalController.update
);

// Eliminar un profesional (solo admin)
router.delete(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  ProfesionalController.delete
);

module.exports = router; 