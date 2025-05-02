const Reporte = require('../models/reporte.model');

/**
 * Controlador para generar reportes estadísticos
 */
class ReporteController {
  /**
   * Obtiene estadísticas de citas por período
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getCitasPorPeriodo(req, res) {
    try {
      const { fecha_inicio, fecha_fin, agrupacion } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      const estadisticas = await Reporte.getCitasPorPeriodo(
        fecha_inicio, 
        fecha_fin, 
        agrupacion || 'dia'
      );
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por período:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }

  /**
   * Obtiene estadísticas de citas por especialidad
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getCitasPorEspecialidad(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      const estadisticas = await Reporte.getCitasPorEspecialidad(fecha_inicio, fecha_fin);
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por especialidad:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }

  /**
   * Obtiene estadísticas de citas por profesional
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getCitasPorProfesional(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      const estadisticas = await Reporte.getCitasPorProfesional(fecha_inicio, fecha_fin);
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por profesional:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }

  /**
   * Obtiene estadísticas de citas por paciente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getCitasPorPaciente(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      const estadisticas = await Reporte.getCitasPorPaciente(fecha_inicio, fecha_fin);
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por paciente:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }

  /**
   * Obtiene estadísticas de horarios disponibles
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getEstadisticasHorarios(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      const estadisticas = await Reporte.getEstadisticasHorarios(fecha_inicio, fecha_fin);
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de horarios:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }

  /**
   * Obtiene estadísticas de diagnósticos más frecuentes
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getDiagnosticosFrecuentes(req, res) {
    try {
      const { fecha_inicio, fecha_fin, limit } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      const estadisticas = await Reporte.getDiagnosticosFrecuentes(
        fecha_inicio, 
        fecha_fin, 
        limit ? parseInt(limit) : 10
      );
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de diagnósticos frecuentes:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }

  /**
   * Obtiene estadísticas generales del sistema
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getEstadisticasGenerales(req, res) {
    try {
      const estadisticas = await Reporte.getEstadisticasGenerales();
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }

  /**
   * Obtiene dashboard con estadísticas principales
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getDashboard(req, res) {
    try {
      // Determinar fechas para el último mes
      const fechaFin = new Date().toISOString().split('T')[0];
      const fechaInicio = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
      
      // Obtener datos para el dashboard en paralelo
      const [
        estadisticasGenerales,
        citasPorPeriodo,
        citasPorEspecialidad,
        estadisticasHorarios,
        diagnosticosFrecuentes
      ] = await Promise.all([
        Reporte.getEstadisticasGenerales(),
        Reporte.getCitasPorPeriodo(fechaInicio, fechaFin, 'semana'),
        Reporte.getCitasPorEspecialidad(fechaInicio, fechaFin),
        Reporte.getEstadisticasHorarios(fechaInicio, fechaFin),
        Reporte.getDiagnosticosFrecuentes(fechaInicio, fechaFin, 5)
      ]);
      
      res.json({
        error: false,
        data: {
          periodo: {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
          },
          estadisticas_generales: estadisticasGenerales,
          citas_por_periodo: citasPorPeriodo,
          citas_por_especialidad: citasPorEspecialidad,
          estadisticas_horarios: estadisticasHorarios,
          diagnosticos_frecuentes: diagnosticosFrecuentes
        }
      });
    } catch (error) {
      console.error('Error al obtener dashboard:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el dashboard'
      });
    }
  }
}

module.exports = ReporteController; 