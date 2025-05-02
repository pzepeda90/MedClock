import { jest } from '@jest/globals';
import { crearPaciente, obtenerPacientePorId, obtenerPacientes } from '../../controllers/paciente.controller.js';
import Paciente from '../../models/paciente.model.js';
import Usuario from '../../models/user.model.js';

// Mock de los modelos
jest.mock('../../models/paciente.model.js');
jest.mock('../../models/user.model.js');

describe('Paciente Controller', () => {
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
  
  describe('crearPaciente', () => {
    it('debería crear un paciente con éxito', async () => {
      // Configurar mocks
      const mockUsuario = { id: '1', nombre: 'Test User' };
      const mockPacienteCreado = { 
        id_usuario: '1', 
        rut: '12345678-9', 
        telefono: '123456789',
        nombre: 'Test User'
      };
      
      req.body = {
        id_usuario: '1',
        rut: '12345678-9',
        telefono: '123456789'
      };
      
      Usuario.findById = jest.fn().mockResolvedValue(mockUsuario);
      Paciente.obtenerPorRut = jest.fn().mockResolvedValue(null); // No existe un paciente con ese RUT
      Paciente.crear = jest.fn().mockResolvedValue(mockPacienteCreado);
      
      // Ejecutar función
      await crearPaciente(req, res);
      
      // Verificar resultados
      expect(Usuario.findById).toHaveBeenCalledWith('1');
      expect(Paciente.obtenerPorRut).toHaveBeenCalledWith('12345678-9');
      expect(Paciente.crear).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        mensaje: 'Paciente creado exitosamente',
        paciente: mockPacienteCreado
      });
    });
    
    it('debería devolver error si faltan campos obligatorios', async () => {
      // Configurar request sin campos obligatorios
      req.body = {
        id_usuario: '1'
        // Falta rut y teléfono
      };
      
      // Ejecutar función
      await crearPaciente(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'ID de usuario, RUT y teléfono son obligatorios'
      });
    });
    
    it('debería devolver error si el usuario no existe', async () => {
      // Configurar request
      req.body = {
        id_usuario: '999', // ID que no existe
        rut: '12345678-9',
        telefono: '123456789'
      };
      
      // El usuario no existe
      Usuario.findById = jest.fn().mockResolvedValue(null);
      
      // Ejecutar función
      await crearPaciente(req, res);
      
      // Verificar resultados
      expect(Usuario.findById).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Usuario no encontrado'
      });
    });
    
    it('debería devolver error si ya existe un paciente con el mismo RUT', async () => {
      // Configurar request
      req.body = {
        id_usuario: '1',
        rut: '12345678-9',
        telefono: '123456789'
      };
      
      // El usuario existe
      Usuario.findById = jest.fn().mockResolvedValue({ id: '1', nombre: 'Test User' });
      
      // Ya existe un paciente con ese RUT
      Paciente.obtenerPorRut = jest.fn().mockResolvedValue({ 
        id_usuario: '2', 
        rut: '12345678-9' 
      });
      
      // Ejecutar función
      await crearPaciente(req, res);
      
      // Verificar resultados
      expect(Usuario.findById).toHaveBeenCalledWith('1');
      expect(Paciente.obtenerPorRut).toHaveBeenCalledWith('12345678-9');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Ya existe un paciente con este RUT'
      });
    });
  });
  
  describe('obtenerPacientePorId', () => {
    it('debería obtener un paciente por su ID con éxito', async () => {
      // Configurar mocks
      const mockPaciente = { 
        id_usuario: '1', 
        rut: '12345678-9', 
        telefono: '123456789',
        nombre: 'Test User'
      };
      
      req.params = { id: '1' };
      
      Paciente.obtenerPorId = jest.fn().mockResolvedValue(mockPaciente);
      
      // Ejecutar función
      await obtenerPacientePorId(req, res);
      
      // Verificar resultados
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        paciente: mockPaciente
      });
    });
    
    it('debería devolver error si el paciente no existe', async () => {
      // Configurar request
      req.params = { id: '999' }; // ID que no existe
      
      // El paciente no existe
      Paciente.obtenerPorId = jest.fn().mockResolvedValue(null);
      
      // Ejecutar función
      await obtenerPacientePorId(req, res);
      
      // Verificar resultados
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    });
  });
  
  describe('obtenerPacientes', () => {
    it('debería obtener todos los pacientes con éxito', async () => {
      // Configurar mocks
      const mockPacientes = [
        { id_usuario: '1', rut: '12345678-9', nombre: 'Test User 1' },
        { id_usuario: '2', rut: '98765432-1', nombre: 'Test User 2' }
      ];
      
      Paciente.obtenerTodos = jest.fn().mockResolvedValue(mockPacientes);
      
      // Ejecutar función
      await obtenerPacientes(req, res);
      
      // Verificar resultados
      expect(Paciente.obtenerTodos).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        total: 2,
        pacientes: mockPacientes
      });
    });
  });
}); 