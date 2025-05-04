import db from "../database/database.js";

/**
 * Clase que representa el modelo de Reporte
 */
class Reporte {
  /**
   * Obtiene estadísticas generales del sistema
   * @returns {Promise<Object|null>} - Estadísticas generales
   */
  static async getEstadisticasGenerales() {
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
          (SELECT COUNT(*) FROM usuarios WHERE rol = 'medico') AS total_medicos,
          (SELECT COUNT(*) FROM especialidades) AS total_especialidades,
          (SELECT COUNT(*) FROM consultorios) AS total_consultorios,
          (SELECT COUNT(*) FROM servicios) AS total_servicios,
          (SELECT COUNT(*) FROM horarios) AS total_horarios,
          (SELECT COUNT(*) FROM citas) AS total_citas,
          (SELECT COUNT(*) FROM diagnosticos) AS total_diagnosticos
      `;
      
      const result = await db.query(query);
      return result.rowCount > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de citas por período (día, semana, mes, año)
   * @param {String} fechaInicio - Fecha de inicio en formato YYYY-MM-DD
   * @param {String} fechaFin - Fecha de fin en formato YYYY-MM-DD
   * @param {String} agrupacion - Tipo de agrupación (dia, semana, mes, anio)
   * @returns {Promise<Array>} - Lista de estadísticas por período
   */
  static async getCitasPorPeriodo(fechaInicio, fechaFin, agrupacion = 'dia') {
    try {
      let periodoSQL;
      
      // Definir la función de extracción de período según la agrupación
      switch (agrupacion.toLowerCase()) {
        case 'semana':
          periodoSQL = "TO_CHAR(fecha, 'IYYY-IW')"; // Año-Semana ISO
          break;
        case 'mes':
          periodoSQL = "TO_CHAR(fecha, 'YYYY-MM')"; // Año-Mes
          break;
        case 'anio':
          periodoSQL = "TO_CHAR(fecha, 'YYYY')"; // Año
          break;
        case 'dia':
        default:
          periodoSQL = "TO_CHAR(fecha, 'YYYY-MM-DD')"; // Año-Mes-Día
          break;
      }
      
      const query = `
        SELECT 
          ${periodoSQL} AS periodo,
          COUNT(*) AS total_citas,
          COUNT(CASE WHEN estado = 'agendada' THEN 1 END) AS agendadas,
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) AS completadas,
          COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) AS canceladas
        FROM citas
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY periodo
        ORDER BY periodo
      `;
      
      const result = await db.query(query, [fechaInicio, fechaFin]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por período:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de citas por especialidad
   * @param {String} fechaInicio - Fecha de inicio en formato YYYY-MM-DD
   * @param {String} fechaFin - Fecha de fin en formato YYYY-MM-DD
   * @returns {Promise<Array>} - Lista de estadísticas por especialidad
   */
  static async getCitasPorEspecialidad(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          e.id AS especialidad_id,
          e.nombre AS especialidad,
          COUNT(c.id) AS total_citas
        FROM citas c
        JOIN horarios h ON c.horario_id = h.id
        JOIN usuarios u ON h.profesional_id = u.id
        JOIN especialidades e ON u.especialidad_id = e.id
        WHERE c.fecha BETWEEN $1 AND $2
        GROUP BY e.id, e.nombre
        ORDER BY total_citas DESC
      `;
      
      const result = await db.query(query, [fechaInicio, fechaFin]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por especialidad:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de horarios disponibles, reservados y completados
   * @param {String} fechaInicio - Fecha de inicio en formato YYYY-MM-DD
   * @param {String} fechaFin - Fecha de fin en formato YYYY-MM-DD
   * @returns {Promise<Object>} - Estadísticas de horarios
   */
  static async getEstadisticasHorarios(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          COUNT(*) AS total_horarios,
          COUNT(CASE WHEN h.estado = 'disponible' THEN 1 END) AS disponibles,
          COUNT(CASE WHEN h.estado = 'reservado' THEN 1 END) AS reservados,
          COUNT(CASE WHEN h.estado = 'completado' THEN 1 END) AS completados
        FROM horarios h
        WHERE h.fecha BETWEEN $1 AND $2
      `;
      
      const result = await db.query(query, [fechaInicio, fechaFin]);
      return result.rowCount > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error al obtener estadísticas de horarios:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene los diagnósticos más frecuentes
   * @param {String} fechaInicio - Fecha de inicio en formato YYYY-MM-DD
   * @param {String} fechaFin - Fecha de fin en formato YYYY-MM-DD
   * @param {Number} limit - Número máximo de resultados
   * @returns {Promise<Array>} - Lista de diagnósticos frecuentes
   */
  static async getDiagnosticosFrecuentes(fechaInicio, fechaFin, limit = 10) {
    try {
      const query = `
        SELECT 
          d.id,
          d.codigo,
          d.nombre,
          d.categoria,
          COUNT(*) AS total
        FROM diagnosticos d
        JOIN citas_diagnosticos cd ON d.id = cd.diagnostico_id
        JOIN citas c ON cd.cita_id = c.id
        WHERE c.fecha BETWEEN $1 AND $2
        GROUP BY d.id, d.codigo, d.nombre, d.categoria
        ORDER BY total DESC
        LIMIT $3
      `;
      
      const result = await db.query(query, [fechaInicio, fechaFin, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener diagnósticos frecuentes:', error);
      throw error;
    }
  }
}

export default Reporte; 