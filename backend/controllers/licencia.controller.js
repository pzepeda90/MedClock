import Licencia from '../models/licencia.model.js';
import Paciente from '../models/paciente.model.js';
import Profesional from '../models/profesional.model.js';
import Cita from '../models/cita.model.js';

// Crear una nueva licencia médica
export const crearLicencia = async (req, res) => {
  try {
    const {
      id_paciente,
      id_profesional,
      id_cita,
      fecha_inicio,
      fecha_termino,
      diagnostico,
      tipo_reposo,
      observaciones
    } = req.body;

    // Verificar campos obligatorios
    if (!id_paciente || !id_profesional || !fecha_inicio || !fecha_termino || !diagnostico) {
      return res.status(400).json({
        error: true,
        mensaje: 'Campos obligatorios: id_paciente, id_profesional, fecha_inicio, fecha_termino y diagnóstico'
      });
    }

    // Verificar si el paciente existe
    const paciente = await Paciente.obtenerPorId(id_paciente);
    if (!paciente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Paciente no encontrado'
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

    // Verificar si la cita existe (si se proporcionó)
    if (id_cita) {
      const cita = await Cita.obtenerPorId(id_cita);
      if (!cita) {
        return res.status(404).json({
          error: true,
          mensaje: 'Cita no encontrada'
        });
      }
    }

    // Verificar fechas
    const fechaInicio = new Date(fecha_inicio);
    const fechaTermino = new Date(fecha_termino);
    
    if (fechaTermino < fechaInicio) {
      return res.status(400).json({
        error: true,
        mensaje: 'La fecha de término no puede ser anterior a la fecha de inicio'
      });
    }

    // Crear la licencia
    const nuevaLicencia = {
      id_paciente,
      id_profesional,
      id_cita: id_cita || null,
      fecha_inicio,
      fecha_termino,
      diagnostico,
      tipo_reposo: tipo_reposo || 'total',
      observaciones: observaciones || null,
      fecha_emision: new Date()
    };

    const licenciaCreada = await Licencia.crear(nuevaLicencia);

    // Calcular días totales
    const diasTotales = Licencia.calcularDiasTotales(fecha_inicio, fecha_termino);

    res.status(201).json({
      error: false,
      mensaje: 'Licencia médica creada exitosamente',
      licencia: licenciaCreada,
      dias_totales: diasTotales
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear licencia médica: ${error.message}`
    });
  }
};

// Obtener una licencia por su ID
export const obtenerLicenciaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const licencia = await Licencia.obtenerPorId(id);

    if (!licencia) {
      return res.status(404).json({
        error: true,
        mensaje: 'Licencia médica no encontrada'
      });
    }

    // Calcular días totales
    const diasTotales = Licencia.calcularDiasTotales(licencia.fecha_inicio, licencia.fecha_termino);

    res.status(200).json({
      error: false,
      licencia,
      dias_totales: diasTotales
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener licencia médica: ${error.message}`
    });
  }
};

// Obtener todas las licencias de un paciente
export const obtenerLicenciasPorPaciente = async (req, res) => {
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

    const licencias = await Licencia.obtenerPorPaciente(id_paciente);

    res.status(200).json({
      error: false,
      paciente: {
        id: paciente.id,
        nombre: paciente.nombre
      },
      total: licencias.length,
      licencias
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener licencias del paciente: ${error.message}`
    });
  }
};

// Obtener todas las licencias emitidas por un profesional
export const obtenerLicenciasPorProfesional = async (req, res) => {
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

    const licencias = await Licencia.obtenerPorProfesional(id_profesional);

    res.status(200).json({
      error: false,
      profesional: {
        id: profesional.id,
        nombre: profesional.nombre
      },
      total: licencias.length,
      licencias
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener licencias emitidas por el profesional: ${error.message}`
    });
  }
};

// Obtener la licencia asociada a una cita
export const obtenerLicenciaPorCita = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const licencia = await Licencia.obtenerPorCita(id_cita);

    if (!licencia) {
      return res.status(404).json({
        error: true,
        mensaje: 'No hay licencia médica asociada a esta cita'
      });
    }

    // Calcular días totales
    const diasTotales = Licencia.calcularDiasTotales(licencia.fecha_inicio, licencia.fecha_termino);

    res.status(200).json({
      error: false,
      licencia,
      dias_totales: diasTotales
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener licencia de la cita: ${error.message}`
    });
  }
};

// Obtener licencias médicas vigentes
export const obtenerLicenciasVigentes = async (req, res) => {
  try {
    const { id_paciente } = req.query;
    const licencias = await Licencia.obtenerVigentes(id_paciente || null);

    res.status(200).json({
      error: false,
      total: licencias.length,
      licencias
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener licencias vigentes: ${error.message}`
    });
  }
};

// Actualizar una licencia médica
export const actualizarLicencia = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si la licencia existe
    const licenciaExistente = await Licencia.obtenerPorId(id);
    if (!licenciaExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Licencia médica no encontrada'
      });
    }

    // Verificar fechas si se están actualizando
    if (datosActualizados.fecha_inicio && datosActualizados.fecha_termino) {
      const fechaInicio = new Date(datosActualizados.fecha_inicio);
      const fechaTermino = new Date(datosActualizados.fecha_termino);
      
      if (fechaTermino < fechaInicio) {
        return res.status(400).json({
          error: true,
          mensaje: 'La fecha de término no puede ser anterior a la fecha de inicio'
        });
      }
    } else if (datosActualizados.fecha_inicio) {
      const fechaInicio = new Date(datosActualizados.fecha_inicio);
      const fechaTermino = new Date(licenciaExistente.fecha_termino);
      
      if (fechaTermino < fechaInicio) {
        return res.status(400).json({
          error: true,
          mensaje: 'La fecha de inicio no puede ser posterior a la fecha de término actual'
        });
      }
    } else if (datosActualizados.fecha_termino) {
      const fechaInicio = new Date(licenciaExistente.fecha_inicio);
      const fechaTermino = new Date(datosActualizados.fecha_termino);
      
      if (fechaTermino < fechaInicio) {
        return res.status(400).json({
          error: true,
          mensaje: 'La fecha de término no puede ser anterior a la fecha de inicio actual'
        });
      }
    }

    // Actualizar la licencia
    const licenciaActualizada = await Licencia.actualizar(id, datosActualizados);

    // Calcular días totales
    const diasTotales = Licencia.calcularDiasTotales(
      licenciaActualizada.fecha_inicio, 
      licenciaActualizada.fecha_termino
    );

    res.status(200).json({
      error: false,
      mensaje: 'Licencia médica actualizada exitosamente',
      licencia: licenciaActualizada,
      dias_totales: diasTotales
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar licencia médica: ${error.message}`
    });
  }
};

// Eliminar una licencia médica
export const eliminarLicencia = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la licencia existe
    const licenciaExistente = await Licencia.obtenerPorId(id);
    if (!licenciaExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Licencia médica no encontrada'
      });
    }

    // Eliminar la licencia
    await Licencia.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Licencia médica eliminada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar licencia médica: ${error.message}`
    });
  }
};

// Generar PDF de la licencia
export const generarPDFLicencia = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la licencia existe
    const licenciaExistente = await Licencia.obtenerPorId(id);
    if (!licenciaExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Licencia médica no encontrada'
      });
    }

    // Generar PDF (simulado en el modelo)
    const resultado = await Licencia.generarPDF(id);

    res.status(200).json({
      error: false,
      mensaje: resultado.message,
      licencia: resultado.licencia,
      pdf_url: resultado.pdfUrl
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al generar PDF de la licencia: ${error.message}`
    });
  }
}; 