import { jest } from '@jest/globals';

// Configuración del entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3001'; // Puerto específico para pruebas

// Configuraciones globales para las pruebas
beforeAll(() => {
  // Configuración antes de todas las pruebas
  jest.resetModules();
});

afterAll(() => {
  // Limpieza después de todas las pruebas
  jest.clearAllMocks();
});

// Configuración para cada prueba
beforeEach(() => {
  // Configuración antes de cada prueba
  jest.clearAllMocks();
}); 