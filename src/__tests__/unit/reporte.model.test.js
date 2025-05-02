const { mockPool, mockQueryResults } = require('../mocks/db.mock');

// Mock de los módulos
jest.mock('../../config/database', () => ({
  pool: mockPool
}));

// Importar el modelo a probar
const Reporte = require('../../models/reporte.model');

describe('Reporte Model', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('getCitasPorPeriodo', () => {
    it('debe obtener estadísticas de citas por período', async () => {
      // Fechas para la prueba
      const fechaInicio = '2023-01-01';
      const fechaFin = '2023-01-31';
      const agrupacion = 'dia';
      
      // Configurar el mock para este caso
      mockPool.query.mockResolvedValueOnce({
        rows: mockQueryResults.citasPorPeriodo,
        rowCount: mockQueryResults.citasPorPeriodo.length
      });

      // Ejecutar función a probar
      const result = await Reporte.getCitasPorPeriodo(fechaInicio, fechaFin, agrupacion);

      // Verificar resultado
      expect(result).toEqual(mockQueryResults.citasPorPeriodo);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query.mock.calls[0][0]).toContain('GROUP BY periodo');
      expect(mockPool.query.mock.calls[0][1]).toEqual([fechaInicio, fechaFin]);
    });
  });

  describe('getEstadisticasGenerales', () => {
    it('debe obtener estadísticas generales del sistema', async () => {
      // Configurar el mock para este caso
      mockPool.query.mockResolvedValueOnce({
        rows: [mockQueryResults.estadisticasGenerales],
        rowCount: 1
      });

      // Ejecutar función a probar
      const result = await Reporte.getEstadisticasGenerales();

      // Verificar resultado
      expect(result).toEqual(mockQueryResults.estadisticasGenerales);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query.mock.calls[0][0]).toContain('total_pacientes');
    });

    it('debe retornar null cuando no hay datos', async () => {
      // Configurar el mock para este caso
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Ejecutar función a probar
      const result = await Reporte.getEstadisticasGenerales();

      // Verificar resultado
      expect(result).toBeNull();
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDiagnosticosFrecuentes', () => {
    it('debe obtener los diagnósticos más frecuentes', async () => {
      // Fechas para la prueba
      const fechaInicio = '2023-01-01';
      const fechaFin = '2023-01-31';
      const limit = 5;
      
      // Configurar el mock para este caso
      mockPool.query.mockResolvedValueOnce({
        rows: mockQueryResults.diagnosticosFrecuentes,
        rowCount: mockQueryResults.diagnosticosFrecuentes.length
      });

      // Ejecutar función a probar
      const result = await Reporte.getDiagnosticosFrecuentes(fechaInicio, fechaFin, limit);

      // Verificar resultado
      expect(result).toEqual(mockQueryResults.diagnosticosFrecuentes);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query.mock.calls[0][0]).toContain('GROUP BY d.id, d.codigo, d.nombre, d.categoria');
      expect(mockPool.query.mock.calls[0][1]).toEqual([fechaInicio, fechaFin, limit]);
    });
  });
}); 