// Este archivo se ejecutará antes de todas las pruebas
// Aquí podemos establecer mocks y configuraciones globales

// Configurar variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.JWT_SECRET = 'test_secret_key';

// Importar jest
import { jest } from '@jest/globals';

// Mock global para jest
global.jest = jest;

// Crear mock común para la base de datos
const mockPool = {
  query: jest.fn().mockImplementation(() => {
    return { rows: [] };
  }),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn()
};

// Mock para database.js
jest.mock('../database/database.js', () => {
  return {
    db: mockPool
  };
});

// Mock para db.js
jest.mock('../database/db.js', () => {
  return {
    pool: mockPool
  };
});

// Mock para connection.js
jest.mock('../database/connection.js', () => {
  return {
    pool: mockPool
  };
}); 