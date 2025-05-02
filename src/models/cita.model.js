const { pool } = require('../config/database');
const Horario = require('./horario.model');
const Paciente = require('./paciente.model');
const Servicio = require('./servicio.model');
const Diagnostico = require('./diagnostico.model');

/**
 * Modelo para gestión de horas agendadas (citas médicas)
 */
class Cita {
  /**
   * Obtiene todas las citas
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de citas
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          c.id,
          c.horario_id,
          c.paciente_id,
          c.servicio_id,
          c.estado,
          c.observaciones,
          c.fecha_agendamiento,
          c.motivo_consulta,
          h.fecha,
          h.hora_inicio,
          h.hora_fin,
          h.id_profesional,
          u.nombre as nombre_profesional,
          u.rol as rol_profesional,
          p.nombre as nombre_paciente,
          p.apellido as apellido_paciente,
          p.rut as rut_paciente,
          p.fecha_nacimiento as fecha_nacimiento_paciente,
          s.nombre as servicio,
          s.duracion_minutos,
          s.precio,
          e.id as especialidad_id,
          e.nombre as especialidad,
          cons.nombre as consultorio,
          cons.direccion as direccion_consultorio
        FROM horas_agendadas c
        JOIN horarios_disponibles h ON c.horario_id = h.id
        JOIN profesionales_salud ps ON h.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN servicios_procedimientos s ON c.servicio_id = s.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        JOIN consultorios cons ON h.consultorio_id = cons.id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCounter = 1;
      
      // Aplicar filtros si se proporcionaron
      if (filters.fecha) {
        query += ` AND h.fecha = $${paramCounter}`;
        values.push(filters.fecha);
        paramCounter++;
      }
      
      if (filters.id_profesional) {
        query += ` AND h.id_profesional = $${paramCounter}`;
        values.push(filters.id_profesional);
        paramCounter++;
      }
      
      if (filters.paciente_id) {
        query += ` AND c.paciente_id = $${paramCounter}`;
        values.push(filters.paciente_id);
        paramCounter++;
      }
      
      if (filters.especialidad_id) {
        query += ` AND e.id = $${paramCounter}`;
        values.push(filters.especialidad_id);
        paramCounter++;
      }
      
      if (filters.estado) {
        query += ` AND c.estado = $${paramCounter}`;
        values.push(filters.estado);
        paramCounter++;
      }
      
      if (filters.rango_fechas) {
        if (filters.fecha_inicio) {
          query += ` AND h.fecha >= $${paramCounter}`;
          values.push(filters.fecha_inicio);
          paramCounter++;
        }
        
        if (filters.fecha_fin) {
          query += ` AND h.fecha <= $${paramCounter}`;
          values.push(filters.fecha_fin);
          paramCounter++;
        }
      }
      
      // Ordenar por fecha y hora
      query += ` ORDER BY h.fecha, h.hora_inicio`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  }

  /**
   * Busca una cita por su ID
   * @param {number} id - ID de la cita
   * @returns {Promise<Object|null>} Cita encontrada o null
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          c.id,
          c.horario_id,
          c.paciente_id,
          c.servicio_id,
          c.estado,
          c.observaciones,
          c.fecha_agendamiento,
          c.motivo_consulta,
          h.fecha,
          h.hora_inicio,
          h.hora_fin,
          h.id_profesional,
          u.nombre as nombre_profesional,
          u.rol as rol_profesional,
          p.nombre as nombre_paciente,
          p.apellido as apellido_paciente,
          p.rut as rut_paciente,
          p.fecha_nacimiento as fecha_nacimiento_paciente,
          s.nombre as servicio,
          s.duracion_minutos,
          s.precio,
          e.id as especialidad_id,
          e.nombre as especialidad,
          cons.nombre as consultorio,
          cons.direccion as direccion_consultorio
        FROM horas_agendadas c
        JOIN horarios_disponibles h ON c.horario_id = h.id
        JOIN profesionales_salud ps ON h.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN servicios_procedimientos s ON c.servicio_id = s.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        JOIN consultorios cons ON h.consultorio_id = cons.id
        WHERE c.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const cita = result.rows[0];
      
      // Obtener diagnósticos asociados a la cita
      try {
        const diagnosticos = await Diagnostico.getDiagnosticosByCita(id);
        cita.diagnosticos = diagnosticos;
      } catch (error) {
        console.error(`Error al obtener diagnósticos para la cita ${id}:`, error);
        cita.diagnosticos = [];
      }
      
      return cita;
    } catch (error) {
      console.error(`Error al obtener cita con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva cita
   * @param {Object} data - Datos de la cita
   * @returns {Promise<Object>} Cita creada
   */
  static async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que el horario exista y esté disponible
      const horario = await Horario.getById(data.horario_id);
      if (!horario) {
        throw new Error('El horario indicado no existe');
      }
      
