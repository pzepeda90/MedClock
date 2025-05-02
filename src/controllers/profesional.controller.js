const Profesional = require('../models/profesional.model');
const Especialidad = require('../models/especialidad.model');

/**
 * Controlador para gestionar profesionales de salud
 */
class ProfesionalController {
  /**
   * Obtiene todos los profesionales
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getAll(req, res) {
    try {
      const profesionales = await Profesional.getAll();
      res.json({
        error: false,
        data: profesionales
      });
    } catch (error) {
      console.error('Error al obtener profesionales:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los profesionales'
      });
    }
  }

  /**
   * Obtiene un profesional por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de profesional inválido'
        });
      }
      
      const profesional = await Profesional.getById(id);
      
      if (!profesional) {
        return res.status(404).json({
          error: true,
          message: 'Profesional no encontrado'
        });
      }
      
      res.json({
        error: false,
        data: profesional
      });
    } catch (error) {
      console.error(`Error al obtener profesional con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el profesional'
      });
    }
  }

  /**
   * Crea un nuevo profesional
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async create(req, res) {
    try {
      const { 
        nombre, email, password, rol, // Datos de usuario
        rut, especialidad_id, telefono, numero_registro, biografia // Datos de profesional
      } = req.body;
      
      // Verificar que el rol sea válido
      if (!['médico', 'enfermera', 'tens'].includes(rol)) {
        return res.status(400).json({
          error: true,
          message: 'Rol inválido para profesional de salud'
        });
      }
      
      // Verificar si el RUT ya está registrado
      if (rut) {
        const existingProfesional = await Profesional.getByRut(rut);
        if (existingProfesional) {
          return res.status(400).json({
            error: true,
            message: 'Ya existe un profesional con ese RUT'
          });
        }
      }
      
      // Verificar que la especialidad exista
      const especialidad = await Especialidad.getById(especialidad_id);
      if (!especialidad) {
        return res.status(400).json({
          error: true,
          message: 'La especialidad indicada no existe'
        });
      }
      
      // Datos para crear el usuario
      const userData = {
        nombre,
        email,
        password,
        rol
      };
      
      // Datos para crear el profesional
      const profesionalData = {
        rut,
        especialidad_id,
        telefono,
        numero_registro,
        biografia
      };
      
      const newProfesional = await Profesional.create(userData, profesionalData);
      
      res.status(201).json({
        error: false,
        message: 'Profesional creado exitosamente',
        data: newProfesional
      });
    } catch (error) {
      console.error('Error al crear profesional:', error);
      
      // Manejar errores específicos
      if (error.message.includes('duplicate key') && error.message.includes('email')) {
        return res.status(400).json({
          error: true,
          message: 'El email ya está registrado'
        });
      }
      
      if (error.message.includes('duplicate key') && error.message.includes('rut')) {
        return res.status(400).json({
          error: true,
          message: 'El RUT ya está registrado'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al crear el profesional'
      });
    }
  }

  /**
   * Actualiza un profesional existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de profesional inválido'
        });
      }
      
      // Verificar si el profesional existe
      const profesional = await Profesional.getById(id);
      
      if (!profesional) {
        return res.status(404).json({
          error: true,
          message: 'Profesional no encontrado'
        });
      }
      
      const { 
        nombre, email, password, rol, // Datos de usuario
        rut, especialidad_id, telefono, numero_registro, biografia // Datos de profesional
      } = req.body;
      
      // Verificar que el rol sea válido si se está actualizando
      if (rol && !['médico', 'enfermera', 'tens'].includes(rol)) {
        return res.status(400).json({
          error: true,
          message: 'Rol inválido para profesional de salud'
        });
      }
      
      // Verificar si se está intentando cambiar el RUT a uno ya existente
      if (rut && rut !== profesional.rut) {
        const existingProfesional = await Profesional.getByRut(rut);
        if (existingProfesional && existingProfesional.id_usuario !== id) {
          return res.status(400).json({
            error: true,
            message: 'Ya existe otro profesional con ese RUT'
          });
        }
      }
      
      // Verificar que la especialidad exista si se está actualizando
      if (especialidad_id && especialidad_id !== profesional.especialidad_id) {
        const especialidad = await Especialidad.getById(especialidad_id);
        if (!especialidad) {
          return res.status(400).json({
            error: true,
            message: 'La especialidad indicada no existe'
          });
        }
      }
      
      // Datos para actualizar el usuario
      const userData = {};
      if (nombre) userData.nombre = nombre;
      if (email) userData.email = email;
      if (password) userData.password = password;
      if (rol) userData.rol = rol;
      
      // Datos para actualizar el profesional
      const profesionalData = {};
      if (rut) profesionalData.rut = rut;
      if (especialidad_id) profesionalData.especialidad_id = especialidad_id;
      if (telefono !== undefined) profesionalData.telefono = telefono;
      if (numero_registro !== undefined) profesionalData.numero_registro = numero_registro;
      if (biografia !== undefined) profesionalData.biografia = biografia;
      
      const updatedProfesional = await Profesional.update(id, userData, profesionalData);
      
      res.json({
        error: false,
        message: 'Profesional actualizado exitosamente',
        data: updatedProfesional
      });
    } catch (error) {
      console.error(`Error al actualizar profesional con ID ${req.params.id}:`, error);
      
      // Manejar errores específicos
      if (error.message.includes('duplicate key') && error.message.includes('email')) {
        return res.status(400).json({
          error: true,
          message: 'El email ya está registrado por otro usuario'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al actualizar el profesional'
      });
    }
  }

  /**
   * Elimina un profesional
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de profesional inválido'
        });
      }
      
      // Verificar si el profesional existe
      const profesional = await Profesional.getById(id);
      
      if (!profesional) {
        return res.status(404).json({
          error: true,
          message: 'Profesional no encontrado'
        });
      }
      
      try {
        const deleted = await Profesional.delete(id);
        
        if (deleted) {
          res.json({
            error: false,
            message: 'Profesional eliminado exitosamente'
          });
        } else {
          // Este caso no debería ocurrir dado que ya verificamos existencia
          res.status(404).json({
            error: true,
            message: 'No se pudo eliminar el profesional'
          });
        }
      } catch (deleteError) {
        // Capturar errores específicos de la operación de eliminación
        if (deleteError.message.includes('tiene citas agendadas')) {
          return res.status(400).json({
            error: true,
            message: 'No se puede eliminar el profesional porque tiene citas agendadas'
          });
        }
        
        if (deleteError.message.includes('tiene horarios disponibles')) {
          return res.status(400).json({
            error: true,
            message: 'No se puede eliminar el profesional porque tiene horarios disponibles'
          });
        }
        
        throw deleteError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error(`Error al eliminar profesional con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al eliminar el profesional'
      });
    }
  }

  /**
   * Busca profesionales por nombre, email, especialidad o RUT
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          error: true,
          message: 'Se requiere un término de búsqueda'
        });
      }
      
      const profesionales = await Profesional.search(q);
      
      res.json({
        error: false,
        data: profesionales
      });
    } catch (error) {
      console.error(`Error al buscar profesionales:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al buscar profesionales'
      });
    }
  }

  /**
   * Obtiene profesionales por especialidad
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getByEspecialidad(req, res) {
    try {
      const especialidad_id = parseInt(req.params.especialidad_id);
      
      if (isNaN(especialidad_id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de especialidad inválido'
        });
      }
      
      // Verificar si la especialidad existe
      const especialidad = await Especialidad.getById(especialidad_id);
      
      if (!especialidad) {
        return res.status(404).json({
          error: true,
          message: 'Especialidad no encontrada'
        });
      }
      
      const profesionales = await Profesional.getByEspecialidad(especialidad_id);
      
      res.json({
        error: false,
        data: profesionales
      });
    } catch (error) {
      console.error(`Error al obtener profesionales por especialidad ${req.params.especialidad_id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los profesionales'
      });
    }
  }

  /**
   * Obtiene los horarios disponibles de un profesional
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getHorariosDisponibles(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de profesional inválido'
        });
      }
      
      // Verificar si el profesional existe
      const profesional = await Profesional.getById(id);
      
      if (!profesional) {
        return res.status(404).json({
          error: true,
          message: 'Profesional no encontrado'
        });
      }
      
      const horarios = await Profesional.getHorariosDisponibles(id);
      
      res.json({
        error: false,
        data: horarios
      });
    } catch (error) {
      console.error(`Error al obtener horarios disponibles del profesional ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los horarios disponibles'
      });
    }
  }

  /**
   * Obtiene las citas agendadas de un profesional
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getCitasAgendadas(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de profesional inválido'
        });
      }
      
      // Verificar si el profesional existe
      const profesional = await Profesional.getById(id);
      
      if (!profesional) {
        return res.status(404).json({
          error: true,
          message: 'Profesional no encontrado'
        });
      }
      
      const citas = await Profesional.getCitasAgendadas(id);
      
      res.json({
        error: false,
        data: citas
      });
    } catch (error) {
      console.error(`Error al obtener citas agendadas del profesional ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener las citas agendadas'
      });
    }
  }
}

module.exports = ProfesionalController; 