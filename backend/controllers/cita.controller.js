import Cita from '../models/cita.model.js';
import Horario from '../models/horario.model.js';
import Notificacion from '../models/notificacion.model.js';
import Paciente from '../models/paciente.model.js';
import Profesional from '../models/profesional.model.js';
import Servicio from '../models/servicio.model.js';

// Crear una nueva cita
export const crearCita = async (req, res) => {
  try {
    const { 
      id_paciente, 
      id_profesional, 
      id_servicio, 
      fecha_hora, 
      consultorio_id, 
      notas_previas 
    } = req.body;

    // Verificar si los campos obligatorios están presentes
    if (!id_paciente || !id_profesional || !fecha_hora) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Todos los campos obligatorios deben estar completos' 
      });
    }

    // Verificar disponibilidad en la fecha y hora especificada
    const fecha = new Date(fecha_hora).toISOString().split('T')[0];
    const hora = new Date(fecha_hora).toTimeString().split(' ')[0];
    
    const disponibilidad = await Horario.verificarDisponibilidad(id_profesional, fecha, hora);
    
    if (!disponibilidad.disponible) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'El profesional no tiene disponibilidad en esa fecha y hora' 
      });
    }

    // Si tenemos id_servicio, obtener la duración del servicio
    let duracion_min = 30; // Duración por defecto
    if (id_servicio) {
      const servicio = await Servicio.obtenerPorId(id_servicio);
      if (servicio) {
        duracion_min = servicio.duracion_min;
      }
    }

    // Crear la nueva cita
    const nuevaCita = {
      id_paciente,
      id_profesional,
      id_servicio: id_servicio || null,
      fecha_hora,
      fecha_solicitud: new Date(),
      duracion_min,
      estado: 'reservada',
      consultorio_id: consultorio_id || disponibilidad.consultorio_id,
      notas_previas: notas_previas || null,
      notas_posteriores: null
    };

    const citaCreada = await Cita.crear(nuevaCita);
    
    // Enviar notificaciones
    await Notificacion.notificarCitaAgendada(citaCreada.id);

    res.status(201).json({
      error: false,
      mensaje: 'Cita agendada exitosamente',
      cita: citaCreada
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al agendar cita: ${error.message}` 
    });
  }
};

// Obtener todas las citas
export const obtenerCitas = async (req, res) => {
  try {
    const { 
      id_paciente, 
      id_profesional, 
      fecha_desde, 
      fecha_hasta, 
      estado,
      consultorio_id
    } = req.query;

    let citas;

    if (id_paciente) {
      citas = await Cita.obtenerPorPaciente(id_paciente);
    } else if (id_profesional) {
      citas = await Cita.obtenerPorProfesional(id_profesional);
    } else if (fecha_desde && fecha_hasta) {
      citas = await Cita.obtenerPorRangoFechas(fecha_desde, fecha_hasta);
    } else if (estado) {
      citas = await Cita.obtenerPorEstado(estado);
    } else if (consultorio_id) {
      citas = await Cita.obtenerPorConsultorio(consultorio_id);
    } else {
      citas = await Cita.obtenerTodas();
    }

    res.status(200).json({
      error: false,
      citas
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al obtener citas: ${error.message}` 
    });
  }
};

// Obtener una cita por su ID
export const obtenerCitaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.obtenerPorId(id);

    if (!cita) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }

    res.status(200).json({
      error: false,
      cita
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al obtener la cita: ${error.message}` 
    });
  }
};

// Actualizar una cita
export const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    
    // Verificar si la cita existe
    const citaExistente = await Cita.obtenerPorId(id);
    if (!citaExistente) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }

    // Si se está actualizando fecha_hora, verificar disponibilidad
    if (datosActualizados.fecha_hora && datosActualizados.fecha_hora !== citaExistente.fecha_hora) {
      const fecha = new Date(datosActualizados.fecha_hora).toISOString().split('T')[0];
      const hora = new Date(datosActualizados.fecha_hora).toTimeString().split(' ')[0];
      
      const disponibilidad = await Horario.verificarDisponibilidad(
        datosActualizados.id_profesional || citaExistente.id_profesional,
        fecha,
        hora
      );
      
      if (!disponibilidad.disponible) {
        return res.status(400).json({ 
          error: true, 
          mensaje: 'El profesional no tiene disponibilidad en esa fecha y hora' 
        });
      }
      
      datosActualizados.consultorio_id = datosActualizados.consultorio_id || disponibilidad.consultorio_id;
    }

    // Actualizar la cita
    const citaActualizada = await Cita.actualizar(id, datosActualizados);

    res.status(200).json({
      error: false,
      mensaje: 'Cita actualizada exitosamente',
      cita: citaActualizada
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al actualizar la cita: ${error.message}` 
    });
  }
};

