import { jest } from '@jest/globals';

// Mock del middleware de autenticación

export const verifyToken = jest.fn((req, res, next) => {
  // Simula un usuario autenticado por defecto
  req.user = {
    id: 1,
    email: 'test@test.com',
    role: 'doctor'
  };
  next();
});

export const setupAuthMock = (role) => {
  verifyToken.mockImplementation((req, res, next) => {
    req.user = {
      id: 1,
      email: 'test@test.com',
      role: role || 'doctor'
    };
    next();
  });
};

export const setupAuthErrorMock = (errorMessage) => {
  verifyToken.mockImplementation((req, res, next) => {
    return res.status(401).json({
      error: errorMessage || 'No autorizado'
    });
  });
};

export const resetAuthMock = () => {
  verifyToken.mockReset();
}; 