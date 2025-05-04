import { body } from 'express-validator';

/**
 * Validación para el registro de usuarios
 */
export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail()
    .trim(),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .trim(),
    
  body('nombre')
    .optional()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
    
  body('role')
    .optional()
    .isIn(['admin', 'medico', 'paciente', 'recepcionista'])
    .withMessage('El rol debe ser uno de: admin, medico, paciente, recepcionista')
    .trim()
];

/**
 * Validación para el inicio de sesión
 */
export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail()
    .trim(),
    
  body('password')
    .isLength({ min: 1 })
    .withMessage('Debe proporcionar una contraseña')
    .trim()
];

/**
 * Validación para actualización de usuario
 */
export const updateUserValidator = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail()
    .trim(),
    
  body('nombre')
    .optional()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
    
  body('role')
    .optional()
    .isIn(['admin', 'medico', 'paciente', 'recepcionista'])
    .withMessage('El rol debe ser uno de: admin, medico, paciente, recepcionista')
    .trim(),
    
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .trim()
];

export default {
  registerValidator,
  loginValidator,
  updateUserValidator
}; 