const { pool } = require('../config/database');
const Usuario = require('./usuario.model');

/**
 * Modelo para la gestión de profesionales de salud
 */
class Profesional {
  /**
   * Obtiene todos los profesionales de salud con información básica
   * @returns {Promise<Array>} Lista de profesionales
   */
  static async getAll() {
    try {
      const query = `
        SELECT 
          ps.id_usuario, 
          ps.rut, 
          ps.especialidad_id,
          ps.telefono, 
          ps.numero_registro,
          ps.biografia,
          e.nombre as especialidad,
          u.nombre, 
          u.email, 
          u.estado
        FROM profesionales_salud ps
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE u.rol IN ('médico', 'enfermera', 'tens')
        ORDER BY u.nombre
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener profesionales:', error);
      throw error;
    }
  }

  /**
   * Busca un profesional por su ID de usuario
   * @param {number} id_usuario - ID del usuario asociado al profesional
   * @returns {Promise<Object|null>} Profesional encontrado o null
   */
  static async getById(id_usuario) {
    try {
      const query = `
        SELECT 
          ps.id_usuario, 
          ps.rut, 
          ps.especialidad_id,
          ps.telefono, 
          ps.numero_registro,
          ps.biografia,
          e.nombre as especialidad,
          u.nombre, 
          u.email, 
          u.rol,
          u.estado,
          u.fecha_creacion
        FROM profesionales_salud ps
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE ps.id_usuario = $1 AND u.rol IN ('médico', 'enfermera', 'tens')
      `;
      const result = await pool.query(query, [id_usuario]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener profesional con ID ${id_usuario}:`, error);
      throw error;
    }
  }

  /**
   * Busca un profesional por su RUT
   * @param {string} rut - RUT del profesional
   * @returns {Promise<Object|null>} Profesional encontrado o null
   */
  static async getByRut(rut) {
    try {
      const query = `
        SELECT 
          ps.id_usuario, 
          ps.rut, 
          ps.especialidad_id,
          ps.telefono, 
          ps.numero_registro,
          e.nombre as especialidad,
          u.nombre, 
          u.email, 
          u.rol,
          u.estado
        FROM profesionales_salud ps
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE ps.rut = $1 AND u.rol IN ('médico', 'enfermera', 'tens')
      `;
      const result = await pool.query(query, [rut]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener profesional con RUT ${rut}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo profesional de salud (incluyendo usuario)
   * @param {Object} userData - Datos del usuario
   * @param {Object} profesionalData - Datos del profesional
   * @returns {Promise<Object>} Profesional creado
   */
  static async create(userData, profesionalData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que el rol sea válido
      if (!['médico', 'enfermera', 'tens'].includes(userData.rol)) {
        throw new Error('Rol inválido para profesional de salud');
      }
      
      // Crear usuario
      const newUser = await Usuario.create(userData);
      
      // Insertar datos de profesional
      const profesionalQuery = `
        INSERT INTO profesionales_salud (
          id_usuario, 
          rut, 
          especialidad_id,
          telefono, 
          numero_registro,
          biografia
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_usuario
      `;
      
      const profesionalValues = [
        newUser.id,
        profesionalData.rut,
        profesionalData.especialidad_id,
        profesionalData.telefono || null,
        profesionalData.numero_registro || null,
        profesionalData.biografia || null
      ];
      
      await client.query(profesionalQuery, profesionalValues);
      
      // Obtener el profesional completo
      const profesional = await Profesional.getById(newUser.id);
      
      await client.query('COMMIT');
      return profesional;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear profesional:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza un profesional existente
   * @param {number} id_usuario - ID del usuario asociado al profesional
   * @param {Object} userData - Datos actualizados del usuario
   * @param {Object} profesionalData - Datos actualizados del profesional
   * @returns {Promise<Object|null>} Profesional actualizado o null
   */
  static async update(id_usuario, userData, profesionalData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Actualizar datos de usuario si se proporcionaron
      if (Object.keys(userData).length > 0) {
        // Verificar que el rol sea válido si se está actualizando
        if (userData.rol && !['médico', 'enfermera', 'tens'].includes(userData.rol)) {
          throw new Error('Rol inválido para profesional de salud');
        }
        
        await Usuario.update(id_usuario, userData);
      }
      
      // Construir la consulta dinámicamente para actualizar solo los campos proporcionados
      if (Object.keys(profesionalData).length > 0) {
        let query = 'UPDATE profesionales_salud SET ';
        const values = [];
        let paramCounter = 1;
        
        for (const [key, value] of Object.entries(profesionalData)) {
          // Solo incluir campos válidos de la tabla profesionales_salud
          if (['rut', 'especialidad_id', 'telefono', 'numero_registro', 'biografia'].includes(key)) {
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
      
      // Obtener el profesional actualizado
      const profesional = await Profesional.getById(id_usuario);
      
      await client.query('COMMIT');
      return profesional;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al actualizar profesional con ID ${id_usuario}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Elimina un profesional y su usuario asociado
   * @param {number} id_usuario - ID del usuario asociado al profesional
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id_usuario) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar si hay citas asociadas a este profesional
      const checkQuery = 'SELECT COUNT(*) FROM horas_agendadas WHERE id_profesional = $1';
      const checkResult = await client.query(checkQuery, [id_usuario]);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el profesional porque tiene citas agendadas');
      }
      
      // Verificar si hay horarios disponibles asociados
      const checkHorariosQuery = 'SELECT COUNT(*) FROM horarios_disponibles WHERE id_profesional = $1';
      const checkHorariosResult = await client.query(checkHorariosQuery, [id_usuario]);
      
      if (parseInt(checkHorariosResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el profesional porque tiene horarios disponibles');
      }
      
      // Eliminar profesional (se eliminará en cascada debido a ON DELETE CASCADE en la FK)
      // y luego eliminar el usuario
      const deleted = await Usuario.delete(id_usuario);
      
      await client.query('COMMIT');
      return deleted;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al eliminar profesional con ID ${id_usuario}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Busca profesionales por nombre, email, especialidad o RUT
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Lista de profesionales que coinciden
   */
  static async search(searchTerm) {
    try {
      const query = `
        SELECT 
          ps.id_usuario, 
          ps.rut, 
          ps.especialidad_id,
          ps.telefono, 
          ps.numero_registro,
          e.nombre as especialidad,
          u.nombre, 
          u.email, 
          u.rol,
          u.estado
        FROM profesionales_salud ps
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE 
          (u.nombre ILIKE $1 OR 
           u.email ILIKE $1 OR 
           ps.rut ILIKE $1 OR
           e.nombre ILIKE $1)
          AND u.rol IN ('médico', 'enfermera', 'tens')
        ORDER BY u.nombre
        LIMIT 50
      `;
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      console.error(`Error al buscar profesionales con término "${searchTerm}":`, error);
      throw error;
    }
  }

  /**
   * Obtiene los profesionales por especialidad
   * @param {number} especialidad_id - ID de la especialidad
   * @returns {Promise<Array>} Lista de profesionales con la especialidad indicada
   */
  static async getByEspecialidad(especialidad_id) {
    try {
      const query = `
        SELECT 
          ps.id_usuario, 
          ps.rut, 
          ps.especialidad_id,
          ps.telefono, 
          ps.numero_registro,
          ps.biografia,
          e.nombre as especialidad,
          u.nombre, 
          u.email, 
          u.rol,
          u.estado
        FROM profesionales_salud ps
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        WHERE ps.especialidad_id = $1 AND u.estado = 'activo'
        ORDER BY u.nombre
      `;
      const result = await pool.query(query, [especialidad_id]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener profesionales por especialidad ${especialidad_id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene los horarios disponibles de un profesional
   * @param {number} id_usuario - ID del usuario asociado al profesional
   * @returns {Promise<Array>} Lista de horarios disponibles
   */
  static async getHorariosDisponibles(id_usuario) {
    try {
      const query = `
        SELECT 
          hd.id,
          hd.fecha,
          hd.hora_inicio,
          hd.hora_fin,
          hd.estado,
          c.id as consultorio_id,
          c.nombre as consultorio,
          c.direccion as direccion_consultorio
        FROM horarios_disponibles hd
        JOIN consultorios c ON hd.consultorio_id = c.id
        WHERE hd.id_profesional = $1 AND hd.estado = 'disponible'
        ORDER BY hd.fecha, hd.hora_inicio
      `;
      const result = await pool.query(query, [id_usuario]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener horarios disponibles del profesional ${id_usuario}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las citas agendadas de un profesional
   * @param {number} id_usuario - ID del usuario asociado al profesional
   * @returns {Promise<Array>} Lista de citas agendadas
   */
  static async getCitasAgendadas(id_usuario) {
    try {
      const query = `
        SELECT 
          ha.id,
          ha.fecha_hora,
          ha.estado,
          ha.fecha_solicitud,
          p.id_usuario as id_paciente,
          u_p.nombre as nombre_paciente,
          p.rut as rut_paciente,
          sp.id as id_servicio,
          sp.nombre as servicio,
          sp.duracion_min,
          c.id as consultorio_id,
          c.nombre as consultorio,
          c.direccion as direccion_consultorio
        FROM horas_agendadas ha
        JOIN servicios_procedimientos sp ON ha.id_servicio = sp.id
        JOIN pacientes p ON ha.id_paciente = p.id_usuario
        JOIN usuarios u_p ON p.id_usuario = u_p.id
        JOIN consultorios c ON ha.consultorio_id = c.id
        WHERE ha.id_profesional = $1
        ORDER BY ha.fecha_hora DESC
      `;
      const result = await pool.query(query, [id_usuario]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener citas agendadas del profesional ${id_usuario}:`, error);
      throw error;
    }
  }
}

module.exports = Profesional; 