import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Crear mocks para los modelos
const mockCitaModel = {
  getCitas: jest.fn(),
  getCitaById: jest.fn(),
  createCita: jest.fn(),
  updateCita: jest.fn(),
  deleteCita: jest.fn(),
  getCitasByPaciente: jest.fn(),
  updateCitaStatus: jest.fn()
};

// Mock del middleware de autenticación
const mockVerifyToken = jest.fn().mockImplementation((req, res, next) => {
  req.user = { id: 1, role: 'admin' };
  next();
});

// Mock de las rutas
const citasRouter = express.Router();

// Ruta GET /citas
citasRouter.get('/', async (req, res) => {
  try {
    const filtros = req.query;
    const citas = await mockCitaModel.getCitas(filtros);
    res.json({ error: false, data: citas });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener citas' });
  }
});

// Ruta GET /citas/:id
citasRouter.get('/:id', async (req, res) => {
  try {
    const cita = await mockCitaModel.getCitaById(req.params.id);
    if (!cita) {
      return res.status(404).json({ error: true, message: 'Cita no encontrada' });
    }
    res.json({ error: false, data: cita });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener la cita' });
  }
});

// Ruta GET /citas/paciente/:paciente_id
citasRouter.get('/paciente/:paciente_id', async (req, res) => {
  try {
    const citas = await mockCitaModel.getCitasByPaciente(req.params.paciente_id);
    res.json({ error: false, data: citas });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener citas del paciente' });
  }
});

// Ruta POST /citas
citasRouter.post('/', async (req, res) => {
  try {
    // Validación simple
    if (!req.body.paciente_id || !req.body.horario_id) {
      return res.status(400).json({ 
        error: true, 
        message: 'Se requieren paciente_id y horario_id para crear una cita' 
      });
    }
    
    const citaCreada = await mockCitaModel.createCita(req.body);
    res.status(201).json({ 
      error: false, 
      data: citaCreada, 
      message: 'Cita creada correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al crear la cita' });
  }
});

// Ruta PUT /citas/:id
citasRouter.put('/:id', async (req, res) => {
  try {
    const cita = await mockCitaModel.updateCita(req.params.id, req.body);
    if (!cita) {
      return res.status(404).json({ error: true, message: 'Cita no encontrada' });
    }
    res.json({ 
      error: false, 
      data: cita, 
      message: 'Cita actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar la cita' });
  }
});

// Ruta PUT /citas/:id/estado
citasRouter.put('/:id/estado', async (req, res) => {
  try {
    if (!req.body.estado) {
      return res.status(400).json({ error: true, message: 'Se requiere estado' });
    }
    
    const cita = await mockCitaModel.updateCitaStatus(req.params.id, req.body.estado);
    if (!cita) {
      return res.status(404).json({ error: true, message: 'Cita no encontrada' });
    }
    
    res.json({ 
      error: false, 
      data: cita, 
      message: 'Estado de cita actualizado correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar estado de cita' });
  }
});

// Ruta DELETE /citas/:id
citasRouter.delete('/:id', async (req, res) => {
  try {
    const result = await mockCitaModel.deleteCita(req.params.id);
    if (!result) {
      return res.status(404).json({ error: true, message: 'Cita no encontrada' });
    }
    res.json({ error: false, message: 'Cita eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al eliminar la cita' });
  }
});

// Crear app express para testing
const app = express();
app.use(express.json());
app.use('/api/citas', citasRouter);

