const { pool } = require('../config/database');
const Usuario = require('./usuario.model');

/**
 * Modelo para la gestión de pacientes
 */
class Paciente {
  /**
   * Obtiene todos los pacientes con información básica
   * @returns {Promise<Array>} Lista de pacientes
   */
  static async getAll() {
    try {
      const query = `
        SELECT 
          p.id_usuario, 
          p.rut, 
          p.telefono, 
          p.direccion, 
          p.fecha_nacimiento, 
          p.sexo,
          p.grupo_sanguineo, 
          u.nombre, 
          u.email, 
          u.estado
        FROM pacientes p
        JOIN usuarios u ON p.id_usuario = u.id
        WHERE u.rol = 'paciente'
        ORDER BY u.nombre
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      throw error;
    }
  }

  /**
   * Busca un paciente por su ID de usuario
   * @param {number} id_usuario - ID del usuario asociado al paciente
   * @returns {Promise<Object|null>} Paciente encontrado o null
   */
  static async getById(id_usuario) {
    try {
      const query = `
        SELECT 
          p.id_usuario, 
          p.rut, 
          p.telefono, 
          p.direccion, 
          p.fecha_nacimiento, 
          p.sexo,
          p.grupo_sanguineo,
          p.alergias,
          p.antecedentes_medicos,
          p.contacto_emergencia_nombre,
          p.contacto_emergencia_telefono,
          u.nombre, 
          u.email, 
          u.estado,
          u.fecha_creacion
        FROM pacientes p
        JOIN usuarios u ON p.id_usuario = u.id
        WHERE p.id_usuario = $1 AND u.rol = 'paciente'
      `;
      const result = await pool.query(query, [id_usuario]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener paciente con ID ${id_usuario}:`, error);
      throw error;
    }
  }

  /**
   * Busca un paciente por su RUT
   * @param {string} rut - RUT del paciente
   * @returns {Promise<Object|null>} Paciente encontrado o null
   */
  static async getByRut(rut) {
    try {
      const query = `
        SELECT 
          p.id_usuario, 
          p.rut, 
          p.telefono, 
          p.direccion, 
          p.fecha_nacimiento, 
          p.sexo,
          p.grupo_sanguineo,
          u.nombre, 
          u.email, 
          u.estado
        FROM pacientes p
        JOIN usuarios u ON p.id_usuario = u.id
        WHERE p.rut = $1 AND u.rol = 'paciente'
      `;
      const result = await pool.query(query, [rut]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener paciente con RUT ${rut}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo paciente (incluyendo usuario)
   * @param {Object} userData - Datos del usuario
   * @param {Object} pacienteData - Datos del paciente
   * @returns {Promise<Object>} Paciente creado
   */
  static async create(userData, pacienteData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Asegurar que el rol sea paciente
      userData.rol = 'paciente';
      
      // Crear usuario
      const newUser = await Usuario.create(userData);
      
      // Insertar datos de paciente
      const pacienteQuery = `
        INSERT INTO pacientes (
          id_usuario, 
          rut, 
          telefono, 
          direccion, 
          fecha_nacimiento, 
          sexo,
          grupo_sanguineo,
          alergias,
          antecedentes_medicos,
          contacto_emergencia_nombre,
          contacto_emergencia_telefono
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id_usuario
      `;
      
      const pacienteValues = [
        newUser.id,
        pacienteData.rut,
        pacienteData.telefono || null,
        pacienteData.direccion || null,
        pacienteData.fecha_nacimiento || null,
        pacienteData.sexo || null,
        pacienteData.grupo_sanguineo || null,
        pacienteData.alergias || null,
        pacienteData.antecedentes_medicos || null,
        pacienteData.contacto_emergencia_nombre || null,
        pacienteData.contacto_emergencia_telefono || null
      ];
      
      await client.query(pacienteQuery, pacienteValues);
      
      // Obtener el paciente completo
      const paciente = await Paciente.getById(newUser.id);
      
      await client.query('COMMIT');
      return paciente;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear paciente:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza un paciente existente
   * @param {number} id_usuario - ID del usuario asociado al paciente
   * @param {Object} userData - Datos actualizados del usuario
   * @param {Object} pacienteData - Datos actualizados del paciente
   * @returns {Promise<Object|null>} Paciente actualizado o null
   */
  static async update(id_usuario, userData, pacienteData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Actualizar datos de usuario si se proporcionaron
      if (Object.keys(userData).length > 0) {
        await Usuario.update(id_usuario, userData);
      }
      
      // Construir la consulta dinámicamente para actualizar solo los campos proporcionados
      if (Object.keys(pacienteData).length > 0) {
        let query = 'UPDATE pacientes SET ';
        const values = [];
        let paramCounter = 1;
        
        for (const [key, value] of Object.entries(pacienteData)) {
          // Solo incluir campos válidos de la tabla pacientes
          if (['rut', 'telefono', 'direccion', 'fecha_nacimiento', 'sexo', 
               'grupo_sanguineo', 'alergias', 'antecedentes_medicos',
               'contacto_emergencia_nombre', 'contacto_emergencia_telefono'].includes(key)) {
            query += `${key} = $${paramCounter}, `;
            values.push(value);
            paramCounter++;
          }
        }
        
        // Eliminar la última coma y espacio
        query = query.slice(0, -2);
        
        // Completar la consulta
        query += ` WHERE id_usuario = $${paramCounter}`;
        values.push(id_usuario);
        
        // Solo ejecutar si hay campos para actualizar
        if (paramCounter > 1) {
          await client.query(query, values);
        }
      }
      
      // Obtener el paciente actualizado
      const paciente = await Paciente.getById(id_usuario);
      
      await client.query('COMMIT');
      return paciente;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al actualizar paciente con ID ${id_usuario}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Elimina un paciente y su usuario asociado
   * @param {number} id_usuario - ID del usuario asociado al paciente
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id_usuario) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar si hay citas asociadas a este paciente
      const checkQuery = 'SELECT COUNT(*) FROM horas_agendadas WHERE id_paciente = $1';
      const checkResult = await client.query(checkQuery, [id_usuario]);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el paciente porque tiene citas agendadas');
      }
      
      // Eliminar paciente (se eliminará en cascada debido a ON DELETE CASCADE en la FK)
      // y luego eliminar el usuario
      const deleted = await Usuario.delete(id_usuario);
      
      await client.query('COMMIT');
      return deleted;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al eliminar paciente con ID ${id_usuario}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Busca pacientes por nombre, email o RUT
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Lista de pacientes que coinciden
   */
  static async search(searchTerm) {
    try {
      const query = `
        SELECT 
          p.id_usuario, 
          p.rut, 
          p.telefono, 
          p.direccion, 
          p.fecha_nacimiento, 
          p.sexo,
          p.grupo_sanguineo,
          u.nombre, 
          u.email, 
          u.estado
        FROM pacientes p
        JOIN usuarios u ON p.id_usuario = u.id
        WHERE 
          (u.nombre ILIKE $1 OR 
           u.email ILIKE $1 OR 
           p.rut ILIKE $1 OR
           p.telefono ILIKE $1)
          AND u.rol = 'paciente'
        ORDER BY u.nombre
        LIMIT 50
      `;
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      console.error(`Error al buscar pacientes con término "${searchTerm}":`, error);
      throw error;
    }
  }

  /**
   * Obtiene el historial médico de un paciente
   * @param {number} id_usuario - ID del usuario asociado al paciente
   * @returns {Promise<Array>} Lista de registros del historial médico
   */
  static async getHistorialMedico(id_usuario) {
    try {
      const query = `
        SELECT 
          hm.id,
          hm.fecha,
          hm.diagnostico,
          hm.tratamiento,
          hm.observaciones,
          u.nombre as nombre_profesional,
          e.nombre as especialidad
        FROM historial_medico hm
        JOIN profesionales_salud ps ON hm.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE hm.id_paciente = $1
        ORDER BY hm.fecha DESC
      `;
      const result = await pool.query(query, [id_usuario]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener historial médico del paciente ${id_usuario}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las citas médicas de un paciente
   * @param {number} id_usuario - ID del usuario asociado al paciente
   * @returns {Promise<Array>} Lista de citas médicas
   */
  static async getCitas(id_usuario) {
    try {
      const query = `
        SELECT 
          ha.id,
          ha.fecha_hora,
          ha.estado,
          ha.fecha_solicitud,
          sp.nombre as servicio,
          sp.duracion_min,
          u.nombre as nombre_profesional,
          e.nombre as especialidad,
          c.nombre as consultorio,
          c.direccion as direccion_consultorio
        FROM horas_agendadas ha
        JOIN servicios_procedimientos sp ON ha.id_servicio = sp.id
        JOIN profesionales_salud ps ON ha.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        JOIN consultorios c ON ha.consultorio_id = c.id
        WHERE ha.id_paciente = $1
        ORDER BY ha.fecha_hora DESC
      `;
      const result = await pool.query(query, [id_usuario]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener citas del paciente ${id_usuario}:`, error);
      throw error;
    }
  }
}

module.exports = Paciente; 