const Especialidad = require('../models/especialidad.model');

/**
 * Controlador para gestionar las especialidades médicas
 */
class EspecialidadController {
  /**
   * Obtiene todas las especialidades
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getAll(req, res) {
    try {
      const especialidades = await Especialidad.getAll();
      res.json({
        error: false,
        data: especialidades
      });
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener las especialidades'
      });
    }
  }

  /**
   * Obtiene una especialidad por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de especialidad inválido'
        });
      }
      
      const especialidad = await Especialidad.getById(id);
      
      if (!especialidad) {
        return res.status(404).json({
          error: true,
          message: 'Especialidad no encontrada'
        });
      }
      
      res.json({
        error: false,
        data: especialidad
      });
    } catch (error) {
      console.error(`Error al obtener especialidad con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener la especialidad'
      });
    }
  }

  /**
   * Crea una nueva especialidad
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      
      // Verificar si ya existe una especialidad con el mismo nombre
      const especialidades = await Especialidad.search(nombre);
      const exists = especialidades.some(e => e.nombre.toLowerCase() === nombre.toLowerCase());
      
      if (exists) {
        return res.status(400).json({
          error: true,
          message: 'Ya existe una especialidad con ese nombre'
        });
      }
      
      const newEspecialidad = await Especialidad.create({ nombre, descripcion });
      
      res.status(201).json({
        error: false,
        message: 'Especialidad creada exitosamente',
        data: newEspecialidad
      });
    } catch (error) {
      console.error('Error al crear especialidad:', error);
      res.status(500).json({
        error: true,
        message: 'Error al crear la especialidad'
      });
    }
  }

  /**
   * Actualiza una especialidad existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de especialidad inválido'
        });
      }
      
      const { nombre, descripcion } = req.body;
      
      // Verificar si la especialidad existe
      const especialidad = await Especialidad.getById(id);
      
      if (!especialidad) {
        return res.status(404).json({
          error: true,
          message: 'Especialidad no encontrada'
        });
      }
      
      // Verificar si ya existe otra especialidad con el mismo nombre
      if (nombre && nombre.toLowerCase() !== especialidad.nombre.toLowerCase()) {
        const especialidades = await Especialidad.search(nombre);
        const exists = especialidades.some(e => e.nombre.toLowerCase() === nombre.toLowerCase());
        
        if (exists) {
          return res.status(400).json({
            error: true,
            message: 'Ya existe otra especialidad con ese nombre'
          });
        }
      }
      
      const updatedEspecialidad = await Especialidad.update(id, { 
        nombre: nombre || especialidad.nombre, 
        descripcion: descripcion !== undefined ? descripcion : especialidad.descripcion 
      });
      
      res.json({
        error: false,
        message: 'Especialidad actualizada exitosamente',
        data: updatedEspecialidad
      });
    } catch (error) {
      console.error(`Error al actualizar especialidad con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al actualizar la especialidad'
      });
    }
  }

  /**
   * Elimina una especialidad
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de especialidad inválido'
        });
      }
      
      // Verificar si hay profesionales con esta especialidad
      const profesionalesCount = await Especialidad.getProfesionalesCount(id);
      
      if (profesionalesCount > 0) {
        return res.status(400).json({
          error: true,
          message: `No se puede eliminar la especialidad porque está asociada a ${profesionalesCount} profesional(es)`
        });
      }
      
      const deleted = await Especialidad.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          error: true,
          message: 'Especialidad no encontrada'
        });
      }
      
      res.json({
        error: false,
        message: 'Especialidad eliminada exitosamente'
      });
    } catch (error) {
      console.error(`Error al eliminar especialidad con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al eliminar la especialidad'
      });
    }
  }

  /**
   * Busca especialidades por nombre
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async search(req, res) {
    try {
      const { nombre } = req.query;
      
      if (!nombre) {
        return res.status(400).json({
          error: true,
          message: 'Se requiere un término de búsqueda'
        });
      }
      
      const especialidades = await Especialidad.search(nombre);
      
      res.json({
        error: false,
        data: especialidades
      });
    } catch (error) {
      console.error(`Error al buscar especialidades:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al buscar especialidades'
      });
    }
  }
}

module.exports = EspecialidadController; 