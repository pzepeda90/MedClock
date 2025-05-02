const { pool } = require('../config/database');
const Profesional = require('./profesional.model');
const Consultorio = require('./consultorio.model');

/**
 * Modelo para la gestión de horarios disponibles de profesionales
 */
class Horario {
  /**
   * Obtiene todos los horarios disponibles
   * @param {Object} filters - Filtros opcionales (fecha, profesional, consultorio, estado)
   * @returns {Promise<Array>} Lista de horarios
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          hd.id,
          hd.id_profesional,
          hd.consultorio_id,
          hd.fecha,
          hd.hora_inicio,
          hd.hora_fin,
          hd.estado,
          u.nombre as nombre_profesional,
          u.rol as rol_profesional,
          e.id as especialidad_id,
          e.nombre as especialidad,
          c.nombre as consultorio,
          c.direccion as direccion_consultorio
        FROM horarios_disponibles hd
        JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        JOIN consultorios c ON hd.consultorio_id = c.id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCounter = 1;
      
      // Aplicar filtros si se proporcionaron
      if (filters.fecha) {
        query += ` AND hd.fecha = $${paramCounter}`;
        values.push(filters.fecha);
        paramCounter++;
      }
      
      if (filters.id_profesional) {
        query += ` AND hd.id_profesional = $${paramCounter}`;
        values.push(filters.id_profesional);
        paramCounter++;
      }
      
      if (filters.consultorio_id) {
        query += ` AND hd.consultorio_id = $${paramCounter}`;
        values.push(filters.consultorio_id);
        paramCounter++;
      }
      
      if (filters.estado) {
        query += ` AND hd.estado = $${paramCounter}`;
        values.push(filters.estado);
        paramCounter++;
      }
      
      // Ordenar por fecha y hora
      query += ` ORDER BY hd.fecha, hd.hora_inicio`;
      
      // Limitar resultados si se especifica
      if (filters.limit) {
        query += ` LIMIT $${paramCounter}`;
        values.push(filters.limit);
        paramCounter++;
      }
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      throw error;
    }
  }

  /**
   * Busca un horario disponible por su ID
   * @param {number} id - ID del horario
   * @returns {Promise<Object|null>} Horario encontrado o null
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          hd.id,
          hd.id_profesional,
          hd.consultorio_id,
          hd.fecha,
          hd.hora_inicio,
          hd.hora_fin,
          hd.estado,
          hd.fecha_creacion,
          u.nombre as nombre_profesional,
          u.rol as rol_profesional,
          e.id as especialidad_id,
          e.nombre as especialidad,
          c.nombre as consultorio,
          c.direccion as direccion_consultorio
        FROM horarios_disponibles hd
        JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        JOIN consultorios c ON hd.consultorio_id = c.id
        WHERE hd.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener horario disponible con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo horario disponible
   * @param {Object} data - Datos del horario
   * @returns {Promise<Object>} Horario creado
   */
  static async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que el profesional exista
      const profesional = await Profesional.getById(data.id_profesional);
      if (!profesional) {
        throw new Error('El profesional indicado no existe');
      }
      
      // Verificar que el consultorio exista
      const consultorio = await Consultorio.getById(data.consultorio_id);
      if (!consultorio) {
        throw new Error('El consultorio indicado no existe');
      }
      
      // Verificar que el horario no se solape con otro ya existente del mismo profesional
      const checkSolapamientoQuery = `
        SELECT id FROM horarios_disponibles
        WHERE id_profesional = $1
        AND fecha = $2
        AND (
          (hora_inicio <= $3 AND hora_fin > $3) OR
          (hora_inicio < $4 AND hora_fin >= $4) OR
          (hora_inicio >= $3 AND hora_fin <= $4)
        )
      `;
      
      const checkSolapamientoValues = [
        data.id_profesional,
        data.fecha,
        data.hora_inicio,
        data.hora_fin
      ];
      
      const solapamientoResult = await client.query(checkSolapamientoQuery, checkSolapamientoValues);
      
      if (solapamientoResult.rows.length > 0) {
        throw new Error('El horario se solapa con otro ya existente para este profesional');
      }
      
      // Insertar el horario disponible
      const query = `
        INSERT INTO horarios_disponibles (
          id_profesional,
          consultorio_id,
          fecha,
          hora_inicio,
          hora_fin,
          estado
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
          id,
          id_profesional,
          consultorio_id,
          fecha,
          hora_inicio,
          hora_fin,
          estado,
          fecha_creacion
      `;
      
      const values = [
        data.id_profesional,
        data.consultorio_id,
        data.fecha,
        data.hora_inicio,
        data.hora_fin,
        data.estado || 'disponible'
      ];
      
      const result = await client.query(query, values);
      const horario = result.rows[0];
      
      await client.query('COMMIT');
      
