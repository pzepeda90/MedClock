import "dotenv/config";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

/**
 * Middleware para verificar la autenticación mediante token JWT
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar al siguiente middleware
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No autorizado: token no proporcionado');
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    
    // Almacenar información del usuario en el objeto req
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    
    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({
        error: true,
        message: error.message
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'No autorizado: token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'No autorizado: token inválido'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Error en la autenticación'
    });
  }
};

/**
 * Middleware para verificar que el usuario tenga los roles permitidos
 * @param {string[]} roles - Array de roles permitidos
 * @returns {Function} Middleware para verificar roles
 */
export const hasRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autorizado: usuario no autenticado');
      }
      
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('Acceso denegado: no tiene permisos suficientes');
      }
      
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        return res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para verificar el propietario de un recurso
 * @param {Function} getResourceOwnerId - Función que obtiene el ID del propietario del recurso
 * @returns {Function} Middleware para verificar propiedad
 */
export const isOwner = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autorizado: usuario no autenticado');
      }
      
      // Si es administrador, permitir acceso
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Obtener el ID del propietario del recurso
      const ownerId = await getResourceOwnerId(req);
      
      // Verificar si el usuario es el propietario
      if (req.user.id !== ownerId) {
        throw new ForbiddenError('Acceso denegado: no es propietario del recurso');
      }
      
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        return res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al verificar propiedad del recurso'
      });
    }
  };
};

export default {
  verifyToken,
  hasRole,
  isOwner
};
