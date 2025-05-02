import { pool } from '../database/db.js';

/**
 * Clase que representa el modelo de Cita
 */
class Cita {
  /**
   * Obtiene todas las citas
   * @param {Object} filtros - Filtros opcionales (fecha, estado, etc.)
   * @returns {Promise<Array>} - Lista de citas
   */
  static async getCitas(filtros = {}) {
    try {
      let query = `
        SELECT 
          c.id,
          c.horario_id,
          c.paciente_id,
          c.servicio_id,
          c.estado,
          c.fecha_agendamiento,
          h.fecha,
          h.hora_inicio,
          h.hora_fin,
          u.nombre as nombre_profesional,
          p.nombre as nombre_paciente,
          p.apellido as apellido_paciente,
          s.nombre as servicio
        FROM citas c
        JOIN horarios h ON c.horario_id = h.id
        JOIN usuarios u ON h.profesional_id = u.id
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN servicios s ON c.servicio_id = s.id
        WHERE 1 = 1
      `;
      
      const values = [];
      let paramIndex = 1;
      
      // Aplicar filtros si existen
      if (filtros.fecha) {
        query += ` AND h.fecha = $${paramIndex}`;
        values.push(filtros.fecha);
        paramIndex++;
      }
      
      if (filtros.estado) {
        query += ` AND c.estado = $${paramIndex}`;
        values.push(filtros.estado);
        paramIndex++;
      }
      
      if (filtros.paciente_id) {
        query += ` AND c.paciente_id = $${paramIndex}`;
        values.push(filtros.paciente_id);
        paramIndex++;
      }
      
      if (filtros.profesional_id) {
        query += ` AND h.profesional_id = $${paramIndex}`;
        values.push(filtros.profesional_id);
        paramIndex++;
      }
      
      query += ` ORDER BY h.fecha DESC, h.hora_inicio`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una cita por su ID
   * @param {Number} id - ID de la cita a buscar
   * @returns {Promise<Object|null>} - Cita encontrada o null
   */
  static async getCitaById(id) {
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
          u.id as id_profesional,
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
          co.nombre as consultorio,
          co.direccion as direccion_consultorio
        FROM citas c
        JOIN horarios h ON c.horario_id = h.id
        JOIN usuarios u ON h.profesional_id = u.id
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN servicios s ON c.servicio_id = s.id
        JOIN especialidades e ON u.especialidad_id = e.id
        JOIN consultorios co ON h.consultorio_id = co.id
        WHERE c.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      return result.rowCount > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener cita con ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva cita
   * @param {Object} datosCita - Datos de la cita a crear
   * @returns {Promise<Object>} - Cita creada
   */
  static async createCita(datosCita) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Primero actualizamos el estado del horario a reservado
      const updateHorarioQuery = `
        UPDATE horarios 
        SET estado = 'reservado' 
        WHERE id = $1
        RETURNING *
      `;
      
      await client.query(updateHorarioQuery, [datosCita.horario_id]);
      
      // Luego creamos la cita
      const insertQuery = `
        INSERT INTO citas (
          horario_id, 
          paciente_id, 
          servicio_id, 
          estado, 
          observaciones, 
          fecha_agendamiento,
          motivo_consulta
        ) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
        RETURNING id
      `;
      
      const values = [
        datosCita.horario_id,
        datosCita.paciente_id,
        datosCita.servicio_id,
        datosCita.estado || 'agendada',
        datosCita.observaciones || '',
        datosCita.motivo_consulta || ''
      ];
      
      const result = await client.query(insertQuery, values);
      const citaId = result.rows[0].id;
      
      // Obtenemos la cita completa
      const citaCreada = await this.getCitaById(citaId);
      
      await client.query('COMMIT');
      return citaCreada;
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
   * @param {Number} id - ID de la cita a actualizar
   * @param {Object} datosCita - Datos a actualizar
   * @returns {Promise<Object|null>} - Cita actualizada o null
   */
  static async updateCita(id, datosCita) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Preparar la actualización
      let updateQuery = 'UPDATE citas SET ';
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      // Agregar campos a actualizar
      for (const [campo, valor] of Object.entries(datosCita)) {
        if (campo !== 'id') { // Evitar actualizar el ID
          updates.push(`${campo} = $${paramIndex}`);
          values.push(valor);
          paramIndex++;
        }
      }
      
      // Si no hay campos para actualizar
      if (updates.length === 0) {
        await client.query('ROLLBACK');
        return await this.getCitaById(id);
      }
      
      // Completar la consulta
      updateQuery += updates.join(', ');
      updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
      values.push(id);
      
      // Ejecutar la actualización
      const result = await client.query(updateQuery, values);
      
      // Si la cita no existe
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      // Si cambió el estado a "completada", actualizar el horario
      if (datosCita.estado === 'completada') {
        const updateHorarioQuery = `
          UPDATE horarios 
          SET estado = 'completado' 
          WHERE id = (SELECT horario_id FROM citas WHERE id = $1)
        `;
        await client.query(updateHorarioQuery, [id]);
      }
      
      // Si cambió el estado a "cancelada", liberar el horario
      if (datosCita.estado === 'cancelada') {
        const updateHorarioQuery = `
          UPDATE horarios 
          SET estado = 'disponible' 
          WHERE id = (SELECT horario_id FROM citas WHERE id = $1)
        `;
        await client.query(updateHorarioQuery, [id]);
      }
      
      await client.query('COMMIT');
      return await this.getCitaById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al actualizar cita con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Elimina una cita
   * @param {Number} id - ID de la cita a eliminar
   * @returns {Promise<Object|null>} - Cita eliminada o null
   */
  static async deleteCita(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Primero verificamos que la cita exista
      const verificarQuery = 'SELECT horario_id FROM citas WHERE id = $1';
      const verificarResult = await client.query(verificarQuery, [id]);
      
      if (verificarResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      const horarioId = verificarResult.rows[0].horario_id;
      
      // Obtenemos la cita antes de eliminarla
      const citaAEliminar = await this.getCitaById(id);
      
      // Eliminamos la cita
      const deleteQuery = 'DELETE FROM citas WHERE id = $1 RETURNING *';
      await client.query(deleteQuery, [id]);
      
      // Actualizamos el estado del horario a disponible
      const updateHorarioQuery = `
        UPDATE horarios 
        SET estado = 'disponible' 
        WHERE id = $1
      `;
      await client.query(updateHorarioQuery, [horarioId]);
      
      await client.query('COMMIT');
      return citaAEliminar;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al eliminar cita con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Cita; 