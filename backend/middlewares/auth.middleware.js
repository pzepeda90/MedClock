import "dotenv/config";
import jwt from "jsonwebtoken";

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
      return res.status(401).json({
        error: true,
        message: 'No autorizado: token no proporcionado'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    
    // Almacenar información del usuario en el objeto req
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    
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