      // Obtener información completa del horario
      return await Horario.getById(horario.id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear horario disponible:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Crea múltiples horarios disponibles en bloque
   * @param {Array} horarios - Array de objetos con datos de horarios
   * @returns {Promise<Array>} Horarios creados
   */
  static async createBulk(horarios) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const horariosCreados = [];
      
      for (const horario of horarios) {
        try {
          // Verificar que el profesional exista
          const profesional = await Profesional.getById(horario.id_profesional);
          if (!profesional) {
            throw new Error(`El profesional con ID ${horario.id_profesional} no existe`);
          }
          
          // Verificar que el consultorio exista
          const consultorio = await Consultorio.getById(horario.consultorio_id);
          if (!consultorio) {
            throw new Error(`El consultorio con ID ${horario.consultorio_id} no existe`);
          }
          
          // Verificar que el horario no se solape con otro ya existente del mismo profesional
          const checkSolapamientoQuery = `
            SELECT id FROM horarios_disponibles
            WHERE id_profesional = $1
            AND fecha = $2
            AND (
              (hora_inicio <= $3 AND hora_fin > $3) OR
              (hora_inicio < $4 AND hora_fin >= $4) OR
              (hora_inicio >= $3 AND hora_fin <= $4)
            )
          `;
          
          const checkSolapamientoValues = [
            horario.id_profesional,
            horario.fecha,
            horario.hora_inicio,
            horario.hora_fin
          ];
          
          const solapamientoResult = await client.query(checkSolapamientoQuery, checkSolapamientoValues);
          
          if (solapamientoResult.rows.length > 0) {
            console.warn(`Horario solapado: ${horario.fecha} ${horario.hora_inicio}-${horario.hora_fin} para profesional ${horario.id_profesional}`);
            continue; // Saltar este horario y continuar con el siguiente
          }
          
          // Insertar el horario disponible
          const query = `
            INSERT INTO horarios_disponibles (
              id_profesional,
              consultorio_id,
              fecha,
              hora_inicio,
              hora_fin,
              estado
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING 
              id,
              id_profesional,
              consultorio_id,
              fecha,
              hora_inicio,
              hora_fin,
              estado,
              fecha_creacion
          `;
          
          const values = [
            horario.id_profesional,
            horario.consultorio_id,
            horario.fecha,
            horario.hora_inicio,
            horario.hora_fin,
            horario.estado || 'disponible'
          ];
          
          const result = await client.query(query, values);
          horariosCreados.push(result.rows[0]);
        } catch (innerError) {
          console.error(`Error al crear un horario en operación bulk: ${innerError.message}`);
          // Continuar con el siguiente horario
        }
      }
      
      await client.query('COMMIT');
      
      return horariosCreados;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear horarios disponibles en bloque:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualiza un horario disponible existente
   * @param {number} id - ID del horario
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object|null>} Horario actualizado o null
   */
  static async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que el horario exista
      const horario = await Horario.getById(id);
      if (!horario) {
        return null;
      }
      
      // Si se está intentando cambiar el profesional, consultorio, fecha u horas,
      // verificar que no haya solapamiento con otros horarios
      if (
        data.id_profesional !== undefined || 
        data.fecha !== undefined || 
        data.hora_inicio !== undefined || 
        data.hora_fin !== undefined
      ) {
        const id_profesional = data.id_profesional || horario.id_profesional;
        const fecha = data.fecha || horario.fecha;
        const hora_inicio = data.hora_inicio || horario.hora_inicio;
        const hora_fin = data.hora_fin || horario.hora_fin;
        
        const checkSolapamientoQuery = `
          SELECT id FROM horarios_disponibles
          WHERE id_profesional = $1
          AND fecha = $2
          AND (
            (hora_inicio <= $3 AND hora_fin > $3) OR
            (hora_inicio < $4 AND hora_fin >= $4) OR
            (hora_inicio >= $3 AND hora_fin <= $4)
          )
          AND id != $5
        `;
        
        const checkSolapamientoValues = [
          id_profesional,
          fecha,
          hora_inicio,
          hora_fin,
          id
        ];
        
        const solapamientoResult = await client.query(checkSolapamientoQuery, checkSolapamientoValues);
        
        if (solapamientoResult.rows.length > 0) {
          throw new Error('El horario se solapa con otro ya existente para este profesional');
        }
      }
      
      // Construir la consulta dinámicamente para actualizar solo los campos proporcionados
      let query = 'UPDATE horarios_disponibles SET ';
      const values = [];
      let paramCounter = 1;
      
      for (const [key, value] of Object.entries(data)) {
        // Solo incluir campos válidos de la tabla horarios_disponibles
        if (['id_profesional', 'consultorio_id', 'fecha', 'hora_inicio', 'hora_fin', 'estado'].includes(key)) {
          query += `${key} = $${paramCounter}, `;
          values.push(value);
          paramCounter++;
        }
      }
      
