const Cita = require('../models/cita.model');
const Horario = require('../models/horario.model');
const Paciente = require('../models/paciente.model');
const Servicio = require('../models/servicio.model');
const Profesional = require('../models/profesional.model');
const Diagnostico = require('../models/diagnostico.model');

/**
 * Controlador para gestionar horas agendadas (citas médicas)
 */
class CitaController {
  /**
   * Obtiene todas las citas con opción de filtros
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getAll(req, res) {
    try {
      // Extraer los filtros de la consulta
      const { 
        fecha, 
        id_profesional, 
        paciente_id, 
        especialidad_id,
        estado,
        fecha_inicio,
        fecha_fin 
      } = req.query;
      
      // Construir objeto de filtros
      const filters = {};
      if (fecha) filters.fecha = fecha;
      if (id_profesional) filters.id_profesional = parseInt(id_profesional);
      if (paciente_id) filters.paciente_id = parseInt(paciente_id);
      if (especialidad_id) filters.especialidad_id = parseInt(especialidad_id);
      if (estado) filters.estado = estado;
      
      // Si se proporcionaron ambas fechas, aplicar filtro por rango
      if (fecha_inicio && fecha_fin) {
        filters.rango_fechas = true;
        filters.fecha_inicio = fecha_inicio;
        filters.fecha_fin = fecha_fin;
      }
      
      const citas = await Cita.getAll(filters);
      
      res.json({
        error: false,
        data: citas
      });
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener las citas'
      });
    }
  }

  /**
   * Obtiene una cita por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de cita inválido'
        });
      }
      
      const cita = await Cita.getById(id);
      
      if (!cita) {
        return res.status(404).json({
          error: true,
          message: 'Cita no encontrada'
        });
      }
      
      res.json({
        error: false,
        data: cita
      });
    } catch (error) {
      console.error(`Error al obtener cita con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener la cita'
      });
    }
  }

  /**
   * Crea una nueva cita
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async create(req, res) {
    try {
      const { 
        horario_id,
        paciente_id,
        servicio_id,
        observaciones,
        motivo_consulta
      } = req.body;
      
      // Validaciones adicionales
      // Verificar que el horario exista
      const horario = await Horario.getById(horario_id);
      if (!horario) {
        return res.status(400).json({
          error: true,
          message: 'El horario indicado no existe'
        });
      }
      
      // Verificar que el paciente exista
      const paciente = await Paciente.getById(paciente_id);
      if (!paciente) {
        return res.status(400).json({
          error: true,
          message: 'El paciente indicado no existe'
        });
      }
      
      // Verificar que el servicio exista
      const servicio = await Servicio.getById(servicio_id);
      if (!servicio) {
        return res.status(400).json({
          error: true,
          message: 'El servicio indicado no existe'
        });
      }
      
      // Datos para crear la cita
      const citaData = {
        horario_id,
        paciente_id,
        servicio_id,
        observaciones,
        motivo_consulta
      };
      
      try {
        const newCita = await Cita.create(citaData);
        
        res.status(201).json({
          error: false,
          message: 'Cita agendada exitosamente',
          data: newCita
        });
      } catch (createError) {
        // Manejar errores específicos
        if (createError.message.includes('no está disponible')) {
          return res.status(400).json({
            error: true,
            message: 'El horario seleccionado no está disponible'
          });
        }
        
        throw createError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({
        error: true,
        message: 'Error al agendar la cita'
      });
    }
  }

  /**
   * Actualiza una cita existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de cita inválido'
        });
      }
      
      // Verificar si la cita existe
      const cita = await Cita.getById(id);
      
      if (!cita) {
        return res.status(404).json({
          error: true,
          message: 'Cita no encontrada'
        });
      }
      
      const { 
        horario_id,
        paciente_id,
        servicio_id,
        observaciones,
        motivo_consulta
      } = req.body;
      
      // Datos para actualizar la cita
      const citaData = {};
      if (horario_id) citaData.horario_id = horario_id;
      if (paciente_id) citaData.paciente_id = paciente_id;
      if (servicio_id) citaData.servicio_id = servicio_id;
      if (observaciones !== undefined) citaData.observaciones = observaciones;
      if (motivo_consulta !== undefined) citaData.motivo_consulta = motivo_consulta;
      
      try {
        const updatedCita = await Cita.update(id, citaData);
        
        if (!updatedCita) {
          return res.status(404).json({
            error: true,
            message: 'No se pudo actualizar la cita'
          });
        }
        
        res.json({
          error: false,
          message: 'Cita actualizada exitosamente',
          data: updatedCita
        });
      } catch (updateError) {
        // Manejar errores específicos
        if (updateError.message.includes('no está disponible')) {
          return res.status(400).json({
            error: true,
            message: 'El nuevo horario seleccionado no está disponible'
          });
        }
        
        throw updateError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error(`Error al actualizar cita con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al actualizar la cita'
      });
    }
  }

  /**
   * Cancela una cita
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async cancelar(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de cita inválido'
        });
      }
      
      const { motivo } = req.body;
      
      if (!motivo) {
        return res.status(400).json({
          error: true,
          message: 'Se requiere indicar el motivo de la cancelación'
        });
      }
      
      try {
        const citaCancelada = await Cita.cancelar(id, motivo);
        
        if (!citaCancelada) {
          return res.status(404).json({
            error: true,
            message: 'Cita no encontrada'
          });
        }
        
        res.json({
          error: false,
          message: 'Cita cancelada exitosamente',
          data: citaCancelada
        });
      } catch (cancelError) {
        // Manejar errores específicos
        if (cancelError.message.includes('No se puede cancelar')) {
          return res.status(400).json({
            error: true,
            message: cancelError.message
          });
        }
        
        throw cancelError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error(`Error al cancelar cita con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al cancelar la cita'
      });
    }
  }

  /**
   * Marca una cita como completada
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async completar(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { observaciones, diagnosticos } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de cita inválido'
        });
      }
      
      if (!observaciones) {
        return res.status(400).json({
          error: true,
          message: 'Las observaciones son obligatorias para completar una cita'
        });
      }
      
      // Verificar diagnósticos si se proporcionaron
      let diagnosticosValidados = [];
      if (diagnosticos && Array.isArray(diagnosticos) && diagnosticos.length > 0) {
        // Validar cada diagnóstico
        for (const diag of diagnosticos) {
          if (!diag.diagnosticoId) {
            return res.status(400).json({
              error: true,
              message: 'Todos los diagnósticos deben tener un ID válido'
            });
          }
          
          // Comprobar que el diagnóstico existe
          const diagnostico = await Diagnostico.getById(diag.diagnosticoId);
          if (!diagnostico) {
            return res.status(400).json({
              error: true,
              message: `El diagnóstico con ID ${diag.diagnosticoId} no existe`
            });
          }
          
          diagnosticosValidados.push({
            diagnosticoId: diag.diagnosticoId,
            notas: diag.notas || null
          });
        }
      }
      
      const cita = await Cita.completar(id, observaciones, diagnosticosValidados);
      
      if (!cita) {
        return res.status(404).json({
          error: true,
          message: 'Cita no encontrada o no se pudo completar'
        });
      }
      
      res.json({
        error: false,
        message: 'Cita completada exitosamente',
        data: cita
      });
    } catch (error) {
      console.error(`Error al completar cita:`, error);
      
      // Manejo de errores específicos
      if (error.message.includes('No se puede completar una cita en estado')) {
        return res.status(400).json({
          error: true,
          message: error.message
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al completar la cita'
      });
    }
  }

  /**
   * Elimina una cita
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de cita inválido'
        });
      }
      
      const deleted = await Cita.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          error: true,
          message: 'Cita no encontrada'
        });
      }
      
      res.json({
        error: false,
        message: 'Cita eliminada exitosamente'
      });
    } catch (error) {
      console.error(`Error al eliminar cita con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al eliminar la cita'
      });
    }
  }

  /**
   * Obtiene citas para un paciente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getByPaciente(req, res) {
    try {
      const paciente_id = parseInt(req.params.paciente_id);
      
      if (isNaN(paciente_id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de paciente inválido'
        });
      }
      
      // Verificar que el paciente exista
      const paciente = await Paciente.getById(paciente_id);
      if (!paciente) {
        return res.status(404).json({
          error: true,
          message: 'Paciente no encontrado'
        });
      }
      
      const citas = await Cita.getByPaciente(paciente_id);
      
      res.json({
        error: false,
        data: citas
      });
    } catch (error) {
      console.error(`Error al obtener citas para paciente ${req.params.paciente_id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener las citas del paciente'
      });
    }
  }

  /**
   * Obtiene citas para un profesional en un rango de fechas
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
      
      const citas = await Cita.getByProfesionalAndDateRange(id_profesional, fecha_inicio, fecha_fin);
      
      res.json({
        error: false,
        data: citas
      });
    } catch (error) {
      console.error(`Error al obtener citas para profesional ${req.params.id_profesional}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener las citas del profesional'
      });
    }
  }
}

module.exports = CitaController; 