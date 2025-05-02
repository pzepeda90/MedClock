const { verifyToken } = require('../utils/auth');
const { pool } = require('../config/database');

/**
 * Middleware para verificar si el usuario está autenticado
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: true, 
        message: 'No se proporcionó token de autenticación' 
      });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: true, 
        message: 'Token inválido o expirado' 
      });
    }

    // Verificar si el usuario existe y está activo
    const userQuery = 'SELECT id, nombre, email, rol, estado FROM usuarios WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: true, 
        message: 'Usuario no encontrado' 
      });
    }

    const user = userResult.rows[0];
    
    if (!user.estado) {
      return res.status(401).json({ 
        error: true, 
        message: 'Usuario desactivado' 
      });
    }

    // Añadir el usuario al objeto request
    req.user = user;
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error en la autenticación' 
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {Array<string>} roles - Array de roles permitidos
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    // Verificar que el middleware isAuthenticated se ejecutó primero
    if (!req.user) {
      return res.status(500).json({ 
        error: true, 
        message: 'Error de configuración: debe usar isAuthenticated antes de hasRole' 
      });
    }

    // Verificar si el rol del usuario está dentro de los roles permitidos
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: true, 
        message: 'No tiene permiso para acceder a este recurso' 
      });
    }

    // Si el rol es válido, continuar
    next();
  };
};

module.exports = {
  isAuthenticated,
  hasRole
}; 