// Cambiar el estado de una cita
export const cambiarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Se requiere especificar el nuevo estado' 
      });
    }
    
    // Verificar si el estado es válido
    const estadosValidos = ['reservada', 'anulada', 'completada', 'reprogramada', 'no asistió'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Estado no válido' 
      });
    }
    
    // Actualizar el estado
    const citaActualizada = await Cita.actualizarEstado(id, estado);
    
    if (!citaActualizada) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }

    res.status(200).json({
      error: false,
      mensaje: `Estado de la cita actualizado a: ${estado}`,
      cita: citaActualizada
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al cambiar el estado de la cita: ${error.message}` 
    });
  }
};

// Eliminar una cita
export const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la cita existe
    const citaExistente = await Cita.obtenerPorId(id);
    if (!citaExistente) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }
    
    // Eliminar la cita
    await Cita.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Cita eliminada exitosamente'
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al eliminar la cita: ${error.message}` 
    });
  }
};

// Reprogramar una cita
export const reprogramarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { nueva_fecha_hora } = req.body;
    
    if (!nueva_fecha_hora) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Se requiere especificar la nueva fecha y hora' 
      });
    }
    
    // Verificar si la cita existe
    const citaExistente = await Cita.obtenerPorId(id);
    if (!citaExistente) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }
    
    // Verificar disponibilidad en la nueva fecha y hora
    const fecha = new Date(nueva_fecha_hora).toISOString().split('T')[0];
    const hora = new Date(nueva_fecha_hora).toTimeString().split(' ')[0];
    
    const disponibilidad = await Horario.verificarDisponibilidad(
      citaExistente.id_profesional,
      fecha,
      hora
    );
    
    if (!disponibilidad.disponible) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'El profesional no tiene disponibilidad en esa fecha y hora' 
      });
    }
    
    // Actualizar la cita
    const citaActualizada = await Cita.actualizar(id, {
      fecha_hora: nueva_fecha_hora,
      estado: 'reprogramada',
      consultorio_id: disponibilidad.consultorio_id
    });
    
    // Enviar notificaciones
    await Notificacion.notificarCitaAgendada(id);

    res.status(200).json({
      error: false,
      mensaje: 'Cita reprogramada exitosamente',
      cita: citaActualizada
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al reprogramar la cita: ${error.message}` 
    });
  }
};

// Verificar disponibilidad
export const verificarDisponibilidad = async (req, res) => {
  try {
    const { id_profesional, fecha, hora } = req.query;
    
    if (!id_profesional || !fecha || !hora) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Se requieren los parámetros id_profesional, fecha y hora' 
      });
    }
    
    const disponibilidad = await Horario.verificarDisponibilidad(id_profesional, fecha, hora);
    
    res.status(200).json({
      error: false,
      disponible: disponibilidad.disponible,
      consultorio_id: disponibilidad.consultorio_id,
      horario: disponibilidad.horario
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al verificar disponibilidad: ${error.message}` 
    });
  }
};

