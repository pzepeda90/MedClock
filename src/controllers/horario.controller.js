const Horario = require('../models/horario.model');
const Profesional = require('../models/profesional.model');
const Consultorio = require('../models/consultorio.model');

/**
 * Controlador para gestionar horarios disponibles
 */
class HorarioController {
  /**
   * Obtiene todos los horarios disponibles con opción de filtros
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getAll(req, res) {
    try {
      // Extraer los filtros de la consulta
      const { fecha, id_profesional, consultorio_id, estado, limit } = req.query;
      
      // Construir objeto de filtros
      const filters = {};
      if (fecha) filters.fecha = fecha;
      if (id_profesional) filters.id_profesional = parseInt(id_profesional);
      if (consultorio_id) filters.consultorio_id = parseInt(consultorio_id);
      if (estado) filters.estado = estado;
      if (limit) filters.limit = parseInt(limit);
      
      const horarios = await Horario.getAll(filters);
      
      res.json({
        error: false,
        data: horarios
      });
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los horarios disponibles'
      });
    }
  }

  /**
   * Obtiene un horario disponible por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de horario inválido'
        });
      }
      
      const horario = await Horario.getById(id);
      
      if (!horario) {
        return res.status(404).json({
          error: true,
          message: 'Horario no encontrado'
        });
      }
      
      res.json({
        error: false,
        data: horario
      });
    } catch (error) {
      console.error(`Error al obtener horario con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el horario'
      });
    }
  }

  /**
   * Crea un nuevo horario disponible
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async create(req, res) {
    try {
      const { 
        id_profesional,
        consultorio_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado
      } = req.body;
      
      // Validar que el profesional exista
      const profesional = await Profesional.getById(id_profesional);
      if (!profesional) {
        return res.status(400).json({
          error: true,
          message: 'El profesional indicado no existe'
        });
      }
      
      // Validar que el consultorio exista
      const consultorio = await Consultorio.getById(consultorio_id);
      if (!consultorio) {
        return res.status(400).json({
          error: true,
          message: 'El consultorio indicado no existe'
        });
      }
      
      // Datos para crear el horario
      const horarioData = {
        id_profesional,
        consultorio_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado
      };
      
      const newHorario = await Horario.create(horarioData);
      
      res.status(201).json({
        error: false,
        message: 'Horario disponible creado exitosamente',
        data: newHorario
      });
    } catch (error) {
      console.error('Error al crear horario disponible:', error);
      
      // Manejar errores específicos
      if (error.message.includes('solapa')) {
        return res.status(400).json({
          error: true,
          message: error.message
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al crear el horario disponible'
      });
    }
  }

  /**
   * Crea múltiples horarios disponibles en bloque
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async createBulk(req, res) {
    try {
      const { horarios } = req.body;
      
      if (!Array.isArray(horarios) || horarios.length === 0) {
        return res.status(400).json({
          error: true,
          message: 'Se debe proporcionar un array de horarios'
        });
      }
      
      const horariosCreados = await Horario.createBulk(horarios);
      
      res.status(201).json({
        error: false,
        message: `${horariosCreados.length} horarios disponibles creados exitosamente`,
        data: horariosCreados
      });
    } catch (error) {
      console.error('Error al crear horarios disponibles en bloque:', error);
      res.status(500).json({
        error: true,
        message: 'Error al crear los horarios disponibles'
      });
    }
  }

  /**
   * Actualiza un horario disponible existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de horario inválido'
        });
      }
      
      // Verificar si el horario existe
      const horario = await Horario.getById(id);
      
      if (!horario) {
        return res.status(404).json({
          error: true,
          message: 'Horario no encontrado'
        });
      }
      
      const { 
        id_profesional,
        consultorio_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado
      } = req.body;
      
      // Validar que el profesional exista si se está cambiando
      if (id_profesional && id_profesional !== horario.id_profesional) {
        const profesional = await Profesional.getById(id_profesional);
        if (!profesional) {
          return res.status(400).json({
            error: true,
            message: 'El profesional indicado no existe'
          });
        }
      }
      
      // Validar que el consultorio exista si se está cambiando
      if (consultorio_id && consultorio_id !== horario.consultorio_id) {
        const consultorio = await Consultorio.getById(consultorio_id);
        if (!consultorio) {
          return res.status(400).json({
            error: true,
            message: 'El consultorio indicado no existe'
          });
        }
      }
      
      // Datos para actualizar el horario
      const horarioData = {};
      if (id_profesional) horarioData.id_profesional = id_profesional;
      if (consultorio_id) horarioData.consultorio_id = consultorio_id;
      if (fecha) horarioData.fecha = fecha;
      if (hora_inicio) horarioData.hora_inicio = hora_inicio;
      if (hora_fin) horarioData.hora_fin = hora_fin;
      if (estado) horarioData.estado = estado;
      
      const updatedHorario = await Horario.update(id, horarioData);
      
      if (!updatedHorario) {
        return res.status(404).json({
          error: true,
          message: 'No se pudo actualizar el horario'
        });
      }
      
      res.json({
        error: false,
        message: 'Horario actualizado exitosamente',
        data: updatedHorario
      });
    } catch (error) {
      console.error(`Error al actualizar horario con ID ${req.params.id}:`, error);
      
      // Manejar errores específicos
      if (error.message.includes('solapa')) {
        return res.status(400).json({
          error: true,
          message: error.message
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al actualizar el horario'
      });
    }
  }

  /**
   * Elimina un horario disponible
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de horario inválido'
        });
      }
      
      // Verificar si el horario existe
      const horario = await Horario.getById(id);
      
      if (!horario) {
        return res.status(404).json({
          error: true,
          message: 'Horario no encontrado'
        });
      }
      
      try {
        const deleted = await Horario.delete(id);
        
        if (deleted) {
          res.json({
            error: false,
            message: 'Horario eliminado exitosamente'
          });
        } else {
          res.status(404).json({
            error: true,
            message: 'No se pudo eliminar el horario'
          });
        }
      } catch (deleteError) {
        // Capturar errores específicos de la operación de eliminación
        if (deleteError.message.includes('citas agendadas')) {
          return res.status(400).json({
            error: true,
            message: 'No se puede eliminar el horario porque ya tiene citas agendadas'
          });
        }
        
        throw deleteError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error(`Error al eliminar horario con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al eliminar el horario'
      });
    }
  }

  /**
   * Obtiene los horarios disponibles para un profesional en un rango de fechas
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getByProfesionalAndDateRange(req, res) {
    try {
      const id_profesional = parseInt(req.params.id_profesional);
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (isNaN(id_profesional)) {
        return res.status(400).json({
          error: true,
          message: 'ID de profesional inválido'
        });
      }
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      // Verificar que el profesional exista
      const profesional = await Profesional.getById(id_profesional);
      if (!profesional) {
        return res.status(404).json({
          error: true,
          message: 'Profesional no encontrado'
        });
      }
      
      const horarios = await Horario.getByProfesionalAndDateRange(id_profesional, fecha_inicio, fecha_fin);
      
      res.json({
        error: false,
        data: horarios
      });
    } catch (error) {
      console.error(`Error al obtener horarios para profesional ${req.params.id_profesional}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los horarios del profesional'
      });
    }
  }

  /**
   * Obtiene los horarios disponibles para un consultorio en un rango de fechas
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getByConsultorioAndDateRange(req, res) {
    try {
      const consultorio_id = parseInt(req.params.consultorio_id);
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (isNaN(consultorio_id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de consultorio inválido'
        });
      }
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      // Verificar que el consultorio exista
      const consultorio = await Consultorio.getById(consultorio_id);
      if (!consultorio) {
        return res.status(404).json({
          error: true,
          message: 'Consultorio no encontrado'
        });
      }
      
      const horarios = await Horario.getByConsultorioAndDateRange(consultorio_id, fecha_inicio, fecha_fin);
      
      res.json({
        error: false,
        data: horarios
      });
    } catch (error) {
      console.error(`Error al obtener horarios para consultorio ${req.params.consultorio_id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los horarios del consultorio'
      });
    }
  }

  /**
   * Obtiene los horarios disponibles para una especialidad en un rango de fechas
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getByEspecialidadAndDateRange(req, res) {
    try {
      const especialidad_id = parseInt(req.params.especialidad_id);
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (isNaN(especialidad_id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de especialidad inválido'
        });
      }
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: true,
          message: 'Se requieren las fechas de inicio y fin'
        });
      }
      
      const horarios = await Horario.getByEspecialidadAndDateRange(especialidad_id, fecha_inicio, fecha_fin);
      
      res.json({
        error: false,
        data: horarios
      });
    } catch (error) {
      console.error(`Error al obtener horarios para especialidad ${req.params.especialidad_id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los horarios de la especialidad'
      });
    }
  }
}

module.exports = HorarioController; 