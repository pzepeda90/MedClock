const { pool } = require('../config/database');

/**
 * Modelo para gestión de servicios/procedimientos médicos
 */
class Servicio {
  /**
   * Obtiene todos los servicios
   * @param {Object} filters - Filtros opcionales (especialidad_id)
   * @returns {Promise<Array>} Lista de servicios
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          s.id,
          s.nombre,
          s.descripcion,
          s.duracion_minutos,
          s.precio,
          s.especialidad_id,
          s.estado,
          s.requiere_autorizacion,
          e.nombre as especialidad
        FROM servicios_procedimientos s
        LEFT JOIN especialidades_medicas e ON s.especialidad_id = e.id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCounter = 1;
      
      // Aplicar filtros si se proporcionaron
      if (filters.especialidad_id) {
        query += ` AND s.especialidad_id = $${paramCounter}`;
        values.push(filters.especialidad_id);
        paramCounter++;
      }
      
      if (filters.estado) {
        query += ` AND s.estado = $${paramCounter}`;
        values.push(filters.estado);
        paramCounter++;
      }
      
      // Ordenar por nombre
      query += ` ORDER BY s.nombre`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener servicios médicos:', error);
      throw error;
    }
  }

  /**
   * Busca un servicio por su ID
   * @param {number} id - ID del servicio
   * @returns {Promise<Object|null>} Servicio encontrado o null
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          s.id,
          s.nombre,
          s.descripcion,
          s.duracion_minutos,
          s.precio,
          s.especialidad_id,
          s.estado,
          s.requiere_autorizacion,
          e.nombre as especialidad
        FROM servicios_procedimientos s
        LEFT JOIN especialidades_medicas e ON s.especialidad_id = e.id
        WHERE s.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo servicio
   * @param {Object} data - Datos del servicio
   * @returns {Promise<Object>} Servicio creado
   */
  static async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO servicios_procedimientos (
          nombre,
          descripcion,
          duracion_minutos,
          precio,
          especialidad_id,
          estado,
          requiere_autorizacion
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const values = [
        data.nombre,
        data.descripcion,
        data.duracion_minutos,
        data.precio,
        data.especialidad_id,
        data.estado || 'activo',
        data.requiere_autorizacion || false
      ];
      
      const result = await client.query(query, values);
      const servicio = result.rows[0];
      
      await client.query('COMMIT');
      
      // Obtener información completa del servicio
      return await Servicio.getById(servicio.id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear servicio médico:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza un servicio existente
   * @param {number} id - ID del servicio
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object|null>} Servicio actualizado o null
   */
  static async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que el servicio exista
      const servicio = await Servicio.getById(id);
      if (!servicio) {
        return null;
      }
      
      // Construir la consulta dinámicamente para actualizar solo los campos proporcionados
      let query = 'UPDATE servicios_procedimientos SET ';
      const values = [];
      let paramCounter = 1;
      
      for (const [key, value] of Object.entries(data)) {
        // Solo incluir campos válidos de la tabla servicios_procedimientos
        if (['nombre', 'descripcion', 'duracion_minutos', 'precio', 'especialidad_id', 'estado', 'requiere_autorizacion'].includes(key)) {
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
      
      // Obtener información completa del servicio actualizado
      return await Servicio.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al actualizar servicio con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Elimina un servicio por su ID
   * @param {number} id - ID del servicio
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que no haya horas agendadas con este servicio
      const checkHorasQuery = `
        SELECT COUNT(*) FROM horas_agendadas
        WHERE servicio_id = $1
      `;
      
      const checkHorasResult = await client.query(checkHorasQuery, [id]);
      
      if (parseInt(checkHorasResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el servicio porque ya está asociado a citas agendadas');
      }
      
      const query = 'DELETE FROM servicios_procedimientos WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      
      await client.query('COMMIT');
      
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al eliminar servicio con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Busca servicios por especialidad
   * @param {number} especialidad_id - ID de la especialidad
   * @returns {Promise<Array>} Lista de servicios
   */
  static async getByEspecialidad(especialidad_id) {
    try {
      const query = `
        SELECT 
          s.id,
          s.nombre,
          s.descripcion,
          s.duracion_minutos,
          s.precio,
          s.especialidad_id,
          s.estado,
          s.requiere_autorizacion,
          e.nombre as especialidad
        FROM servicios_procedimientos s
        LEFT JOIN especialidades_medicas e ON s.especialidad_id = e.id
        WHERE s.especialidad_id = $1 AND s.estado = 'activo'
        ORDER BY s.nombre
      `;
      const result = await pool.query(query, [especialidad_id]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener servicios para especialidad ${especialidad_id}:`, error);
      throw error;
    }
  }
}

module.exports = Servicio; 