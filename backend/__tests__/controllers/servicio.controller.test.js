import { jest } from '@jest/globals';
import { crearServicio, obtenerServicioPorId, obtenerServicios } from '../../controllers/servicio.controller.js';
import Servicio from '../../models/servicio.model.js';
import Profesional from '../../models/profesional.model.js';

// Mock de los modelos
jest.mock('../../models/servicio.model.js');
jest.mock('../../models/profesional.model.js');

describe('Servicio Controller', () => {
  // Mock de request y response
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Limpiamos todos los mocks
    jest.clearAllMocks();
  });
  
  describe('crearServicio', () => {
    it('debería crear un servicio con éxito', async () => {
      // Configurar mocks
      const mockServicioCreado = {
        id: 1,
        nombre: 'Consulta General',
        descripcion: 'Consulta médica general',
        duracion_min: 30,
        precio: 50000,
        requiere_preparacion: false
      };
      
      req.body = {
        nombre: 'Consulta General',
        descripcion: 'Consulta médica general',
        duracion_min: 30,
        precio: 50000
      };
      
      Servicio.obtenerPorNombre = jest.fn().mockResolvedValue(null); // No existe servicio con ese nombre
      Servicio.crear = jest.fn().mockResolvedValue(mockServicioCreado);
      
      // Ejecutar función
      await crearServicio(req, res);
      
      // Verificar resultados
      expect(Servicio.obtenerPorNombre).toHaveBeenCalledWith('Consulta General');
      expect(Servicio.crear).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        mensaje: 'Servicio creado exitosamente',
        servicio: mockServicioCreado
      });
    });
    
    it('debería devolver error si faltan campos obligatorios', async () => {
      // Configurar request sin campos obligatorios
      req.body = {
        nombre: 'Consulta General',
        // Falta duracion_min y precio
      };
      
      // Ejecutar función
      await crearServicio(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Nombre, duración y precio son obligatorios'
      });
    });
    
    it('debería devolver error si ya existe un servicio con el mismo nombre', async () => {
      // Configurar request
      req.body = {
        nombre: 'Consulta General',
        duracion_min: 30,
        precio: 50000
      };
      
      // Ya existe un servicio con ese nombre
      Servicio.obtenerPorNombre = jest.fn().mockResolvedValue({
        id: 1,
        nombre: 'Consulta General'
      });
      
      // Ejecutar función
      await crearServicio(req, res);
      
      // Verificar resultados
      expect(Servicio.obtenerPorNombre).toHaveBeenCalledWith('Consulta General');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Ya existe un servicio con este nombre'
      });
    });
  });
  
  describe('obtenerServicioPorId', () => {
    it('debería obtener un servicio por su ID con éxito', async () => {
      // Configurar mocks
      const mockServicio = {
        id: 1,
        nombre: 'Consulta General',
        duracion_min: 30,
        precio: 50000
      };
      
      req.params = { id: '1' };
      
      Servicio.obtenerPorId = jest.fn().mockResolvedValue(mockServicio);
      
      // Ejecutar función
      await obtenerServicioPorId(req, res);
      
      // Verificar resultados
      expect(Servicio.obtenerPorId).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        servicio: mockServicio
      });
    });
    
    it('debería devolver error si el servicio no existe', async () => {
      // Configurar request
      req.params = { id: '999' }; // ID que no existe
      
      // El servicio no existe
      Servicio.obtenerPorId = jest.fn().mockResolvedValue(null);
      
      // Ejecutar función
      await obtenerServicioPorId(req, res);
      
      // Verificar resultados
      expect(Servicio.obtenerPorId).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    });
  });
  
  describe('obtenerServicios', () => {
    it('debería obtener todos los servicios con éxito', async () => {
      // Configurar mocks
      const mockServicios = [
        { id: 1, nombre: 'Consulta General', duracion_min: 30, precio: 50000 },
        { id: 2, nombre: 'Examen Visual', duracion_min: 45, precio: 75000 }
      ];
      
      Servicio.obtenerTodos = jest.fn().mockResolvedValue(mockServicios);
      
      // Ejecutar función
      await obtenerServicios(req, res);
      
      // Verificar resultados
      expect(Servicio.obtenerTodos).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        total: 2,
        servicios: mockServicios
      });
    });
    
    it('debería obtener servicios por rango de precio', async () => {
      // Configurar mocks
      const mockServicios = [
        { id: 1, nombre: 'Consulta General', duracion_min: 30, precio: 50000 }
      ];
      
      req.query = {
        precio_min: 40000,
        precio_max: 60000
      };
      
      Servicio.obtenerPorRangoPrecio = jest.fn().mockResolvedValue(mockServicios);
      
      // Ejecutar función
      await obtenerServicios(req, res);
      
      // Verificar resultados
      expect(Servicio.obtenerPorRangoPrecio).toHaveBeenCalledWith(40000, 60000);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        total: 1,
        servicios: mockServicios
      });
    });
    
    it('debería obtener servicios por duración', async () => {
      // Configurar mocks
      const mockServicios = [
        { id: 1, nombre: 'Consulta General', duracion_min: 30, precio: 50000 },
        { id: 2, nombre: 'Control Simple', duracion_min: 15, precio: 30000 }
      ];
      
      req.query = {
        duracion: 30
      };
      
      Servicio.obtenerPorDuracion = jest.fn().mockResolvedValue(mockServicios);
      
      // Ejecutar función
      await obtenerServicios(req, res);
      
      // Verificar resultados
      expect(Servicio.obtenerPorDuracion).toHaveBeenCalledWith(30);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        total: 2,
        servicios: mockServicios
      });
    });
  });
}); 