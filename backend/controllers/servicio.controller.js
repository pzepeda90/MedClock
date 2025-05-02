import Servicio from '../models/servicio.model.js';
import Profesional from '../models/profesional.model.js';

// Crear un nuevo servicio
export const crearServicio = async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      duracion_min, 
      precio, 
      requiere_preparacion, 
      instrucciones_preparacion 
    } = req.body;

    // Verificar campos obligatorios
    if (!nombre || !duracion_min || !precio) {
      return res.status(400).json({
        error: true,
        mensaje: 'Nombre, duración y precio son obligatorios'
      });
    }

    // Verificar si ya existe un servicio con este nombre
    const servicioExistente = await Servicio.obtenerPorNombre(nombre);
    if (servicioExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ya existe un servicio con este nombre'
      });
    }

    // Crear el nuevo servicio
    const nuevoServicio = {
      nombre,
      descripcion: descripcion || null,
      duracion_min,
      precio,
      requiere_preparacion: requiere_preparacion || false,
      instrucciones_preparacion: instrucciones_preparacion || null
    };

    const servicioCreado = await Servicio.crear(nuevoServicio);

    res.status(201).json({
      error: false,
      mensaje: 'Servicio creado exitosamente',
      servicio: servicioCreado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear servicio: ${error.message}`
    });
  }
};

// Obtener un servicio por su ID
export const obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.obtenerPorId(id);

    if (!servicio) {
      return res.status(404).json({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      servicio
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener servicio: ${error.message}`
    });
  }
};

// Obtener todos los servicios
export const obtenerServicios = async (req, res) => {
  try {
    const { precio_min, precio_max, duracion } = req.query;
    
    let servicios;
    
    if (precio_min && precio_max) {
      servicios = await Servicio.obtenerPorRangoPrecio(precio_min, precio_max);
    } else if (duracion) {
      servicios = await Servicio.obtenerPorDuracion(duracion);
    } else {
      servicios = await Servicio.obtenerTodos();
    }

    res.status(200).json({
      error: false,
      total: servicios.length,
      servicios
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener servicios: ${error.message}`
    });
  }
};

// Actualizar un servicio
export const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el servicio existe
    const servicioExistente = await Servicio.obtenerPorId(id);
    if (!servicioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (datosActualizados.nombre && datosActualizados.nombre !== servicioExistente.nombre) {
      const servicioConMismoNombre = await Servicio.obtenerPorNombre(datosActualizados.nombre);
      if (servicioConMismoNombre) {
        return res.status(400).json({
          error: true,
          mensaje: 'Ya existe otro servicio con ese nombre'
        });
      }
    }

    // Actualizar el servicio
    const servicioActualizado = await Servicio.actualizar(id, {
      nombre: datosActualizados.nombre || servicioExistente.nombre,
      descripcion: datosActualizados.descripcion !== undefined ? datosActualizados.descripcion : servicioExistente.descripcion,
      duracion_min: datosActualizados.duracion_min || servicioExistente.duracion_min,
      precio: datosActualizados.precio || servicioExistente.precio,
      requiere_preparacion: datosActualizados.requiere_preparacion !== undefined ? datosActualizados.requiere_preparacion : servicioExistente.requiere_preparacion,
      instrucciones_preparacion: datosActualizados.instrucciones_preparacion !== undefined ? datosActualizados.instrucciones_preparacion : servicioExistente.instrucciones_preparacion
    });

    res.status(200).json({
      error: false,
      mensaje: 'Servicio actualizado exitosamente',
      servicio: servicioActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar servicio: ${error.message}`
    });
  }
};

// Eliminar un servicio
export const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el servicio existe
    const servicioExistente = await Servicio.obtenerPorId(id);
    if (!servicioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    }

    // Eliminar el servicio
    await Servicio.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Servicio eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar servicio: ${error.message}`
    });
  }
};

// Obtener profesionales que ofrecen un servicio
export const obtenerProfesionalesServicio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el servicio existe
    const servicioExistente = await Servicio.obtenerPorId(id);
    if (!servicioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    }

    const profesionales = await Servicio.obtenerProfesionales(id);

    res.status(200).json({
      error: false,
      servicio: {
        id: servicioExistente.id,
        nombre: servicioExistente.nombre
      },
      total: profesionales.length,
      profesionales
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener profesionales del servicio: ${error.message}`
    });
  }
};

// Asignar un profesional a un servicio
export const asignarProfesionalServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_profesional } = req.body;

    if (!id_profesional) {
      return res.status(400).json({
        error: true,
        mensaje: 'ID del profesional es obligatorio'
      });
    }

    // Verificar si el servicio existe
    const servicioExistente = await Servicio.obtenerPorId(id);
    if (!servicioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Servicio no encontrado'
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

    // Asignar el profesional
    const resultado = await Servicio.asignarProfesional(id, id_profesional);

    res.status(201).json({
      error: false,
      mensaje: 'Profesional asignado exitosamente',
      resultado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al asignar profesional: ${error.message}`
    });
  }
};

// Eliminar un profesional de un servicio
export const eliminarProfesionalServicio = async (req, res) => {
  try {
    const { id, id_profesional } = req.params;

    // Verificar si el servicio existe
    const servicioExistente = await Servicio.obtenerPorId(id);
    if (!servicioExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Servicio no encontrado'
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

    // Eliminar la asignación
    const resultado = await Servicio.eliminarProfesional(id, id_profesional);

    if (!resultado) {
      return res.status(404).json({
        error: true,
        mensaje: 'El profesional no está asignado a este servicio'
      });
    }

    res.status(200).json({
      error: false,
      mensaje: 'Profesional eliminado del servicio exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar profesional: ${error.message}`
    });
  }
}; 