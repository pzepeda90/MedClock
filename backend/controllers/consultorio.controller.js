import Consultorio from '../models/consultorio.model.js';

// Crear un nuevo consultorio
export const crearConsultorio = async (req, res) => {
  try {
    const { 
      nombre, 
      direccion, 
      comuna, 
      region, 
      telefono, 
      email, 
      horario_apertura, 
      horario_cierre 
    } = req.body;

    // Verificar campos obligatorios
    if (!nombre || !direccion || !comuna || !region) {
      return res.status(400).json({
        error: true,
        mensaje: 'Nombre, dirección, comuna y región son obligatorios'
      });
    }

    // Verificar si ya existe un consultorio con este nombre
    const consultorioExistente = await Consultorio.obtenerPorNombre(nombre);
    if (consultorioExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ya existe un consultorio con este nombre'
      });
    }

    // Crear el nuevo consultorio
    const nuevoConsultorio = {
      nombre,
      direccion,
      comuna,
      region,
      telefono: telefono || null,
      email: email || null,
      horario_apertura: horario_apertura || null,
      horario_cierre: horario_cierre || null
    };

    const consultorioCreado = await Consultorio.crear(nuevoConsultorio);

    res.status(201).json({
      error: false,
      mensaje: 'Consultorio creado exitosamente',
      consultorio: consultorioCreado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear consultorio: ${error.message}`
    });
  }
};

// Obtener un consultorio por su ID
export const obtenerConsultorioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const consultorio = await Consultorio.obtenerPorId(id);

    if (!consultorio) {
      return res.status(404).json({
        error: true,
        mensaje: 'Consultorio no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      consultorio
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener consultorio: ${error.message}`
    });
  }
};

// Obtener todos los consultorios
export const obtenerConsultorios = async (req, res) => {
  try {
    const { comuna, region } = req.query;
    
    let consultorios;
    
    if (comuna) {
      consultorios = await Consultorio.obtenerPorComuna(comuna);
    } else if (region) {
      consultorios = await Consultorio.obtenerPorRegion(region);
    } else {
      consultorios = await Consultorio.obtenerTodos();
    }

    res.status(200).json({
      error: false,
      total: consultorios.length,
      consultorios
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener consultorios: ${error.message}`
    });
  }
};

// Actualizar un consultorio
export const actualizarConsultorio = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el consultorio existe
    const consultorioExistente = await Consultorio.obtenerPorId(id);
    if (!consultorioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Consultorio no encontrado'
      });
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (datosActualizados.nombre && datosActualizados.nombre !== consultorioExistente.nombre) {
      const consultorioConMismoNombre = await Consultorio.obtenerPorNombre(datosActualizados.nombre);
      if (consultorioConMismoNombre) {
        return res.status(400).json({
          error: true,
          mensaje: 'Ya existe otro consultorio con ese nombre'
        });
      }
    }

    // Actualizar el consultorio
    const consultorioActualizado = await Consultorio.actualizar(id, {
      nombre: datosActualizados.nombre || consultorioExistente.nombre,
      direccion: datosActualizados.direccion || consultorioExistente.direccion,
      comuna: datosActualizados.comuna || consultorioExistente.comuna,
      region: datosActualizados.region || consultorioExistente.region,
      telefono: datosActualizados.telefono !== undefined ? datosActualizados.telefono : consultorioExistente.telefono,
      email: datosActualizados.email !== undefined ? datosActualizados.email : consultorioExistente.email,
      horario_apertura: datosActualizados.horario_apertura !== undefined ? datosActualizados.horario_apertura : consultorioExistente.horario_apertura,
      horario_cierre: datosActualizados.horario_cierre !== undefined ? datosActualizados.horario_cierre : consultorioExistente.horario_cierre
    });

    res.status(200).json({
      error: false,
      mensaje: 'Consultorio actualizado exitosamente',
      consultorio: consultorioActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar consultorio: ${error.message}`
    });
  }
};

// Eliminar un consultorio
export const eliminarConsultorio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el consultorio existe
    const consultorioExistente = await Consultorio.obtenerPorId(id);
    if (!consultorioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Consultorio no encontrado'
      });
    }

    // Verificar si hay citas programadas en este consultorio
    const citas = await Consultorio.obtenerCitas(id);
    if (citas.length > 0) {
      return res.status(400).json({
        error: true,
        mensaje: 'No se puede eliminar el consultorio porque hay citas programadas',
        citas_programadas: citas.length
      });
    }

    // Eliminar el consultorio
    await Consultorio.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Consultorio eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar consultorio: ${error.message}`
    });
  }
};

// Obtener citas programadas en un consultorio
export const obtenerCitasConsultorio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el consultorio existe
    const consultorioExistente = await Consultorio.obtenerPorId(id);
    if (!consultorioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Consultorio no encontrado'
      });
    }

    const citas = await Consultorio.obtenerCitas(id);

    res.status(200).json({
      error: false,
      consultorio: {
        id: consultorioExistente.id,
        nombre: consultorioExistente.nombre
      },
      total: citas.length,
      citas
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener citas del consultorio: ${error.message}`
    });
  }
};

// Obtener profesionales que atienden en un consultorio
export const obtenerProfesionalesConsultorio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el consultorio existe
    const consultorioExistente = await Consultorio.obtenerPorId(id);
    if (!consultorioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Consultorio no encontrado'
      });
    }

    const profesionales = await Consultorio.obtenerProfesionales(id);

    res.status(200).json({
      error: false,
      consultorio: {
        id: consultorioExistente.id,
        nombre: consultorioExistente.nombre
      },
      total: profesionales.length,
      profesionales
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener profesionales del consultorio: ${error.message}`
    });
  }
}; 