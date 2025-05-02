import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import servicioRoutes from '../../routes/servicio.routes.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import Servicio from '../../models/servicio.model.js';
import Profesional from '../../models/profesional.model.js';

// Mock del middleware de autenticación
jest.mock('../../middlewares/auth.middleware.js', () => ({
  verifyToken: jest.fn((req, res, next) => next())
}));

// Mock de los modelos
jest.mock('../../models/servicio.model.js');
jest.mock('../../models/profesional.model.js');

// Crear aplicación Express para pruebas
const app = express();
app.use(express.json());
app.use('/servicios', servicioRoutes);

describe('Rutas de Servicios', () => {
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('GET /servicios', () => {
    it('debería obtener todos los servicios', async () => {
      // Mock de datos de servicios
      const mockServicios = [
        { id: 1, nombre: 'Consulta General', duracion_min: 30, precio: 50000 },
        { id: 2, nombre: 'Examen Visual', duracion_min: 45, precio: 75000 }
      ];
      
      // Configurar mock
      Servicio.obtenerTodos = jest.fn().mockResolvedValue(mockServicios);
      
      // Realizar petición
      const response = await request(app)
        .get('/servicios')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Servicio.obtenerTodos).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: false,
        total: 2,
        servicios: mockServicios
      });
    });
    
    it('debería obtener servicios por rango de precio', async () => {
      // Mock de datos de servicios
      const mockServicios = [
        { id: 1, nombre: 'Consulta General', duracion_min: 30, precio: 50000 }
      ];
      
      // Configurar mock
      Servicio.obtenerPorRangoPrecio = jest.fn().mockResolvedValue(mockServicios);
      
      // Realizar petición
      const response = await request(app)
        .get('/servicios?precio_min=40000&precio_max=60000')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Servicio.obtenerPorRangoPrecio).toHaveBeenCalledWith('40000', '60000');
      expect(response.body).toEqual({
        error: false,
        total: 1,
        servicios: mockServicios
      });
    });
  });
  
  describe('GET /servicios/:id', () => {
    it('debería obtener un servicio por su ID', async () => {
      // Mock de datos del servicio
      const mockServicio = {
        id: 1,
        nombre: 'Consulta General',
        duracion_min: 30,
        precio: 50000
      };
      
      // Configurar mock
      Servicio.obtenerPorId = jest.fn().mockResolvedValue(mockServicio);
      
      // Realizar petición
      const response = await request(app)
        .get('/servicios/1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Servicio.obtenerPorId).toHaveBeenCalledWith('1');
      expect(response.body).toEqual({
        error: false,
        servicio: mockServicio
      });
    });
    
    it('debería devolver 404 si el servicio no existe', async () => {
      // Configurar mock
      Servicio.obtenerPorId = jest.fn().mockResolvedValue(null);
      
      // Realizar petición
      const response = await request(app)
        .get('/servicios/999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Servicio.obtenerPorId).toHaveBeenCalledWith('999');
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    });
  });
  
  describe('POST /servicios', () => {
    it('debería crear un nuevo servicio', async () => {
      // Mock de datos del servicio
      const mockServicioCreado = {
        id: 1,
        nombre: 'Consulta General',
        descripcion: 'Consulta médica general',
        duracion_min: 30,
        precio: 50000,
        requiere_preparacion: false
      };
      
      // Datos para crear servicio
      const servicioData = {
        nombre: 'Consulta General',
        descripcion: 'Consulta médica general',
        duracion_min: 30,
        precio: 50000
      };
      
      // Configurar mocks
      Servicio.obtenerPorNombre = jest.fn().mockResolvedValue(null); // No existe servicio con ese nombre
      Servicio.crear = jest.fn().mockResolvedValue(mockServicioCreado);
      
      // Realizar petición
      const response = await request(app)
        .post('/servicios')
        .send(servicioData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Servicio.obtenerPorNombre).toHaveBeenCalledWith('Consulta General');
      expect(Servicio.crear).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: false,
        mensaje: 'Servicio creado exitosamente',
        servicio: mockServicioCreado
      });
    });
    
    it('debería devolver error si faltan campos obligatorios', async () => {
      // Datos incompletos
      const servicioData = {
        nombre: 'Consulta General',
        // Falta duracion_min y precio
      };
      
      // Realizar petición
      const response = await request(app)
        .post('/servicios')
        .send(servicioData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Nombre, duración y precio son obligatorios'
      });
    });
  });
  
  describe('GET /servicios/:id/profesionales', () => {
    it('debería obtener profesionales que ofrecen un servicio', async () => {
      // Mock de datos
      const mockServicio = {
        id: 1,
        nombre: 'Consulta General'
      };
      
      const mockProfesionales = [
        { id_usuario: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Medicina General' },
        { id_usuario: 2, nombre: 'Dra. María López', especialidad: 'Medicina General' }
      ];
      
      // Configurar mocks
      Servicio.obtenerPorId = jest.fn().mockResolvedValue(mockServicio);
      Servicio.obtenerProfesionales = jest.fn().mockResolvedValue(mockProfesionales);
      
      // Realizar petición
      const response = await request(app)
        .get('/servicios/1/profesionales')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Servicio.obtenerPorId).toHaveBeenCalledWith('1');
      expect(Servicio.obtenerProfesionales).toHaveBeenCalledWith('1');
      expect(response.body).toEqual({
        error: false,
        servicio: {
          id: 1,
          nombre: 'Consulta General'
        },
        total: 2,
        profesionales: mockProfesionales
      });
    });
    
    it('debería devolver 404 si el servicio no existe', async () => {
      // Configurar mock
      Servicio.obtenerPorId = jest.fn().mockResolvedValue(null);
      
      // Realizar petición
      const response = await request(app)
        .get('/servicios/999/profesionales')
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Servicio.obtenerPorId).toHaveBeenCalledWith('999');
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    });
  });
  
  describe('POST /servicios/:id/profesionales', () => {
    it('debería asignar un profesional a un servicio', async () => {
      // Mock de datos
      const mockServicio = {
        id: 1,
        nombre: 'Consulta General'
      };
      
      const mockProfesional = {
        id_usuario: 1,
        nombre: 'Dr. Juan Pérez'
      };
      
      const mockResultado = {
        id_servicio: 1,
        id_profesional: 1
      };
      
      // Datos para asignar profesional
      const profesionalData = {
        id_profesional: 1
      };
      
      // Configurar mocks
      Servicio.obtenerPorId = jest.fn().mockResolvedValue(mockServicio);
      Profesional.obtenerPorId = jest.fn().mockResolvedValue(mockProfesional);
      Servicio.asignarProfesional = jest.fn().mockResolvedValue(mockResultado);
      
      // Realizar petición
      const response = await request(app)
        .post('/servicios/1/profesionales')
        .send(profesionalData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Servicio.obtenerPorId).toHaveBeenCalledWith('1');
      expect(Profesional.obtenerPorId).toHaveBeenCalledWith(1);
      expect(Servicio.asignarProfesional).toHaveBeenCalledWith('1', 1);
      expect(response.body).toEqual({
        error: false,
        mensaje: 'Profesional asignado exitosamente',
        resultado: mockResultado
      });
    });
    
    it('debería devolver error si falta el ID del profesional', async () => {
      // Datos incompletos
      const profesionalData = {};
      
      // Realizar petición
      const response = await request(app)
        .post('/servicios/1/profesionales')
        .send(profesionalData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: true,
        mensaje: 'ID del profesional es obligatorio'
      });
    });
  });
}); 