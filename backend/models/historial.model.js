import { db } from '../database/database.js';

class Historial {
  constructor(historial) {
    this.id = historial.id;
    this.id_paciente = historial.id_paciente;
    this.id_cita = historial.id_cita;
    this.id_profesional = historial.id_profesional;
    this.fecha = historial.fecha;
    this.diagnostico = historial.diagnostico;
    this.tratamiento = historial.tratamiento;
    this.receta = historial.receta;
    this.observaciones = historial.observaciones;
  }

  // Crea un nuevo registro en el historial médico
  static async crear(nuevoHistorial) {
    const query = `
      INSERT INTO historial_medico (
        id_paciente, id_cita, id_profesional, fecha,
        diagnostico, tratamiento, receta, observaciones
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      nuevoHistorial.id_paciente,
      nuevoHistorial.id_cita,
      nuevoHistorial.id_profesional,
      nuevoHistorial.fecha || 'NOW()',
      nuevoHistorial.diagnostico,
      nuevoHistorial.tratamiento,
      nuevoHistorial.receta,
      nuevoHistorial.observaciones
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear registro en historial médico: ${error.message}`);
    }
  }

  // Obtiene un registro del historial por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM historial_medico WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener historial: ${error.message}`);
    }
  }

  // Obtiene todo el historial médico de un paciente
  static async obtenerPorPaciente(idPaciente) {
    const query = `
      SELECT h.*, u.nombre as nombre_profesional, c.fecha_hora as fecha_cita
      FROM historial_medico h
      LEFT JOIN usuarios u ON h.id_profesional = u.id
      LEFT JOIN horas_agendadas c ON h.id_cita = c.id
      WHERE h.id_paciente = $1
      ORDER BY h.fecha DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idPaciente]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener historial del paciente: ${error.message}`);
    }
  }

  // Obtiene historiales médicos creados por un profesional
  static async obtenerPorProfesional(idProfesional) {
    const query = `
      SELECT h.*, u.nombre as nombre_paciente
      FROM historial_medico h
      JOIN usuarios u ON h.id_paciente = u.id
      WHERE h.id_profesional = $1
      ORDER BY h.fecha DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idProfesional]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener historiales del profesional: ${error.message}`);
    }
  }

  // Obtiene el historial asociado a una cita
  static async obtenerPorCita(idCita) {
    const query = 'SELECT * FROM historial_medico WHERE id_cita = $1';
    
    try {
      const { rows } = await db.query(query, [idCita]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener historial de la cita: ${error.message}`);
    }
  }

  // Busca en el historial por diagnóstico o tratamiento
  static async buscar(terminoBusqueda, idPaciente = null) {
    let query = `
      SELECT h.*, u1.nombre as nombre_paciente, u2.nombre as nombre_profesional
      FROM historial_medico h
      JOIN usuarios u1 ON h.id_paciente = u1.id
      LEFT JOIN usuarios u2 ON h.id_profesional = u2.id
      WHERE (h.diagnostico ILIKE $1 OR h.tratamiento ILIKE $1 OR h.observaciones ILIKE $1)
    `;
    
    const params = [`%${terminoBusqueda}%`];
    
    if (idPaciente) {
      query += ' AND h.id_paciente = $2';
      params.push(idPaciente);
    }
    
    query += ' ORDER BY h.fecha DESC';
    
    try {
      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar en historial: ${error.message}`);
    }
  }

  // Actualiza un registro del historial
  static async actualizar(id, historialActualizado) {
    const query = `
      UPDATE historial_medico 
      SET 
        id_paciente = $2,
        id_cita = $3,
        id_profesional = $4,
        diagnostico = $5,
        tratamiento = $6,
        receta = $7,
        observaciones = $8
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      historialActualizado.id_paciente,
      historialActualizado.id_cita,
      historialActualizado.id_profesional,
      historialActualizado.diagnostico,
      historialActualizado.tratamiento,
      historialActualizado.receta,
      historialActualizado.observaciones
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar historial: ${error.message}`);
    }
  }

  // Elimina un registro del historial
  static async eliminar(id) {
    const query = 'DELETE FROM historial_medico WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar historial: ${error.message}`);
    }
  }

  // Obtiene todas las recetas asociadas a un historial
  static async obtenerRecetas(idHistorial) {
    const query = `
      SELECT rm.*, m.nombre as medicamento_nombre
      FROM recetas_medicamentos rm
      JOIN medicamentos m ON rm.id_medicamento = m.id
      WHERE rm.id_historial = $1
    `;
    
    try {
      const { rows } = await db.query(query, [idHistorial]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener recetas del historial: ${error.message}`);
    }
  }
}

export default Historial; 