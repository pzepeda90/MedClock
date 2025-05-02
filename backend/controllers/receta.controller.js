import Receta from '../models/receta.model.js';
import Historial from '../models/historial.model.js';
import Medicamento from '../models/medicamento.model.js';

// Crear una nueva receta
export const crearReceta = async (req, res) => {
  try {
    const {
      id_historial,
      id_medicamento,
      dosis,
      frecuencia,
      duracion,
      indicaciones_especiales
    } = req.body;

    // Verificar campos obligatorios
    if (!id_historial || !id_medicamento || !dosis || !frecuencia) {
      return res.status(400).json({
        error: true,
        mensaje: 'Campos obligatorios: id_historial, id_medicamento, dosis y frecuencia'
      });
    }

    // Verificar si el historial existe
    const historial = await Historial.obtenerPorId(id_historial);
    if (!historial) {
      return res.status(404).json({
        error: true,
        mensaje: 'Historial médico no encontrado'
      });
    }

    // Verificar si el medicamento existe
    const medicamento = await Medicamento.obtenerPorId(id_medicamento);
    if (!medicamento) {
      return res.status(404).json({
        error: true,
        mensaje: 'Medicamento no encontrado'
      });
    }

    // Crear la receta
    const nuevaReceta = {
      id_historial,
      id_medicamento,
      dosis,
      frecuencia,
      duracion: duracion || null,
      indicaciones_especiales: indicaciones_especiales || null
    };

    const recetaCreada = await Receta.crear(nuevaReceta);

    res.status(201).json({
      error: false,
      mensaje: 'Receta creada exitosamente',
      receta: recetaCreada
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear receta: ${error.message}`
    });
  }
};

// Obtener una receta por su ID
export const obtenerRecetaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const receta = await Receta.obtenerPorId(id);

    if (!receta) {
      return res.status(404).json({
        error: true,
        mensaje: 'Receta no encontrada'
      });
    }

    res.status(200).json({
      error: false,
      receta
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener receta: ${error.message}`
    });
  }
};

// Obtener todas las recetas asociadas a un historial médico
export const obtenerRecetasPorHistorial = async (req, res) => {
  try {
    const { id_historial } = req.params;

    // Verificar si el historial existe
    const historial = await Historial.obtenerPorId(id_historial);
    if (!historial) {
      return res.status(404).json({
        error: true,
        mensaje: 'Historial médico no encontrado'
      });
    }

    const recetas = await Receta.obtenerPorHistorial(id_historial);

    res.status(200).json({
      error: false,
      historial_id: id_historial,
      total: recetas.length,
      recetas
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener recetas del historial: ${error.message}`
    });
  }
};

// Obtener todas las recetas recetadas a un paciente
export const obtenerRecetasPorPaciente = async (req, res) => {
  try {
    const { id_paciente } = req.params;
    const recetas = await Receta.obtenerPorPaciente(id_paciente);

    res.status(200).json({
      error: false,
      paciente_id: id_paciente,
      total: recetas.length,
      recetas
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener recetas del paciente: ${error.message}`
    });
  }
};

// Obtener todas las recetas emitidas por un profesional
export const obtenerRecetasPorProfesional = async (req, res) => {
  try {
    const { id_profesional } = req.params;
    const recetas = await Receta.obtenerPorProfesional(id_profesional);

    res.status(200).json({
      error: false,
      profesional_id: id_profesional,
      total: recetas.length,
      recetas
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener recetas emitidas por el profesional: ${error.message}`
    });
  }
};

// Actualizar una receta
export const actualizarReceta = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si la receta existe
    const recetaExistente = await Receta.obtenerPorId(id);
    if (!recetaExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Receta no encontrada'
      });
    }

    // Si se actualiza el medicamento, verificar que exista
    if (datosActualizados.id_medicamento && 
        datosActualizados.id_medicamento !== recetaExistente.id_medicamento) {
      const medicamento = await Medicamento.obtenerPorId(datosActualizados.id_medicamento);
      if (!medicamento) {
        return res.status(404).json({
          error: true,
          mensaje: 'Medicamento no encontrado'
        });
      }
    }

    // Si se actualiza el historial, verificar que exista
    if (datosActualizados.id_historial && 
        datosActualizados.id_historial !== recetaExistente.id_historial) {
      const historial = await Historial.obtenerPorId(datosActualizados.id_historial);
      if (!historial) {
        return res.status(404).json({
          error: true,
          mensaje: 'Historial médico no encontrado'
        });
      }
    }

    // Actualizar la receta
    const recetaActualizada = await Receta.actualizar(id, datosActualizados);

    res.status(200).json({
      error: false,
      mensaje: 'Receta actualizada exitosamente',
      receta: recetaActualizada
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar receta: ${error.message}`
    });
  }
};

// Eliminar una receta
export const eliminarReceta = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la receta existe
    const recetaExistente = await Receta.obtenerPorId(id);
    if (!recetaExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Receta no encontrada'
      });
    }

    // Eliminar la receta
    await Receta.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Receta eliminada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar receta: ${error.message}`
    });
  }
};

// Generar PDF de una receta
export const generarPDFReceta = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la receta existe
    const recetaExistente = await Receta.obtenerPorId(id);
    if (!recetaExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Receta no encontrada'
      });
    }

    // Generar PDF (simulado en el modelo)
    const resultado = await Receta.generarPDF(id);

    res.status(200).json({
      error: false,
      mensaje: resultado.message,
      receta: resultado.receta,
      pdf_url: resultado.pdfUrl
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al generar PDF de la receta: ${error.message}`
    });
  }
}; 