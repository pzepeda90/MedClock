import { jest } from '@jest/globals';

// Mock del modelo
const mockGetEstadisticasGenerales = jest.fn();
const mockGetCitasPorPeriodo = jest.fn();
const mockGetCitasPorEspecialidad = jest.fn();
const mockGetEstadisticasHorarios = jest.fn();
const mockGetDiagnosticosFrecuentes = jest.fn();

jest.mock('../../models/reporte.model.js', () => ({
  __esModule: true,
  default: {
    getEstadisticasGenerales: mockGetEstadisticasGenerales,
    getCitasPorPeriodo: mockGetCitasPorPeriodo,
    getCitasPorEspecialidad: mockGetCitasPorEspecialidad,
    getEstadisticasHorarios: mockGetEstadisticasHorarios,
    getDiagnosticosFrecuentes: mockGetDiagnosticosFrecuentes
  }
}));

// Importar el modelo mockeado
import Reporte from '../../models/reporte.model.js';

// Importar el controlador a probar
import ReporteController from '../../controllers/reporte.controller.js';

describe('ReporteController', () => {
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

  describe('getEstadisticasGenerales', () => {
    it('debe obtener estadísticas generales', async () => {
      // Datos de prueba
      const mockEstadisticas = {
        total_pacientes: 150,
        total_medicos: 10,
        total_especialidades: 5
      };
      
      // Configurar mock
      mockGetEstadisticasGenerales.mockResolvedValue(mockEstadisticas);

      // Ejecutar función a probar
      await ReporteController.getEstadisticasGenerales(req, res);

      // Verificar resultado
      expect(mockGetEstadisticasGenerales).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockEstadisticas
      });
    });

    it('debe manejar errores correctamente', async () => {
      // Configurar mock para lanzar error
      const error = new Error('Error en base de datos');
      mockGetEstadisticasGenerales.mockRejectedValue(error);

      // Ejecutar función a probar
      await ReporteController.getEstadisticasGenerales(req, res);

      // Verificar resultado
      expect(mockGetEstadisticasGenerales).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Error al generar el reporte'
      });
    });
  });

  describe('getCitasPorPeriodo', () => {
    it('debe obtener estadísticas de citas por período', async () => {
      // Datos de prueba
      const mockEstadisticas = [
        { periodo: '2023-01-01', total_citas: 5, agendadas: 2, completadas: 2, canceladas: 1 }
      ];
      
      // Configurar req y mocks
      req.query = {
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-31',
        agrupacion: 'dia'
      };
      
      mockGetCitasPorPeriodo.mockResolvedValue(mockEstadisticas);

      // Ejecutar función a probar
      await ReporteController.getCitasPorPeriodo(req, res);

      // Verificar resultado
      expect(mockGetCitasPorPeriodo).toHaveBeenCalledWith(
        req.query.fecha_inicio,
        req.query.fecha_fin,
        req.query.agrupacion
      );
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockEstadisticas
      });
    });

    it('debe retornar 400 cuando faltan fechas', async () => {
      // Configurar req sin fechas
      req.query = {
        agrupacion: 'dia'
      };

      // Ejecutar función a probar
      await ReporteController.getCitasPorPeriodo(req, res);

      // Verificar resultado
      expect(mockGetCitasPorPeriodo).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Se requieren las fechas de inicio y fin'
      });
    });
  });

  describe('getDiagnosticosFrecuentes', () => {
    it('debe obtener diagnósticos frecuentes', async () => {
      // Datos de prueba
      const mockDiagnosticos = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', categoria: 'Enfermedades respiratorias', total: 12 }
      ];
      
      // Configurar req y mocks
      req.query = {
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-31',
        limit: '5'
      };
      
      mockGetDiagnosticosFrecuentes.mockResolvedValue(mockDiagnosticos);

      // Ejecutar función a probar
      await ReporteController.getDiagnosticosFrecuentes(req, res);

      // Verificar resultado
      expect(mockGetDiagnosticosFrecuentes).toHaveBeenCalledWith(
        req.query.fecha_inicio,
        req.query.fecha_fin,
        parseInt(req.query.limit)
      );
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockDiagnosticos
      });
    });

    it('debe usar fechas predeterminadas cuando no se proporcionan', async () => {
      // Datos de prueba
      const mockDiagnosticos = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', categoria: 'Enfermedades respiratorias', total: 12 }
      ];
      
      // Fecha actual simulada
      const mockDate = new Date('2023-02-01');
      const expectedFechaFin = '2023-02-01';
      const expectedFechaInicio = '2023-01-01'; // Un mes antes
      
      // Mock para Date
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      // Configurar req (sin fechas) y mocks
      req.query = {
        limit: '5'
      };
      
      mockGetDiagnosticosFrecuentes.mockResolvedValue(mockDiagnosticos);

      // Ejecutar función a probar
      await ReporteController.getDiagnosticosFrecuentes(req, res);

      // Verificar resultado
      expect(mockGetDiagnosticosFrecuentes).toHaveBeenCalledWith(
        expectedFechaInicio,
        expectedFechaFin,
        parseInt(req.query.limit)
      );
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockDiagnosticos
      });
      
      // Restaurar Date
      jest.spyOn(global, 'Date').mockRestore();
    });
  });

  describe('getDashboard', () => {
    it('debe obtener un dashboard completo', async () => {
      // Configurar mocks para todos los métodos llamados
      const mockDate = new Date('2023-02-01');
      const mockDateFin = '2023-02-01';
      const mockDateInicio = '2023-01-01'; // Un mes antes
      
      // Mock para Date
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      // Datos de prueba
      const mockEstadisticasGenerales = {
        total_pacientes: 150,
        total_medicos: 10,
        total_especialidades: 5
      };
      
      const mockCitasPorPeriodo = [
        { periodo: '2023-W01', total_citas: 15, agendadas: 5, completadas: 8, canceladas: 2 }
      ];
      
      const mockCitasPorEspecialidad = [
        { especialidad_id: 1, especialidad: 'Medicina General', total_citas: 20 }
      ];
      
      const mockEstadisticasHorarios = {
        total_horarios: 100,
        disponibles: 50,
        reservados: 30,
        completados: 20
      };
      
      const mockDiagnosticosFrecuentes = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', categoria: 'Enfermedades respiratorias', total: 12 }
      ];
      
      // Mock para todos los métodos del modelo
      mockGetEstadisticasGenerales.mockResolvedValue(mockEstadisticasGenerales);
      mockGetCitasPorPeriodo.mockResolvedValue(mockCitasPorPeriodo);
      mockGetCitasPorEspecialidad.mockResolvedValue(mockCitasPorEspecialidad);
      mockGetEstadisticasHorarios.mockResolvedValue(mockEstadisticasHorarios);
      mockGetDiagnosticosFrecuentes.mockResolvedValue(mockDiagnosticosFrecuentes);

      // Ejecutar función a probar
      await ReporteController.getDashboard(req, res);

      // Verificar resultado
      expect(mockGetEstadisticasGenerales).toHaveBeenCalledTimes(1);
      expect(mockGetCitasPorPeriodo).toHaveBeenCalledWith(
        mockDateInicio,
        mockDateFin,
        'semana'
      );
      expect(mockGetDiagnosticosFrecuentes).toHaveBeenCalledWith(
        mockDateInicio,
        mockDateFin,
        5
      );
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: expect.objectContaining({
          periodo: {
            fecha_inicio: mockDateInicio,
            fecha_fin: mockDateFin
          },
          estadisticas_generales: mockEstadisticasGenerales,
          citas_por_periodo: mockCitasPorPeriodo,
          citas_por_especialidad: mockCitasPorEspecialidad,
          estadisticas_horarios: mockEstadisticasHorarios,
          diagnosticos_frecuentes: mockDiagnosticosFrecuentes
        })
      });
      
      // Restaurar Date
      jest.spyOn(global, 'Date').mockRestore();
    });
  });
}); 