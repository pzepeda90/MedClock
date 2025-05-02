import Medicamento from '../models/medicamento.model.js';

// Crear un nuevo medicamento
export const crearMedicamento = async (req, res) => {
  try {
    const {
      nombre,
      principio_activo,
      presentacion,
      concentracion,
      indicaciones
    } = req.body;

    // Verificar campos obligatorios
    if (!nombre || !principio_activo) {
      return res.status(400).json({
        error: true,
        mensaje: 'Nombre y principio activo son obligatorios'
      });
    }

    // Verificar si ya existe un medicamento con el mismo nombre
    const medicamentoExistente = await Medicamento.obtenerPorNombre(nombre);
    if (medicamentoExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ya existe un medicamento con ese nombre'
      });
    }

    // Crear el nuevo medicamento
    const nuevoMedicamento = {
      nombre,
      principio_activo,
      presentacion: presentacion || null,
      concentracion: concentracion || null,
      indicaciones: indicaciones || null
    };

    const medicamentoCreado = await Medicamento.crear(nuevoMedicamento);

    res.status(201).json({
      error: false,
      mensaje: 'Medicamento creado exitosamente',
      medicamento: medicamentoCreado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear medicamento: ${error.message}`
    });
  }
};

// Obtener un medicamento por su ID
export const obtenerMedicamentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const medicamento = await Medicamento.obtenerPorId(id);

    if (!medicamento) {
      return res.status(404).json({
        error: true,
        mensaje: 'Medicamento no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      medicamento
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener medicamento: ${error.message}`
    });
  }
};

// Obtener todos los medicamentos
export const obtenerMedicamentos = async (req, res) => {
  try {
    const { principio_activo, nombre } = req.query;

    let medicamentos;

    if (principio_activo) {
      medicamentos = await Medicamento.obtenerPorPrincipioActivo(principio_activo);
    } else if (nombre) {
      const medicamento = await Medicamento.obtenerPorNombre(nombre);
      medicamentos = medicamento ? [medicamento] : [];
    } else {
      medicamentos = await Medicamento.obtenerTodos();
    }

    res.status(200).json({
      error: false,
      total: medicamentos.length,
      medicamentos
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener medicamentos: ${error.message}`
    });
  }
};

// Buscar medicamentos por nombre, principio activo o indicaciones
export const buscarMedicamentos = async (req, res) => {
  try {
    const { termino } = req.query;

    if (!termino) {
      return res.status(400).json({
        error: true,
        mensaje: 'Se requiere un término de búsqueda'
      });
    }

    const resultados = await Medicamento.buscar(termino);

    res.status(200).json({
      error: false,
      total: resultados.length,
      resultados
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al buscar medicamentos: ${error.message}`
    });
  }
};

// Actualizar un medicamento
export const actualizarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el medicamento existe
    const medicamentoExistente = await Medicamento.obtenerPorId(id);
    if (!medicamentoExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Medicamento no encontrado'
      });
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (datosActualizados.nombre && datosActualizados.nombre !== medicamentoExistente.nombre) {
      const medicamentoConMismoNombre = await Medicamento.obtenerPorNombre(datosActualizados.nombre);
      if (medicamentoConMismoNombre) {
        return res.status(400).json({
          error: true,
          mensaje: 'Ya existe otro medicamento con ese nombre'
        });
      }
    }

    // Actualizar el medicamento
    const medicamentoActualizado = await Medicamento.actualizar(id, datosActualizados);

    res.status(200).json({
      error: false,
      mensaje: 'Medicamento actualizado exitosamente',
      medicamento: medicamentoActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar medicamento: ${error.message}`
    });
  }
};

// Eliminar un medicamento
export const eliminarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el medicamento existe
    const medicamentoExistente = await Medicamento.obtenerPorId(id);
    if (!medicamentoExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Medicamento no encontrado'
      });
    }

    // Obtener recetas que incluyen este medicamento
    const recetas = await Medicamento.obtenerRecetas(id);
    
    // Si hay recetas asociadas, no permitir la eliminación
    if (recetas && recetas.length > 0) {
      return res.status(400).json({
        error: true,
        mensaje: 'No se puede eliminar el medicamento porque está siendo utilizado en recetas',
        recetas_asociadas: recetas.length
      });
    }

    // Eliminar el medicamento
    await Medicamento.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Medicamento eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar medicamento: ${error.message}`
    });
  }
};

// Obtener todas las recetas que incluyen este medicamento
export const obtenerRecetasMedicamento = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el medicamento existe
    const medicamentoExistente = await Medicamento.obtenerPorId(id);
    if (!medicamentoExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Medicamento no encontrado'
      });
    }

    const recetas = await Medicamento.obtenerRecetas(id);

    res.status(200).json({
      error: false,
      medicamento: {
        id: medicamentoExistente.id,
        nombre: medicamentoExistente.nombre
      },
      total: recetas.length,
      recetas
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener recetas del medicamento: ${error.message}`
    });
  }
}; 