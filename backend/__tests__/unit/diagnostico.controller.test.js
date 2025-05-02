import { jest } from '@jest/globals';

// Mock de los modelos
const mockGetAll = jest.fn();
const mockGetById = jest.fn();
const mockGetByCodigo = jest.fn();
const mockCreate = jest.fn();
const mockAsociarACita = jest.fn();
const mockGetDiagnosticosByCita = jest.fn();
const mockCitaGetById = jest.fn();

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

// Importar los modelos mockeados
import Diagnostico from '../../models/diagnostico.model.js';
import Cita from '../../models/cita.model.js';

// Importar el controlador a probar
import DiagnosticoController from '../../controllers/diagnostico.controller.js';

describe('DiagnosticoController', () => {
  // Mock de req, res
  let req;
  let res;

  beforeEach(() => {
    // Reconfigurar mocks antes de cada prueba
    jest.clearAllMocks();

    // Mock de req, res para cada prueba
    req = {
      params: {},
      query: {},
      body: {}
    };
    
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getAll', () => {
    it('debe obtener todos los diagnósticos', async () => {
      // Datos de prueba
      const mockDiagnosticos = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', descripcion: null, categoria: 'Enfermedades respiratorias' },
        { id: 2, codigo: 'E11', nombre: 'Diabetes mellitus tipo 2', descripcion: null, categoria: 'Enfermedades endocrinas' }
      ];
      
      // Configurar el mock del modelo
      mockGetAll.mockResolvedValue(mockDiagnosticos);

      // Ejecutar función a probar
      await DiagnosticoController.getAll(req, res);

      // Verificar resultado
      expect(mockGetAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockDiagnosticos
      });
    });

    it('debe manejar errores correctamente', async () => {
      // Configurar el mock del modelo para lanzar error
      const error = new Error('Error al obtener diagnósticos');
      mockGetAll.mockRejectedValue(error);

      // Ejecutar función a probar
      await DiagnosticoController.getAll(req, res);

      // Verificar resultado
      expect(mockGetAll).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Error al obtener los diagnósticos'
      });
    });
  });

  describe('getById', () => {
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
      req.params.id = '1';
      mockGetById.mockResolvedValue(mockDiagnostico);

      // Ejecutar función a probar
      await DiagnosticoController.getById(req, res);

      // Verificar resultado
      expect(mockGetById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockDiagnostico
      });
    });

    it('debe retornar 404 cuando no encuentra el diagnóstico', async () => {
      // Configurar el mock
      req.params.id = '999';
      mockGetById.mockResolvedValue(null);

      // Ejecutar función a probar
      await DiagnosticoController.getById(req, res);

      // Verificar resultado
      expect(mockGetById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Diagnóstico no encontrado'
      });
    });

    it('debe retornar 400 cuando el ID no es válido', async () => {
      // Configurar el mock
      req.params.id = 'abc';

      // Ejecutar función a probar
      await DiagnosticoController.getById(req, res);

      // Verificar resultado
      expect(mockGetById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'ID de diagnóstico inválido'
      });
    });
  });

  describe('create', () => {
    it('debe crear un nuevo diagnóstico', async () => {
      // Datos para crear
      const diagData = {
        codigo: 'J99',
        nombre: 'Nuevo diagnóstico',
        descripcion: 'Descripción del diagnóstico',
        categoria: 'Enfermedades respiratorias'
      };

      // Configurar req y mocks
      req.body = diagData;
      mockGetByCodigo.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 3, ...diagData });

      // Ejecutar función a probar
      await DiagnosticoController.create(req, res);

      // Verificar resultado
      expect(mockGetByCodigo).toHaveBeenCalledWith(diagData.codigo);
      expect(mockCreate).toHaveBeenCalledWith(diagData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Diagnóstico creado exitosamente',
        data: { id: 3, ...diagData }
      });
    });

    it('debe retornar 400 cuando ya existe un diagnóstico con el mismo código', async () => {
      // Datos para crear
      const diagData = {
        codigo: 'J00',
        nombre: 'Resfriado común',
        categoria: 'Enfermedades respiratorias'
      };
      
      const existingDiag = {
        id: 1,
        ...diagData
      };

      // Configurar req y mocks
      req.body = diagData;
      mockGetByCodigo.mockResolvedValue(existingDiag);

      // Ejecutar función a probar
      await DiagnosticoController.create(req, res);

      // Verificar resultado
      expect(mockGetByCodigo).toHaveBeenCalledWith(diagData.codigo);
      expect(mockCreate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: `Ya existe un diagnóstico con el código ${diagData.codigo}`
      });
    });
  });

  describe('asociarACita', () => {
    it('debe asociar un diagnóstico a una cita', async () => {
      // Datos para asociar
      const citaId = 1;
      const diagnosticoId = 1;
      const notas = 'Notas sobre el diagnóstico';
      const fechaCreacion = new Date().toISOString();
      
      const relacion = { 
        id: 1, 
        cita_id: citaId, 
        diagnostico_id: diagnosticoId, 
        notas,
        fecha_creacion: fechaCreacion
      };

      // Configurar req y mocks
      req.params.citaId = citaId.toString();
      req.body = { diagnosticoId, notas };
      
      const mockCita = { 
        id: citaId, 
        estado: 'completada', 
        paciente_id: 1, 
        horario_id: 1 
      };
      
      const mockDiagnostico = {
        id: diagnosticoId,
        codigo: 'J00',
        nombre: 'Resfriado común'
      };
      
      mockCitaGetById.mockResolvedValue(mockCita);
      mockGetById.mockResolvedValue(mockDiagnostico);
      mockAsociarACita.mockResolvedValue(relacion);

      // Ejecutar función a probar
      await DiagnosticoController.asociarACita(req, res);

      // Verificar resultado
      expect(mockCitaGetById).toHaveBeenCalledWith(citaId);
      expect(mockGetById).toHaveBeenCalledWith(diagnosticoId);
      expect(mockAsociarACita).toHaveBeenCalledWith(citaId, diagnosticoId, notas);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Diagnóstico asociado exitosamente a la cita',
        data: relacion
      });
    });

    it('debe retornar 400 cuando la cita no está completada', async () => {
      // Datos para asociar
      const citaId = 1;
      const diagnosticoId = 1;
      
      // Configurar req y mocks
      req.params.citaId = citaId.toString();
      req.body = { diagnosticoId };
      
      const mockCita = { 
        id: citaId, 
        estado: 'agendada', 
        paciente_id: 1, 
        horario_id: 1 
      };
      
      const mockDiagnostico = {
        id: diagnosticoId,
        codigo: 'J00',
        nombre: 'Resfriado común'
      };
      
      mockCitaGetById.mockResolvedValue(mockCita);
      mockGetById.mockResolvedValue(mockDiagnostico);

      // Ejecutar función a probar
      await DiagnosticoController.asociarACita(req, res);

      // Verificar resultado
      expect(mockCitaGetById).toHaveBeenCalledWith(citaId);
      expect(mockGetById).toHaveBeenCalledWith(diagnosticoId);
      expect(mockAsociarACita).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Solo se pueden asociar diagnósticos a citas completadas'
      });
    });
  });

  describe('getDiagnosticosByCita', () => {
    it('debe obtener diagnósticos asociados a una cita', async () => {
      // Datos de prueba
      const citaId = 1;
      const fechaCreacion = new Date().toISOString();
      
      const mockDiagnosticos = [
        { 
          id: 1, 
          codigo: 'J00', 
          nombre: 'Resfriado común', 
          descripcion: null, 
          categoria: 'Enfermedades respiratorias',
          notas: 'Notas del diagnóstico',
          fecha_creacion: fechaCreacion
        }
      ];

      // Configurar req y mocks
      req.params.citaId = citaId.toString();
      mockCitaGetById.mockResolvedValue({ id: citaId });
      mockGetDiagnosticosByCita.mockResolvedValue(mockDiagnosticos);

      // Ejecutar función a probar
      await DiagnosticoController.getDiagnosticosByCita(req, res);

      // Verificar resultado
      expect(mockCitaGetById).toHaveBeenCalledWith(citaId);
      expect(mockGetDiagnosticosByCita).toHaveBeenCalledWith(citaId);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockDiagnosticos
      });
    });
  });
}); 