const Diagnostico = require('../models/diagnostico.model');
const Cita = require('../models/cita.model');

/**
 * Controlador para gestionar diagnósticos médicos
 */
class DiagnosticoController {
  /**
   * Obtiene todos los diagnósticos con opción de filtros
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getAll(req, res) {
    try {
      // Extraer los filtros de la consulta
      const { codigo, nombre, categoria, limit } = req.query;
      
      // Construir objeto de filtros
      const filters = {};
      if (codigo) filters.codigo = codigo;
      if (nombre) filters.nombre = nombre;
      if (categoria) filters.categoria = categoria;
      if (limit) filters.limit = parseInt(limit);
      
      const diagnosticos = await Diagnostico.getAll(filters);
      
      res.json({
        error: false,
        data: diagnosticos
      });
    } catch (error) {
      console.error('Error al obtener diagnósticos:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los diagnósticos'
      });
    }
  }

  /**
   * Obtiene un diagnóstico por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de diagnóstico inválido'
        });
      }
      
      const diagnostico = await Diagnostico.getById(id);
      
      if (!diagnostico) {
        return res.status(404).json({
          error: true,
          message: 'Diagnóstico no encontrado'
        });
      }
      
      res.json({
        error: false,
        data: diagnostico
      });
    } catch (error) {
      console.error(`Error al obtener diagnóstico con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el diagnóstico'
      });
    }
  }

  /**
   * Obtiene un diagnóstico por su código
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getByCodigo(req, res) {
    try {
      const { codigo } = req.params;
      
      if (!codigo) {
        return res.status(400).json({
          error: true,
          message: 'Código de diagnóstico inválido'
        });
      }
      
      const diagnostico = await Diagnostico.getByCodigo(codigo);
      
      if (!diagnostico) {
        return res.status(404).json({
          error: true,
          message: 'Diagnóstico no encontrado'
        });
      }
      
      res.json({
        error: false,
        data: diagnostico
      });
    } catch (error) {
      console.error(`Error al obtener diagnóstico con código ${req.params.codigo}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el diagnóstico'
      });
    }
  }

  /**
   * Crea un nuevo diagnóstico
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async create(req, res) {
    try {
      const { 
        codigo,
        nombre,
        descripcion,
        categoria
      } = req.body;
      
      // Verificar si ya existe un diagnóstico con el mismo código
      const existente = await Diagnostico.getByCodigo(codigo);
      
      if (existente) {
        return res.status(400).json({
          error: true,
          message: `Ya existe un diagnóstico con el código ${codigo}`
        });
      }
      
      // Datos para crear el diagnóstico
      const diagnosticoData = {
        codigo,
        nombre,
        descripcion,
        categoria
      };
      
      const newDiagnostico = await Diagnostico.create(diagnosticoData);
      
      res.status(201).json({
        error: false,
        message: 'Diagnóstico creado exitosamente',
        data: newDiagnostico
      });
    } catch (error) {
      console.error('Error al crear diagnóstico:', error);
      res.status(500).json({
        error: true,
        message: 'Error al crear el diagnóstico'
      });
    }
  }

  /**
   * Actualiza un diagnóstico existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de diagnóstico inválido'
        });
      }
      
      // Verificar si el diagnóstico existe
      const diagnostico = await Diagnostico.getById(id);
      
      if (!diagnostico) {
        return res.status(404).json({
          error: true,
          message: 'Diagnóstico no encontrado'
        });
      }
      
      const { 
        codigo,
        nombre,
        descripcion,
        categoria
      } = req.body;
      
      // Si se está cambiando el código, verificar que no exista otro con ese código
      if (codigo && codigo !== diagnostico.codigo) {
        const existente = await Diagnostico.getByCodigo(codigo);
        
        if (existente && existente.id !== id) {
          return res.status(400).json({
            error: true,
            message: `Ya existe un diagnóstico con el código ${codigo}`
          });
        }
      }
      
      // Datos para actualizar el diagnóstico
      const diagnosticoData = {};
      if (codigo !== undefined) diagnosticoData.codigo = codigo;
      if (nombre !== undefined) diagnosticoData.nombre = nombre;
      if (descripcion !== undefined) diagnosticoData.descripcion = descripcion;
      if (categoria !== undefined) diagnosticoData.categoria = categoria;
      
      const updatedDiagnostico = await Diagnostico.update(id, diagnosticoData);
      
      if (!updatedDiagnostico) {
        return res.status(404).json({
          error: true,
          message: 'No se pudo actualizar el diagnóstico'
        });
      }
      
      res.json({
        error: false,
        message: 'Diagnóstico actualizado exitosamente',
        data: updatedDiagnostico
      });
    } catch (error) {
      console.error(`Error al actualizar diagnóstico con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al actualizar el diagnóstico'
      });
    }
  }

  /**
   * Elimina un diagnóstico
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de diagnóstico inválido'
        });
      }
      
      // Verificar si el diagnóstico existe
      const diagnostico = await Diagnostico.getById(id);
      
      if (!diagnostico) {
        return res.status(404).json({
          error: true,
          message: 'Diagnóstico no encontrado'
        });
      }
      
      try {
        const deleted = await Diagnostico.delete(id);
        
        if (deleted) {
          res.json({
            error: false,
            message: 'Diagnóstico eliminado exitosamente'
          });
        } else {
          res.status(404).json({
            error: true,
            message: 'No se pudo eliminar el diagnóstico'
          });
        }
      } catch (deleteError) {
        // Capturar errores específicos de la operación de eliminación
        if (deleteError.message.includes('está asociado a citas')) {
          return res.status(400).json({
            error: true,
            message: 'No se puede eliminar el diagnóstico porque está asociado a citas'
          });
        }
        
        throw deleteError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error(`Error al eliminar diagnóstico con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al eliminar el diagnóstico'
      });
    }
  }

  /**
   * Busca diagnósticos por término de búsqueda
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async search(req, res) {
    try {
      const { term, limit } = req.query;
      
      if (!term) {
        return res.status(400).json({
          error: true,
          message: 'Se requiere un término de búsqueda'
        });
      }
      
      const diagnosticos = await Diagnostico.search(term, limit ? parseInt(limit) : 10);
      
      res.json({
        error: false,
        data: diagnosticos
      });
    } catch (error) {
      console.error(`Error al buscar diagnósticos con término "${req.query.term}":`, error);
      res.status(500).json({
        error: true,
        message: 'Error al buscar diagnósticos'
      });
    }
  }

  /**
   * Asocia un diagnóstico a una cita
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async asociarACita(req, res) {
    try {
      const citaId = parseInt(req.params.citaId);
      const { diagnosticoId, notas } = req.body;
      
      if (isNaN(citaId) || !diagnosticoId) {
        return res.status(400).json({
          error: true,
          message: 'IDs de cita y diagnóstico son obligatorios'
        });
      }
      
      // Verificar que la cita exista
      const cita = await Cita.getById(citaId);
      if (!cita) {
        return res.status(404).json({
          error: true,
          message: 'Cita no encontrada'
        });
      }
      
      // Verificar que el diagnóstico exista
      const diagnostico = await Diagnostico.getById(diagnosticoId);
      if (!diagnostico) {
        return res.status(404).json({
          error: true,
          message: 'Diagnóstico no encontrado'
        });
      }
      
      // Verificar que la cita esté en estado completada
      if (cita.estado !== 'completada') {
        return res.status(400).json({
          error: true,
          message: 'Solo se pueden asociar diagnósticos a citas completadas'
        });
      }
      
      const relacion = await Diagnostico.asociarACita(citaId, diagnosticoId, notas);
      
      res.status(201).json({
        error: false,
        message: 'Diagnóstico asociado exitosamente a la cita',
        data: relacion
      });
    } catch (error) {
      console.error(`Error al asociar diagnóstico a cita:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al asociar diagnóstico a la cita'
      });
    }
  }

  /**
   * Obtiene diagnósticos asociados a una cita
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getDiagnosticosByCita(req, res) {
    try {
      const citaId = parseInt(req.params.citaId);
      
      if (isNaN(citaId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de cita inválido'
        });
      }
      
      // Verificar que la cita exista
      const cita = await Cita.getById(citaId);
      if (!cita) {
        return res.status(404).json({
          error: true,
          message: 'Cita no encontrada'
        });
      }
      
      const diagnosticos = await Diagnostico.getDiagnosticosByCita(citaId);
      
      res.json({
        error: false,
        data: diagnosticos
      });
    } catch (error) {
      console.error(`Error al obtener diagnósticos para la cita ${req.params.citaId}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los diagnósticos de la cita'
      });
    }
  }

  /**
   * Elimina la asociación de un diagnóstico con una cita
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async desasociarDeCita(req, res) {
    try {
      const citaId = parseInt(req.params.citaId);
      const diagnosticoId = parseInt(req.params.diagnosticoId);
      
      if (isNaN(citaId) || isNaN(diagnosticoId)) {
        return res.status(400).json({
          error: true,
          message: 'IDs de cita y diagnóstico inválidos'
        });
      }
      
      const desasociado = await Diagnostico.desasociarDeCita(citaId, diagnosticoId);
      
      if (desasociado) {
        res.json({
          error: false,
          message: 'Diagnóstico desasociado exitosamente de la cita'
        });
      } else {
        res.status(404).json({
          error: true,
          message: 'No se encontró la asociación entre la cita y el diagnóstico'
        });
      }
    } catch (error) {
      console.error(`Error al desasociar diagnóstico de cita:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al desasociar diagnóstico de la cita'
      });
    }
  }
}

module.exports = DiagnosticoController; 