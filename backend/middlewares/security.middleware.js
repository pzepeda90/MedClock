import rateLimit from 'express-rate-limit';

/**
 * Middleware para limitar el número de solicitudes por IP
 * Protege contra ataques de fuerza bruta y denegación de servicio
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 solicitudes por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos'
  }
});

/**
 * Middleware específico para rutas de autenticación
 * Más restrictivo para prevenir ataques de fuerza bruta
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Límite de 10 intentos por hora por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente después de una hora'
  }
});

/**
 * Middleware para sanitizar datos y prevenir XSS
 * Elimina caracteres peligrosos de los parámetros de entrada
 */
export const sanitizeInputs = (req, res, next) => {
  // Función para sanitizar string (eliminar scripts y caracteres peligrosos)
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Reemplazar caracteres que podrían ser usados para XSS
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#x60;');
  };
  
  // Función recursiva para sanitizar objetos
  const sanitizeObject = (obj) => {
    if (!obj) return obj;
    
    if (typeof obj === 'string') return sanitizeString(obj);
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  // Sanitizar body, query y params
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  
  next();
};

/**
 * Middleware para añadir encabezados de seguridad
 */
export const securityHeaders = (req, res, next) => {
  // Prevenir que el navegador detecte automáticamente MIME types
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Política de seguridad de contenido (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline';"
  );
  
  // Protección XSS en navegadores antiguos
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevenir que el sitio sea framed (protección contra clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Política de referencia
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  next();
};

export default {
  generalLimiter,
  authLimiter,
  sanitizeInputs,
  securityHeaders
}; 