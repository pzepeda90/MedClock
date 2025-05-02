const { pool } = require('../config/database');
const { hashPassword } = require('../utils/auth');

/**
 * Modelo para la gestión de usuarios
 */
class Usuario {
  /**
   * Obtiene todos los usuarios
   * @returns {Promise<Array>} Lista de usuarios
   */
  static async getAll() {
    try {
      const query = 'SELECT id, nombre, email, rol, fecha_creacion, estado FROM usuarios ORDER BY id';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Busca un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  static async getById(id) {
    try {
      const query = 'SELECT id, nombre, email, rol, fecha_creacion, estado FROM usuarios WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca un usuario por su email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  static async getByEmail(email) {
    try {
      const query = 'SELECT id, nombre, email, password_hash, rol, fecha_creacion, estado FROM usuarios WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener usuario con email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  static async create(userData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Generar hash de la contraseña
      const hashedPassword = await hashPassword(userData.password);
      
      // Insertar usuario
      const query = `
        INSERT INTO usuarios (nombre, email, password_hash, rol, estado)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nombre, email, rol, fecha_creacion, estado
      `;
      
      const values = [
        userData.nombre,
        userData.email,
        hashedPassword,
        userData.rol || 'paciente', // Rol por defecto si no se especifica
        userData.estado !== undefined ? userData.estado : true // Activo por defecto
      ];
      
      const result = await client.query(query, values);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear usuario:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza un usuario existente
   * @param {number} id - ID del usuario
   * @param {Object} userData - Datos actualizados
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  static async update(id, userData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Construir la consulta dinámicamente basada en los campos proporcionados
      let query = 'UPDATE usuarios SET ';
      const values = [];
      let paramCounter = 1;
      
      if (userData.nombre) {
        query += `nombre = $${paramCounter}, `;
        values.push(userData.nombre);
        paramCounter++;
      }
      
      if (userData.email) {
        query += `email = $${paramCounter}, `;
        values.push(userData.email);
        paramCounter++;
      }
      
      if (userData.password) {
        const hashedPassword = await hashPassword(userData.password);
        query += `password_hash = $${paramCounter}, `;
        values.push(hashedPassword);
        paramCounter++;
      }
      
      if (userData.rol) {
        query += `rol = $${paramCounter}, `;
        values.push(userData.rol);
        paramCounter++;
      }
      
      if (userData.estado !== undefined) {
        query += `estado = $${paramCounter}, `;
        values.push(userData.estado);
        paramCounter++;
      }
      
      // Eliminar la última coma y espacio
      query = query.slice(0, -2);
      
      // Completar la consulta
      query += ` WHERE id = $${paramCounter} RETURNING id, nombre, email, rol, fecha_creacion, estado`;
      values.push(id);
      
      const result = await client.query(query, values);
      
      await client.query('COMMIT');
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Elimina un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cambia el estado (activo/inactivo) de un usuario
   * @param {number} id - ID del usuario
   * @param {boolean} estado - Nuevo estado
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  static async toggleEstado(id, estado) {
    try {
      const query = 'UPDATE usuarios SET estado = $1 WHERE id = $2 RETURNING id, nombre, email, rol, fecha_creacion, estado';
      const result = await pool.query(query, [estado, id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al cambiar estado de usuario con ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Usuario; 