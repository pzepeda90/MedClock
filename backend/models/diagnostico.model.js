import { pool } from '../database/db.js';

/**
 * Clase que representa el modelo de Diagnóstico
 */
class Diagnostico {
  /**
   * Obtiene todos los diagnósticos con filtros opcionales
   * @param {Object} filtros - Filtros para la consulta (código, nombre, categoría)
   * @returns {Promise<Array>} - Lista de diagnósticos
   */
  static async getAll(filtros = {}) {
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
      
      const params = [];
      
      if (filtros.codigo) {
        params.push(`%${filtros.codigo}%`);
        query += ` AND d.codigo LIKE $${params.length}`;
      }
      
      if (filtros.nombre) {
        params.push(`%${filtros.nombre}%`);
        query += ` AND d.nombre LIKE $${params.length}`;
      }
      
      if (filtros.categoria) {
        params.push(`%${filtros.categoria}%`);
        query += ` AND d.categoria LIKE $${params.length}`;
      }
      
      query += ` ORDER BY d.codigo`;
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener diagnósticos:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un diagnóstico por su ID
   * @param {Number} id - ID del diagnóstico a buscar
   * @returns {Promise<Object|null>} - Diagnóstico encontrado o null
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
      return result.rowCount > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener diagnóstico con ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene un diagnóstico por su código
   * @param {String} codigo - Código del diagnóstico a buscar
   * @returns {Promise<Object|null>} - Diagnóstico encontrado o null
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
      return result.rowCount > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener diagnóstico con código ${codigo}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo diagnóstico
   * @param {Object} data - Datos del diagnóstico
   * @returns {Promise<Object>} - Diagnóstico creado
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
        ) VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      
      const values = [
        data.codigo,
        data.nombre,
        data.descripcion || null,
        data.categoria
      ];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      return this.getById(result.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear diagnóstico:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Asocia un diagnóstico a una cita
   * @param {Number} citaId - ID de la cita
   * @param {Number} diagnosticoId - ID del diagnóstico
   * @param {String} notas - Notas asociadas al diagnóstico
   * @returns {Promise<Object>} - Relación creada
   */
  static async asociarACita(citaId, diagnosticoId, notas = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO citas_diagnosticos (
          cita_id, 
          diagnostico_id, 
          notas
        ) VALUES ($1, $2, $3)
        RETURNING id, cita_id, diagnostico_id, notas, fecha_creacion
      `;
      
      const values = [citaId, diagnosticoId, notas];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al asociar diagnóstico a cita:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Obtiene los diagnósticos asociados a una cita
   * @param {Number} citaId - ID de la cita
   * @returns {Promise<Array>} - Lista de diagnósticos de la cita
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
        ORDER BY cd.fecha_creacion DESC
      `;
      
      const result = await pool.query(query, [citaId]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener diagnósticos para la cita ${citaId}:`, error);
      throw error;
    }
  }
}

export default Diagnostico; 