      // Eliminar la última coma y espacio
      query = query.slice(0, -2);
      
      // Completar la consulta
      query += ` WHERE id = $${paramCounter} RETURNING *`;
      values.push(id);
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      await client.query('COMMIT');
      
      // Obtener información completa del horario actualizado
      return await Horario.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al actualizar horario disponible con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Elimina un horario disponible por su ID
   * @param {number} id - ID del horario
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar que no haya citas agendadas para este horario
      const checkCitasQuery = `
        SELECT COUNT(*) FROM horas_agendadas
        WHERE horario_id = $1
      `;
      
      const checkCitasResult = await client.query(checkCitasQuery, [id]);
      
      if (parseInt(checkCitasResult.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el horario porque ya tiene citas agendadas');
      }
      
      const query = 'DELETE FROM horarios_disponibles WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      
      await client.query('COMMIT');
      
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error al eliminar horario disponible con ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Busca horarios disponibles para un profesional en un rango de fechas
   * @param {number} id_profesional - ID del profesional
   * @param {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Lista de horarios disponibles
   */
  static async getByProfesionalAndDateRange(id_profesional, fecha_inicio, fecha_fin) {
    try {
      const query = `
        SELECT 
          hd.id,
          hd.id_profesional,
          hd.consultorio_id,
          hd.fecha,
          hd.hora_inicio,
          hd.hora_fin,
          hd.estado,
          u.nombre as nombre_profesional,
          u.rol as rol_profesional,
          e.id as especialidad_id,
          e.nombre as especialidad,
          c.nombre as consultorio,
          c.direccion as direccion_consultorio
        FROM horarios_disponibles hd
        JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        JOIN consultorios c ON hd.consultorio_id = c.id
        WHERE hd.id_profesional = $1
        AND hd.fecha BETWEEN $2 AND $3
        ORDER BY hd.fecha, hd.hora_inicio
      `;
      
      const result = await pool.query(query, [id_profesional, fecha_inicio, fecha_fin]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener horarios para profesional ${id_profesional} entre ${fecha_inicio} y ${fecha_fin}:`, error);
      throw error;
    }
  }

  /**
   * Busca horarios disponibles por consultorio en un rango de fechas
   * @param {number} consultorio_id - ID del consultorio
   * @param {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Lista de horarios disponibles
   */
  static async getByConsultorioAndDateRange(consultorio_id, fecha_inicio, fecha_fin) {
    try {
      const query = `
        SELECT 
          hd.id,
          hd.id_profesional,
          hd.consultorio_id,
          hd.fecha,
          hd.hora_inicio,
          hd.hora_fin,
          hd.estado,
          u.nombre as nombre_profesional,
          u.rol as rol_profesional,
          e.id as especialidad_id,
          e.nombre as especialidad,
          c.nombre as consultorio,
          c.direccion as direccion_consultorio
        FROM horarios_disponibles hd
        JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        JOIN consultorios c ON hd.consultorio_id = c.id
        WHERE hd.consultorio_id = $1
        AND hd.fecha BETWEEN $2 AND $3
        ORDER BY hd.fecha, hd.hora_inicio
      `;
      
      const result = await pool.query(query, [consultorio_id, fecha_inicio, fecha_fin]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener horarios para consultorio ${consultorio_id} entre ${fecha_inicio} y ${fecha_fin}:`, error);
      throw error;
    }
  }

  /**
   * Busca horarios disponibles por especialidad en un rango de fechas
   * @param {number} especialidad_id - ID de la especialidad
   * @param {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Lista de horarios disponibles
   */
  static async getByEspecialidadAndDateRange(especialidad_id, fecha_inicio, fecha_fin) {
    try {
      const query = `
        SELECT 
          hd.id,
          hd.id_profesional,
          hd.consultorio_id,
          hd.fecha,
          hd.hora_inicio,
          hd.hora_fin,
          hd.estado,
          u.nombre as nombre_profesional,
          u.rol as rol_profesional,
          e.id as especialidad_id,
          e.nombre as especialidad,
          c.nombre as consultorio,
          c.direccion as direccion_consultorio
        FROM horarios_disponibles hd
        JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
        JOIN usuarios u ON ps.id_usuario = u.id
        JOIN especialidades_medicas e ON ps.especialidad_id = e.id
        JOIN consultorios c ON hd.consultorio_id = c.id
        WHERE ps.especialidad_id = $1
        AND hd.fecha BETWEEN $2 AND $3
        AND hd.estado = 'disponible'
        ORDER BY hd.fecha, hd.hora_inicio
      `;
      
      const result = await pool.query(query, [especialidad_id, fecha_inicio, fecha_fin]);
      return result.rows;
    } catch (error) {
      console.error(`Error al obtener horarios para especialidad ${especialidad_id} entre ${fecha_inicio} y ${fecha_fin}:`, error);
      throw error;
    }
  }
}

module.exports = Horario; 