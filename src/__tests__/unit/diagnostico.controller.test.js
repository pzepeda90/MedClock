const { mockQueryResults } = require('../mocks/db.mock');

// Mock de los modelos
jest.mock('../../models/diagnostico.model');
jest.mock('../../models/cita.model');

// Importar el modelo mockeado
const Diagnostico = require('../../models/diagnostico.model');
const Cita = require('../../models/cita.model');

// Importar el controlador a probar
const DiagnosticoController = require('../../controllers/diagnostico.controller');

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
      // Configurar el mock del modelo
      Diagnostico.getAll.mockResolvedValueOnce(mockQueryResults.diagnósticos);

      // Ejecutar función a probar
      await DiagnosticoController.getAll(req, res);

      // Verificar resultado
      expect(Diagnostico.getAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockQueryResults.diagnósticos
      });
    });

    it('debe manejar errores correctamente', async () => {
      // Configurar el mock del modelo para lanzar error
      const error = new Error('Error al obtener diagnósticos');
      Diagnostico.getAll.mockRejectedValueOnce(error);

      // Ejecutar función a probar
      await DiagnosticoController.getAll(req, res);

      // Verificar resultado
      expect(Diagnostico.getAll).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Error al obtener los diagnósticos'
      });
    });
  });

  describe('getById', () => {
    it('debe obtener un diagnóstico por ID', async () => {
      // Configurar el mock
      req.params.id = '1';
      Diagnostico.getById.mockResolvedValueOnce(mockQueryResults.diagnósticos[0]);

      // Ejecutar función a probar
      await DiagnosticoController.getById(req, res);

      // Verificar resultado
      expect(Diagnostico.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockQueryResults.diagnósticos[0]
      });
    });

    it('debe retornar 404 cuando no encuentra el diagnóstico', async () => {
      // Configurar el mock
      req.params.id = '999';
      Diagnostico.getById.mockResolvedValueOnce(null);

      // Ejecutar función a probar
      await DiagnosticoController.getById(req, res);

      // Verificar resultado
      expect(Diagnostico.getById).toHaveBeenCalledWith(999);
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
      expect(Diagnostico.getById).not.toHaveBeenCalled();
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
      Diagnostico.getByCodigo.mockResolvedValueOnce(null);
      Diagnostico.create.mockResolvedValueOnce({ id: 3, ...diagData });

      // Ejecutar función a probar
      await DiagnosticoController.create(req, res);

      // Verificar resultado
      expect(Diagnostico.getByCodigo).toHaveBeenCalledWith(diagData.codigo);
      expect(Diagnostico.create).toHaveBeenCalledWith(diagData);
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

      // Configurar req y mocks
      req.body = diagData;
      Diagnostico.getByCodigo.mockResolvedValueOnce(mockQueryResults.diagnósticos[0]);

      // Ejecutar función a probar
      await DiagnosticoController.create(req, res);

      // Verificar resultado
      expect(Diagnostico.getByCodigo).toHaveBeenCalledWith(diagData.codigo);
      expect(Diagnostico.create).not.toHaveBeenCalled();
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
      const relacion = { 
        id: 1, 
        cita_id: citaId, 
        diagnostico_id: diagnosticoId, 
        notas: notas,
        fecha_creacion: new Date().toISOString()
      };

      // Configurar req y mocks
      req.params.citaId = citaId.toString();
      req.body = { diagnosticoId, notas };
      
      Cita.getById.mockResolvedValueOnce({ ...mockQueryResults.citas[1], id: citaId });
      Diagnostico.getById.mockResolvedValueOnce(mockQueryResults.diagnósticos[0]);
      Diagnostico.asociarACita.mockResolvedValueOnce(relacion);

      // Ejecutar función a probar
      await DiagnosticoController.asociarACita(req, res);

      // Verificar resultado
      expect(Cita.getById).toHaveBeenCalledWith(citaId);
      expect(Diagnostico.getById).toHaveBeenCalledWith(diagnosticoId);
      expect(Diagnostico.asociarACita).toHaveBeenCalledWith(citaId, diagnosticoId, notas);
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
      
      Cita.getById.mockResolvedValueOnce({ ...mockQueryResults.citas[0], id: citaId, estado: 'agendada' });
      Diagnostico.getById.mockResolvedValueOnce(mockQueryResults.diagnósticos[0]);

      // Ejecutar función a probar
      await DiagnosticoController.asociarACita(req, res);

      // Verificar resultado
      expect(Cita.getById).toHaveBeenCalledWith(citaId);
      expect(Diagnostico.getById).toHaveBeenCalledWith(diagnosticoId);
      expect(Diagnostico.asociarACita).not.toHaveBeenCalled();
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
      const diagnosticosCita = [
        { ...mockQueryResults.diagnósticos[0], notas: 'Notas 1', fecha_creacion: new Date().toISOString() }
      ];

      // Configurar req y mocks
      req.params.citaId = citaId.toString();
      Cita.getById.mockResolvedValueOnce(mockQueryResults.citas[0]);
      Diagnostico.getDiagnosticosByCita.mockResolvedValueOnce(diagnosticosCita);

      // Ejecutar función a probar
      await DiagnosticoController.getDiagnosticosByCita(req, res);

      // Verificar resultado
      expect(Cita.getById).toHaveBeenCalledWith(citaId);
      expect(Diagnostico.getDiagnosticosByCita).toHaveBeenCalledWith(citaId);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: diagnosticosCita
      });
    });
  });
}); 