      if (horario.estado !== 'disponible') {
        throw new Error('El horario seleccionado no está disponible');
      }
      
      // Verificar que el paciente exista
      const paciente = await Paciente.getById(data.paciente_id);
      if (!paciente) {
        throw new Error('El paciente indicado no existe');
      }
      
      // Verificar que el servicio exista
      const servicio = await Servicio.getById(data.servicio_id);
      if (!servicio) {
        throw new Error('El servicio indicado no existe');
      }
      
      // Actualizar el estado del horario a 'reservado'
      await client.query(
        'UPDATE horarios_disponibles SET estado = $1 WHERE id = $2',
        ['reservado', data.horario_id]
      );
      
      // Insertar la hora agendada
      const query = `
        INSERT INTO horas_agendadas (
          horario_id,
          paciente_id,
          servicio_id,
          estado,
          observaciones,
          motivo_consulta,
          fecha_agendamiento
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
      `;
      
      const values = [
        data.horario_id,
        data.paciente_id,
        data.servicio_id,
        data.estado || 'agendada',
        data.observaciones || null,
        data.motivo_consulta || null
      ];
      
      const result = await client.query(query, values);
      const cita = result.rows[0];
      
      await client.query('COMMIT');
      
      // Obtener información completa de la cita
      return await Cita.getById(cita.id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear cita:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza una cita existente
   * @param {number} id - ID de la cita
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object|null>} Cita actualizada o null
   */
  static async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que la cita exista
      const cita = await Cita.getById(id);
      if (!cita) {
        return null;
      }
      
      // Si se cambia el horario, verificar que el nuevo horario exista y esté disponible
      if (data.horario_id && data.horario_id !== cita.horario_id) {
        // Verificar que el nuevo horario exista y esté disponible
        const nuevoHorario = await Horario.getById(data.horario_id);
        if (!nuevoHorario) {
          throw new Error('El nuevo horario indicado no existe');
        }
        
        if (nuevoHorario.estado !== 'disponible') {
          throw new Error('El nuevo horario seleccionado no está disponible');
        }
        
        // Liberar el horario anterior
        await client.query(
          'UPDATE horarios_disponibles SET estado = $1 WHERE id = $2',
          ['disponible', cita.horario_id]
        );
        
        // Reservar el nuevo horario
        await client.query(
          'UPDATE horarios_disponibles SET estado = $1 WHERE id = $2',
          ['reservado', data.horario_id]
        );
      }
      
      // Si se cambia el paciente, verificar que el nuevo paciente exista
      if (data.paciente_id && data.paciente_id !== cita.paciente_id) {
        const paciente = await Paciente.getById(data.paciente_id);
        if (!paciente) {
          throw new Error('El paciente indicado no existe');
        }
      }
      
      // Si se cambia el servicio, verificar que el nuevo servicio exista
      if (data.servicio_id && data.servicio_id !== cita.servicio_id) {
        const servicio = await Servicio.getById(data.servicio_id);
        if (!servicio) {
          throw new Error('El servicio indicado no existe');
        }
      }
      
      // Construir la consulta dinámicamente para actualizar solo los campos proporcionados
      let query = 'UPDATE horas_agendadas SET ';
      const values = [];
      let paramCounter = 1;
      
      for (const [key, value] of Object.entries(data)) {
        // Solo incluir campos válidos de la tabla horas_agendadas
        if (['horario_id', 'paciente_id', 'servicio_id', 'estado', 'observaciones', 'motivo_consulta'].includes(key)) {
          query += `${key} = $${paramCounter}, `;
          values.push(value);
          paramCounter++;
        }
      }
      
      // Eliminar la última coma y espacio
      query = query.slice(0, -2);
      
      // Completar la consulta
      query += ` WHERE id = $${paramCounter} RETURNING id`;
      values.push(id);
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      await client.query('COMMIT');
      
