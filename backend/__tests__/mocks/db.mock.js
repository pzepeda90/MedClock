import { jest } from '@jest/globals';

// Mock para la conexión a la base de datos
export const pool = {
  query: jest.fn(),
  connect: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn()
  }))
};

// Función para resetear todos los mocks
export const resetMocks = () => {
  jest.clearAllMocks();
};

// Función para configurar respuestas mock
export const setupMock = (mockFn, response) => {
  mockFn.mockResolvedValue(response);
};

// Función para configurar errores mock
export const setupErrorMock = (mockFn, error) => {
  mockFn.mockRejectedValue(error);
}; 