import { db } from '../database/database.js';

class Horario {
  constructor(horario) {
    this.id = horario.id;
    this.id_profesional = horario.id_profesional;
    this.dia_semana = horario.dia_semana;
    this.hora_inicio = horario.hora_inicio;
    this.hora_fin = horario.hora_fin;
    this.consultorio_id = horario.consultorio_id;
  }

  // Crea un nuevo horario disponible
  static async crear(nuevoHorario) {
    const query = `
      INSERT INTO horarios_disponibles (
        id_profesional, dia_semana, hora_inicio, hora_fin, consultorio_id
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      nuevoHorario.id_profesional,
      nuevoHorario.dia_semana,
      nuevoHorario.hora_inicio,
      nuevoHorario.hora_fin,
      nuevoHorario.consultorio_id
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear horario disponible: ${error.message}`);
    }
  }

  // Obtiene un horario por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM horarios_disponibles WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener horario: ${error.message}`);
    }
  }

  // Obtiene todos los horarios de un profesional
  static async obtenerPorProfesional(idProfesional) {
    const query = `
      SELECT hd.*, c.nombre as consultorio_nombre 
      FROM horarios_disponibles hd
      JOIN consultorios c ON hd.consultorio_id = c.id
      WHERE hd.id_profesional = $1
      ORDER BY hd.dia_semana, hd.hora_inicio
    `;
    
    try {
      const { rows } = await db.query(query, [idProfesional]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener horarios por profesional: ${error.message}`);
    }
  }

  // Obtiene todos los horarios de un consultorio
  static async obtenerPorConsultorio(idConsultorio) {
    const query = `
      SELECT hd.*, u.nombre as profesional_nombre 
      FROM horarios_disponibles hd
      JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
      JOIN usuarios u ON ps.id_usuario = u.id
      WHERE hd.consultorio_id = $1
      ORDER BY hd.dia_semana, hd.hora_inicio, u.nombre
    `;
    
    try {
      const { rows } = await db.query(query, [idConsultorio]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener horarios por consultorio: ${error.message}`);
    }
  }

  // Obtiene todos los horarios disponibles
  static async obtenerTodos() {
    const query = `
      SELECT hd.*, u.nombre as profesional_nombre, c.nombre as consultorio_nombre 
      FROM horarios_disponibles hd
      JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
      JOIN usuarios u ON ps.id_usuario = u.id
      JOIN consultorios c ON hd.consultorio_id = c.id
      ORDER BY hd.dia_semana, hd.hora_inicio
    `;
    
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener todos los horarios: ${error.message}`);
    }
  }

  // Obtiene horarios disponibles por día de la semana
  static async obtenerPorDia(diaSemana) {
    const query = `
      SELECT hd.*, u.nombre as profesional_nombre, c.nombre as consultorio_nombre 
      FROM horarios_disponibles hd
      JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
      JOIN usuarios u ON ps.id_usuario = u.id
      JOIN consultorios c ON hd.consultorio_id = c.id
      WHERE hd.dia_semana = $1
      ORDER BY hd.hora_inicio, u.nombre
    `;
    
    try {
      const { rows } = await db.query(query, [diaSemana]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener horarios por día: ${error.message}`);
    }
  }

  // Actualiza un horario disponible
  static async actualizar(id, horarioActualizado) {
    const query = `
      UPDATE horarios_disponibles 
      SET 
        id_profesional = $2,
        dia_semana = $3,
        hora_inicio = $4,
        hora_fin = $5,
        consultorio_id = $6
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      horarioActualizado.id_profesional,
      horarioActualizado.dia_semana,
      horarioActualizado.hora_inicio,
      horarioActualizado.hora_fin,
      horarioActualizado.consultorio_id
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar horario: ${error.message}`);
    }
  }

  // Elimina un horario disponible
  static async eliminar(id) {
    const query = 'DELETE FROM horarios_disponibles WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar horario: ${error.message}`);
    }
  }

  // Verifica disponibilidad de un profesional en una fecha y hora específica
  static async verificarDisponibilidad(idProfesional, fecha, hora) {
    // Obtener el día de la semana (1-7, donde 1 es lunes)
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay() === 0 ? 7 : fechaObj.getDay();
    
    // Verificar si el profesional tiene horario ese día de la semana
    const query = `
      SELECT * FROM horarios_disponibles 
      WHERE id_profesional = $1 
      AND dia_semana = $2
      AND $3::time BETWEEN hora_inicio AND hora_fin
    `;
    
    try {
      const { rows } = await db.query(query, [idProfesional, diaSemana, hora]);
      
      // Si hay resultados, verificar que no haya citas ya agendadas en ese horario
      if (rows.length > 0) {
        const consultorioId = rows[0].consultorio_id;
        
        const citasQuery = `
          SELECT * FROM horas_agendadas 
          WHERE id_profesional = $1 
          AND fecha_hora::date = $2::date
          AND fecha_hora::time = $3::time
          AND estado IN ('reservada', 'reprogramada')
        `;
        
        const { rows: citasRows } = await db.query(citasQuery, [idProfesional, fecha, hora]);
        
        // Si no hay citas, el horario está disponible
        if (citasRows.length === 0) {
          return {
            disponible: true,
            horario: rows[0],
            consultorio_id: consultorioId
          };
        }
      }
      
      return { disponible: false };
    } catch (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`);
    }
  }
}

export default Horario; 