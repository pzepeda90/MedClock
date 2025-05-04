import db from "../database/database.js";

/**
 * Modelo para gestionar códigos de procedimientos médicos (Fonasa, etc.)
 */
class CodigoProcedimiento {
  constructor(codigoProcedimiento) {
    this.id = codigoProcedimiento.id;
    this.codigo = codigoProcedimiento.codigo;
    this.nombre = codigoProcedimiento.nombre;
    this.descripcion = codigoProcedimiento.descripcion;
    this.tipo = codigoProcedimiento.tipo;
    this.precio_referencia = codigoProcedimiento.precio_referencia;
    this.activo = codigoProcedimiento.activo;
    this.fecha_creacion = codigoProcedimiento.fecha_creacion;
    this.fecha_actualizacion = codigoProcedimiento.fecha_actualizacion;
  }

  /**
   * Crea un nuevo código de procedimiento
   * @param {Object} nuevoCodigo - Datos del nuevo código
   * @returns {Object} - Código creado
   */
  static async crear(nuevoCodigo) {
    const query = `
      INSERT INTO codigos_procedimientos (
        codigo, nombre, descripcion, tipo, precio_referencia, activo
      ) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      nuevoCodigo.codigo,
      nuevoCodigo.nombre,
      nuevoCodigo.descripcion || null,
      nuevoCodigo.tipo,
      nuevoCodigo.precio_referencia || 0,
      nuevoCodigo.activo !== undefined ? nuevoCodigo.activo : true
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error en crear código:", error);
      throw error;
    }
  }

  /**
   * Obtiene un código de procedimiento por su ID
   * @param {number} id - ID del código
   * @returns {Object|null} - Código encontrado o null
   */
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM codigos_procedimientos WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error en obtenerPorId:", error);
      throw error;
    }
  }

  /**
   * Obtiene un código de procedimiento por su código
   * @param {string} codigo - Código del procedimiento
   * @returns {Object|null} - Código encontrado o null
   */
  static async obtenerPorCodigo(codigo) {
    const query = 'SELECT * FROM codigos_procedimientos WHERE codigo = $1';
    
    try {
      const { rows } = await db.query(query, [codigo]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error en obtenerPorCodigo:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los códigos de procedimientos
   * @param {boolean} [soloActivos=true] - Si solo se deben incluir los códigos activos
   * @returns {Array} - Lista de códigos
   */
  static async obtenerTodos(soloActivos = true) {
    let query = 'SELECT * FROM codigos_procedimientos';
    
    if (soloActivos) {
      query += ' WHERE activo = TRUE';
    }
    
    query += ' ORDER BY codigo';
    
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Error en obtenerTodos:", error);
      throw error;
    }
  }

  /**
   * Busca códigos de procedimientos por criterios específicos
   * @param {Object} filtros - Criterios de búsqueda
   * @returns {Array} - Lista de códigos que coinciden con los criterios
   */
  static async buscar(filtros) {
    let query = 'SELECT * FROM codigos_procedimientos WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Filtrar por código
    if (filtros.codigo) {
      query += ` AND codigo LIKE $${paramIndex}`;
      params.push(`%${filtros.codigo}%`);
      paramIndex++;
    }

    // Filtrar por nombre
    if (filtros.nombre) {
      query += ` AND LOWER(nombre) LIKE $${paramIndex}`;
      params.push(`%${filtros.nombre.toLowerCase()}%`);
      paramIndex++;
    }

    // Filtrar por tipo
    if (filtros.tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(filtros.tipo);
      paramIndex++;
    }

    // Filtrar por estado (activo/inactivo)
    if (filtros.activo !== undefined) {
      query += ` AND activo = $${paramIndex}`;
      params.push(filtros.activo);
      paramIndex++;
    }

    // Filtrar por rango de precio
    if (filtros.precio_min !== undefined) {
      query += ` AND precio_referencia >= $${paramIndex}`;
      params.push(filtros.precio_min);
      paramIndex++;
    }

    if (filtros.precio_max !== undefined) {
      query += ` AND precio_referencia <= $${paramIndex}`;
      params.push(filtros.precio_max);
      paramIndex++;
    }

    // Ordenar resultados
    query += ' ORDER BY codigo';

    try {
      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error("Error en buscar:", error);
      throw error;
    }
  }

  /**
   * Obtiene códigos de procedimiento por tipo
   * @param {string} tipo - Tipo de código (fonasa, particular, etc.)
   * @returns {Array} - Lista de códigos del tipo especificado
   */
  static async obtenerPorTipo(tipo) {
    const query = `
      SELECT * FROM codigos_procedimientos 
      WHERE tipo = $1 AND activo = TRUE
      ORDER BY codigo
    `;
    
    try {
      const { rows } = await db.query(query, [tipo]);
      return rows;
    } catch (error) {
      console.error("Error en obtenerPorTipo:", error);
      throw error;
    }
  }

  /**
   * Actualiza un código de procedimiento
   * @param {number} id - ID del código a actualizar
   * @param {Object} datosActualizados - Datos actualizados
   * @returns {Object|null} - Código actualizado o null
   */
  static async actualizar(id, datosActualizados) {
    const campos = ['codigo', 'nombre', 'descripcion', 'tipo', 'precio_referencia', 'activo'];
    const updates = [];
    const values = [id];
    let paramIndex = 2;

    // Construir dinámicamente la consulta SQL según los campos a actualizar
    for (const campo of campos) {
      if (datosActualizados[campo] !== undefined) {
        updates.push(`${campo} = $${paramIndex}`);
        values.push(datosActualizados[campo]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return await this.obtenerPorId(id);
    }

    const query = `
      UPDATE codigos_procedimientos 
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error("Error en actualizar:", error);
      throw error;
    }
  }

  /**
   * Elimina un código de procedimiento
   * @param {number} id - ID del código a eliminar
   * @returns {Object|null} - Código eliminado o null
   */
  static async eliminar(id) {
    const query = 'DELETE FROM codigos_procedimientos WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error en eliminar:", error);
      throw error;
    }
  }

  /**
   * Asocia un código de procedimiento con un servicio
   * @param {number} idCodigo - ID del código
   * @param {number} idServicio - ID del servicio
   * @returns {Object} - Relación creada
   */
  static async asociarServicio(idCodigo, idServicio) {
    const query = `
      INSERT INTO rel_codigo_servicio (id_codigo, id_servicio)
      VALUES ($1, $2)
      ON CONFLICT (id_codigo, id_servicio) DO NOTHING
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [idCodigo, idServicio]);
      return rows[0] || { id_codigo: idCodigo, id_servicio: idServicio };
    } catch (error) {
      console.error("Error en asociarServicio:", error);
      throw error;
    }
  }

  /**
   * Desasocia un código de procedimiento de un servicio
   * @param {number} idCodigo - ID del código
   * @param {number} idServicio - ID del servicio
   * @returns {boolean} - true si se desasoció correctamente
   */
  static async desasociarServicio(idCodigo, idServicio) {
    const query = `
      DELETE FROM rel_codigo_servicio 
      WHERE id_codigo = $1 AND id_servicio = $2
      RETURNING *
    `;
    
    try {
      const { rowCount } = await db.query(query, [idCodigo, idServicio]);
      return rowCount > 0;
    } catch (error) {
      console.error("Error en desasociarServicio:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los servicios asociados a un código de procedimiento
   * @param {number} idCodigo - ID del código
   * @returns {Array} - Lista de servicios asociados
   */
  static async obtenerServiciosAsociados(idCodigo) {
    const query = `
      SELECT s.* 
      FROM servicios_procedimientos s
      JOIN rel_codigo_servicio r ON s.id = r.id_servicio
      WHERE r.id_codigo = $1
      ORDER BY s.nombre
    `;
    
    try {
      const { rows } = await db.query(query, [idCodigo]);
      return rows;
    } catch (error) {
      console.error("Error en obtenerServiciosAsociados:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los códigos asociados a un servicio
   * @param {number} idServicio - ID del servicio
   * @returns {Array} - Lista de códigos asociados
   */
  static async obtenerCodigosAsociados(idServicio) {
    const query = `
      SELECT c.* 
      FROM codigos_procedimientos c
      JOIN rel_codigo_servicio r ON c.id = r.id_codigo
      WHERE r.id_servicio = $1 AND c.activo = TRUE
      ORDER BY c.codigo
    `;
    
    try {
      const { rows } = await db.query(query, [idServicio]);
      return rows;
    } catch (error) {
      console.error("Error en obtenerCodigosAsociados:", error);
      throw error;
    }
  }
}

export default CodigoProcedimiento; 