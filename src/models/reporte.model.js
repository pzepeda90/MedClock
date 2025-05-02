const { pool } = require('../config/database');

/**
 * Modelo para generación de reportes estadísticos
 */
class Reporte {
  /**
   * Obtiene estadísticas de citas por período
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @param {string} agrupacion - Tipo de agrupación: 'dia', 'semana', 'mes'
   * @returns {Promise<Array>} Estadísticas de citas
   */
  static async getCitasPorPeriodo(fechaInicio, fechaFin, agrupacion = 'dia') {
    try {
      let intervalo;
      switch (agrupacion.toLowerCase()) {
        case 'semana':
          intervalo = "to_char(h.fecha, 'IYYY-IW')";
          break;
        case 'mes':
          intervalo = "to_char(h.fecha, 'YYYY-MM')";
          break;
        case 'dia':
        default:
          intervalo = "to_char(h.fecha, 'YYYY-MM-DD')";
          break;
      }

      const query = `
        SELECT 
          ${intervalo} as periodo,
          COUNT(*) as total_citas,
          SUM(CASE WHEN c.estado = 'agendada' THEN 1 ELSE 0 END) as agendadas,
          SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
        FROM horas_agendadas c
        JOIN horarios_disponibles h ON c.horario_id = h.id
        WHERE h.fecha BETWEEN $1 AND $2
        GROUP BY periodo
        ORDER BY periodo
      `;

      const result = await pool.query(query, [fechaInicio, fechaFin]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por período:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de citas por especialidad
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Estadísticas de citas por especialidad
   */
  static async getCitasPorEspecialidad(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          e.id as especialidad_id,
          e.nombre as especialidad,
          COUNT(*) as total_citas,
          SUM(CASE WHEN c.estado = 'agendada' THEN 1 ELSE 0 END) as agendadas,
          SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          ROUND(SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_asistencia,
          ROUND(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_cancelacion
        FROM horas_agendadas c
        JOIN horarios_disponibles h ON c.horario_id = h.id
        JOIN profesionales_salud ps ON h.id_profesional = ps.id_usuario
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE h.fecha BETWEEN $1 AND $2
        GROUP BY e.id, e.nombre
        ORDER BY total_citas DESC
      `;

      const result = await pool.query(query, [fechaInicio, fechaFin]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por especialidad:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de citas por profesional
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Estadísticas de citas por profesional
   */
  static async getCitasPorProfesional(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          ps.id_usuario as profesional_id,
          u.nombre as nombre_profesional,
          e.nombre as especialidad,
          COUNT(*) as total_citas,
          SUM(CASE WHEN c.estado = 'agendada' THEN 1 ELSE 0 END) as agendadas,
          SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          ROUND(SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_asistencia,
          ROUND(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_cancelacion
        FROM horas_agendadas c
        JOIN horarios_disponibles h ON c.horario_id = h.id
        JOIN profesionales_salud ps ON h.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE h.fecha BETWEEN $1 AND $2
        GROUP BY ps.id_usuario, u.nombre, e.nombre
        ORDER BY total_citas DESC
      `;

      const result = await pool.query(query, [fechaInicio, fechaFin]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por profesional:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de citas por paciente
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Estadísticas de citas por paciente
   */
  static async getCitasPorPaciente(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          p.id as paciente_id,
          p.nombre || ' ' || p.apellido as nombre_paciente,
          p.rut,
          COUNT(*) as total_citas,
          SUM(CASE WHEN c.estado = 'agendada' THEN 1 ELSE 0 END) as agendadas,
          SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          ROUND(SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_asistencia,
          ROUND(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_cancelacion
        FROM horas_agendadas c
        JOIN horarios_disponibles h ON c.horario_id = h.id
        JOIN pacientes p ON c.paciente_id = p.id
        WHERE h.fecha BETWEEN $1 AND $2
        GROUP BY p.id, p.nombre, p.apellido, p.rut
        ORDER BY total_citas DESC
      `;

      const result = await pool.query(query, [fechaInicio, fechaFin]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de citas por paciente:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de horarios disponibles
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Estadísticas de horarios
   */
  static async getEstadisticasHorarios(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_horarios,
          SUM(CASE WHEN h.estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
          SUM(CASE WHEN h.estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
          SUM(CASE WHEN h.estado = 'completado' THEN 1 ELSE 0 END) as completados,
          ROUND(SUM(CASE WHEN h.estado = 'disponible' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_disponibles,
          ROUND(SUM(CASE WHEN h.estado = 'reservado' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_reservados,
          ROUND(SUM(CASE WHEN h.estado = 'completado' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_completados
        FROM horarios_disponibles h
        WHERE h.fecha BETWEEN $1 AND $2
      `;

      const result = await pool.query(query, [fechaInicio, fechaFin]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error al obtener estadísticas de horarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de diagnósticos más frecuentes
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Estadísticas de diagnósticos
   */
  static async getDiagnosticosFrecuentes(fechaInicio, fechaFin, limit = 10) {
    try {
      const query = `
        SELECT 
          d.id,
          d.codigo,
          d.nombre,
          d.categoria,
          COUNT(*) as total
        FROM citas_diagnosticos cd
        JOIN diagnosticos d ON cd.diagnostico_id = d.id
        JOIN horas_agendadas c ON cd.cita_id = c.id
        JOIN horarios_disponibles h ON c.horario_id = h.id
        WHERE h.fecha BETWEEN $1 AND $2
        GROUP BY d.id, d.codigo, d.nombre, d.categoria
        ORDER BY total DESC
        LIMIT $3
      `;

      const result = await pool.query(query, [fechaInicio, fechaFin, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de diagnósticos frecuentes:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales del sistema
   * @returns {Promise<Object>} Estadísticas generales
   */
  static async getEstadisticasGenerales() {
    try {
      const query = `
        SELECT
          (SELECT COUNT(*) FROM pacientes) as total_pacientes,
          (SELECT COUNT(*) FROM usuarios WHERE rol = 'médico') as total_medicos,
          (SELECT COUNT(*) FROM especialidades_medicas) as total_especialidades,
          (SELECT COUNT(*) FROM consultorios) as total_consultorios,
          (SELECT COUNT(*) FROM servicios_procedimientos) as total_servicios,
          (SELECT COUNT(*) FROM horarios_disponibles) as total_horarios,
          (SELECT COUNT(*) FROM horas_agendadas) as total_citas,
          (SELECT COUNT(*) FROM diagnosticos) as total_diagnosticos
      `;

      const result = await pool.query(query);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw error;
    }
  }
}

module.exports = Reporte; 