      // Obtener información completa de la cita actualizada
      return await Cita.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al actualizar cita con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancela una cita
   * @param {number} id - ID de la cita
   * @param {string} motivo - Motivo de la cancelación
   * @returns {Promise<Object|null>} Cita cancelada o null
   */
  static async cancelar(id, motivo) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que la cita exista
      const cita = await Cita.getById(id);
      if (!cita) {
        return null;
      }
      
      // Verificar que la cita no esté ya cancelada o completada
      if (['cancelada', 'completada'].includes(cita.estado)) {
        throw new Error(`No se puede cancelar una cita en estado ${cita.estado}`);
      }
      
      // Actualizar el estado de la cita a 'cancelada' y agregar el motivo
      const query = `
        UPDATE horas_agendadas 
        SET estado = $1, observaciones = $2 
        WHERE id = $3 
        RETURNING id
      `;
      
      const result = await client.query(query, ['cancelada', motivo, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Liberar el horario
      await client.query(
        'UPDATE horarios_disponibles SET estado = $1 WHERE id = $2',
        ['disponible', cita.horario_id]
      );
      
      await client.query('COMMIT');
      
      // Obtener información completa de la cita cancelada
      return await Cita.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al cancelar cita con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Marca una cita como completada
   * @param {number} id - ID de la cita
   * @param {string} observaciones - Observaciones o resultados de la consulta
   * @param {Array} diagnosticos - Array de objetos con diagnósticos (opcional)
   * @returns {Promise<Object|null>} Cita completada o null
   */
  static async completar(id, observaciones, diagnosticos = []) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que la cita exista
      const cita = await Cita.getById(id);
      if (!cita) {
        return null;
      }
      
      // Verificar que la cita esté agendada
      if (cita.estado !== 'agendada') {
        throw new Error(`No se puede completar una cita en estado ${cita.estado}`);
      }
      
      // Actualizar el estado de la cita a 'completada' y agregar las observaciones
      const query = `
        UPDATE horas_agendadas 
        SET estado = $1, observaciones = $2 
        WHERE id = $3 
        RETURNING id
      `;
      
      const result = await client.query(query, ['completada', observaciones, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Actualizar el estado del horario a 'completado'
      await client.query(
        'UPDATE horarios_disponibles SET estado = $1 WHERE id = $2',
        ['completado', cita.horario_id]
      );
      
      // Asociar diagnósticos si se proporcionaron
      if (diagnosticos && diagnosticos.length > 0) {
        for (const diag of diagnosticos) {
          await Diagnostico.asociarACita(id, diag.diagnosticoId, diag.notas);
        }
      }
      
      await client.query('COMMIT');
      
      // Obtener información completa de la cita completada
      return await Cita.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al completar cita con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Elimina una cita por su ID
   * @param {number} id - ID de la cita
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que la cita exista
      const cita = await Cita.getById(id);
      if (!cita) {
        return false;
      }
      
      // Verificar si hay diagnósticos asociados
      if (cita.diagnosticos && cita.diagnosticos.length > 0) {
        // Eliminar asociaciones con diagnósticos
        await client.query('DELETE FROM citas_diagnosticos WHERE cita_id = $1', [id]);
      }
      
      // Eliminar la cita
      const query = 'DELETE FROM horas_agendadas WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      
      if (result.rowCount === 0) {
        return false;
      }
      
      // Liberar el horario si la cita no estaba completada
      if (cita.estado !== 'completada') {
        await client.query(
          'UPDATE horarios_disponibles SET estado = $1 WHERE id = $2',
          ['disponible', cita.horario_id]
        );
      }
      
      await client.query('COMMIT');
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al eliminar cita con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtiene citas para un paciente
   * @param {number} paciente_id - ID del paciente
   * @returns {Promise<Array>} Lista de citas del paciente
   */
  static async getByPaciente(paciente_id) {
    try {
      return await Cita.getAll({ paciente_id });
    } catch (error) {
      console.error(`Error al obtener citas para paciente ${paciente_id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene citas para un profesional en un rango de fechas
   * @param {number} id_profesional - ID del profesional
   * @param {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Lista de citas del profesional
   */
  static async getByProfesionalAndDateRange(id_profesional, fecha_inicio, fecha_fin) {
    try {
      return await Cita.getAll({
        id_profesional,
        rango_fechas: true,
        fecha_inicio,
        fecha_fin
      });
    } catch (error) {
      console.error(`Error al obtener citas para profesional ${id_profesional} entre ${fecha_inicio} y ${fecha_fin}:`, error);
      throw error;
    }
  }
}

module.exports = Cita; 