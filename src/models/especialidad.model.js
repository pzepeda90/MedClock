const { pool } = require('../config/database');

/**
 * Modelo para la gestión de especialidades médicas
 */
class Especialidad {
  /**
   * Obtiene todas las especialidades
   * @returns {Promise<Array>} Lista de especialidades
   */
  static async getAll() {
    try {
      const query = 'SELECT id, nombre, descripcion FROM especialidades_medicas ORDER BY nombre';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      throw error;
    }
  }

  /**
   * Busca una especialidad por su ID
   * @param {number} id - ID de la especialidad
   * @returns {Promise<Object|null>} Especialidad encontrada o null
   */
  static async getById(id) {
    try {
      const query = 'SELECT id, nombre, descripcion FROM especialidades_medicas WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener especialidad con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva especialidad
   * @param {Object} data - Datos de la especialidad
   * @returns {Promise<Object>} Especialidad creada
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO especialidades_medicas (nombre, descripcion)
        VALUES ($1, $2)
        RETURNING id, nombre, descripcion
      `;
      
      const values = [
        data.nombre,
        data.descripcion || null
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear especialidad:', error);
      throw error;
    }
  }

  /**
   * Actualiza una especialidad existente
   * @param {number} id - ID de la especialidad
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object|null>} Especialidad actualizada o null
   */
  static async update(id, data) {
    try {
      const query = `
        UPDATE especialidades_medicas
        SET nombre = $1, descripcion = $2
        WHERE id = $3
        RETURNING id, nombre, descripcion
      `;
      
      const values = [
        data.nombre,
        data.descripcion || null,
        id
      ];
      
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al actualizar especialidad con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una especialidad por su ID
   * @param {number} id - ID de la especialidad
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id) {
    try {
      // Verificar si hay profesionales asociados a esta especialidad
      const checkQuery = 'SELECT COUNT(*) FROM profesionales_salud WHERE especialidad_id = $1';
      const checkResult = await pool.query(checkQuery, [id]);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar la especialidad porque hay profesionales asociados');
      }
      
      const query = 'DELETE FROM especialidades_medicas WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error al eliminar especialidad con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca especialidades por nombre
   * @param {string} nombre - Texto a buscar en el nombre
   * @returns {Promise<Array>} Lista de especialidades que coinciden
   */
  static async search(nombre) {
    try {
      const query = 'SELECT id, nombre, descripcion FROM especialidades_medicas WHERE nombre ILIKE $1 ORDER BY nombre';
      const result = await pool.query(query, [`%${nombre}%`]);
      return result.rows;
    } catch (error) {
      console.error(`Error al buscar especialidades con nombre "${nombre}":`, error);
      throw error;
    }
  }

  /**
   * Obtiene la cantidad de profesionales por especialidad
   * @param {number} id - ID de la especialidad
   * @returns {Promise<number>} Cantidad de profesionales
   */
  static async getProfesionalesCount(id) {
    try {
      const query = 'SELECT COUNT(*) FROM profesionales_salud WHERE especialidad_id = $1';
      const result = await pool.query(query, [id]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error al obtener cantidad de profesionales para especialidad ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Especialidad; 