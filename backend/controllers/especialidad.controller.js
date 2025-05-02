import Especialidad from '../models/especialidad.model.js';

// Crear una nueva especialidad
export const crearEspecialidad = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Verificar campos obligatorios
    if (!nombre) {
      return res.status(400).json({
        error: true,
        mensaje: 'El nombre de la especialidad es obligatorio'
      });
    }

    // Verificar si ya existe una especialidad con este nombre
    const especialidadExistente = await Especialidad.obtenerPorNombre(nombre);
    if (especialidadExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ya existe una especialidad con este nombre'
      });
    }

    // Crear la nueva especialidad
    const nuevaEspecialidad = {
      nombre,
      descripcion: descripcion || null
    };

    const especialidadCreada = await Especialidad.crear(nuevaEspecialidad);

    res.status(201).json({
      error: false,
      mensaje: 'Especialidad creada exitosamente',
      especialidad: especialidadCreada
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear especialidad: ${error.message}`
    });
  }
};

// Obtener una especialidad por su ID
export const obtenerEspecialidadPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const especialidad = await Especialidad.obtenerPorId(id);

    if (!especialidad) {
      return res.status(404).json({
        error: true,
        mensaje: 'Especialidad no encontrada'
      });
    }

    res.status(200).json({
      error: false,
      especialidad
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener especialidad: ${error.message}`
    });
  }
};

// Obtener todas las especialidades
export const obtenerEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.obtenerTodas();

    res.status(200).json({
      error: false,
      total: especialidades.length,
      especialidades
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener especialidades: ${error.message}`
    });
  }
};

// Actualizar una especialidad
export const actualizarEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    // Verificar si la especialidad existe
    const especialidadExistente = await Especialidad.obtenerPorId(id);
    if (!especialidadExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Especialidad no encontrada'
      });
    }

    // Si se está actualizando el nombre, verificar que no exista otra con ese nombre
    if (nombre && nombre !== especialidadExistente.nombre) {
      const especialidadConMismoNombre = await Especialidad.obtenerPorNombre(nombre);
      if (especialidadConMismoNombre) {
        return res.status(400).json({
          error: true,
          mensaje: 'Ya existe otra especialidad con ese nombre'
        });
      }
    }

    // Preparar datos actualizados
    const datosActualizados = {
      nombre: nombre || especialidadExistente.nombre,
      descripcion: descripcion !== undefined ? descripcion : especialidadExistente.descripcion
    };

    // Actualizar la especialidad
    const especialidadActualizada = await Especialidad.actualizar(id, datosActualizados);

    res.status(200).json({
      error: false,
      mensaje: 'Especialidad actualizada exitosamente',
      especialidad: especialidadActualizada
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar especialidad: ${error.message}`
    });
  }
};

// Eliminar una especialidad
export const eliminarEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la especialidad existe
    const especialidadExistente = await Especialidad.obtenerPorId(id);
    if (!especialidadExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Especialidad no encontrada'
      });
    }

    // Verificar si hay profesionales con esta especialidad
    const profesionales = await Especialidad.obtenerProfesionales(id);
    if (profesionales.length > 0) {
      return res.status(400).json({
        error: true,
        mensaje: 'No se puede eliminar la especialidad porque hay profesionales asociados',
        profesionales_asociados: profesionales.length
      });
    }

    // Eliminar la especialidad
    await Especialidad.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Especialidad eliminada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar especialidad: ${error.message}`
    });
  }
};

// Obtener profesionales de una especialidad
export const obtenerProfesionalesEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la especialidad existe
    const especialidadExistente = await Especialidad.obtenerPorId(id);
    if (!especialidadExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Especialidad no encontrada'
      });
    }

    const profesionales = await Especialidad.obtenerProfesionales(id);

    res.status(200).json({
      error: false,
      especialidad: {
        id: especialidadExistente.id,
        nombre: especialidadExistente.nombre
      },
      total: profesionales.length,
      profesionales
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener profesionales de la especialidad: ${error.message}`
    });
  }
}; 