// Obtener disponibilidad de un profesional en un día específico
export const obtenerDisponibilidadDiaria = async (req, res) => {
  try {
    const { id_profesional, fecha } = req.query;
    
    if (!id_profesional || !fecha) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Se requieren los parámetros id_profesional y fecha' 
      });
    }
    
    // Obtener el día de la semana (1-7, donde 1 es lunes)
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay() === 0 ? 7 : fechaObj.getDay();
    
    // Obtener horarios disponibles del profesional para ese día
    const horarios = await Horario.obtenerPorProfesional(id_profesional);
    const horariosDelDia = horarios.filter(h => h.dia_semana === diaSemana);
    
    if (horariosDelDia.length === 0) {
      return res.status(200).json({
        error: false,
        mensaje: 'El profesional no tiene horarios disponibles ese día',
        horarios: []
      });
    }
    
    // Obtener citas ya agendadas ese día
    const citasDelDia = await Cita.obtenerPorFechaYProfesional(id_profesional, fecha);
    
    // Generar bloques horarios disponibles
    const horariosDisponibles = [];
    
    for (const horario of horariosDelDia) {
      let horaInicio = new Date(`${fecha}T${horario.hora_inicio}`);
      const horaFin = new Date(`${fecha}T${horario.hora_fin}`);
      
      // Suponemos bloques de 30 minutos
      const duracionBloque = 30; // en minutos
      
      while (horaInicio < horaFin) {
        const horaActual = horaInicio.toTimeString().slice(0, 5);
        
        // Verificar si esta hora ya está ocupada
        const ocupada = citasDelDia.some(cita => {
          const horaCita = new Date(cita.fecha_hora).toTimeString().slice(0, 5);
          return horaCita === horaActual;
        });
        
        if (!ocupada) {
          horariosDisponibles.push({
            hora: horaActual,
            consultorio_id: horario.consultorio_id,
            consultorio_nombre: horario.consultorio_nombre
          });
        }
        
        // Avanzar al siguiente bloque
        horaInicio = new Date(horaInicio.getTime() + duracionBloque * 60000);
      }
    }
    
    res.status(200).json({
      error: false,
      fecha,
      dia_semana: diaSemana,
      profesional_id: id_profesional,
      horarios_disponibles: horariosDisponibles
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al obtener disponibilidad: ${error.message}` 
    });
  }
};

// Registrar asistencia a cita
export const registrarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { asistio, notas_posteriores } = req.body;
    
    // Verificar si la cita existe
    const citaExistente = await Cita.obtenerPorId(id);
    if (!citaExistente) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }
    
    // Actualizar el estado según asistencia
    const nuevoEstado = asistio ? 'completada' : 'no asistió';
    
    const citaActualizada = await Cita.actualizar(id, {
      estado: nuevoEstado,
      notas_posteriores: notas_posteriores || citaExistente.notas_posteriores
    });

    res.status(200).json({
      error: false,
      mensaje: `Asistencia registrada como: ${nuevoEstado}`,
      cita: citaActualizada
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al registrar asistencia: ${error.message}` 
    });
  }
};

// Obtener próximas citas de un paciente
export const obtenerProximasCitasPaciente = async (req, res) => {
  try {
    const { id_paciente } = req.params;
    
    // Verificar si el paciente existe
    const paciente = await Paciente.obtenerPorId(id_paciente);
    if (!paciente) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Paciente no encontrado' 
      });
    }
    
    const citas = await Cita.obtenerProximasPorPaciente(id_paciente);
    
    res.status(200).json({
      error: false,
      citas
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al obtener próximas citas: ${error.message}` 
    });
  }
};

// Obtener próximas citas de un profesional
export const obtenerProximasCitasProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    
    // Verificar si el profesional existe
    const profesional = await Profesional.obtenerPorId(id_profesional);
    if (!profesional) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Profesional no encontrado' 
      });
    }
    
    const citas = await Cita.obtenerProximasPorProfesional(id_profesional);
    
    res.status(200).json({
      error: false,
      citas
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al obtener próximas citas: ${error.message}` 
    });
  }
};

// Obtener citas del día para un profesional
export const obtenerCitasDelDiaProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0]; // Fecha actual por defecto
    
    const citas = await Cita.obtenerPorFechaYProfesional(id_profesional, fecha);
    
    res.status(200).json({
      error: false,
      fecha,
      citas
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al obtener citas del día: ${error.message}` 
    });
  }
}; 