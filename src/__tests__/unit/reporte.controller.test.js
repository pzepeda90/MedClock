const { mockQueryResults } = require('../mocks/db.mock');

// Mock del modelo
jest.mock('../../models/reporte.model');

// Importar el modelo mockeado
const Reporte = require('../../models/reporte.model');

// Importar el controlador a probar
const ReporteController = require('../../controllers/reporte.controller');

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

  describe('getCitasPorPeriodo', () => {
    it('debe obtener estadísticas de citas por período', async () => {
      // Configurar req y mocks
      req.query = {
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-31',
        agrupacion: 'dia'
      };
      
      Reporte.getCitasPorPeriodo.mockResolvedValueOnce(mockQueryResults.citasPorPeriodo);

      // Ejecutar función a probar
      await ReporteController.getCitasPorPeriodo(req, res);

      // Verificar resultado
      expect(Reporte.getCitasPorPeriodo).toHaveBeenCalledWith(
        req.query.fecha_inicio,
        req.query.fecha_fin,
        req.query.agrupacion
      );
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockQueryResults.citasPorPeriodo
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
      expect(Reporte.getCitasPorPeriodo).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Se requieren las fechas de inicio y fin'
      });
    });

    it('debe manejar errores correctamente', async () => {
      // Configurar req y mocks
      req.query = {
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-31'
      };
      
      const error = new Error('Error en base de datos');
      Reporte.getCitasPorPeriodo.mockRejectedValueOnce(error);

      // Ejecutar función a probar
      await ReporteController.getCitasPorPeriodo(req, res);

      // Verificar resultado
      expect(Reporte.getCitasPorPeriodo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Error al generar el reporte'
      });
    });
  });

  describe('getEstadisticasGenerales', () => {
    it('debe obtener estadísticas generales', async () => {
      // Configurar mock
      Reporte.getEstadisticasGenerales.mockResolvedValueOnce(
        mockQueryResults.estadisticasGenerales
      );

      // Ejecutar función a probar
      await ReporteController.getEstadisticasGenerales(req, res);

      // Verificar resultado
      expect(Reporte.getEstadisticasGenerales).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockQueryResults.estadisticasGenerales
      });
    });
  });

  describe('getDiagnosticosFrecuentes', () => {
    it('debe obtener diagnósticos frecuentes', async () => {
      // Configurar req y mocks
      req.query = {
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-31',
        limit: '5'
      };
      
      Reporte.getDiagnosticosFrecuentes.mockResolvedValueOnce(
        mockQueryResults.diagnosticosFrecuentes
      );

      // Ejecutar función a probar
      await ReporteController.getDiagnosticosFrecuentes(req, res);

      // Verificar resultado
      expect(Reporte.getDiagnosticosFrecuentes).toHaveBeenCalledWith(
        req.query.fecha_inicio,
        req.query.fecha_fin,
        parseInt(req.query.limit)
      );
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: mockQueryResults.diagnosticosFrecuentes
      });
    });
  });

  describe('getDashboard', () => {
    it('debe obtener un dashboard completo', async () => {
      // Configurar mocks para todos los métodos llamados
      const mockDate = new Date('2023-02-01');
      const mockDateFin = mockDate.toISOString().split('T')[0];
      const mockDateInicio = new Date(new Date(mockDate).setMonth(mockDate.getMonth() - 1)).toISOString().split('T')[0];
      
      // Mock para Date.now
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      // Mock para todos los métodos del modelo
      Reporte.getEstadisticasGenerales.mockResolvedValueOnce(
        mockQueryResults.estadisticasGenerales
      );
      Reporte.getCitasPorPeriodo.mockResolvedValueOnce(
        mockQueryResults.citasPorPeriodo
      );
      Reporte.getCitasPorEspecialidad.mockResolvedValueOnce([
        { especialidad_id: 1, especialidad: 'Medicina General', total_citas: 20 }
      ]);
      Reporte.getEstadisticasHorarios.mockResolvedValueOnce({
        total_horarios: 100,
        disponibles: 50,
        reservados: 30,
        completados: 20
      });
      Reporte.getDiagnosticosFrecuentes.mockResolvedValueOnce(
        mockQueryResults.diagnosticosFrecuentes
      );

      // Ejecutar función a probar
      await ReporteController.getDashboard(req, res);

      // Verificar resultado
      expect(Reporte.getEstadisticasGenerales).toHaveBeenCalledTimes(1);
      expect(Reporte.getCitasPorPeriodo).toHaveBeenCalledWith(
        mockDateInicio,
        mockDateFin,
        'semana'
      );
      expect(Reporte.getDiagnosticosFrecuentes).toHaveBeenCalledWith(
        mockDateInicio,
        mockDateFin,
        5
      );
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        data: expect.objectContaining({
          periodo: expect.any(Object),
          estadisticas_generales: expect.any(Object),
          citas_por_periodo: expect.any(Array),
          diagnosticos_frecuentes: expect.any(Array)
        })
      });
      
      // Restaurar Date
      jest.spyOn(global, 'Date').mockRestore();
    });
  });
}); 