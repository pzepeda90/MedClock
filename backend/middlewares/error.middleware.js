import { HttpError } from "../utils/errors.js";

/**
 * Middleware para manejar errores HTTP
 * @param {Error} err - Error capturado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para pasar al siguiente middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);
  
  // Determinar código de estado y mensaje apropiados
  let statusCode = err instanceof HttpError ? err.statusCode : (err.statusCode || 500);
  let errorMessage = err.message || "Error interno del servidor";
  let errorData = err instanceof HttpError ? err.data : null;
  
  // Manejar errores específicos de PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = 409;
        errorMessage = "Conflicto con el estado actual del recurso: clave duplicada";
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        errorMessage = "No se puede realizar la operación debido a restricciones de clave foránea";
        break;
      case '42P01': // Undefined table
        statusCode = 500;
        errorMessage = "Error interno: tabla no definida";
        break;
      // Añadir más códigos según sea necesario
    }
  }
  
  // Enviar respuesta de error
  res.status(statusCode).json({
    error: true,
    message: errorMessage,
    ...(errorData && { details: errorData }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware para manejar rutas no encontradas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: true,
    message: "Ruta no encontrada",
    path: req.originalUrl
  });
};

export default {
  errorHandler,
  notFoundHandler
}; 