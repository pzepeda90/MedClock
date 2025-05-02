const { pool } = require('../config/database');

/**
 * Modelo para la gestión de consultorios
 */
class Consultorio {
  /**
   * Obtiene todos los consultorios
   * @returns {Promise<Array>} Lista de consultorios
   */
  static async getAll() {
    try {
      const query = 'SELECT id, nombre, direccion, telefono, email, estado FROM consultorios ORDER BY nombre';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener consultorios:', error);
      throw error;
    }
  }

  /**
   * Busca un consultorio por su ID
   * @param {number} id - ID del consultorio
   * @returns {Promise<Object|null>} Consultorio encontrado o null
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          id, 
          nombre, 
          direccion, 
          telefono, 
          email, 
          coordenadas,
          horario_atencion,
          estado,
          fecha_creacion
        FROM consultorios 
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener consultorio con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo consultorio
   * @param {Object} data - Datos del consultorio
   * @returns {Promise<Object>} Consultorio creado
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO consultorios (
          nombre, 
          direccion, 
          telefono, 
          email, 
          coordenadas,
          horario_atencion,
          estado
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id, 
          nombre, 
          direccion, 
          telefono, 
          email, 
          coordenadas,
          horario_atencion,
          estado,
          fecha_creacion
      `;
      
      const values = [
        data.nombre,
        data.direccion,
        data.telefono || null,
        data.email || null,
        data.coordenadas || null,
        data.horario_atencion || null,
        data.estado || 'activo'
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear consultorio:', error);
      throw error;
    }
  }

  /**
   * Actualiza un consultorio existente
   * @param {number} id - ID del consultorio
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object|null>} Consultorio actualizado o null
   */
  static async update(id, data) {
    try {
      // Obtener el consultorio actual para combinar los datos
      const currentConsultorio = await Consultorio.getById(id);
      
      if (!currentConsultorio) {
        return null;
      }
      
      const query = `
        UPDATE consultorios
        SET 
          nombre = $1, 
          direccion = $2, 
          telefono = $3, 
          email = $4, 
          coordenadas = $5,
          horario_atencion = $6,
          estado = $7
        WHERE id = $8
        RETURNING 
          id, 
          nombre, 
          direccion, 
          telefono, 
          email, 
          coordenadas,
          horario_atencion,
          estado,
          fecha_creacion
      `;
      
      const values = [
        data.nombre || currentConsultorio.nombre,
        data.direccion || currentConsultorio.direccion,
        data.telefono !== undefined ? data.telefono : currentConsultorio.telefono,
        data.email !== undefined ? data.email : currentConsultorio.email,
        data.coordenadas !== undefined ? data.coordenadas : currentConsultorio.coordenadas,
        data.horario_atencion !== undefined ? data.horario_atencion : currentConsultorio.horario_atencion,
        data.estado || currentConsultorio.estado,
        id
      ];
      
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al actualizar consultorio con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un consultorio por su ID
   * @param {number} id - ID del consultorio
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar si hay horarios disponibles asociados a este consultorio
      const checkHorariosQuery = 'SELECT COUNT(*) FROM horarios_disponibles WHERE consultorio_id = $1';
      const checkHorariosResult = await client.query(checkHorariosQuery, [id]);
      
      if (parseInt(checkHorariosResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el consultorio porque tiene horarios disponibles asociados');
      }
      
      // Verificar si hay horas agendadas en este consultorio
      const checkHorasQuery = 'SELECT COUNT(*) FROM horas_agendadas WHERE consultorio_id = $1';
      const checkHorasResult = await client.query(checkHorasQuery, [id]);
      
      if (parseInt(checkHorasResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el consultorio porque tiene citas médicas agendadas');
      }
      
      const query = 'DELETE FROM consultorios WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      
      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al eliminar consultorio con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Busca consultorios por nombre o dirección
   * @param {string} searchTerm - Texto a buscar
   * @returns {Promise<Array>} Lista de consultorios que coinciden
   */
  static async search(searchTerm) {
    try {
      const query = `
        SELECT 
          id, 
          nombre, 
          direccion, 
          telefono, 
          email, 
          estado
        FROM consultorios
        WHERE nombre ILIKE $1 OR direccion ILIKE $1
        ORDER BY nombre
        LIMIT 50
      `;
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      console.error(`Error al buscar consultorios con término "${searchTerm}":`, error);
      throw error;
    }
  }

  /**
   * Obtiene los profesionales asociados a un consultorio (que tienen horarios en él)
   * @param {number} id - ID del consultorio
   * @returns {Promise<Array>} Lista de profesionales
   */
  static async getProfesionales(id) {
    try {
      const query = `
        SELECT DISTINCT
          ps.id_usuario,
          u.nombre,
          u.rol,
          ps.especialidad_id,
          e.nombre as especialidad
        FROM horarios_disponibles hd
        JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE hd.consultorio_id = $1 AND u.estado = 'activo'
        ORDER BY u.nombre
      `;
      const result = await pool.query(query, [id]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener profesionales del consultorio ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene los horarios disponibles en un consultorio
   * @param {number} id - ID del consultorio
   * @returns {Promise<Array>} Lista de horarios disponibles
   */
  static async getHorariosDisponibles(id) {
    try {
      const query = `
        SELECT 
          hd.id,
          hd.fecha,
          hd.hora_inicio,
          hd.hora_fin,
          hd.id_profesional,
          u.nombre as nombre_profesional,
          u.rol,
          ps.especialidad_id,
          e.nombre as especialidad,
          hd.estado
        FROM horarios_disponibles hd
        JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE hd.consultorio_id = $1 AND hd.estado = 'disponible'
        ORDER BY hd.fecha, hd.hora_inicio
      `;
      const result = await pool.query(query, [id]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener horarios disponibles del consultorio ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Consultorio; 