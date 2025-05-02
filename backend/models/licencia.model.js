import { db } from '../database/database.js';

class Licencia {
  constructor(licencia) {
    this.id = licencia.id;
    this.id_paciente = licencia.id_paciente;
    this.id_profesional = licencia.id_profesional;
    this.id_cita = licencia.id_cita;
    this.fecha_inicio = licencia.fecha_inicio;
    this.fecha_termino = licencia.fecha_termino;
    this.diagnostico = licencia.diagnostico;
    this.tipo_reposo = licencia.tipo_reposo;
    this.observaciones = licencia.observaciones;
    this.fecha_emision = licencia.fecha_emision;
  }

  // Crea una nueva licencia médica
  static async crear(nuevaLicencia) {
    const query = `
      INSERT INTO licencias_medicas (
        id_paciente, id_profesional, id_cita, fecha_inicio, fecha_termino,
        diagnostico, tipo_reposo, observaciones, fecha_emision
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      nuevaLicencia.id_paciente,
      nuevaLicencia.id_profesional,
      nuevaLicencia.id_cita,
      nuevaLicencia.fecha_inicio,
      nuevaLicencia.fecha_termino,
      nuevaLicencia.diagnostico,
      nuevaLicencia.tipo_reposo,
      nuevaLicencia.observaciones,
      nuevaLicencia.fecha_emision || 'NOW()'
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear licencia médica: ${error.message}`);
    }
  }

  // Obtiene una licencia por su ID
  static async obtenerPorId(id) {
    const query = `
      SELECT l.*, u1.nombre as paciente_nombre, u2.nombre as profesional_nombre
      FROM licencias_medicas l
      JOIN usuarios u1 ON l.id_paciente = u1.id
      JOIN usuarios u2 ON l.id_profesional = u2.id
      WHERE l.id = $1
    `;
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener licencia: ${error.message}`);
    }
  }

  // Obtiene todas las licencias de un paciente
  static async obtenerPorPaciente(idPaciente) {
    const query = `
      SELECT l.*, u.nombre as profesional_nombre
      FROM licencias_medicas l
      JOIN usuarios u ON l.id_profesional = u.id
      WHERE l.id_paciente = $1
      ORDER BY l.fecha_emision DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idPaciente]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener licencias del paciente: ${error.message}`);
    }
  }

  // Obtiene todas las licencias emitidas por un profesional
  static async obtenerPorProfesional(idProfesional) {
    const query = `
      SELECT l.*, u.nombre as paciente_nombre
      FROM licencias_medicas l
      JOIN usuarios u ON l.id_paciente = u.id
      WHERE l.id_profesional = $1
      ORDER BY l.fecha_emision DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idProfesional]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener licencias emitidas por el profesional: ${error.message}`);
    }
  }

  // Obtiene la licencia asociada a una cita
  static async obtenerPorCita(idCita) {
    const query = `
      SELECT l.*, u1.nombre as paciente_nombre, u2.nombre as profesional_nombre
      FROM licencias_medicas l
      JOIN usuarios u1 ON l.id_paciente = u1.id
      JOIN usuarios u2 ON l.id_profesional = u2.id
      WHERE l.id_cita = $1
    `;
    
    try {
      const { rows } = await db.query(query, [idCita]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener licencia de la cita: ${error.message}`);
    }
  }

  // Obtiene licencias médicas vigentes (fecha_termino >= fecha actual)
  static async obtenerVigentes(idPaciente = null) {
    let query = `
      SELECT l.*, u1.nombre as paciente_nombre, u2.nombre as profesional_nombre
      FROM licencias_medicas l
      JOIN usuarios u1 ON l.id_paciente = u1.id
      JOIN usuarios u2 ON l.id_profesional = u2.id
      WHERE l.fecha_termino >= CURRENT_DATE
    `;
    
    if (idPaciente) {
      query += ' AND l.id_paciente = $1';
    }
    
    query += ' ORDER BY l.fecha_inicio';
    
    try {
      const params = idPaciente ? [idPaciente] : [];
      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener licencias vigentes: ${error.message}`);
    }
  }

  // Actualiza una licencia médica
  static async actualizar(id, licenciaActualizada) {
    const query = `
      UPDATE licencias_medicas 
      SET 
        id_paciente = $2,
        id_profesional = $3,
        id_cita = $4,
        fecha_inicio = $5,
        fecha_termino = $6,
        diagnostico = $7,
        tipo_reposo = $8,
        observaciones = $9
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      licenciaActualizada.id_paciente,
      licenciaActualizada.id_profesional,
      licenciaActualizada.id_cita,
      licenciaActualizada.fecha_inicio,
      licenciaActualizada.fecha_termino,
      licenciaActualizada.diagnostico,
      licenciaActualizada.tipo_reposo,
      licenciaActualizada.observaciones
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar licencia: ${error.message}`);
    }
  }

  // Elimina una licencia médica
  static async eliminar(id) {
    const query = 'DELETE FROM licencias_medicas WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar licencia: ${error.message}`);
    }
  }

  // Calcula días totales de la licencia
  static calcularDiasTotales(fechaInicio, fechaTermino) {
    const inicio = new Date(fechaInicio);
    const termino = new Date(fechaTermino);
    const diferenciaTiempo = termino.getTime() - inicio.getTime();
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    return diferenciaDias + 1; // Incluye ambos días
  }

  // Genera PDF de la licencia (función simulada)
  static async generarPDF(idLicencia) {
    try {
      // Aquí se integraría con alguna biblioteca de generación de PDF
      const licencia = await this.obtenerPorId(idLicencia);
      
      if (!licencia) {
        throw new Error('Licencia no encontrada');
      }
      
      // Simulamos la generación del PDF
      const pdfUrl = `/licencias/pdf/${idLicencia}.pdf`;
      
      return {
        success: true,
        licencia: licencia,
        pdfUrl: pdfUrl,
        message: 'PDF generado correctamente'
      };
    } catch (error) {
      throw new Error(`Error al generar PDF: ${error.message}`);
    }
  }
}

export default Licencia; 