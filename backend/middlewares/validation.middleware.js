import { validationResult } from 'express-validator';

/**
 * Middleware para validar las reglas definidas por express-validator
 * Retorna un error 400 con los mensajes de validación si hay errores
 * 
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * @returns {Object|void} - Respuesta de error o continúa al siguiente middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: 'Error de validación en los datos enviados',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Sanitiza un objeto eliminando campos no permitidos y
 * asegurando que solo se incluyan los campos permitidos
 * 
 * @param {Object} data - Objeto a sanitizar
 * @param {Array} allowedFields - Lista de campos permitidos
 * @returns {Object} - Objeto sanitizado
 */
export const sanitizeData = (data, allowedFields) => {
  const sanitized = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  });
  
  return sanitized;
};

export default { validate, sanitizeData }; 