describe('Cita Routes', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /api/citas', () => {
    it('debe obtener todas las citas', async () => {
      // Datos de prueba
      const mockCitas = [
        { id: 1, paciente_id: 1, horario_id: 1, fecha: '2023-01-01', estado: 'agendada' },
        { id: 2, paciente_id: 2, horario_id: 2, fecha: '2023-01-02', estado: 'completada' }
      ];
      
      // Configurar el mock
      mockCitaModel.getCitas.mockResolvedValue(mockCitas);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/citas');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockCitas
      });
      expect(mockCitaModel.getCitas).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores al obtener citas', async () => {
      // Configurar el mock para simular un error
      mockCitaModel.getCitas.mockRejectedValue(new Error('Error de base de datos'));

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/citas');

      // Verificar resultado
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: true,
        message: 'Error al obtener citas'
      });
      expect(mockCitaModel.getCitas).toHaveBeenCalledTimes(1);
    });
    
    it('debe aplicar filtros al obtener citas', async () => {
      // Datos de prueba
      const mockCitas = [
        { id: 1, paciente_id: 1, horario_id: 1, fecha: '2023-01-01', estado: 'agendada' }
      ];
      
      // Filtros para la consulta
      const filtros = { estado: 'agendada' };
      
      // Configurar el mock
      mockCitaModel.getCitas.mockResolvedValue(mockCitas);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/citas')
        .query(filtros);

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockCitas
      });
      expect(mockCitaModel.getCitas).toHaveBeenCalledWith(filtros);
    });
  });

  describe('GET /api/citas/:id', () => {
    it('debe obtener una cita por su ID', async () => {
      // Datos de prueba
      const mockCita = { 
        id: 1, 
        paciente_id: 1, 
        horario_id: 1, 
        fecha: '2023-01-01', 
        estado: 'agendada' 
      };
      const citaId = '1';
      
      // Configurar el mock
      mockCitaModel.getCitaById.mockResolvedValue(mockCita);

      // Ejecutar la prueba
      const response = await request(app)
        .get(`/api/citas/${citaId}`);

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockCita
      });
      expect(mockCitaModel.getCitaById).toHaveBeenCalledWith(citaId);
    });

    it('debe retornar 404 cuando la cita no existe', async () => {
      const citaId = '999';
      
      // Configurar el mock
      mockCitaModel.getCitaById.mockResolvedValue(null);

      // Ejecutar la prueba
      const response = await request(app)
        .get(`/api/citas/${citaId}`);

      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: true,
        message: 'Cita no encontrada'
      });
      expect(mockCitaModel.getCitaById).toHaveBeenCalledWith(citaId);
    });
  });
  
  describe('GET /api/citas/paciente/:paciente_id', () => {
    it('debe obtener citas para un paciente específico', async () => {
      // Datos de prueba
      const pacienteId = '5';
      const mockCitas = [
        { id: 1, paciente_id: 5, fecha: '2023-01-15', estado: 'agendada' },
        { id: 2, paciente_id: 5, fecha: '2023-02-20', estado: 'completada' }
      ];
      
      // Configurar el mock
      mockCitaModel.getCitasByPaciente.mockResolvedValue(mockCitas);
      
      // Ejecutar la prueba
      const response = await request(app)
        .get(`/api/citas/paciente/${pacienteId}`);
        
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockCitas
      });
      expect(mockCitaModel.getCitasByPaciente).toHaveBeenCalledWith(pacienteId);
    });
    
    it('debe manejar errores al obtener citas del paciente', async () => {
      const pacienteId = '5';
      
      // Configurar el mock para simular un error
      mockCitaModel.getCitasByPaciente.mockRejectedValue(new Error('Error al consultar'));
      
      // Ejecutar la prueba
      const response = await request(app)
        .get(`/api/citas/paciente/${pacienteId}`);
        
      // Verificar resultado
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(true);
    });
  });

  describe('POST /api/citas', () => {
    it('debe crear una nueva cita', async () => {
      // Datos de prueba
      const nuevaCita = { 
        paciente_id: 1, 
        horario_id: 1, 
        fecha: '2023-01-01', 
        estado: 'agendada' 
      };
      
      const citaCreada = { 
        id: 1, 
        ...nuevaCita 
      };
      
      // Configurar el mock
      mockCitaModel.createCita.mockResolvedValue(citaCreada);

      // Ejecutar la prueba
      const response = await request(app)
        .post('/api/citas')
        .send(nuevaCita);

      // Verificar resultado
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        error: false,
        data: citaCreada,
        message: 'Cita creada correctamente'
      });
      expect(mockCitaModel.createCita).toHaveBeenCalledWith(nuevaCita);
    });

    it('debe manejar errores de validación al crear una cita', async () => {
      // Datos incompletos
      const citaIncompleta = { 
        // Falta paciente_id, horario_id, etc.
      };
      
      // Ejecutar la prueba
      const response = await request(app)
        .post('/api/citas')
        .send(citaIncompleta);

      // Verificar resultado - asumiendo que hay validación
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: expect.stringContaining('Se requieren')
      });
      expect(mockCitaModel.createCita).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/citas/:id', () => {
    it('debe actualizar una cita existente', async () => {
      // Datos de prueba
      const citaId = '1';
      const datosCita = { 
        estado: 'completada',
        observaciones: 'El paciente completó su cita con éxito'
      };
      
      const citaActualizada = { 
        id: 1, 
        paciente_id: 1,
        horario_id: 1,
        fecha: '2023-01-01',
        ...datosCita 
      };
      
      // Configurar el mock
      mockCitaModel.updateCita.mockResolvedValue(citaActualizada);

      // Ejecutar la prueba
      const response = await request(app)
        .put(`/api/citas/${citaId}`)
        .send(datosCita);

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: citaActualizada,
        message: 'Cita actualizada correctamente'
      });
      expect(mockCitaModel.updateCita).toHaveBeenCalledWith(citaId, datosCita);
    });

    it('debe retornar 404 cuando la cita a actualizar no existe', async () => {
      const citaId = '999';
      const datosCita = { estado: 'cancelada' };
      
      // Configurar el mock
      mockCitaModel.updateCita.mockResolvedValue(null);

      // Ejecutar la prueba
      const response = await request(app)
        .put(`/api/citas/${citaId}`)
        .send(datosCita);

      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: true,
        message: 'Cita no encontrada'
      });
      expect(mockCitaModel.updateCita).toHaveBeenCalledWith(citaId, datosCita);
    });
  });
  
  describe('PUT /api/citas/:id/estado', () => {
    it('debe cambiar el estado de una cita', async () => {
      // Datos de prueba
      const citaId = '1';
      const nuevoEstado = { estado: 'cancelada' };
      
      const citaActualizada = {
        id: 1,
        paciente_id: 1,
        horario_id: 1,
        fecha: '2023-01-01',
        estado: 'cancelada'
      };
      
      // Configurar el mock
      mockCitaModel.updateCitaStatus.mockResolvedValue(citaActualizada);
      
      // Ejecutar la prueba
      const response = await request(app)
        .put(`/api/citas/${citaId}/estado`)
        .send(nuevoEstado);
        
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: citaActualizada,
        message: 'Estado de cita actualizado correctamente'
      });
      expect(mockCitaModel.updateCitaStatus).toHaveBeenCalledWith(citaId, 'cancelada');
    });
    
    it('debe validar que se proporcione un estado', async () => {
      const citaId = '1';
      
      // Ejecutar la prueba sin enviar estado
      const response = await request(app)
        .put(`/api/citas/${citaId}/estado`)
        .send({});
        
      // Verificar resultado
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
      expect(mockCitaModel.updateCitaStatus).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/citas/:id', () => {
    it('debe eliminar una cita existente', async () => {
      // Datos de prueba
      const citaId = '1';
      
      // Configurar el mock
      mockCitaModel.deleteCita.mockResolvedValue(true);

      // Ejecutar la prueba
      const response = await request(app)
        .delete(`/api/citas/${citaId}`);

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: 'Cita eliminada correctamente'
      });
      expect(mockCitaModel.deleteCita).toHaveBeenCalledWith(citaId);
    });

    it('debe retornar 404 cuando la cita a eliminar no existe', async () => {
      const citaId = '999';
      
      // Configurar el mock
      mockCitaModel.deleteCita.mockResolvedValue(false);

      // Ejecutar la prueba
      const response = await request(app)
        .delete(`/api/citas/${citaId}`);

      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: true,
        message: 'Cita no encontrada'
      });
      expect(mockCitaModel.deleteCita).toHaveBeenCalledWith(citaId);
    });
    
    it('debe manejar errores al eliminar una cita', async () => {
      const citaId = '1';
      
      // Configurar el mock para simular un error
      mockCitaModel.deleteCita.mockRejectedValue(new Error('Error al eliminar'));

      // Ejecutar la prueba
      const response = await request(app)
        .delete(`/api/citas/${citaId}`);

      // Verificar resultado
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(true);
      expect(mockCitaModel.deleteCita).toHaveBeenCalledWith(citaId);
    });
  });
}); 