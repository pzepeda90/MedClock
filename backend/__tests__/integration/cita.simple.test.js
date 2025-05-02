import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Crear mocks para el modelo de citas
const mockGetCitas = jest.fn();
const mockGetCitaById = jest.fn();
const mockCreateCita = jest.fn();
const mockUpdateCita = jest.fn();
const mockDeleteCita = jest.fn();

// Crear un mock del modelo de citas completo
const mockCitaModel = {
  getCitas: mockGetCitas,
  getCitaById: mockGetCitaById,
  createCita: mockCreateCita,
  updateCita: mockUpdateCita,
  deleteCita: mockDeleteCita
};

// Crear un mini router para citas
const crearCitasRouter = (mockModel) => {
  const router = express.Router();
  
  // GET /citas
  router.get('/', async (req, res) => {
    try {
      const citas = await mockModel.getCitas(req.query);
      res.json({ error: false, data: citas });
    } catch (error) {
      res.status(500).json({ error: true, message: 'Error al obtener citas' });
    }
  });
  
  // GET /citas/:id
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const cita = await mockModel.getCitaById(id);
      
      if (!cita) {
        return res.status(404).json({ error: true, message: 'Cita no encontrada' });
      }
      
      res.json({ error: false, data: cita });
    } catch (error) {
      res.status(500).json({ error: true, message: 'Error al obtener la cita' });
    }
  });
  
  // POST /citas
  router.post('/', express.json(), async (req, res) => {
    try {
      const { paciente_id, horario_id, servicio_id } = req.body;
      
      if (!paciente_id || !horario_id || !servicio_id) {
        return res.status(400).json({ 
          error: true, 
          message: 'Se requieren los campos paciente_id, horario_id y servicio_id' 
        });
      }
      
      const nuevaCita = await mockModel.createCita(req.body);
      
      res.status(201).json({ 
        error: false, 
        data: nuevaCita, 
        message: 'Cita creada correctamente' 
      });
    } catch (error) {
      res.status(500).json({ error: true, message: 'Error al crear la cita' });
    }
  });

  return router;
};

// Crear la aplicación con el router
const app = express();
app.use('/api/citas', crearCitasRouter(mockCitaModel));

describe('Pruebas de Rutas de Citas Simplificadas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/citas', () => {
    it('debe obtener todas las citas', async () => {
      // Datos de prueba
      const mockCitas = [
        { id: 1, paciente_id: 1, estado: 'agendada' },
        { id: 2, paciente_id: 2, estado: 'completada' }
      ];
      
      // Configurar mock
      mockGetCitas.mockResolvedValue(mockCitas);
      
      // Ejecutar prueba
      const response = await request(app)
        .get('/api/citas');
      
      // Verificaciones
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockCitas
      });
      expect(mockGetCitas).toHaveBeenCalled();
    });

    it('debe manejar errores correctamente', async () => {
      // Configurar mock para error
      mockGetCitas.mockRejectedValue(new Error('Error de base de datos'));
      
      // Ejecutar prueba
      const response = await request(app)
        .get('/api/citas');
      
      // Verificaciones
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: true,
        message: 'Error al obtener citas'
      });
      expect(mockGetCitas).toHaveBeenCalled();
    });
  });

  describe('GET /api/citas/:id', () => {
    it('debe obtener una cita por ID', async () => {
      // Datos de prueba
      const citaId = '1';
      const mockCita = { id: 1, paciente_id: 1, estado: 'agendada' };
      
      // Configurar mock
      mockGetCitaById.mockResolvedValue(mockCita);
      
      // Ejecutar prueba
      const response = await request(app)
        .get(`/api/citas/${citaId}`);
      
      // Verificaciones
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockCita
      });
      expect(mockGetCitaById).toHaveBeenCalledWith(citaId);
    });

    it('debe retornar 404 cuando la cita no existe', async () => {
      // Configurar mock
      mockGetCitaById.mockResolvedValue(null);
      
      // Ejecutar prueba
      const response = await request(app)
        .get('/api/citas/999');
      
      // Verificaciones
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: true,
        message: 'Cita no encontrada'
      });
      expect(mockGetCitaById).toHaveBeenCalledWith('999');
    });
  });

  describe('POST /api/citas', () => {
    it('debe crear una nueva cita', async () => {
      // Datos de prueba
      const nuevaCita = {
        paciente_id: 1,
        horario_id: 1,
        servicio_id: 1
      };
      
      const citaCreada = {
        id: 1,
        ...nuevaCita,
        estado: 'agendada'
      };
      
      // Configurar mock
      mockCreateCita.mockResolvedValue(citaCreada);
      
      // Ejecutar prueba
      const response = await request(app)
        .post('/api/citas')
        .send(nuevaCita);
      
      // Verificaciones
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        error: false,
        data: citaCreada,
        message: 'Cita creada correctamente'
      });
      expect(mockCreateCita).toHaveBeenCalledWith(nuevaCita);
    });

    it('debe validar campos requeridos', async () => {
      // Datos incompletos
      const citaIncompleta = {
        paciente_id: 1
        // Faltan horario_id y servicio_id
      };
      
      // Ejecutar prueba
      const response = await request(app)
        .post('/api/citas')
        .send(citaIncompleta);
      
      // Verificaciones
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: 'Se requieren los campos paciente_id, horario_id y servicio_id'
      });
      expect(mockCreateCita).not.toHaveBeenCalled();
    });
  });
}); 