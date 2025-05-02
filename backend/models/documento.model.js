import { db } from '../database/database.js';

class Documento {
  constructor(documento) {
    this.id = documento.id;
    this.id_paciente = documento.id_paciente;
    this.id_profesional = documento.id_profesional;
    this.id_cita = documento.id_cita;
    this.tipo = documento.tipo;
    this.titulo = documento.titulo;
    this.contenido = documento.contenido;
    this.archivo_url = documento.archivo_url;
    this.fecha_creacion = documento.fecha_creacion;
    this.es_confidencial = documento.es_confidencial;
  }

  // Crea un nuevo documento clínico
  static async crear(nuevoDocumento) {
    const query = `
      INSERT INTO documentos_clinicos (
        id_paciente, id_profesional, id_cita, tipo, titulo,
        contenido, archivo_url, fecha_creacion, es_confidencial
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      nuevoDocumento.id_paciente,
      nuevoDocumento.id_profesional,
      nuevoDocumento.id_cita,
      nuevoDocumento.tipo,
      nuevoDocumento.titulo,
      nuevoDocumento.contenido,
      nuevoDocumento.archivo_url,
      nuevoDocumento.fecha_creacion || 'NOW()',
      nuevoDocumento.es_confidencial || false
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear documento clínico: ${error.message}`);
    }
  }

  // Obtiene un documento por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM documentos_clinicos WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener documento: ${error.message}`);
    }
  }

  // Obtiene todos los documentos de un paciente
  static async obtenerPorPaciente(idPaciente) {
    const query = `
      SELECT dc.*, u.nombre as nombre_profesional
      FROM documentos_clinicos dc
      LEFT JOIN usuarios u ON dc.id_profesional = u.id
      WHERE dc.id_paciente = $1
      ORDER BY dc.fecha_creacion DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idPaciente]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener documentos del paciente: ${error.message}`);
    }
  }

  // Obtiene todos los documentos creados por un profesional
  static async obtenerPorProfesional(idProfesional) {
    const query = `
      SELECT dc.*, u.nombre as nombre_paciente
      FROM documentos_clinicos dc
      JOIN usuarios u ON dc.id_paciente = u.id
      WHERE dc.id_profesional = $1
      ORDER BY dc.fecha_creacion DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idProfesional]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener documentos del profesional: ${error.message}`);
    }
  }

  // Obtiene documentos asociados a una cita
  static async obtenerPorCita(idCita) {
    const query = 'SELECT * FROM documentos_clinicos WHERE id_cita = $1 ORDER BY fecha_creacion DESC';
    
    try {
      const { rows } = await db.query(query, [idCita]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener documentos de la cita: ${error.message}`);
    }
  }

  // Obtiene documentos por tipo
  static async obtenerPorTipo(tipo) {
    const query = `
      SELECT dc.*, up.nombre as nombre_paciente, u.nombre as nombre_profesional
      FROM documentos_clinicos dc
      JOIN usuarios up ON dc.id_paciente = up.id
      LEFT JOIN usuarios u ON dc.id_profesional = u.id
      WHERE dc.tipo = $1
      ORDER BY dc.fecha_creacion DESC
    `;
    
    try {
      const { rows } = await db.query(query, [tipo]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener documentos por tipo: ${error.message}`);
    }
  }

  // Busca documentos por título o contenido
  static async buscar(terminoBusqueda, idPaciente = null) {
    let query = `
      SELECT dc.*, up.nombre as nombre_paciente, u.nombre as nombre_profesional
      FROM documentos_clinicos dc
      JOIN usuarios up ON dc.id_paciente = up.id
      LEFT JOIN usuarios u ON dc.id_profesional = u.id
      WHERE (dc.titulo ILIKE $1 OR dc.contenido ILIKE $1)
    `;
    
    const params = [`%${terminoBusqueda}%`];
    
    if (idPaciente) {
      query += ' AND dc.id_paciente = $2';
      params.push(idPaciente);
    }
    
    query += ' ORDER BY dc.fecha_creacion DESC';
    
    try {
      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar documentos: ${error.message}`);
    }
  }

  // Actualiza un documento
  static async actualizar(id, documentoActualizado) {
    const query = `
      UPDATE documentos_clinicos 
      SET 
        id_paciente = $2,
        id_profesional = $3,
        id_cita = $4,
        tipo = $5,
        titulo = $6,
        contenido = $7,
        archivo_url = $8,
        es_confidencial = $9
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      documentoActualizado.id_paciente,
      documentoActualizado.id_profesional,
      documentoActualizado.id_cita,
      documentoActualizado.tipo,
      documentoActualizado.titulo,
      documentoActualizado.contenido,
      documentoActualizado.archivo_url,
      documentoActualizado.es_confidencial
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }
  }

  // Actualiza el estado de confidencialidad de un documento
  static async actualizarConfidencialidad(id, esConfidencial) {
    const query = `
      UPDATE documentos_clinicos 
      SET es_confidencial = $2
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [id, esConfidencial]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar confidencialidad: ${error.message}`);
    }
  }

  // Elimina un documento
  static async eliminar(id) {
    const query = 'DELETE FROM documentos_clinicos WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }
}

export default Documento; 