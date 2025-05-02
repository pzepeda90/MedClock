import Diagnostico from '../models/diagnostico.model.js';
import Cita from '../models/cita.model.js';

/**
 * Controlador para gestionar diagnósticos
 */
class DiagnosticoController {
  /**
   * Obtiene todos los diagnósticos
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getAll(req, res) {
    try {
      // Extraer filtros de query params
      const { codigo, nombre, categoria } = req.query;
      
      // Aplicar filtros si existen
      const filtros = {};
      if (codigo) filtros.codigo = codigo;
      if (nombre) filtros.nombre = nombre;
      if (categoria) filtros.categoria = categoria;
      
      const diagnosticos = await Diagnostico.getAll(filtros);
      
      res.json({
        error: false,
        data: diagnosticos
      });
    } catch (error) {
      console.error('Error en DiagnosticoController.getAll:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los diagnósticos'
      });
    }
  }
  
  /**
   * Obtiene un diagnóstico por ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id) || id <= 0) {
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
      console.error(`Error en DiagnosticoController.getById:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el diagnóstico'
      });
    }
  }
  
  /**
   * Obtiene un diagnóstico por su código
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getByCodigo(req, res) {
    try {
      const codigo = req.params.codigo;
      
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
      console.error(`Error en DiagnosticoController.getByCodigo:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el diagnóstico'
      });
    }
  }
  
  /**
   * Crea un nuevo diagnóstico
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async create(req, res) {
    try {
      const { codigo, nombre, descripcion, categoria } = req.body;
      
      // Verificar si ya existe un diagnóstico con el mismo código
      const existeDiagnostico = await Diagnostico.getByCodigo(codigo);
      
      if (existeDiagnostico) {
        return res.status(400).json({
          error: true,
          message: `Ya existe un diagnóstico con el código ${codigo}`
        });
      }
      
      // Crear el diagnóstico
      const diagnostico = await Diagnostico.create({
        codigo,
        nombre,
        descripcion,
        categoria
      });
      
      res.status(201).json({
        error: false,
        message: 'Diagnóstico creado exitosamente',
        data: diagnostico
      });
    } catch (error) {
      console.error('Error en DiagnosticoController.create:', error);
      res.status(500).json({
        error: true,
        message: 'Error al crear el diagnóstico'
      });
    }
  }
  
  /**
   * Asocia un diagnóstico a una cita
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async asociarACita(req, res) {
    try {
      const citaId = parseInt(req.params.citaId);
      const { diagnosticoId, notas } = req.body;
      
      if (isNaN(citaId) || citaId <= 0) {
        return res.status(400).json({
          error: true,
          message: 'ID de cita inválido'
        });
      }
      
      if (isNaN(diagnosticoId) || diagnosticoId <= 0) {
        return res.status(400).json({
          error: true,
          message: 'ID de diagnóstico inválido'
        });
      }
      
      // Verificar que exista la cita
      const cita = await Cita.getById(citaId);
      
      if (!cita) {
        return res.status(404).json({
          error: true,
          message: 'Cita no encontrada'
        });
      }
      
      // Verificar que la cita esté completada
      if (cita.estado !== 'completada') {
        return res.status(400).json({
          error: true,
          message: 'Solo se pueden asociar diagnósticos a citas completadas'
        });
      }
      
      // Verificar que exista el diagnóstico
      const diagnostico = await Diagnostico.getById(diagnosticoId);
      
      if (!diagnostico) {
        return res.status(404).json({
          error: true,
          message: 'Diagnóstico no encontrado'
        });
      }
      
      // Asociar el diagnóstico a la cita
      const asociacion = await Diagnostico.asociarACita(citaId, diagnosticoId, notas);
      
      res.status(201).json({
        error: false,
        message: 'Diagnóstico asociado exitosamente a la cita',
        data: asociacion
      });
    } catch (error) {
      console.error('Error en DiagnosticoController.asociarACita:', error);
      res.status(500).json({
        error: true,
        message: 'Error al asociar el diagnóstico a la cita'
      });
    }
  }
  
  /**
   * Obtiene los diagnósticos asociados a una cita
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getDiagnosticosByCita(req, res) {
    try {
      const citaId = parseInt(req.params.citaId);
      
      if (isNaN(citaId) || citaId <= 0) {
        return res.status(400).json({
          error: true,
          message: 'ID de cita inválido'
        });
      }
      
      // Verificar que exista la cita
      const cita = await Cita.getById(citaId);
      
      if (!cita) {
        return res.status(404).json({
          error: true,
          message: 'Cita no encontrada'
        });
      }
      
      // Obtener los diagnósticos de la cita
      const diagnosticos = await Diagnostico.getDiagnosticosByCita(citaId);
      
      res.json({
        error: false,
        data: diagnosticos
      });
    } catch (error) {
      console.error('Error en DiagnosticoController.getDiagnosticosByCita:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los diagnósticos de la cita'
      });
    }
  }
}

export default DiagnosticoController; 