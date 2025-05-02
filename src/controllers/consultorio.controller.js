const Consultorio = require('../models/consultorio.model');

/**
 * Controlador para gestionar consultorios
 */
class ConsultorioController {
  /**
   * Obtiene todos los consultorios
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getAll(req, res) {
    try {
      const consultorios = await Consultorio.getAll();
      res.json({
        error: false,
        data: consultorios
      });
    } catch (error) {
      console.error('Error al obtener consultorios:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los consultorios'
      });
    }
  }

  /**
   * Obtiene un consultorio por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de consultorio inválido'
        });
      }
      
      const consultorio = await Consultorio.getById(id);
      
      if (!consultorio) {
        return res.status(404).json({
          error: true,
          message: 'Consultorio no encontrado'
        });
      }
      
      res.json({
        error: false,
        data: consultorio
      });
    } catch (error) {
      console.error(`Error al obtener consultorio con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el consultorio'
      });
    }
  }

  /**
   * Crea un nuevo consultorio
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async create(req, res) {
    try {
      const { 
        nombre, 
        direccion, 
        telefono, 
        email, 
        coordenadas,
        horario_atencion,
        estado
      } = req.body;
      
      // Datos para crear el consultorio
      const consultorioData = {
        nombre,
        direccion,
        telefono,
        email,
        coordenadas,
        horario_atencion,
        estado
      };
      
      const newConsultorio = await Consultorio.create(consultorioData);
      
      res.status(201).json({
        error: false,
        message: 'Consultorio creado exitosamente',
        data: newConsultorio
      });
    } catch (error) {
      console.error('Error al crear consultorio:', error);
      
      // Manejar errores específicos
      if (error.message.includes('duplicate key') && error.message.includes('nombre')) {
        return res.status(400).json({
          error: true,
          message: 'Ya existe un consultorio con ese nombre'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al crear el consultorio'
      });
    }
  }

  /**
   * Actualiza un consultorio existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de consultorio inválido'
        });
      }
      
      // Verificar si el consultorio existe
      const consultorio = await Consultorio.getById(id);
      
      if (!consultorio) {
        return res.status(404).json({
          error: true,
          message: 'Consultorio no encontrado'
        });
      }
      
      const { 
        nombre, 
        direccion, 
        telefono, 
        email, 
        coordenadas,
        horario_atencion,
        estado
      } = req.body;
      
      // Datos para actualizar el consultorio
      const consultorioData = {};
      if (nombre) consultorioData.nombre = nombre;
      if (direccion) consultorioData.direccion = direccion;
      if (telefono !== undefined) consultorioData.telefono = telefono;
      if (email !== undefined) consultorioData.email = email;
      if (coordenadas !== undefined) consultorioData.coordenadas = coordenadas;
      if (horario_atencion !== undefined) consultorioData.horario_atencion = horario_atencion;
      if (estado) consultorioData.estado = estado;
      
      const updatedConsultorio = await Consultorio.update(id, consultorioData);
      
      res.json({
        error: false,
        message: 'Consultorio actualizado exitosamente',
        data: updatedConsultorio
      });
    } catch (error) {
      console.error(`Error al actualizar consultorio con ID ${req.params.id}:`, error);
      
      // Manejar errores específicos
      if (error.message.includes('duplicate key') && error.message.includes('nombre')) {
        return res.status(400).json({
          error: true,
          message: 'Ya existe otro consultorio con ese nombre'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al actualizar el consultorio'
      });
    }
  }

  /**
   * Elimina un consultorio
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de consultorio inválido'
        });
      }
      
      // Verificar si el consultorio existe
      const consultorio = await Consultorio.getById(id);
      
      if (!consultorio) {
        return res.status(404).json({
          error: true,
          message: 'Consultorio no encontrado'
        });
      }
      
      try {
        const deleted = await Consultorio.delete(id);
        
        if (deleted) {
          res.json({
            error: false,
            message: 'Consultorio eliminado exitosamente'
          });
        } else {
          // Este caso no debería ocurrir dado que ya verificamos existencia
          res.status(404).json({
            error: true,
            message: 'No se pudo eliminar el consultorio'
          });
        }
      } catch (deleteError) {
        // Capturar errores específicos de la operación de eliminación
        if (deleteError.message.includes('tiene horarios disponibles')) {
          return res.status(400).json({
            error: true,
            message: 'No se puede eliminar el consultorio porque tiene horarios disponibles asociados'
          });
        }
        
        if (deleteError.message.includes('tiene citas médicas')) {
          return res.status(400).json({
            error: true,
            message: 'No se puede eliminar el consultorio porque tiene citas médicas agendadas'
          });
        }
        
        throw deleteError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error(`Error al eliminar consultorio con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al eliminar el consultorio'
      });
    }
  }

  /**
   * Busca consultorios por nombre o dirección
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
      
      const consultorios = await Consultorio.search(q);
      
      res.json({
        error: false,
        data: consultorios
      });
    } catch (error) {
      console.error(`Error al buscar consultorios:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al buscar consultorios'
      });
    }
  }

  /**
   * Obtiene los profesionales que atienden en un consultorio
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getProfesionales(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de consultorio inválido'
        });
      }
      
      // Verificar si el consultorio existe
      const consultorio = await Consultorio.getById(id);
      
      if (!consultorio) {
        return res.status(404).json({
          error: true,
          message: 'Consultorio no encontrado'
        });
      }
      
      const profesionales = await Consultorio.getProfesionales(id);
      
      res.json({
        error: false,
        data: profesionales
      });
    } catch (error) {
      console.error(`Error al obtener profesionales del consultorio ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los profesionales'
      });
    }
  }

  /**
   * Obtiene los horarios disponibles en un consultorio
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getHorariosDisponibles(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de consultorio inválido'
        });
      }
      
      // Verificar si el consultorio existe
      const consultorio = await Consultorio.getById(id);
      
      if (!consultorio) {
        return res.status(404).json({
          error: true,
          message: 'Consultorio no encontrado'
        });
      }
      
      const horarios = await Consultorio.getHorariosDisponibles(id);
      
      res.json({
        error: false,
        data: horarios
      });
    } catch (error) {
      console.error(`Error al obtener horarios disponibles del consultorio ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los horarios disponibles'
      });
    }
  }
}

module.exports = ConsultorioController; 