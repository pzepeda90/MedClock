import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/user.route.js';
import jwt from 'jsonwebtoken';
import bcript from 'bcryptjs';

// Mock de los módulos
jest.mock('../../models/user.model.js', () => ({
  userModel: {
    findOneEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn()
  }
}));

// Importar después del mock para acceder a la versión mockeada
import { userModel } from '../../models/user.model.js';

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

// Crear aplicación Express para pruebas
const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('Rutas de Usuarios', () => {
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('POST /users/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      // Mock de datos
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        nombre: 'Usuario Test',
        role: 'paciente'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'paciente'
      };

      // Configurar mocks
      userModel.create.mockResolvedValue(mockUser);
      bcript.hashSync.mockReturnValue('hashed_password');

      // Realizar petición
      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Verificar respuesta
      expect(userModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashed_password',
        nombre: 'Usuario Test',
        role: 'paciente'
      });
      expect(response.body).toEqual({
        message: 'User created successfully'
      });
    });

    it('debería devolver error si el usuario ya existe', async () => {
      // Mock de datos
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      // Configurar mocks para simular error de duplicado
      userModel.create.mockRejectedValue({ code: '23505' });

      // Realizar petición
      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      // Verificar respuesta
      expect(response.body).toEqual({
        message: 'User already exists'
      });
    });
  });

  describe('POST /users/login', () => {
    it('debería iniciar sesión y devolver un token', async () => {
      // Mock de datos
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'paciente'
      };

      const mockToken = 'mock_jwt_token';

      // Configurar mocks
      userModel.findOneEmail.mockResolvedValue(mockUser);
      bcript.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue(mockToken);

      // Realizar petición
      const response = await request(app)
        .post('/users/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(200);

      // Verificar respuesta
      expect(userModel.findOneEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcript.compareSync).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalled();
      expect(response.body).toEqual({
        message: 'Login successfully',
        token: mockToken,
        email: 'test@example.com'
      });
    });

    it('debería devolver error si el usuario no existe', async () => {
      // Mock de datos
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Configurar mocks
      userModel.findOneEmail.mockResolvedValue(null);

      // Realizar petición
      const response = await request(app)
        .post('/users/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(400);

      // Verificar respuesta
      expect(response.body).toEqual({
        message: 'User not found'
      });
    });

    it('debería devolver error si la contraseña es incorrecta', async () => {
      // Mock de datos
      const loginData = {
        email: 'test@example.com',
        password: 'wrong_password'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password'
      };

      // Configurar mocks
      userModel.findOneEmail.mockResolvedValue(mockUser);
      bcript.compareSync.mockReturnValue(false);

      // Realizar petición
      const response = await request(app)
        .post('/users/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(400);

      // Verificar respuesta
      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });
    });
  });
}); 