import Reporte from '../models/reporte.model.js';

/**
 * Controlador para generar reportes y estadísticas
 */
class ReporteController {
  /**
   * Obtiene un dashboard con indicadores principales
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getDashboard(req, res) {
    try {
      // Calcular fechas si no vienen en la solicitud
      const fechaActual = new Date();
      const fechaFin = req.query.fecha_fin || fechaActual.toISOString().split('T')[0];
      
      // Por defecto, mostrar datos del último mes
      const fechaInicio = req.query.fecha_inicio || 
        new Date(new Date(fechaActual).setMonth(fechaActual.getMonth() - 1)).toISOString().split('T')[0];
      
      // Ejecutar consultas en paralelo para optimizar tiempo
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
      console.error('Error en ReporteController.getDashboard:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el dashboard'
      });
    }
  }
  
  /**
   * Obtiene estadísticas generales del sistema
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getEstadisticasGenerales(req, res) {
    try {
      const estadisticas = await Reporte.getEstadisticasGenerales();
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error en ReporteController.getEstadisticasGenerales:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }
  
  /**
   * Obtiene estadísticas de citas por período
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getCitasPorPeriodo(req, res) {
    try {
      const { fecha_inicio, fecha_fin, agrupacion } = req.query;
      
      // Validación de fechas
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
      console.error('Error en ReporteController.getCitasPorPeriodo:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }
  
  /**
   * Obtiene estadísticas de diagnósticos más frecuentes
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getDiagnosticosFrecuentes(req, res) {
    try {
      const { fecha_inicio, fecha_fin, limit } = req.query;
      
      // Calcular fechas si no vienen en la solicitud
      const fechaActual = new Date();
      const fechaFinReal = fecha_fin || fechaActual.toISOString().split('T')[0];
      
      // Por defecto, mostrar datos del último mes
      const fechaInicioReal = fecha_inicio || 
        new Date(new Date(fechaActual).setMonth(fechaActual.getMonth() - 1)).toISOString().split('T')[0];
      
      const estadisticas = await Reporte.getDiagnosticosFrecuentes(
        fechaInicioReal, 
        fechaFinReal, 
        parseInt(limit) || 10
      );
      
      res.json({
        error: false,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error en ReporteController.getDiagnosticosFrecuentes:', error);
      res.status(500).json({
        error: true,
        message: 'Error al generar el reporte'
      });
    }
  }
}

export default ReporteController; 