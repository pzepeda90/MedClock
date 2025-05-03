import Profesional from '../models/profesional.model.js';
import { userModel as Usuario } from '../models/user.model.js';
import Especialidad from '../models/especialidad.model.js';
import Servicio from '../models/servicio.model.js';

// Crear un nuevo profesional
export const crearProfesional = async (req, res) => {
  try {
    const { 
      id_usuario, 
      especialidad_id, 
      numero_registro, 
      biografia, 
      anos_experiencia, 
      educacion, 
      foto_url 
    } = req.body;

    // Verificar campos obligatorios
    if (!id_usuario || !especialidad_id || !numero_registro) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'ID de usuario, especialidad y número de registro son obligatorios' 
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

    // Verificar si la especialidad existe
    const especialidad = await Especialidad.obtenerPorId(especialidad_id);
    if (!especialidad) {
      return res.status(404).json({
        error: true,
        mensaje: 'Especialidad no encontrada'
      });
    }

    // Verificar si ya existe un profesional con este número de registro
    const profesionalExistente = await Profesional.obtenerPorNumeroRegistro(numero_registro);
    if (profesionalExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ya existe un profesional con este número de registro'
      });
    }

    // Crear el nuevo profesional
    const nuevoProfesional = {
      id_usuario,
      especialidad_id,
      numero_registro,
      biografia: biografia || null,
      anos_experiencia: anos_experiencia || 0,
      educacion: educacion || null,
      foto_url: foto_url || null
    };

    const profesionalCreado = await Profesional.crear(nuevoProfesional);

    res.status(201).json({
      error: false,
      mensaje: 'Profesional creado exitosamente',
      profesional: profesionalCreado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear profesional: ${error.message}`
    });
  }
};

// Obtener un profesional por su ID
export const obtenerProfesionalPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const profesional = await Profesional.obtenerPorId(id);

    if (!profesional) {
      return res.status(404).json({
        error: true,
        mensaje: 'Profesional no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      profesional
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener profesional: ${error.message}`
    });
  }
};

// Obtener todos los profesionales
export const obtenerProfesionales = async (req, res) => {
  try {
    const { especialidad_id } = req.query;
    
    let profesionales;
    
    if (especialidad_id) {
      profesionales = await Profesional.obtenerPorEspecialidad(especialidad_id);
    } else {
      profesionales = await Profesional.obtenerTodos();
    }

    res.status(200).json({
      error: false,
      total: profesionales.length,
      profesionales
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener profesionales: ${error.message}`
    });
  }
};

// Actualizar un profesional
export const actualizarProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el profesional existe
    const profesionalExistente = await Profesional.obtenerPorId(id);
    if (!profesionalExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Profesional no encontrado'
      });
    }

    // Si se está actualizando la especialidad, verificar que exista
    if (datosActualizados.especialidad_id) {
      const especialidad = await Especialidad.obtenerPorId(datosActualizados.especialidad_id);
      if (!especialidad) {
        return res.status(404).json({
          error: true,
          mensaje: 'Especialidad no encontrada'
        });
      }
    }

    // Si se está actualizando el número de registro, verificar que no exista otro con ese número
    if (datosActualizados.numero_registro && 
        datosActualizados.numero_registro !== profesionalExistente.numero_registro) {
      const profesionalConMismoRegistro = await Profesional.obtenerPorNumeroRegistro(datosActualizados.numero_registro);
      if (profesionalConMismoRegistro) {
        return res.status(400).json({
          error: true,
          mensaje: 'Ya existe otro profesional con ese número de registro'
        });
      }
    }

    // Actualizar el profesional
    const profesionalActualizado = await Profesional.actualizar(id, datosActualizados);

    res.status(200).json({
      error: false,
      mensaje: 'Profesional actualizado exitosamente',
      profesional: profesionalActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar profesional: ${error.message}`
    });
  }
};

// Eliminar un profesional
export const eliminarProfesional = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el profesional existe
    const profesionalExistente = await Profesional.obtenerPorId(id);
    if (!profesionalExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Profesional no encontrado'
      });
    }

    // Eliminar el profesional
    await Profesional.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Profesional eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar profesional: ${error.message}`
    });
  }
};

// Obtener servicios de un profesional
export const obtenerServiciosProfesional = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el profesional existe
    const profesionalExistente = await Profesional.obtenerPorId(id);
    if (!profesionalExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Profesional no encontrado'
      });
    }

    const servicios = await Profesional.obtenerServicios(id);

    res.status(200).json({
      error: false,
      total: servicios.length,
      servicios
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener servicios del profesional: ${error.message}`
    });
  }
};

// Asignar un servicio a un profesional
export const asignarServicioProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_servicio } = req.body;

    if (!id_servicio) {
      return res.status(400).json({
        error: true,
        mensaje: 'ID del servicio es obligatorio'
      });
    }

    // Verificar si el profesional existe
    const profesionalExistente = await Profesional.obtenerPorId(id);
    if (!profesionalExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Profesional no encontrado'
      });
    }

    // Verificar si el servicio existe
    const servicio = await Servicio.obtenerPorId(id_servicio);
    if (!servicio) {
      return res.status(404).json({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    }

    // Asignar el servicio
    const resultado = await Profesional.asignarServicio(id, id_servicio);

    res.status(201).json({
      error: false,
      mensaje: 'Servicio asignado exitosamente',
      resultado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al asignar servicio: ${error.message}`
    });
  }
};

// Eliminar un servicio de un profesional
export const eliminarServicioProfesional = async (req, res) => {
  try {
    const { id, id_servicio } = req.params;

    // Verificar si el profesional existe
    const profesionalExistente = await Profesional.obtenerPorId(id);
    if (!profesionalExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Profesional no encontrado'
      });
    }

    // Verificar si el servicio existe
    const servicio = await Servicio.obtenerPorId(id_servicio);
    if (!servicio) {
      return res.status(404).json({
        error: true,
        mensaje: 'Servicio no encontrado'
      });
    }

    // Eliminar la asignación
    const resultado = await Profesional.eliminarServicio(id, id_servicio);

    if (!resultado) {
      return res.status(404).json({
        error: true,
        mensaje: 'El servicio no está asignado a este profesional'
      });
    }

    res.status(200).json({
      error: false,
      mensaje: 'Servicio eliminado del profesional exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar servicio: ${error.message}`
    });
  }
}; 