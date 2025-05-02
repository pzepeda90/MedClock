import Paciente from '../models/paciente.model.js';
import Usuario from '../models/user.model.js';

// Crear un nuevo paciente
export const crearPaciente = async (req, res) => {
  try {
    const { 
      id_usuario, 
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
    } = req.body;

    // Verificar campos obligatorios
    if (!id_usuario || !rut || !telefono) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'ID de usuario, RUT y teléfono son obligatorios' 
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

    // Verificar si ya existe un paciente con este RUT
    const pacienteExistente = await Paciente.obtenerPorRut(rut);
    if (pacienteExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ya existe un paciente con este RUT'
      });
    }

    // Crear el nuevo paciente
    const nuevoPaciente = {
      id_usuario,
      rut,
      telefono,
      direccion: direccion || null,
      fecha_nacimiento: fecha_nacimiento || null,
      sexo: sexo || null,
      grupo_sanguineo: grupo_sanguineo || null,
      alergias: alergias || null,
      antecedentes_medicos: antecedentes_medicos || null,
      contacto_emergencia_nombre: contacto_emergencia_nombre || null,
      contacto_emergencia_telefono: contacto_emergencia_telefono || null
    };

    const pacienteCreado = await Paciente.crear(nuevoPaciente);

    res.status(201).json({
      error: false,
      mensaje: 'Paciente creado exitosamente',
      paciente: pacienteCreado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al crear paciente: ${error.message}`
    });
  }
};

// Obtener un paciente por su ID
export const obtenerPacientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await Paciente.obtenerPorId(id);

    if (!paciente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      paciente
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener paciente: ${error.message}`
    });
  }
};

// Obtener un paciente por su RUT
export const obtenerPacientePorRut = async (req, res) => {
  try {
    const { rut } = req.params;
    const paciente = await Paciente.obtenerPorRut(rut);

    if (!paciente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      paciente
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener paciente: ${error.message}`
    });
  }
};

// Obtener todos los pacientes
export const obtenerPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.obtenerTodos();

    res.status(200).json({
      error: false,
      total: pacientes.length,
      pacientes
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener pacientes: ${error.message}`
    });
  }
};

// Actualizar un paciente
export const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el paciente existe
    const pacienteExistente = await Paciente.obtenerPorId(id);
    if (!pacienteExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    }

    // Si se está actualizando el RUT, verificar que no exista otro con ese RUT
    if (datosActualizados.rut && datosActualizados.rut !== pacienteExistente.rut) {
      const pacienteConMismoRut = await Paciente.obtenerPorRut(datosActualizados.rut);
      if (pacienteConMismoRut) {
        return res.status(400).json({
          error: true,
          mensaje: 'Ya existe otro paciente con ese RUT'
        });
      }
    }

    // Actualizar el paciente
    const pacienteActualizado = await Paciente.actualizar(id, datosActualizados);

    res.status(200).json({
      error: false,
      mensaje: 'Paciente actualizado exitosamente',
      paciente: pacienteActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar paciente: ${error.message}`
    });
  }
};

// Eliminar un paciente
export const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el paciente existe
    const pacienteExistente = await Paciente.obtenerPorId(id);
    if (!pacienteExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    }

    // Eliminar el paciente
    await Paciente.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Paciente eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al eliminar paciente: ${error.message}`
    });
  }
}; 