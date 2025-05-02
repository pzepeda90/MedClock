import { jest } from '@jest/globals';
import { pool } from '../mocks/db.mock.js';

// Mock de los módulos
jest.mock('../../database/db.js', () => ({
  pool
}));

// Importar el modelo a probar
import Reporte from '../../models/reporte.model.js';

describe('Reporte Model', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('getEstadisticasGenerales', () => {
    it('debe obtener estadísticas generales del sistema', async () => {
      // Datos de prueba
      const mockEstadisticas = {
        total_pacientes: 150,
        total_medicos: 10,
        total_especialidades: 5,
        total_consultorios: 3,
        total_servicios: 15,
        total_horarios: 200,
        total_citas: 80,
        total_diagnosticos: 50
      };
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: [mockEstadisticas], rowCount: 1 });

      // Ejecutar función a probar
      const result = await Reporte.getEstadisticasGenerales();

      // Verificar resultado
      expect(result).toEqual(mockEstadisticas);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('total_pacientes');
    });

    it('debe retornar null cuando no hay datos', async () => {
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      // Ejecutar función a probar
      const result = await Reporte.getEstadisticasGenerales();

      // Verificar resultado
      expect(result).toBeNull();
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCitasPorPeriodo', () => {
    it('debe obtener estadísticas de citas por período', async () => {
      // Datos de prueba
      const mockEstadisticas = [
        { periodo: '2023-01-01', total_citas: 5, agendadas: 2, completadas: 2, canceladas: 1 },
        { periodo: '2023-01-02', total_citas: 8, agendadas: 3, completadas: 4, canceladas: 1 }
      ];
      
      // Fechas para la prueba
      const fechaInicio = '2023-01-01';
      const fechaFin = '2023-01-31';
      const agrupacion = 'dia';
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: mockEstadisticas, rowCount: mockEstadisticas.length });

      // Ejecutar función a probar
      const result = await Reporte.getCitasPorPeriodo(fechaInicio, fechaFin, agrupacion);

      // Verificar resultado
      expect(result).toEqual(mockEstadisticas);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('GROUP BY periodo');
      expect(pool.query.mock.calls[0][1]).toEqual([fechaInicio, fechaFin]);
    });
  });

  describe('getDiagnosticosFrecuentes', () => {
    it('debe obtener los diagnósticos más frecuentes', async () => {
      // Datos de prueba
      const mockDiagnosticos = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', categoria: 'Enfermedades respiratorias', total: 12 },
        { id: 3, codigo: 'J03', nombre: 'Amigdalitis aguda', categoria: 'Enfermedades respiratorias', total: 8 },
        { id: 7, codigo: 'I10', nombre: 'Hipertensión esencial', categoria: 'Enfermedades cardiovasculares', total: 7 }
      ];
      
      // Fechas para la prueba
      const fechaInicio = '2023-01-01';
      const fechaFin = '2023-01-31';
      const limit = 5;
      
      // Configurar el mock
      pool.query.mockResolvedValue({ rows: mockDiagnosticos, rowCount: mockDiagnosticos.length });

      // Ejecutar función a probar
      const result = await Reporte.getDiagnosticosFrecuentes(fechaInicio, fechaFin, limit);

      // Verificar resultado
      expect(result).toEqual(mockDiagnosticos);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('GROUP BY d.id, d.codigo, d.nombre, d.categoria');
      expect(pool.query.mock.calls[0][1]).toEqual([fechaInicio, fechaFin, limit]);
    });
  });
}); 