const Paciente = require('../models/paciente.model');

/**
 * Controlador para gestionar pacientes
 */
class PacienteController {
  /**
   * Obtiene todos los pacientes
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getAll(req, res) {
    try {
      const pacientes = await Paciente.getAll();
      res.json({
        error: false,
        data: pacientes
      });
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener los pacientes'
      });
    }
  }

  /**
   * Obtiene un paciente por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de paciente inválido'
        });
      }
      
      const paciente = await Paciente.getById(id);
      
      if (!paciente) {
        return res.status(404).json({
          error: true,
          message: 'Paciente no encontrado'
        });
      }
      
      res.json({
        error: false,
        data: paciente
      });
    } catch (error) {
      console.error(`Error al obtener paciente con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el paciente'
      });
    }
  }

  /**
   * Crea un nuevo paciente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async create(req, res) {
    try {
      const { 
        nombre, email, password, // Datos de usuario
        rut, telefono, direccion, fecha_nacimiento, sexo, grupo_sanguineo,
        alergias, antecedentes_medicos, contacto_emergencia_nombre, 
        contacto_emergencia_telefono // Datos de paciente
      } = req.body;
      
      // Verificar si el RUT ya está registrado
      if (rut) {
        const existingPaciente = await Paciente.getByRut(rut);
        if (existingPaciente) {
          return res.status(400).json({
            error: true,
            message: 'Ya existe un paciente con ese RUT'
          });
        }
      }
      
      // Datos para crear el usuario
      const userData = {
        nombre,
        email,
        password,
        rol: 'paciente'
      };
      
      // Datos para crear el paciente
      const pacienteData = {
        rut,
        telefono,
        direccion,
        fecha_nacimiento,
        sexo,
        grupo_sanguineo,
        alergias,
        antecedentes_medicos,
        contacto_emergencia_nombre,
        contacto_emergencia_telefono
      };
      
      const newPaciente = await Paciente.create(userData, pacienteData);
      
      res.status(201).json({
        error: false,
        message: 'Paciente creado exitosamente',
        data: newPaciente
      });
    } catch (error) {
      console.error('Error al crear paciente:', error);
      
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
        message: 'Error al crear el paciente'
      });
    }
  }

  /**
   * Actualiza un paciente existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de paciente inválido'
        });
      }
      
      // Verificar si el paciente existe
      const paciente = await Paciente.getById(id);
      
      if (!paciente) {
        return res.status(404).json({
          error: true,
          message: 'Paciente no encontrado'
        });
      }
      
      const { 
        nombre, email, password, // Datos de usuario
        rut, telefono, direccion, fecha_nacimiento, sexo, grupo_sanguineo,
        alergias, antecedentes_medicos, contacto_emergencia_nombre, 
        contacto_emergencia_telefono // Datos de paciente
      } = req.body;
      
      // Verificar si se está intentando cambiar el RUT a uno ya existente
      if (rut && rut !== paciente.rut) {
        const existingPaciente = await Paciente.getByRut(rut);
        if (existingPaciente && existingPaciente.id_usuario !== id) {
          return res.status(400).json({
            error: true,
            message: 'Ya existe otro paciente con ese RUT'
          });
        }
      }
      
      // Datos para actualizar el usuario
      const userData = {};
      if (nombre) userData.nombre = nombre;
      if (email) userData.email = email;
      if (password) userData.password = password;
      
      // Datos para actualizar el paciente
      const pacienteData = {};
      if (rut) pacienteData.rut = rut;
      if (telefono !== undefined) pacienteData.telefono = telefono;
      if (direccion !== undefined) pacienteData.direccion = direccion;
      if (fecha_nacimiento !== undefined) pacienteData.fecha_nacimiento = fecha_nacimiento;
      if (sexo !== undefined) pacienteData.sexo = sexo;
      if (grupo_sanguineo !== undefined) pacienteData.grupo_sanguineo = grupo_sanguineo;
      if (alergias !== undefined) pacienteData.alergias = alergias;
      if (antecedentes_medicos !== undefined) pacienteData.antecedentes_medicos = antecedentes_medicos;
      if (contacto_emergencia_nombre !== undefined) pacienteData.contacto_emergencia_nombre = contacto_emergencia_nombre;
      if (contacto_emergencia_telefono !== undefined) pacienteData.contacto_emergencia_telefono = contacto_emergencia_telefono;
      
      const updatedPaciente = await Paciente.update(id, userData, pacienteData);
      
      res.json({
        error: false,
        message: 'Paciente actualizado exitosamente',
        data: updatedPaciente
      });
    } catch (error) {
      console.error(`Error al actualizar paciente con ID ${req.params.id}:`, error);
      
      // Manejar errores específicos
      if (error.message.includes('duplicate key') && error.message.includes('email')) {
        return res.status(400).json({
          error: true,
          message: 'El email ya está registrado por otro usuario'
        });
      }
      
      res.status(500).json({
        error: true,
        message: 'Error al actualizar el paciente'
      });
    }
  }

  /**
   * Elimina un paciente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de paciente inválido'
        });
      }
      
      // Verificar si el paciente existe
      const paciente = await Paciente.getById(id);
      
      if (!paciente) {
        return res.status(404).json({
          error: true,
          message: 'Paciente no encontrado'
        });
      }
      
      try {
        const deleted = await Paciente.delete(id);
        
        if (deleted) {
          res.json({
            error: false,
            message: 'Paciente eliminado exitosamente'
          });
        } else {
          // Este caso no debería ocurrir dado que ya verificamos existencia
          res.status(404).json({
            error: true,
            message: 'No se pudo eliminar el paciente'
          });
        }
      } catch (deleteError) {
        // Capturar errores específicos de la operación de eliminación
        if (deleteError.message.includes('tiene citas agendadas')) {
          return res.status(400).json({
            error: true,
            message: 'No se puede eliminar el paciente porque tiene citas agendadas'
          });
        }
        throw deleteError; // Re-lanzar otros errores
      }
    } catch (error) {
      console.error(`Error al eliminar paciente con ID ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al eliminar el paciente'
      });
    }
  }

  /**
   * Busca pacientes por nombre, email o RUT
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
      
      const pacientes = await Paciente.search(q);
      
      res.json({
        error: false,
        data: pacientes
      });
    } catch (error) {
      console.error(`Error al buscar pacientes:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al buscar pacientes'
      });
    }
  }

  /**
   * Obtiene el historial médico de un paciente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getHistorialMedico(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de paciente inválido'
        });
      }
      
      // Verificar si el paciente existe
      const paciente = await Paciente.getById(id);
      
      if (!paciente) {
        return res.status(404).json({
          error: true,
          message: 'Paciente no encontrado'
        });
      }
      
      const historial = await Paciente.getHistorialMedico(id);
      
      res.json({
        error: false,
        data: historial
      });
    } catch (error) {
      console.error(`Error al obtener historial médico del paciente ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener el historial médico'
      });
    }
  }

  /**
   * Obtiene las citas de un paciente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async getCitas(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de paciente inválido'
        });
      }
      
      // Verificar si el paciente existe
      const paciente = await Paciente.getById(id);
      
      if (!paciente) {
        return res.status(404).json({
          error: true,
          message: 'Paciente no encontrado'
        });
      }
      
      const citas = await Paciente.getCitas(id);
      
      res.json({
        error: false,
        data: citas
      });
    } catch (error) {
      console.error(`Error al obtener citas del paciente ${req.params.id}:`, error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener las citas'
      });
    }
  }
}

module.exports = PacienteController; 