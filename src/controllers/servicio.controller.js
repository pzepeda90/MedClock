const Servicio = require('../models/servicio.model');
const Especialidad = require('../models/especialidad.model');

/**
 * Controlador para gestionar servicios médicos
 */
class ServicioController {
  /**
   * Obtiene todos los servicios con opción de filtros
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getAll(req, res) {
    try {
      // Extraer los filtros de la consulta
      const { especialidad_id, estado } = req.query;
      
      // Construir objeto de filtros
      const filters = {};
      if (especialidad_id) filters.especialidad_id = parseInt(especialidad_id);
      if (estado) filters.estado = estado;
      
      const servicios = await Servicio.getAll(filters);
      
      res.json({
        error: false,
        data: servicios
      });
    } catch (error) {
      console.error('Error al obtener servicios médicos:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los servicios médicos'
      });
    }
  }

  /**
   * Obtiene un servicio por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de servicio inválido'
        });
      }
      
      const servicio = await Servicio.getById(id);
      
      if (!servicio) {
        return res.status(404).json({
          error: true,
          message: 'Servicio no encontrado'
        });
      }
      
      res.json({
        error: false,
        data: servicio
      });
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el servicio'
      });
    }
  }

  /**
   * Crea un nuevo servicio
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async create(req, res) {
    try {
      const { 
        nombre,
        descripcion,
        duracion_minutos,
        precio,
        especialidad_id,
        estado,
        requiere_autorizacion
      } = req.body;
      
      // Validar que la especialidad exista
      if (especialidad_id) {
        const especialidad = await Especialidad.getById(especialidad_id);
        if (!especialidad) {
          return res.status(400).json({
            error: true,
            message: 'La especialidad indicada no existe'
          });
        }
      }
      
      // Datos para crear el servicio
      const servicioData = {
        nombre,
        descripcion,
        duracion_minutos,
        precio,
        especialidad_id,
        estado,
        requiere_autorizacion
      };
      
      const newServicio = await Servicio.create(servicioData);
      
      res.status(201).json({
        error: false,
        message: 'Servicio médico creado exitosamente',
        data: newServicio
      });
    } catch (error) {
      console.error('Error al crear servicio médico:', error);
      res.status(500).json({
        error: true,
        message: 'Error al crear el servicio médico'
      });
    }
  }

  /**
   * Actualiza un servicio existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de servicio inválido'
        });
      }
      
      // Verificar si el servicio existe
      const servicio = await Servicio.getById(id);
      
      if (!servicio) {
        return res.status(404).json({
          error: true,
          message: 'Servicio no encontrado'
        });
      }
      
      const { 
        nombre,
        descripcion,
        duracion_minutos,
        precio,
        especialidad_id,
        estado,
        requiere_autorizacion
      } = req.body;
      
      // Validar que la especialidad exista si se está cambiando
      if (especialidad_id && especialidad_id !== servicio.especialidad_id) {
        const especialidad = await Especialidad.getById(especialidad_id);
        if (!especialidad) {
          return res.status(400).json({
            error: true,
            message: 'La especialidad indicada no existe'
          });
        }
      }
      
      // Datos para actualizar el servicio
      const servicioData = {};
      if (nombre !== undefined) servicioData.nombre = nombre;
      if (descripcion !== undefined) servicioData.descripcion = descripcion;
      if (duracion_minutos !== undefined) servicioData.duracion_minutos = duracion_minutos;
      if (precio !== undefined) servicioData.precio = precio;
      if (especialidad_id !== undefined) servicioData.especialidad_id = especialidad_id;
      if (estado !== undefined) servicioData.estado = estado;
      if (requiere_autorizacion !== undefined) servicioData.requiere_autorizacion = requiere_autorizacion;
      
      const updatedServicio = await Servicio.update(id, servicioData);
      
      if (!updatedServicio) {
        return res.status(404).json({
          error: true,
          message: 'No se pudo actualizar el servicio'
        });
      }
      
      res.json({
        error: false,
        message: 'Servicio actualizado exitosamente',
        data: updatedServicio
      });
    } catch (error) {
      console.error(`Error al actualizar servicio con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al actualizar el servicio'
      });
    }
  }

  /**
   * Elimina un servicio
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de servicio inválido'
        });
      }
      
      // Verificar si el servicio existe
      const servicio = await Servicio.getById(id);
      
      if (!servicio) {
        return res.status(404).json({
          error: true,
          message: 'Servicio no encontrado'
        });
      }
      
      try {
        const deleted = await Servicio.delete(id);
        
        if (deleted) {
          res.json({
            error: false,
            message: 'Servicio eliminado exitosamente'
          });
        } else {
          res.status(404).json({
            error: true,
            message: 'No se pudo eliminar el servicio'
          });
        }
      } catch (deleteError) {
        // Capturar errores específicos de la operación de eliminación
        if (deleteError.message.includes('citas agendadas')) {
          return res.status(400).json({
            error: true,
            message: 'No se puede eliminar el servicio porque ya está asociado a citas agendadas'
          });
        }
        
        throw deleteError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error(`Error al eliminar servicio con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al eliminar el servicio'
      });
    }
  }

  /**
   * Obtiene servicios por especialidad
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
      
      // Verificar que la especialidad exista
      const especialidad = await Especialidad.getById(especialidad_id);
      if (!especialidad) {
        return res.status(404).json({
          error: true,
          message: 'Especialidad no encontrada'
        });
      }
      
      const servicios = await Servicio.getByEspecialidad(especialidad_id);
      
      res.json({
        error: false,
        data: servicios
      });
    } catch (error) {
      console.error(`Error al obtener servicios para especialidad ${req.params.especialidad_id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los servicios de la especialidad'
      });
    }
  }
}

module.exports = ServicioController; 