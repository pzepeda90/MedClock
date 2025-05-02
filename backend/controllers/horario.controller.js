import Horario from '../models/horario.model.js';
import Profesional from '../models/profesional.model.js';
import Consultorio from '../models/consultorio.model.js';

// Crear un nuevo horario disponible
export const crearHorario = async (req, res) => {
  try {
    const { 
      id_profesional, 
      dia_semana, 
      hora_inicio, 
      hora_fin, 
      consultorio_id 
    } = req.body;

    // Verificar campos obligatorios
    if (!id_profesional || !dia_semana || !hora_inicio || !hora_fin || !consultorio_id) {
      return res.status(400).json({
        error: true,
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    // Verificar que el día de la semana sea válido (1-7, donde 1 es lunes)
    if (dia_semana < 1 || dia_semana > 7) {
      return res.status(400).json({
        error: true,
        mensaje: 'El día de la semana debe ser un número entre 1 y 7 (donde 1 es lunes)'
      });
    }

    // Verificar que la hora de inicio sea anterior a la hora de fin
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({
        error: true,
        mensaje: 'La hora de inicio debe ser anterior a la hora de fin'
      });
    }

    // Verificar si el profesional existe
    const profesional = await Profesional.obtenerPorId(id_profesional);
    if (!profesional) {
      return res.status(404).json({
        error: true,
        mensaje: 'Profesional no encontrado'
      });
    }

    // Verificar si el consultorio existe
    const consultorio = await Consultorio.obtenerPorId(consultorio_id);
    if (!consultorio) {
      return res.status(404).json({
        error: true,
        mensaje: 'Consultorio no encontrado'
      });
    }

    // Verificar si ya existe un horario solapado para este profesional
    const horariosProfesional = await Horario.obtenerPorProfesional(id_profesional);
    
    const horarioSolapado = horariosProfesional.find(h => 
      h.dia_semana === parseInt(dia_semana) && 
      ((hora_inicio >= h.hora_inicio && hora_inicio < h.hora_fin) || 
       (hora_fin > h.hora_inicio && hora_fin <= h.hora_fin) ||
       (hora_inicio <= h.hora_inicio && hora_fin >= h.hora_fin))
    );
    
    if (horarioSolapado) {
      return res.status(400).json({
        error: true,
        mensaje: 'El horario se solapa con otro horario existente para este profesional'
      });
    }

    // Crear el nuevo horario
    const nuevoHorario = {
      id_profesional,
      dia_semana,
      hora_inicio,
      hora_fin,
      consultorio_id
    };

    const horarioCreado = await Horario.crear(nuevoHorario);

    res.status(201).json({
      error: false,
      mensaje: 'Horario disponible creado exitosamente',
      horario: horarioCreado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear horario disponible: ${error.message}`
    });
  }
};

// Obtener un horario por su ID
export const obtenerHorarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const horario = await Horario.obtenerPorId(id);

    if (!horario) {
      return res.status(404).json({
        error: true,
        mensaje: 'Horario no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      horario
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener horario: ${error.message}`
    });
  }
};

// Obtener todos los horarios
export const obtenerHorarios = async (req, res) => {
  try {
    const { id_profesional, consultorio_id, dia_semana } = req.query;
    
    let horarios;
    
    if (id_profesional) {
      horarios = await Horario.obtenerPorProfesional(id_profesional);
    } else if (consultorio_id) {
      horarios = await Horario.obtenerPorConsultorio(consultorio_id);
    } else if (dia_semana) {
      horarios = await Horario.obtenerPorDia(dia_semana);
    } else {
      horarios = await Horario.obtenerTodos();
    }

    res.status(200).json({
      error: false,
      total: horarios.length,
      horarios
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener horarios: ${error.message}`
    });
  }
};

// Actualizar un horario
export const actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el horario existe
    const horarioExistente = await Horario.obtenerPorId(id);
    if (!horarioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Horario no encontrado'
      });
    }

    // Si se actualiza el día de la semana, verificar que sea válido
    if (datosActualizados.dia_semana && (datosActualizados.dia_semana < 1 || datosActualizados.dia_semana > 7)) {
      return res.status(400).json({
        error: true,
        mensaje: 'El día de la semana debe ser un número entre 1 y 7 (donde 1 es lunes)'
      });
    }

    // Si se actualizan las horas, verificar que la hora de inicio sea anterior a la hora de fin
    const horaInicio = datosActualizados.hora_inicio || horarioExistente.hora_inicio;
    const horaFin = datosActualizados.hora_fin || horarioExistente.hora_fin;
    
    if (horaInicio >= horaFin) {
      return res.status(400).json({
        error: true,
        mensaje: 'La hora de inicio debe ser anterior a la hora de fin'
      });
    }

    // Si se actualiza el profesional, verificar que exista
    if (datosActualizados.id_profesional) {
      const profesional = await Profesional.obtenerPorId(datosActualizados.id_profesional);
      if (!profesional) {
        return res.status(404).json({
          error: true,
          mensaje: 'Profesional no encontrado'
        });
      }
    }

    // Si se actualiza el consultorio, verificar que exista
    if (datosActualizados.consultorio_id) {
      const consultorio = await Consultorio.obtenerPorId(datosActualizados.consultorio_id);
      if (!consultorio) {
        return res.status(404).json({
          error: true,
          mensaje: 'Consultorio no encontrado'
        });
      }
    }

    // Verificar solapamiento solo si se cambian días u horas
    if (datosActualizados.dia_semana || datosActualizados.hora_inicio || datosActualizados.hora_fin) {
      const idProfesional = datosActualizados.id_profesional || horarioExistente.id_profesional;
      const diaSemana = datosActualizados.dia_semana || horarioExistente.dia_semana;
      
      const horariosProfesional = await Horario.obtenerPorProfesional(idProfesional);
      
      const horarioSolapado = horariosProfesional.find(h => 
        h.id !== parseInt(id) && 
        h.dia_semana === parseInt(diaSemana) && 
        ((horaInicio >= h.hora_inicio && horaInicio < h.hora_fin) || 
         (horaFin > h.hora_inicio && horaFin <= h.hora_fin) ||
         (horaInicio <= h.hora_inicio && horaFin >= h.hora_fin))
      );
      
      if (horarioSolapado) {
        return res.status(400).json({
          error: true,
          mensaje: 'El horario se solapa con otro horario existente para este profesional'
        });
      }
    }

    // Actualizar el horario
    const horarioActualizado = await Horario.actualizar(id, {
      id_profesional: datosActualizados.id_profesional || horarioExistente.id_profesional,
      dia_semana: datosActualizados.dia_semana || horarioExistente.dia_semana,
      hora_inicio: datosActualizados.hora_inicio || horarioExistente.hora_inicio,
      hora_fin: datosActualizados.hora_fin || horarioExistente.hora_fin,
      consultorio_id: datosActualizados.consultorio_id || horarioExistente.consultorio_id
    });

    res.status(200).json({
      error: false,
      mensaje: 'Horario actualizado exitosamente',
      horario: horarioActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar horario: ${error.message}`
    });
  }
};

// Eliminar un horario
export const eliminarHorario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el horario existe
    const horarioExistente = await Horario.obtenerPorId(id);
    if (!horarioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Horario no encontrado'
      });
    }

    // Eliminar el horario
    await Horario.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Horario eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar horario: ${error.message}`
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
        mensaje: 'Se requieren id_profesional, fecha y hora'
      });
    }

    const resultado = await Horario.verificarDisponibilidad(id_profesional, fecha, hora);

    res.status(200).json({
      error: false,
      disponible: resultado.disponible,
      consultorio_id: resultado.consultorio_id,
      horario: resultado.horario
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al verificar disponibilidad: ${error.message}`
    });
  }
}; 