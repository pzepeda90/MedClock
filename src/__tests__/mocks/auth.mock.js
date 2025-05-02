/**
 * Mock para el middleware de autenticación
 */

// Mock del middleware de autenticación
const isAuthenticated = jest.fn((req, res, next) => {
  // Por defecto, se considera autenticado en los tests
  req.user = {
    id: 1,
    email: 'test@example.com',
    nombre: 'Usuario Test',
    rol: 'admin'
  };
  next();
});

// Mock del middleware de verificación de roles
const hasRole = jest.fn((roles) => {
  return (req, res, next) => {
    // Por defecto, se considera autorizado en los tests
    next();
  };
});

module.exports = {
  isAuthenticated,
  hasRole
}; 