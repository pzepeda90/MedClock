/**
 * Clase para crear errores HTTP con código de estado
 * @extends Error
 */
export class HttpError extends Error {
  /**
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP
   * @param {Object} [data=null] - Datos adicionales del error
   */
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;
    
    // Capturar stack trace para desarrollo
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error 400 - Bad Request
 */
export class BadRequestError extends HttpError {
  constructor(message = 'Solicitud inválida', data = null) {
    super(message, 400, data);
  }
}

/**
 * Error 401 - Unauthorized
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'No autorizado', data = null) {
    super(message, 401, data);
  }
}

/**
 * Error 403 - Forbidden
 */
export class ForbiddenError extends HttpError {
  constructor(message = 'Acceso prohibido', data = null) {
    super(message, 403, data);
  }
}

/**
 * Error 404 - Not Found
 */
export class NotFoundError extends HttpError {
  constructor(message = 'Recurso no encontrado', data = null) {
    super(message, 404, data);
  }
}

/**
 * Error 409 - Conflict
 */
export class ConflictError extends HttpError {
  constructor(message = 'Conflicto con el estado actual del recurso', data = null) {
    super(message, 409, data);
  }
}

/**
 * Error 422 - Unprocessable Entity
 */
export class ValidationError extends HttpError {
  constructor(message = 'Error de validación', data = null) {
    super(message, 422, data);
  }
}

/**
 * Error 500 - Internal Server Error
 */
export class InternalServerError extends HttpError {
  constructor(message = 'Error interno del servidor', data = null) {
    super(message, 500, data);
  }
}

export default {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError
}; 