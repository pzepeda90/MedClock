import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Definir mocks
const mockGetEstadisticasGenerales = jest.fn();
const mockGetCitasPorPeriodo = jest.fn();
const mockGetCitasPorEspecialidad = jest.fn();
const mockGetEstadisticasHorarios = jest.fn();
const mockGetDiagnosticosFrecuentes = jest.fn();
const mockVerifyToken = jest.fn();

// Mock de módulos
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

jest.mock('../../middlewares/auth.middleware.js', () => ({
  verifyToken: (req, res, next) => { 
    mockVerifyToken(req, res, next);
    req.user = { id: 1, role: 'admin' };
    next();
  }
}));

// Importar el modelo mockeado
import Reporte from '../../models/reporte.model.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

// Crear app express para testing
const app = express();
app.use(express.json());

// Importar las rutas a probar
import reporteRoutes from '../../routes/reporte.routes.js';
app.use('/api/reportes', reporteRoutes);

describe('Reporte Routes', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /api/reportes/dashboard', () => {
    it('debe generar un dashboard con todos los indicadores', async () => {
      // Configurar fecha fija para las pruebas
      const mockDate = new Date('2023-02-01');
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
      
      // Configurar los mocks
      mockGetEstadisticasGenerales.mockResolvedValue(mockEstadisticasGenerales);
      mockGetCitasPorPeriodo.mockResolvedValue(mockCitasPorPeriodo);
      mockGetCitasPorEspecialidad.mockResolvedValue(mockCitasPorEspecialidad);
      mockGetEstadisticasHorarios.mockResolvedValue(mockEstadisticasHorarios);
      mockGetDiagnosticosFrecuentes.mockResolvedValue(mockDiagnosticosFrecuentes);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/reportes/dashboard');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: {
          periodo: {
            fecha_inicio: '2023-01-01', // Un mes antes de mockDate
            fecha_fin: '2023-02-01'     // mockDate
          },
          estadisticas_generales: mockEstadisticasGenerales,
          citas_por_periodo: mockCitasPorPeriodo,
          citas_por_especialidad: mockCitasPorEspecialidad,
          estadisticas_horarios: mockEstadisticasHorarios,
          diagnosticos_frecuentes: mockDiagnosticosFrecuentes
        }
      });
      
      // Restaurar Date
      jest.spyOn(global, 'Date').mockRestore();
    });
  });

  describe('GET /api/reportes/estadisticas-generales', () => {
    it('debe obtener estadísticas generales', async () => {
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
      mockGetEstadisticasGenerales.mockResolvedValue(mockEstadisticas);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/reportes/estadisticas-generales');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockEstadisticas
      });
      expect(mockGetEstadisticasGenerales).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/reportes/citas-por-periodo', () => {
    it('debe obtener estadísticas de citas por período', async () => {
      // Datos de prueba
      const mockEstadisticas = [
        { periodo: '2023-01-01', total_citas: 5, agendadas: 2, completadas: 2, canceladas: 1 },
        { periodo: '2023-01-02', total_citas: 8, agendadas: 3, completadas: 4, canceladas: 1 }
      ];
      
      // Configurar el mock
      mockGetCitasPorPeriodo.mockResolvedValue(mockEstadisticas);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/reportes/citas-por-periodo?fecha_inicio=2023-01-01&fecha_fin=2023-01-31&agrupacion=dia');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockEstadisticas
      });
      expect(mockGetCitasPorPeriodo).toHaveBeenCalledWith('2023-01-01', '2023-01-31', 'dia');
    });

    it('debe retornar 400 cuando faltan fechas', async () => {
      // Ejecutar la prueba sin proporcionar fechas
      const response = await request(app)
        .get('/api/reportes/citas-por-periodo');

      // Verificar resultado
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: 'Se requieren las fechas de inicio y fin'
      });
      expect(mockGetCitasPorPeriodo).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/reportes/diagnosticos-frecuentes', () => {
    it('debe obtener diagnósticos frecuentes', async () => {
      // Datos de prueba
      const mockDiagnosticos = [
        { id: 1, codigo: 'J00', nombre: 'Resfriado común', categoria: 'Enfermedades respiratorias', total: 12 },
        { id: 3, codigo: 'J03', nombre: 'Amigdalitis aguda', categoria: 'Enfermedades respiratorias', total: 8 }
      ];
      
      // Configurar el mock
      mockGetDiagnosticosFrecuentes.mockResolvedValue(mockDiagnosticos);

      // Ejecutar la prueba
      const response = await request(app)
        .get('/api/reportes/diagnosticos-frecuentes?fecha_inicio=2023-01-01&fecha_fin=2023-01-31&limit=5');

      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        data: mockDiagnosticos
      });
      expect(mockGetDiagnosticosFrecuentes).toHaveBeenCalledWith('2023-01-01', '2023-01-31', 5);
    });
  });
}); 