import { jest } from '@jest/globals';
import { pool } from '../mocks/db.mock.js';

// Mock de los módulos
jest.mock('../../database/db.js', () => ({
  pool
}));

// Importar el modelo a probar
import Diagnostico from '../../models/diagnostico.model.js';

describe('Diagnostico Model', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debe obtener todos los diagnósticos sin filtros', async () => {
      // Datos de prueba
      const mockDiagnosticos = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', descripcion: null, categoria: 'Enfermedades respiratorias' },
        { id: 2, codigo: 'E11', nombre: 'Diabetes mellitus tipo 2', descripcion: null, categoria: 'Enfermedades endocrinas' }
      ];
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: mockDiagnosticos, rowCount: mockDiagnosticos.length });

      // Ejecutar función a probar
      const result = await Diagnostico.getAll();

      // Verificar resultado
      expect(result).toEqual(mockDiagnosticos);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('SELECT');
      expect(pool.query.mock.calls[0][0]).toContain('FROM diagnosticos');
    });

    it('debe obtener diagnósticos filtrados por código', async () => {
      // Datos de prueba
      const mockDiagnosticos = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', descripcion: null, categoria: 'Enfermedades respiratorias' }
      ];
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: mockDiagnosticos, rowCount: mockDiagnosticos.length });

      // Ejecutar función a probar
      const result = await Diagnostico.getAll({ codigo: 'J00' });

      // Verificar resultado
      expect(result).toEqual(mockDiagnosticos);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('AND d.codigo LIKE');
      expect(pool.query.mock.calls[0][1]).toContain('%J00%');
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
      pool.query.mockResolvedValue({ rows: [mockDiagnostico], rowCount: 1 });

      // Ejecutar función a probar
      const result = await Diagnostico.getById(1);

      // Verificar resultado
      expect(result).toEqual(mockDiagnostico);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('WHERE d.id = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
    });

    it('debe retornar null cuando no encuentra el diagnóstico', async () => {
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      // Ejecutar función a probar
      const result = await Diagnostico.getById(999);

      // Verificar resultado
      expect(result).toBeNull();
      expect(pool.query).toHaveBeenCalledTimes(1);
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

      // Mock del cliente de pool
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      
      // Configurar mocks
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 3 }] }); // INSERT
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT
      
      // Mock para getById que se llama después de crear
      pool.query.mockResolvedValue({ rows: [{ id: 3, ...diagData }], rowCount: 1 });

      // Ejecutar función a probar
      const result = await Diagnostico.create(diagData);

      // Verificar resultado
      expect(result).toEqual({ id: 3, ...diagData });
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(3);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('asociarACita', () => {
    it('debe asociar un diagnóstico a una cita', async () => {
      // Datos para asociar
      const citaId = 1;
      const diagnosticoId = 1;
      const notas = 'Notas sobre el diagnóstico';
      const fechaCreacion = new Date().toISOString();
      
      // Mock del cliente de pool
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      
      // Configurar mocks
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ 
        rows: [{ 
          id: 1, 
          cita_id: citaId, 
          diagnostico_id: diagnosticoId, 
          notas: notas,
          fecha_creacion: fechaCreacion
        }]
      }); // INSERT
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Ejecutar función a probar
      const result = await Diagnostico.asociarACita(citaId, diagnosticoId, notas);

      // Verificar resultado
      expect(result).toHaveProperty('id');
      expect(result.cita_id).toBe(citaId);
      expect(result.diagnostico_id).toBe(diagnosticoId);
      expect(result.notas).toBe(notas);
      expect(result.fecha_creacion).toBe(fechaCreacion);
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(3);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDiagnosticosByCita', () => {
    it('debe obtener los diagnósticos asociados a una cita', async () => {
      // Datos de prueba
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
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: mockDiagnosticos, rowCount: mockDiagnosticos.length });

      // Ejecutar función a probar
      const result = await Diagnostico.getDiagnosticosByCita(1);

      // Verificar resultado
      expect(result).toEqual(mockDiagnosticos);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('WHERE cd.cita_id = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
    });
  });
}); 