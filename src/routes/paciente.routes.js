const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/paciente.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para crear paciente
const createPacienteValidators = [
  // Datos de usuario
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Debe proporcionar un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  // Datos de paciente
  body('rut')
    .notEmpty().withMessage('El RUT es obligatorio')
    .matches(/^(\d{1,3}(?:\.\d{1,3}){2}-[\dkK])$|^(\d{7,8}-[\dkK])$/).withMessage('Formato de RUT inválido'),
  body('telefono')
    .optional()
    .matches(/^\+?[0-9]{6,15}$/).withMessage('Formato de teléfono inválido'),
  body('fecha_nacimiento')
    .optional()
    .isDate().withMessage('Formato de fecha inválido'),
  body('sexo')
    .optional()
    .isIn(['M', 'F', 'O']).withMessage('Sexo debe ser M, F u O'),
  body('grupo_sanguineo')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Grupo sanguíneo inválido')
];

// Validadores para actualizar paciente (menos restrictivos)
const updatePacienteValidators = [
  // Datos de usuario
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('email').optional().isEmail().withMessage('Debe proporcionar un email válido'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  // Datos de paciente
  body('rut')
    .optional()
    .matches(/^(\d{1,3}(?:\.\d{1,3}){2}-[\dkK])$|^(\d{7,8}-[\dkK])$/).withMessage('Formato de RUT inválido'),
  body('telefono')
    .optional()
    .matches(/^\+?[0-9]{6,15}$/).withMessage('Formato de teléfono inválido'),
  body('fecha_nacimiento')
    .optional()
    .isDate().withMessage('Formato de fecha inválido'),
  body('sexo')
    .optional()
    .isIn(['M', 'F', 'O']).withMessage('Sexo debe ser M, F u O'),
  body('grupo_sanguineo')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Grupo sanguíneo inválido')
];

// Rutas públicas

// Rutas protegidas - Requieren autenticación
// Algunos endpoints permiten acceso solo a roles específicos

// Obtener todos los pacientes (admin, médico, enfermera, secretario)
router.get(
  '/',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  PacienteController.getAll
);

// Buscar pacientes (admin, médico, enfermera, secretario)
router.get(
  '/search',
  isAuthenticated,
  hasRole(['admin', 'médico', 'enfermera', 'tens', 'secretario']),
  PacienteController.search
);

// Obtener un paciente por ID 
// (admin, médico, enfermera, secretario o el propio paciente)
router.get(
  '/:id',
  isAuthenticated,
  (req, res, next) => {
    // Permitir al propio paciente ver su información
    const requestedId = parseInt(req.params.id);
    if (req.user.rol === 'paciente' && req.user.id !== requestedId) {
      return res.status(403).json({
        error: true,
        message: 'No tiene permiso para acceder a la información de este paciente'
      });
    }
    next();
  },
  PacienteController.getById
);

// Obtener el historial médico de un paciente 
// (admin, médico, enfermera o el propio paciente)
router.get(
  '/:id/historial',
  isAuthenticated,
  (req, res, next) => {
    // Permitir al propio paciente ver su historial
    const requestedId = parseInt(req.params.id);
    if (req.user.rol === 'paciente' && req.user.id !== requestedId) {
      return res.status(403).json({
        error: true,
        message: 'No tiene permiso para acceder al historial de este paciente'
      });
    }
    next();
  },
  PacienteController.getHistorialMedico
);

// Obtener las citas de un paciente 
// (admin, médico, enfermera, secretario o el propio paciente)
router.get(
  '/:id/citas',
  isAuthenticated,
  (req, res, next) => {
    // Permitir al propio paciente ver sus citas
    const requestedId = parseInt(req.params.id);
    if (req.user.rol === 'paciente' && req.user.id !== requestedId) {
      return res.status(403).json({
        error: true,
        message: 'No tiene permiso para acceder a las citas de este paciente'
      });
    }
    next();
  },
  PacienteController.getCitas
);

// Crear un nuevo paciente (admin, secretario)
router.post(
  '/',
  isAuthenticated,
  hasRole(['admin', 'secretario']),
  createPacienteValidators,
  validationMiddleware,
  PacienteController.create
);

// Actualizar un paciente (admin, secretario o el propio paciente)
router.put(
  '/:id',
  isAuthenticated,
  (req, res, next) => {
    // Permitir al propio paciente actualizar su información
    const requestedId = parseInt(req.params.id);
    if (req.user.rol === 'paciente' && req.user.id !== requestedId) {
      return res.status(403).json({
        error: true,
        message: 'No tiene permiso para modificar la información de este paciente'
      });
    }
    next();
  },
  updatePacienteValidators,
  validationMiddleware,
  PacienteController.update
);

// Eliminar un paciente (solo admin)
router.delete(
  '/:id',
  isAuthenticated,
  hasRole(['admin']),
  PacienteController.delete
);

module.exports = router; 