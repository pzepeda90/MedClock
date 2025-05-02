const { pool } = require('../config/database');

/**
 * Modelo para gestión de diagnósticos médicos
 */
class Diagnostico {
  /**
   * Obtiene todos los diagnósticos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de diagnósticos
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          d.id,
          d.codigo,
          d.nombre,
          d.descripcion,
          d.categoria
        FROM diagnosticos d
        WHERE 1=1
      `;
      
      const values = [];
      let paramCounter = 1;
      
      // Aplicar filtros si se proporcionaron
      if (filters.codigo) {
        query += ` AND d.codigo LIKE $${paramCounter}`;
        values.push(`%${filters.codigo}%`);
        paramCounter++;
      }
      
      if (filters.nombre) {
        query += ` AND d.nombre ILIKE $${paramCounter}`;
        values.push(`%${filters.nombre}%`);
        paramCounter++;
      }
      
      if (filters.categoria) {
        query += ` AND d.categoria = $${paramCounter}`;
        values.push(filters.categoria);
        paramCounter++;
      }
      
      // Ordenar por código
      query += ` ORDER BY d.codigo`;
      
      // Limitar resultados si se especifica
      if (filters.limit) {
        query += ` LIMIT $${paramCounter}`;
        values.push(filters.limit);
        paramCounter++;
      }
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener diagnósticos:', error);
      throw error;
    }
  }

  /**
   * Busca un diagnóstico por su ID
   * @param {number} id - ID del diagnóstico
   * @returns {Promise<Object|null>} Diagnóstico encontrado o null
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          d.id,
          d.codigo,
          d.nombre,
          d.descripcion,
          d.categoria
        FROM diagnosticos d
        WHERE d.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener diagnóstico con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca un diagnóstico por su código
   * @param {string} codigo - Código del diagnóstico (ej: CIE-10)
   * @returns {Promise<Object|null>} Diagnóstico encontrado o null
   */
  static async getByCodigo(codigo) {
    try {
      const query = `
        SELECT 
          d.id,
          d.codigo,
          d.nombre,
          d.descripcion,
          d.categoria
        FROM diagnosticos d
        WHERE d.codigo = $1
      `;
      const result = await pool.query(query, [codigo]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener diagnóstico con código ${codigo}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo diagnóstico
   * @param {Object} data - Datos del diagnóstico
   * @returns {Promise<Object>} Diagnóstico creado
   */
  static async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO diagnosticos (
          codigo,
          nombre,
          descripcion,
          categoria
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      
      const values = [
        data.codigo,
        data.nombre,
        data.descripcion || null,
        data.categoria || null
      ];
      
      const result = await client.query(query, values);
      const diagnostico = result.rows[0];
      
      await client.query('COMMIT');
      
      // Obtener información completa del diagnóstico
      return await Diagnostico.getById(diagnostico.id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear diagnóstico:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza un diagnóstico existente
   * @param {number} id - ID del diagnóstico
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object|null>} Diagnóstico actualizado o null
   */
  static async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que el diagnóstico exista
      const diagnostico = await Diagnostico.getById(id);
      if (!diagnostico) {
        return null;
      }
      
      // Construir la consulta dinámicamente para actualizar solo los campos proporcionados
      let query = 'UPDATE diagnosticos SET ';
      const values = [];
      let paramCounter = 1;
      
      for (const [key, value] of Object.entries(data)) {
        // Solo incluir campos válidos de la tabla diagnósticos
        if (['codigo', 'nombre', 'descripcion', 'categoria'].includes(key)) {
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
      
      // Obtener información completa del diagnóstico actualizado
      return await Diagnostico.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al actualizar diagnóstico con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Elimina un diagnóstico por su ID
   * @param {number} id - ID del diagnóstico
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar si hay citas asociadas a este diagnóstico
      const checkCitasQuery = `
        SELECT COUNT(*) FROM citas_diagnosticos
        WHERE diagnostico_id = $1
      `;
      
      const checkCitasResult = await client.query(checkCitasQuery, [id]);
      
      if (parseInt(checkCitasResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el diagnóstico porque está asociado a citas');
      }
      
      const query = 'DELETE FROM diagnosticos WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      
      await client.query('COMMIT');
      
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al eliminar diagnóstico con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Busca diagnósticos por término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de diagnósticos
   */
  static async search(searchTerm, limit = 10) {
    try {
      const query = `
        SELECT 
          d.id,
          d.codigo,
          d.nombre,
          d.descripcion,
          d.categoria
        FROM diagnosticos d
        WHERE 
          d.codigo ILIKE $1 OR
          d.nombre ILIKE $1
        ORDER BY d.codigo
        LIMIT $2
      `;
      
      const result = await pool.query(query, [`%${searchTerm}%`, limit]);
      return result.rows;
    } catch (error) {
      console.error(`Error al buscar diagnósticos con término "${searchTerm}":`, error);
      throw error;
    }
  }

  /**
   * Asocia un diagnóstico a una cita
   * @param {number} citaId - ID de la cita
   * @param {number} diagnosticoId - ID del diagnóstico
   * @param {string} notas - Notas adicionales sobre el diagnóstico
   * @returns {Promise<Object>} Relación creada
   */
  static async asociarACita(citaId, diagnosticoId, notas = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO citas_diagnosticos (
          cita_id,
          diagnostico_id,
          notas,
          fecha_creacion
        )
        VALUES ($1, $2, $3, NOW())
        RETURNING id, cita_id, diagnostico_id, notas, fecha_creacion
      `;
      
      const result = await client.query(query, [citaId, diagnosticoId, notas]);
      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al asociar diagnóstico ${diagnosticoId} a cita ${citaId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtiene diagnósticos asociados a una cita
   * @param {number} citaId - ID de la cita
   * @returns {Promise<Array>} Lista de diagnósticos asociados
   */
  static async getDiagnosticosByCita(citaId) {
    try {
      const query = `
        SELECT 
          d.id,
          d.codigo,
          d.nombre,
          d.descripcion,
          d.categoria,
          cd.notas,
          cd.fecha_creacion
        FROM diagnosticos d
        JOIN citas_diagnosticos cd ON d.id = cd.diagnostico_id
        WHERE cd.cita_id = $1
        ORDER BY cd.fecha_creacion
      `;
      
      const result = await pool.query(query, [citaId]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener diagnósticos para la cita ${citaId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina la asociación de un diagnóstico con una cita
   * @param {number} citaId - ID de la cita
   * @param {number} diagnosticoId - ID del diagnóstico
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async desasociarDeCita(citaId, diagnosticoId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        DELETE FROM citas_diagnosticos
        WHERE cita_id = $1 AND diagnostico_id = $2
        RETURNING id
      `;
      
      const result = await client.query(query, [citaId, diagnosticoId]);
      await client.query('COMMIT');
      
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al desasociar diagnóstico ${diagnosticoId} de cita ${citaId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Diagnostico; 