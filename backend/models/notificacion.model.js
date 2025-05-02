import { db } from '../database/database.js';

class Notificacion {
  constructor(notificacion) {
    this.id = notificacion.id;
    this.id_usuario = notificacion.id_usuario;
    this.mensaje = notificacion.mensaje;
    this.leido = notificacion.leido;
    this.tipo = notificacion.tipo;
    this.fecha_envio = notificacion.fecha_envio;
    this.fecha_lectura = notificacion.fecha_lectura;
  }

  // Crea una nueva notificación
  static async crear(nuevaNotificacion) {
    const query = `
      INSERT INTO notificaciones (
        id_usuario, mensaje, leido, tipo, fecha_envio, fecha_lectura
      ) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      nuevaNotificacion.id_usuario,
      nuevaNotificacion.mensaje,
      nuevaNotificacion.leido || false,
      nuevaNotificacion.tipo,
      nuevaNotificacion.fecha_envio || 'NOW()',
      nuevaNotificacion.fecha_lectura
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear notificación: ${error.message}`);
    }
  }

  // Obtiene una notificación por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM notificaciones WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener notificación: ${error.message}`);
    }
  }

  // Obtiene todas las notificaciones de un usuario
  static async obtenerPorUsuario(idUsuario) {
    const query = `
      SELECT * FROM notificaciones 
      WHERE id_usuario = $1
      ORDER BY fecha_envio DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idUsuario]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones del usuario: ${error.message}`);
    }
  }

  // Obtiene todas las notificaciones no leídas de un usuario
  static async obtenerNoLeidasPorUsuario(idUsuario) {
    const query = `
      SELECT * FROM notificaciones 
      WHERE id_usuario = $1 AND leido = FALSE
      ORDER BY fecha_envio DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idUsuario]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones no leídas: ${error.message}`);
    }
  }

  // Obtiene notificaciones por tipo
  static async obtenerPorTipo(idUsuario, tipo) {
    const query = `
      SELECT * FROM notificaciones 
      WHERE id_usuario = $1 AND tipo = $2
      ORDER BY fecha_envio DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idUsuario, tipo]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones por tipo: ${error.message}`);
    }
  }

  // Marca una notificación como leída
  static async marcarComoLeida(id) {
    const query = `
      UPDATE notificaciones 
      SET leido = TRUE, fecha_lectura = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al marcar notificación como leída: ${error.message}`);
    }
  }

  // Marca todas las notificaciones de un usuario como leídas
  static async marcarTodasComoLeidas(idUsuario) {
    const query = `
      UPDATE notificaciones 
      SET leido = TRUE, fecha_lectura = NOW()
      WHERE id_usuario = $1 AND leido = FALSE
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [idUsuario]);
      return rows;
    } catch (error) {
      throw new Error(`Error al marcar todas las notificaciones como leídas: ${error.message}`);
    }
  }

  // Elimina una notificación
  static async eliminar(id) {
    const query = 'DELETE FROM notificaciones WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar notificación: ${error.message}`);
    }
  }

  // Elimina todas las notificaciones de un usuario
  static async eliminarTodas(idUsuario) {
    const query = 'DELETE FROM notificaciones WHERE id_usuario = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [idUsuario]);
      return rows;
    } catch (error) {
      throw new Error(`Error al eliminar todas las notificaciones: ${error.message}`);
    }
  }

  // Envia notificación de cita agendada
  static async notificarCitaAgendada(idCita) {
    try {
      // Obtener datos de la cita
      const citaQuery = `
        SELECT c.*, p.id_usuario as id_paciente, ps.id_usuario as id_profesional,
               u1.nombre as nombre_paciente, u2.nombre as nombre_profesional,
               s.nombre as nombre_servicio
        FROM horas_agendadas c
        JOIN pacientes p ON c.id_paciente = p.id_usuario
        JOIN usuarios u1 ON p.id_usuario = u1.id
        JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
        JOIN usuarios u2 ON ps.id_usuario = u2.id
        LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
        WHERE c.id = $1
      `;
      
      const { rows: citaRows } = await db.query(citaQuery, [idCita]);
      
      if (citaRows.length === 0) {
        throw new Error('Cita no encontrada');
      }
      
      const cita = citaRows[0];
      const fechaHora = new Date(cita.fecha_hora).toLocaleString();
      
      // Notificación para el paciente
      const notificacionPaciente = {
        id_usuario: cita.id_paciente,
        mensaje: `Su cita para ${cita.nombre_servicio} con ${cita.nombre_profesional} ha sido agendada para el ${fechaHora}.`,
        leido: false,
        tipo: 'cita_agendada'
      };
      
      // Notificación para el profesional
      const notificacionProfesional = {
        id_usuario: cita.id_profesional,
        mensaje: `Nueva cita agendada con ${cita.nombre_paciente} para ${cita.nombre_servicio} el ${fechaHora}.`,
        leido: false,
        tipo: 'cita_agendada'
      };
      
      // Crear ambas notificaciones
      await Notificacion.crear(notificacionPaciente);
      await Notificacion.crear(notificacionProfesional);
      
      return { 
        paciente: notificacionPaciente, 
        profesional: notificacionProfesional 
      };
    } catch (error) {
      throw new Error(`Error al enviar notificaciones de cita agendada: ${error.message}`);
    }
  }

  // Notifica recordatorio de cita
  static async notificarRecordatorioCita(idCita) {
    try {
      // Similar al método anterior pero con mensaje diferente
      const citaQuery = `
        SELECT c.*, p.id_usuario as id_paciente, ps.id_usuario as id_profesional,
               u1.nombre as nombre_paciente, u2.nombre as nombre_profesional,
               s.nombre as nombre_servicio
        FROM horas_agendadas c
        JOIN pacientes p ON c.id_paciente = p.id_usuario
        JOIN usuarios u1 ON p.id_usuario = u1.id
        JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
        JOIN usuarios u2 ON ps.id_usuario = u2.id
        LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
        WHERE c.id = $1
      `;
      
      const { rows: citaRows } = await db.query(citaQuery, [idCita]);
      
      if (citaRows.length === 0) {
        throw new Error('Cita no encontrada');
      }
      
      const cita = citaRows[0];
      const fechaHora = new Date(cita.fecha_hora).toLocaleString();
      
      // Solo notificación para el paciente en este caso
      const notificacionPaciente = {
        id_usuario: cita.id_paciente,
        mensaje: `Recordatorio: Su cita para ${cita.nombre_servicio} con ${cita.nombre_profesional} está programada para mañana a las ${fechaHora}.`,
        leido: false,
        tipo: 'recordatorio_cita'
      };
      
      await Notificacion.crear(notificacionPaciente);
      
      return notificacionPaciente;
    } catch (error) {
      throw new Error(`Error al enviar recordatorio de cita: ${error.message}`);
    }
  }
}

export default Notificacion; 