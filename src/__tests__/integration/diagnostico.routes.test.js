const request = require('supertest');
const express = require('express');
const { mockQueryResults } = require('../mocks/db.mock');
const { isAuthenticated, hasRole } = require('../mocks/auth.mock');

// Mock de módulos
jest.mock('../../models/diagnostico.model');
jest.mock('../../models/cita.model');
jest.mock('../../middlewares/auth.middleware', () => ({
  isAuthenticated: (req, res, next) => { 
    req.user = { id: 1, rol: 'admin' };
    next();
  },
  hasRole: () => (req, res, next) => next()
}));
jest.mock('../../middlewares/validation.middleware', () => (
  (req, res, next) => next()
));

// Importar los modelos mockeados
const Diagnostico = require('../../models/diagnostico.model');
const Cita = require('../../models/cita.model');

// Crear app express para testing
const app = express();
app.use(express.json());

// Importar las rutas a probar
const diagnosticoRoutes = require('../../routes/diagnostico.routes');
app.use('/api/diagnosticos', diagnosticoRoutes);

describe('Diagnostico Routes', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /api/diagnosticos', () => {
    it('debe obtener todos los diagnósticos', async () => {
      // Configurar el mock
      Diagnostico.getAll.mockResolvedValueOnce(mockQueryResults.diagnósticos);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/diagnosticos');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockQueryResults.diagnósticos
      });
      expect(Diagnostico.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/diagnosticos/:id', () => {
    it('debe obtener un diagnóstico por ID', async () => {
      // Configurar el mock
      Diagnostico.getById.mockResolvedValueOnce(mockQueryResults.diagnósticos[0]);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/diagnosticos/1');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockQueryResults.diagnósticos[0]
      });
      expect(Diagnostico.getById).toHaveBeenCalledWith(1);
    });

    it('debe retornar 404 cuando no encuentra el diagnóstico', async () => {
      // Configurar el mock
      Diagnostico.getById.mockResolvedValueOnce(null);

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
      Diagnostico.getByCodigo.mockResolvedValueOnce(null);
      Diagnostico.create.mockResolvedValueOnce({ id: 3, ...newDiagnostico });

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
      expect(Diagnostico.getByCodigo).toHaveBeenCalledWith(newDiagnostico.codigo);
      expect(Diagnostico.create).toHaveBeenCalledWith(newDiagnostico);
    });

    it('debe retornar 400 cuando ya existe un diagnóstico con el mismo código', async () => {
      // Datos para la prueba
      const newDiagnostico = {
        codigo: 'J00',
        nombre: 'Resfriado común',
        categoria: 'Enfermedades respiratorias'
      };
      
      // Configurar los mocks
      Diagnostico.getByCodigo.mockResolvedValueOnce(mockQueryResults.diagnósticos[0]);

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
      expect(Diagnostico.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/diagnosticos/cita/:citaId', () => {
    it('debe asociar un diagnóstico a una cita', async () => {
      // Datos para la prueba
      const citaId = 1;
      const diagnosticoId = 1;
      const notas = 'Notas sobre el diagnóstico';
      const asociacion = {
        id: 1,
        cita_id: citaId,
        diagnostico_id: diagnosticoId,
        notas,
        fecha_creacion: new Date().toISOString()
      };
      
      // Configurar los mocks
      Cita.getById.mockResolvedValueOnce({ ...mockQueryResults.citas[1], id: citaId });
      Diagnostico.getById.mockResolvedValueOnce(mockQueryResults.diagnósticos[0]);
      Diagnostico.asociarACita.mockResolvedValueOnce(asociacion);

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
      expect(Cita.getById).toHaveBeenCalledWith(citaId);
      expect(Diagnostico.getById).toHaveBeenCalledWith(diagnosticoId);
      expect(Diagnostico.asociarACita).toHaveBeenCalledWith(citaId, diagnosticoId, notas);
    });
  });

  describe('GET /api/diagnosticos/cita/:citaId', () => {
    it('debe obtener diagnósticos asociados a una cita', async () => {
      // Datos para la prueba
      const citaId = 1;
      const diagnosticosCita = [
        { ...mockQueryResults.diagnósticos[0], notas: 'Notas 1', fecha_creacion: new Date().toISOString() }
      ];
      
      // Configurar los mocks
      Cita.getById.mockResolvedValueOnce(mockQueryResults.citas[0]);
      Diagnostico.getDiagnosticosByCita.mockResolvedValueOnce(diagnosticosCita);

      // Ejecutar la prueba
      const response = await request(app)
        .get(`/api/diagnosticos/cita/${citaId}`);

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: diagnosticosCita
      });
      expect(Cita.getById).toHaveBeenCalledWith(citaId);
      expect(Diagnostico.getDiagnosticosByCita).toHaveBeenCalledWith(citaId);
    });
  });
}); 