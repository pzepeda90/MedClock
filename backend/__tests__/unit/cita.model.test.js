import { jest } from '@jest/globals';

// Mock de los módulos
jest.mock('../../database/db.js', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(() => ({
      query: jest.fn(),
      release: jest.fn()
    }))
  }
}));

// Importar el pool mockeado directamente desde el módulo
import { pool } from '../../database/db.js';

// Importar el modelo a probar 
import Cita from '../../models/cita.model.js';

describe('Cita Model', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('getCitas', () => {
    it('debe obtener todas las citas', async () => {
      // Datos de prueba
      const mockCitas = [
        { id: 1, paciente_id: 1, horario_id: 1, fecha: '2023-01-01', estado: 'agendada' },
        { id: 2, paciente_id: 2, horario_id: 2, fecha: '2023-01-02', estado: 'completada' }
      ];
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: mockCitas, rowCount: mockCitas.length });

      // Ejecutar función a probar
      const result = await Cita.getCitas();

      // Verificar resultado
      expect(result).toEqual(mockCitas);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCitaById', () => {
    it('debe obtener una cita por su ID', async () => {
      // Datos de prueba
      const mockCita = { 
        id: 1, 
        paciente_id: 1, 
        horario_id: 1, 
        fecha: '2023-01-01', 
        estado: 'agendada' 
      };
      const citaId = 1;
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: [mockCita], rowCount: 1 });

      // Ejecutar función a probar
      const result = await Cita.getCitaById(citaId);

      // Verificar resultado
      expect(result).toEqual(mockCita);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][1]).toEqual([citaId]);
    });

    it('debe retornar null cuando no existe la cita', async () => {
      const citaId = 999;
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      // Ejecutar función a probar
      const result = await Cita.getCitaById(citaId);

      // Verificar resultado
      expect(result).toBeNull();
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCita', () => {
    it('debe crear una nueva cita', async () => {
      // Datos de prueba
      const nuevaCita = { 
        paciente_id: 1, 
        horario_id: 1, 
        servicio_id: 1,
        fecha: '2023-01-01', 
        estado: 'agendada' 
      };
      
      const citaCreada = { 
        id: 1, 
        ...nuevaCita 
      };
      
      // Mock del cliente de pool
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      
      // Configurar mocks
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // UPDATE horarios
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // INSERT cita
      
      // Mock para getCitaById que se llama después de crear
      pool.query.mockResolvedValueOnce({ rows: [citaCreada], rowCount: 1 });
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Ejecutar función a probar
      const result = await Cita.createCita(nuevaCita);

      // Verificar resultado
      expect(result).toEqual(citaCreada);
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCita', () => {
    it('debe actualizar una cita existente', async () => {
      // Datos de prueba
      const citaId = 1;
      const datosCita = { 
        estado: 'completada',
        observaciones: 'El paciente completó su cita con éxito'
      };
      
      const citaActualizada = { 
        id: citaId, 
        paciente_id: 1,
        horario_id: 1,
        fecha: '2023-01-01',
        ...datosCita 
      };
      
      // Mock del cliente de pool
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      
      // Configurar mocks
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [citaActualizada], rowCount: 1 }); // UPDATE cita
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // UPDATE horario
      
      // Mock para getCitaById que se llama después de actualizar
      pool.query.mockResolvedValueOnce({ rows: [citaActualizada], rowCount: 1 });
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Ejecutar función a probar
      const result = await Cita.updateCita(citaId, datosCita);

      // Verificar resultado
      expect(result).toEqual(citaActualizada);
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('debe retornar null cuando la cita no existe', async () => {
      const citaId = 999;
      const datosCita = { estado: 'cancelada' };
      
      // Mock del cliente de pool
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      
      // Configurar mocks
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE sin resultados
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // ROLLBACK

      // Ejecutar función a probar
      const result = await Cita.updateCita(citaId, datosCita);

      // Verificar resultado
      expect(result).toBeNull();
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(3);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteCita', () => {
    it('debe eliminar una cita existente', async () => {
      // Datos de prueba
      const citaId = 1;
      const citaEliminada = { 
        id: citaId, 
        paciente_id: 1,
        horario_id: 1,
        fecha: '2023-01-01',
        estado: 'eliminada'
      };
      
      // Mock del cliente de pool
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      
      // Configurar mocks
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [{ horario_id: 1 }], rowCount: 1 }); // SELECT
      
      // Mock para getCitaById que se llama antes de eliminar
      pool.query.mockResolvedValueOnce({ rows: [citaEliminada], rowCount: 1 });
      
      mockClient.query.mockResolvedValueOnce({ rows: [citaEliminada], rowCount: 1 }); // DELETE
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // UPDATE horario
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Ejecutar función a probar
      const result = await Cita.deleteCita(citaId);

      // Verificar resultado
      expect(result).toEqual(citaEliminada);
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(5);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('debe retornar null cuando la cita no existe', async () => {
      const citaId = 999;
      
      // Mock del cliente de pool
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      
      // Configurar mocks
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT sin resultados
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // ROLLBACK

      // Ejecutar función a probar
      const result = await Cita.deleteCita(citaId);

      // Verificar resultado
      expect(result).toBeNull();
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(3);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });
}); 