import { db } from '../database/database.js';

class Receta {
  constructor(receta) {
    this.id = receta.id;
    this.id_historial = receta.id_historial;
    this.id_medicamento = receta.id_medicamento;
    this.dosis = receta.dosis;
    this.frecuencia = receta.frecuencia;
    this.duracion = receta.duracion;
    this.indicaciones_especiales = receta.indicaciones_especiales;
  }

  // Crea una nueva receta de medicamento
  static async crear(nuevaReceta) {
    const query = `
      INSERT INTO recetas_medicamentos (
        id_historial, id_medicamento, dosis, frecuencia, 
        duracion, indicaciones_especiales
      ) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      nuevaReceta.id_historial,
      nuevaReceta.id_medicamento,
      nuevaReceta.dosis,
      nuevaReceta.frecuencia,
      nuevaReceta.duracion,
      nuevaReceta.indicaciones_especiales
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear receta: ${error.message}`);
    }
  }

  // Obtiene una receta por su ID
  static async obtenerPorId(id) {
    const query = `
      SELECT r.*, m.nombre as medicamento_nombre, m.principio_activo,
             m.presentacion, m.concentracion
      FROM recetas_medicamentos r
      JOIN medicamentos m ON r.id_medicamento = m.id
      WHERE r.id = $1
    `;
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener receta: ${error.message}`);
    }
  }

  // Obtiene todas las recetas asociadas a un historial médico
  static async obtenerPorHistorial(idHistorial) {
    const query = `
      SELECT r.*, m.nombre as medicamento_nombre, m.principio_activo,
             m.presentacion, m.concentracion, m.indicaciones
      FROM recetas_medicamentos r
      JOIN medicamentos m ON r.id_medicamento = m.id
      WHERE r.id_historial = $1
      ORDER BY r.id
    `;
    
    try {
      const { rows } = await db.query(query, [idHistorial]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener recetas del historial: ${error.message}`);
    }
  }

  // Obtiene todas las recetas recetadas a un paciente
  static async obtenerPorPaciente(idPaciente) {
    const query = `
      SELECT r.*, m.nombre as medicamento_nombre, m.principio_activo,
             m.presentacion, m.concentracion,
             h.fecha as fecha_receta, u.nombre as profesional_nombre
      FROM recetas_medicamentos r
      JOIN historial_medico h ON r.id_historial = h.id
      JOIN medicamentos m ON r.id_medicamento = m.id
      JOIN usuarios u ON h.id_profesional = u.id
      WHERE h.id_paciente = $1
      ORDER BY h.fecha DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idPaciente]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener recetas del paciente: ${error.message}`);
    }
  }

  // Obtiene todas las recetas emitidas por un profesional
  static async obtenerPorProfesional(idProfesional) {
    const query = `
      SELECT r.*, m.nombre as medicamento_nombre,
             h.fecha as fecha_receta, u.nombre as paciente_nombre
      FROM recetas_medicamentos r
      JOIN historial_medico h ON r.id_historial = h.id
      JOIN medicamentos m ON r.id_medicamento = m.id
      JOIN usuarios u ON h.id_paciente = u.id
      WHERE h.id_profesional = $1
      ORDER BY h.fecha DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idProfesional]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener recetas emitidas por el profesional: ${error.message}`);
    }
  }

  // Actualiza una receta
  static async actualizar(id, recetaActualizada) {
    const query = `
      UPDATE recetas_medicamentos 
      SET 
        id_historial = $2,
        id_medicamento = $3,
        dosis = $4,
        frecuencia = $5,
        duracion = $6,
        indicaciones_especiales = $7
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      recetaActualizada.id_historial,
      recetaActualizada.id_medicamento,
      recetaActualizada.dosis,
      recetaActualizada.frecuencia,
      recetaActualizada.duracion,
      recetaActualizada.indicaciones_especiales
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar receta: ${error.message}`);
    }
  }

  // Elimina una receta
  static async eliminar(id) {
    const query = 'DELETE FROM recetas_medicamentos WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar receta: ${error.message}`);
    }
  }

  // Genera PDF de una receta (función simulada)
  static async generarPDF(idReceta) {
    try {
      // Aquí se integraría con alguna biblioteca de generación de PDF
      // como PDFKit, jsPDF, etc.
      const receta = await this.obtenerPorId(idReceta);
      
      if (!receta) {
        throw new Error('Receta no encontrada');
      }
      
      // Simulamos la generación del PDF
      const pdfUrl = `/recetas/pdf/${idReceta}.pdf`;
      
      return {
        success: true,
        receta: receta,
        pdfUrl: pdfUrl,
        message: 'PDF generado correctamente'
      };
    } catch (error) {
      throw new Error(`Error al generar PDF: ${error.message}`);
    }
  }
}

export default Receta; 