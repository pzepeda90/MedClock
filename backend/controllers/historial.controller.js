import Historial from '../models/historial.model.js';
import Paciente from '../models/paciente.model.js';
import Profesional from '../models/profesional.model.js';

// Crear un nuevo registro en el historial médico
export const crearHistorial = async (req, res) => {
  try {
    const {
      id_paciente,
      id_cita,
      id_profesional,
      diagnostico,
      tratamiento,
      receta,
      observaciones
    } = req.body;

    // Verificar campos obligatorios
    if (!id_paciente || !id_profesional || !diagnostico) {
      return res.status(400).json({
        error: true,
        mensaje: 'Campos obligatorios: id_paciente, id_profesional y diagnóstico'
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

    // Crear el nuevo registro
    const nuevoHistorial = {
      id_paciente,
      id_cita: id_cita || null,
      id_profesional,
      fecha: new Date(),
      diagnostico,
      tratamiento: tratamiento || null,
      receta: receta || null,
      observaciones: observaciones || null
    };

    const historialCreado = await Historial.crear(nuevoHistorial);

    res.status(201).json({
      error: false,
      mensaje: 'Registro de historial médico creado exitosamente',
      historial: historialCreado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear registro en historial médico: ${error.message}`
    });
  }
};

// Obtener un registro del historial por su ID
export const obtenerHistorialPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const historial = await Historial.obtenerPorId(id);

    if (!historial) {
      return res.status(404).json({
        error: true,
        mensaje: 'Registro de historial médico no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      historial
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener historial médico: ${error.message}`
    });
  }
};

// Obtener todo el historial médico de un paciente
export const obtenerHistorialPorPaciente = async (req, res) => {
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

    const historial = await Historial.obtenerPorPaciente(id_paciente);

    res.status(200).json({
      error: false,
      paciente: {
        id: paciente.id,
        nombre: paciente.nombre
      },
      historial
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener historial del paciente: ${error.message}`
    });
  }
};

// Obtener historiales médicos creados por un profesional
export const obtenerHistorialPorProfesional = async (req, res) => {
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

    const historial = await Historial.obtenerPorProfesional(id_profesional);

    res.status(200).json({
      error: false,
      profesional: {
        id: profesional.id,
        nombre: profesional.nombre
      },
      historial
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener historiales del profesional: ${error.message}`
    });
  }
};

// Obtener el historial asociado a una cita
export const obtenerHistorialPorCita = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const historial = await Historial.obtenerPorCita(id_cita);

    if (!historial) {
      return res.status(404).json({
        error: true,
        mensaje: 'No hay registros de historial médico para esta cita'
      });
    }

    res.status(200).json({
      error: false,
      historial
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener historial de la cita: ${error.message}`
    });
  }
};

// Buscar en el historial por diagnóstico o tratamiento
export const buscarHistorial = async (req, res) => {
  try {
    const { termino, id_paciente } = req.query;

    if (!termino) {
      return res.status(400).json({
        error: true,
        mensaje: 'Se requiere un término de búsqueda'
      });
    }

    const resultados = await Historial.buscar(termino, id_paciente || null);

    res.status(200).json({
      error: false,
      resultados
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al buscar en historial médico: ${error.message}`
    });
  }
};

// Actualizar un registro del historial
export const actualizarHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el historial existe
    const historialExistente = await Historial.obtenerPorId(id);
    if (!historialExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Registro de historial médico no encontrado'
      });
    }

    // Actualizar el registro
    const historialActualizado = await Historial.actualizar(id, datosActualizados);

    res.status(200).json({
      error: false,
      mensaje: 'Registro de historial médico actualizado exitosamente',
      historial: historialActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar historial médico: ${error.message}`
    });
  }
};

// Eliminar un registro del historial
export const eliminarHistorial = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el historial existe
    const historialExistente = await Historial.obtenerPorId(id);
    if (!historialExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Registro de historial médico no encontrado'
      });
    }

    // Eliminar el registro
    await Historial.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Registro de historial médico eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar historial médico: ${error.message}`
    });
  }
};

// Obtener todas las recetas asociadas a un historial
export const obtenerRecetasHistorial = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el historial existe
    const historialExistente = await Historial.obtenerPorId(id);
    if (!historialExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Registro de historial médico no encontrado'
      });
    }

    const recetas = await Historial.obtenerRecetas(id);

    res.status(200).json({
      error: false,
      historial_id: id,
      recetas
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener recetas del historial: ${error.message}`
    });
  }
}; 