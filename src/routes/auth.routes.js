const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Validadores para el registro
const registerValidators = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Debe proporcionar un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isIn(['admin', 'médico', 'enfermera', 'tens', 'secretario', 'paciente'])
    .withMessage('Rol no válido')
];

// Validadores para el login
const loginValidators = [
  body('email').isEmail().withMessage('Debe proporcionar un email válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

// Validadores para cambio de contraseña
const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

// Registrar un nuevo usuario
router.post(
  '/register',
  registerValidators,
  validationMiddleware,
  AuthController.register
);

// Iniciar sesión
router.post(
  '/login',
  loginValidators,
  validationMiddleware,
  AuthController.login
);

// Obtener información del usuario autenticado
router.get(
  '/me',
  isAuthenticated,
  AuthController.me
);

// Cambiar contraseña
router.post(
  '/change-password',
  isAuthenticated,
  changePasswordValidators,
  validationMiddleware,
  AuthController.changePassword
);

module.exports = router; 