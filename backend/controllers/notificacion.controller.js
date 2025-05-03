import Notificacion from '../models/notificacion.model.js';
import { userModel as Usuario } from '../models/user.model.js';
import Cita from '../models/cita.model.js';

// Crear una nueva notificación
export const crearNotificacion = async (req, res) => {
  try {
    const { 
      id_usuario, 
      mensaje, 
      tipo, 
      leido 
    } = req.body;

    // Verificar campos obligatorios
    if (!id_usuario || !mensaje || !tipo) {
      return res.status(400).json({
        error: true,
        mensaje: 'ID de usuario, mensaje y tipo son obligatorios'
      });
    }

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id_usuario);
    if (!usuario) {
      return res.status(404).json({
        error: true,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Crear la nueva notificación
    const nuevaNotificacion = {
      id_usuario,
      mensaje,
      tipo,
      leido: leido || false,
      fecha_envio: new Date()
    };

    const notificacionCreada = await Notificacion.crear(nuevaNotificacion);

    res.status(201).json({
      error: false,
      mensaje: 'Notificación creada exitosamente',
      notificacion: notificacionCreada
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear notificación: ${error.message}`
    });
  }
};

// Obtener una notificación por su ID
export const obtenerNotificacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await Notificacion.obtenerPorId(id);

    if (!notificacion) {
      return res.status(404).json({
        error: true,
        mensaje: 'Notificación no encontrada'
      });
    }

    res.status(200).json({
      error: false,
      notificacion
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener notificación: ${error.message}`
    });
  }
};

// Obtener notificaciones por usuario
export const obtenerNotificacionesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { no_leidas, tipo } = req.query;

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id_usuario);
    if (!usuario) {
      return res.status(404).json({
        error: true,
        mensaje: 'Usuario no encontrado'
      });
    }

    let notificaciones;

    if (no_leidas === 'true') {
      notificaciones = await Notificacion.obtenerNoLeidasPorUsuario(id_usuario);
    } else if (tipo) {
      notificaciones = await Notificacion.obtenerPorTipo(id_usuario, tipo);
    } else {
      notificaciones = await Notificacion.obtenerPorUsuario(id_usuario);
    }

    res.status(200).json({
      error: false,
      total: notificaciones.length,
      notificaciones
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener notificaciones: ${error.message}`
    });
  }
};

// Marcar notificación como leída
export const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la notificación existe
    const notificacionExistente = await Notificacion.obtenerPorId(id);
    if (!notificacionExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Notificación no encontrada'
      });
    }

    // Verificar si ya está marcada como leída
    if (notificacionExistente.leido) {
      return res.status(400).json({
        error: true,
        mensaje: 'La notificación ya está marcada como leída'
      });
    }

    // Marcar como leída
    const notificacionActualizada = await Notificacion.marcarComoLeida(id);

    res.status(200).json({
      error: false,
      mensaje: 'Notificación marcada como leída exitosamente',
      notificacion: notificacionActualizada
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al marcar notificación como leída: ${error.message}`
    });
  }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasComoLeidas = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id_usuario);
    if (!usuario) {
      return res.status(404).json({
        error: true,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Marcar todas como leídas
    const notificacionesActualizadas = await Notificacion.marcarTodasComoLeidas(id_usuario);

    res.status(200).json({
      error: false,
      mensaje: 'Todas las notificaciones han sido marcadas como leídas',
      total: notificacionesActualizadas.length
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al marcar notificaciones como leídas: ${error.message}`
    });
  }
};

// Eliminar una notificación
export const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la notificación existe
    const notificacionExistente = await Notificacion.obtenerPorId(id);
    if (!notificacionExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Notificación no encontrada'
      });
    }

    // Eliminar la notificación
    await Notificacion.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar notificación: ${error.message}`
    });
  }
};

// Eliminar todas las notificaciones de un usuario
export const eliminarTodasNotificaciones = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id_usuario);
    if (!usuario) {
      return res.status(404).json({
        error: true,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Eliminar todas las notificaciones
    const notificacionesEliminadas = await Notificacion.eliminarTodas(id_usuario);

    res.status(200).json({
      error: false,
      mensaje: 'Todas las notificaciones han sido eliminadas',
      total: notificacionesEliminadas.length
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar notificaciones: ${error.message}`
    });
  }
};

// Notificar cita agendada
export const notificarCitaAgendada = async (req, res) => {
  try {
    const { id_cita } = req.params;

    // Verificar si la cita existe
    const cita = await Cita.obtenerPorId(id_cita);
    if (!cita) {
      return res.status(404).json({
        error: true,
        mensaje: 'Cita no encontrada'
      });
    }

    // Enviar notificaciones
    const notificaciones = await Notificacion.notificarCitaAgendada(id_cita);

    res.status(200).json({
      error: false,
      mensaje: 'Notificaciones de cita agendada enviadas exitosamente',
      notificaciones
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al enviar notificaciones de cita agendada: ${error.message}`
    });
  }
};

// Notificar recordatorio de cita
export const notificarRecordatorioCita = async (req, res) => {
  try {
    const { id_cita } = req.params;

    // Verificar si la cita existe
    const cita = await Cita.obtenerPorId(id_cita);
    if (!cita) {
      return res.status(404).json({
        error: true,
        mensaje: 'Cita no encontrada'
      });
    }

    // Enviar notificación
    const notificacion = await Notificacion.notificarRecordatorioCita(id_cita);

    res.status(200).json({
      error: false,
      mensaje: 'Recordatorio de cita enviado exitosamente',
      notificacion
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al enviar recordatorio de cita: ${error.message}`
    });
  }
}; 