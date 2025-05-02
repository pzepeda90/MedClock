import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Definir mocks
const mockGetAll = jest.fn();
const mockGetById = jest.fn();
const mockGetByCodigo = jest.fn();
const mockCreate = jest.fn();
const mockAsociarACita = jest.fn();
const mockGetDiagnosticosByCita = jest.fn();
const mockCitaGetById = jest.fn();
const mockVerifyToken = jest.fn();

// Mock de módulos
jest.mock('../../models/diagnostico.model.js', () => ({
  __esModule: true,
  default: {
    getAll: mockGetAll,
    getById: mockGetById,
    getByCodigo: mockGetByCodigo,
    create: mockCreate,
    asociarACita: mockAsociarACita,
    getDiagnosticosByCita: mockGetDiagnosticosByCita
  }
}));

jest.mock('../../models/cita.model.js', () => ({
  __esModule: true,
  default: {
    getById: mockCitaGetById
  }
}));

jest.mock('../../middlewares/auth.middleware.js', () => ({
  verifyToken: (req, res, next) => { 
    mockVerifyToken(req, res, next);
    req.user = { id: 1, role: 'admin' };
    next();
  }
}));

// Importar los modelos mockeados
import Diagnostico from '../../models/diagnostico.model.js';
import Cita from '../../models/cita.model.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

// Crear app express para testing
const app = express();
app.use(express.json());

// Importar las rutas a probar
import diagnosticoRoutes from '../../routes/diagnostico.routes.js';
app.use('/api/diagnosticos', diagnosticoRoutes);

describe('Diagnostico Routes', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /api/diagnosticos', () => {
    it('debe obtener todos los diagnósticos', async () => {
      // Datos de prueba
      const mockDiagnosticos = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', descripcion: null, categoria: 'Enfermedades respiratorias' },
        { id: 2, codigo: 'E11', nombre: 'Diabetes mellitus tipo 2', descripcion: null, categoria: 'Enfermedades endocrinas' }
      ];
      
      // Configurar el mock
      mockGetAll.mockResolvedValue(mockDiagnosticos);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/diagnosticos');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockDiagnosticos
      });
      expect(mockGetAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/diagnosticos/:id', () => {
    it('debe obtener un diagnóstico por ID', async () => {
      // Datos de prueba
      const mockDiagnostico = { 
        id: 1, 
        codigo: 'J00', 
        nombre: 'Resfriado común', 
        descripcion: null, 
        categoria: 'Enfermedades respiratorias' 
      };
      
      // Configurar el mock
      mockGetById.mockResolvedValue(mockDiagnostico);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/diagnosticos/1');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockDiagnostico
      });
      expect(mockGetById).toHaveBeenCalledWith(1);
    });

    it('debe retornar 404 cuando no encuentra el diagnóstico', async () => {
      // Configurar el mock
      mockGetById.mockResolvedValue(null);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/diagnosticos/999');

      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: true,
        message: 'Diagnóstico no encontrado'
      });
    });
  });

  describe('POST /api/diagnosticos', () => {
    it('debe crear un nuevo diagnóstico', async () => {
      // Datos para la prueba
      const newDiagnostico = {
        codigo: 'J99',
        nombre: 'Nuevo diagnóstico',
        categoria: 'Enfermedades respiratorias'
      };
      
      // Configurar los mocks
      mockGetByCodigo.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 3, ...newDiagnostico });

      // Ejecutar la prueba
      const response = await request(app)
        .post('/api/diagnosticos')
        .send(newDiagnostico);

      // Verificar resultado
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        error: false,
        message: 'Diagnóstico creado exitosamente',
        data: { id: 3, ...newDiagnostico }
      });
      expect(mockGetByCodigo).toHaveBeenCalledWith(newDiagnostico.codigo);
      expect(mockCreate).toHaveBeenCalledWith(newDiagnostico);
    });

    it('debe retornar 400 cuando ya existe un diagnóstico con el mismo código', async () => {
      // Datos para la prueba
      const newDiagnostico = {
        codigo: 'J00',
        nombre: 'Resfriado común',
        categoria: 'Enfermedades respiratorias'
      };
      
      // Configurar los mocks
      mockGetByCodigo.mockResolvedValue({ id: 1, ...newDiagnostico });

      // Ejecutar la prueba
      const response = await request(app)
        .post('/api/diagnosticos')
        .send(newDiagnostico);

      // Verificar resultado
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: `Ya existe un diagnóstico con el código ${newDiagnostico.codigo}`
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/diagnosticos/cita/:citaId', () => {
    it('debe asociar un diagnóstico a una cita', async () => {
      // Datos para la prueba
      const citaId = 1;
      const diagnosticoId = 1;
      const notas = 'Notas sobre el diagnóstico';
      const fechaCreacion = new Date().toISOString();
      
      const asociacion = {
        id: 1,
        cita_id: citaId,
        diagnostico_id: diagnosticoId,
        notas,
        fecha_creacion
      };
      
      // Configurar los mocks
      mockCitaGetById.mockResolvedValue({ id: citaId, estado: 'completada' });
      mockGetById.mockResolvedValue({ id: diagnosticoId });
      mockAsociarACita.mockResolvedValue(asociacion);

      // Ejecutar la prueba
      const response = await request(app)
        .post(`/api/diagnosticos/cita/${citaId}`)
        .send({ diagnosticoId, notas });

      // Verificar resultado
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        error: false,
        message: 'Diagnóstico asociado exitosamente a la cita',
        data: asociacion
      });
      expect(mockCitaGetById).toHaveBeenCalledWith(citaId);
      expect(mockGetById).toHaveBeenCalledWith(diagnosticoId);
      expect(mockAsociarACita).toHaveBeenCalledWith(citaId, diagnosticoId, notas);
    });
  });

  describe('GET /api/diagnosticos/cita/:citaId', () => {
    it('debe obtener diagnósticos asociados a una cita', async () => {
      // Datos para la prueba
      const citaId = 1;
      const fechaCreacion = new Date().toISOString();
      
      const mockDiagnosticos = [
        { 
          id: 1, 
          codigo: 'J00', 
          nombre: 'Resfriado común', 
          descripcion: null, 
          categoria: 'Enfermedades respiratorias',
          notas: 'Notas sobre el diagnóstico',
          fecha_creacion: fechaCreacion
        }
      ];
      
      // Configurar los mocks
      mockCitaGetById.mockResolvedValue({ id: citaId });
      mockGetDiagnosticosByCita.mockResolvedValue(mockDiagnosticos);

      // Ejecutar la prueba
      const response = await request(app)
        .get(`/api/diagnosticos/cita/${citaId}`);

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockDiagnosticos
      });
      expect(mockCitaGetById).toHaveBeenCalledWith(citaId);
      expect(mockGetDiagnosticosByCita).toHaveBeenCalledWith(citaId);
    });
  });
}); 