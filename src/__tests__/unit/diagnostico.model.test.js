const { mockPool, mockQueryResults } = require('../mocks/db.mock');

// Mock de los módulos
jest.mock('../../config/database', () => ({
  pool: mockPool
}));

// Importar el modelo a probar
const Diagnostico = require('../../models/diagnostico.model');

describe('Diagnostico Model', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debe obtener todos los diagnósticos sin filtros', async () => {
      // Configurar el mock para este caso
      mockPool.query.mockResolvedValueOnce({
        rows: mockQueryResults.diagnósticos,
        rowCount: mockQueryResults.diagnósticos.length
      });

      // Ejecutar función a probar
      const result = await Diagnostico.getAll();

      // Verificar resultado
      expect(result).toEqual(mockQueryResults.diagnósticos);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query.mock.calls[0][0]).toContain('SELECT');
      expect(mockPool.query.mock.calls[0][0]).toContain('FROM diagnosticos');
    });

    it('debe obtener diagnósticos filtrados por código', async () => {
      // Configurar el mock para este caso
      mockPool.query.mockResolvedValueOnce({
        rows: [mockQueryResults.diagnósticos[0]],
        rowCount: 1
      });

      // Ejecutar función a probar
      const result = await Diagnostico.getAll({ codigo: 'J00' });

      // Verificar resultado
      expect(result).toEqual([mockQueryResults.diagnósticos[0]]);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query.mock.calls[0][0]).toContain('d.codigo LIKE');
    });
  });

  describe('getById', () => {
    it('debe obtener un diagnóstico por ID', async () => {
      // Configurar el mock para este caso
      mockPool.query.mockResolvedValueOnce({
        rows: [mockQueryResults.diagnósticos[0]],
        rowCount: 1
      });

      // Ejecutar función a probar
      const result = await Diagnostico.getById(1);

      // Verificar resultado
      expect(result).toEqual(mockQueryResults.diagnósticos[0]);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query.mock.calls[0][0]).toContain('WHERE d.id = $1');
      expect(mockPool.query.mock.calls[0][1]).toEqual([1]);
    });

    it('debe retornar null cuando no encuentra el diagnóstico', async () => {
      // Configurar el mock para este caso
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Ejecutar función a probar
      const result = await Diagnostico.getById(999);

      // Verificar resultado
      expect(result).toBeNull();
      expect(mockPool.query).toHaveBeenCalledTimes(1);
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
      mockPool.connect.mockResolvedValueOnce(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 3 }] }); // INSERT
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT
      
      // Mock para getById que se llama después de crear
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 3, ...diagData }],
        rowCount: 1
      });

      // Ejecutar función a probar
      const result = await Diagnostico.create(diagData);

      // Verificar resultado
      expect(result).toEqual({ id: 3, ...diagData });
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(3);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('asociarACita', () => {
    it('debe asociar un diagnóstico a una cita', async () => {
      // Datos para asociar
      const citaId = 1;
      const diagnosticoId = 1;
      const notas = 'Notas sobre el diagnóstico';

      // Mock del cliente de pool
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      
      // Configurar mocks
      mockPool.connect.mockResolvedValueOnce(mockClient);
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({ 
        rows: [{ 
          id: 1, 
          cita_id: citaId, 
          diagnostico_id: diagnosticoId, 
          notas: notas,
          fecha_creacion: new Date().toISOString()
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
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(3);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDiagnosticosByCita', () => {
    it('debe obtener los diagnósticos asociados a una cita', async () => {
      // Configurar el mock para este caso
      const diagnosticosCita = [
        { ...mockQueryResults.diagnósticos[0], notas: 'Notas 1', fecha_creacion: new Date().toISOString() }
      ];
      
      mockPool.query.mockResolvedValueOnce({
        rows: diagnosticosCita,
        rowCount: diagnosticosCita.length
      });

      // Ejecutar función a probar
      const result = await Diagnostico.getDiagnosticosByCita(1);

      // Verificar resultado
      expect(result).toEqual(diagnosticosCita);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query.mock.calls[0][0]).toContain('WHERE cd.cita_id = $1');
      expect(mockPool.query.mock.calls[0][1]).toEqual([1]);
    });
  });
}); 