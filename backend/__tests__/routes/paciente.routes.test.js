import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import pacienteRoutes from '../../routes/paciente.routes.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import Paciente from '../../models/paciente.model.js';
import Usuario from '../../models/user.model.js';

// Mock del middleware de autenticación
jest.mock('../../middlewares/auth.middleware.js', () => ({
  verifyToken: jest.fn((req, res, next) => next())
}));

// Mock de los modelos
jest.mock('../../models/paciente.model.js');
jest.mock('../../models/user.model.js');

// Crear aplicación Express para pruebas
const app = express();
app.use(express.json());
app.use('/pacientes', pacienteRoutes);

describe('Rutas de Pacientes', () => {
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('GET /pacientes', () => {
    it('debería obtener todos los pacientes', async () => {
      // Mock de datos de pacientes
      const mockPacientes = [
        { id_usuario: '1', rut: '12345678-9', nombre: 'Test User 1' },
        { id_usuario: '2', rut: '98765432-1', nombre: 'Test User 2' }
      ];
      
      // Configurar mock
      Paciente.obtenerTodos = jest.fn().mockResolvedValue(mockPacientes);
      
      // Realizar petición
      const response = await request(app)
        .get('/pacientes')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerTodos).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: false,
        total: 2,
        pacientes: mockPacientes
      });
    });
  });
  
  describe('GET /pacientes/:id', () => {
    it('debería obtener un paciente por su ID', async () => {
      // Mock de datos del paciente
      const mockPaciente = { 
        id_usuario: '1', 
        rut: '12345678-9', 
        telefono: '123456789',
        nombre: 'Test User'
      };
      
      // Configurar mock
      Paciente.obtenerPorId = jest.fn().mockResolvedValue(mockPaciente);
      
      // Realizar petición
      const response = await request(app)
        .get('/pacientes/1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('1');
      expect(response.body).toEqual({
        error: false,
        paciente: mockPaciente
      });
    });
    
    it('debería devolver 404 si el paciente no existe', async () => {
      // Configurar mock
      Paciente.obtenerPorId = jest.fn().mockResolvedValue(null);
      
      // Realizar petición
      const response = await request(app)
        .get('/pacientes/999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('999');
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    });
  });
  
  describe('POST /pacientes', () => {
    it('debería crear un nuevo paciente', async () => {
      // Mock de datos del usuario y paciente
      const mockUsuario = { id: '1', nombre: 'Test User' };
      const mockPacienteCreado = { 
        id_usuario: '1', 
        rut: '12345678-9', 
        telefono: '123456789',
        nombre: 'Test User'
      };
      
      // Datos para crear paciente
      const pacienteData = {
        id_usuario: '1',
        rut: '12345678-9',
        telefono: '123456789'
      };
      
      // Configurar mocks
      Usuario.findById = jest.fn().mockResolvedValue(mockUsuario);
      Paciente.obtenerPorRut = jest.fn().mockResolvedValue(null); // No existe paciente con ese RUT
      Paciente.crear = jest.fn().mockResolvedValue(mockPacienteCreado);
      
      // Realizar petición
      const response = await request(app)
        .post('/pacientes')
        .send(pacienteData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Usuario.findById).toHaveBeenCalledWith('1');
      expect(Paciente.obtenerPorRut).toHaveBeenCalledWith('12345678-9');
      expect(Paciente.crear).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: false,
        mensaje: 'Paciente creado exitosamente',
        paciente: mockPacienteCreado
      });
    });
    
    it('debería devolver error si faltan campos obligatorios', async () => {
      // Datos incompletos
      const pacienteData = {
        id_usuario: '1'
        // Falta rut y teléfono
      };
      
      // Realizar petición
      const response = await request(app)
        .post('/pacientes')
        .send(pacienteData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: true,
        mensaje: 'ID de usuario, RUT y teléfono son obligatorios'
      });
    });
  });
  
  describe('PUT /pacientes/:id', () => {
    it('debería actualizar un paciente existente', async () => {
      // Mock de datos
      const mockPacienteExistente = { 
        id_usuario: '1', 
        rut: '12345678-9', 
        telefono: '123456789'
      };
      
      const mockPacienteActualizado = { 
        id_usuario: '1', 
        rut: '12345678-9', 
        telefono: '987654321'
      };
      
      // Datos para actualizar
      const datosActualizados = {
        telefono: '987654321'
      };
      
      // Configurar mocks
      Paciente.obtenerPorId = jest.fn().mockResolvedValue(mockPacienteExistente);
      Paciente.actualizar = jest.fn().mockResolvedValue(mockPacienteActualizado);
      
      // Realizar petición
      const response = await request(app)
        .put('/pacientes/1')
        .send(datosActualizados)
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('1');
      expect(Paciente.actualizar).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: false,
        mensaje: 'Paciente actualizado exitosamente',
        paciente: mockPacienteActualizado
      });
    });
    
    it('debería devolver 404 si el paciente no existe', async () => {
      // Configurar mock
      Paciente.obtenerPorId = jest.fn().mockResolvedValue(null);
      
      // Realizar petición
      const response = await request(app)
        .put('/pacientes/999')
        .send({ telefono: '987654321' })
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('999');
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    });
  });
  
  describe('DELETE /pacientes/:id', () => {
    it('debería eliminar un paciente existente', async () => {
      // Mock de datos
      const mockPacienteExistente = { 
        id_usuario: '1', 
        rut: '12345678-9', 
        telefono: '123456789'
      };
      
      // Configurar mocks
      Paciente.obtenerPorId = jest.fn().mockResolvedValue(mockPacienteExistente);
      Paciente.eliminar = jest.fn().mockResolvedValue({ id_usuario: '1' });
      
      // Realizar petición
      const response = await request(app)
        .delete('/pacientes/1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('1');
      expect(Paciente.eliminar).toHaveBeenCalledWith('1');
      expect(response.body).toEqual({
        error: false,
        mensaje: 'Paciente eliminado exitosamente'
      });
    });
    
    it('debería devolver 404 si el paciente no existe', async () => {
      // Configurar mock
      Paciente.obtenerPorId = jest.fn().mockResolvedValue(null);
      
      // Realizar petición
      const response = await request(app)
        .delete('/pacientes/999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('999');
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    });
  });
}); 