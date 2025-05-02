import { db } from '../database/database.js';

class Paciente {
  constructor(paciente) {
    this.id_usuario = paciente.id_usuario;
    this.rut = paciente.rut;
    this.telefono = paciente.telefono;
    this.direccion = paciente.direccion;
    this.fecha_nacimiento = paciente.fecha_nacimiento;
    this.sexo = paciente.sexo;
    this.grupo_sanguineo = paciente.grupo_sanguineo;
    this.alergias = paciente.alergias;
    this.antecedentes_medicos = paciente.antecedentes_medicos;
    this.contacto_emergencia_nombre = paciente.contacto_emergencia_nombre;
    this.contacto_emergencia_telefono = paciente.contacto_emergencia_telefono;
  }

  // Crea un nuevo paciente
  static async crear(nuevoPaciente) {
    const query = `
      INSERT INTO pacientes (
        id_usuario, rut, telefono, direccion, fecha_nacimiento, 
        sexo, grupo_sanguineo, alergias, antecedentes_medicos, 
        contacto_emergencia_nombre, contacto_emergencia_telefono
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      nuevoPaciente.id_usuario,
      nuevoPaciente.rut,
      nuevoPaciente.telefono,
      nuevoPaciente.direccion,
      nuevoPaciente.fecha_nacimiento,
      nuevoPaciente.sexo,
      nuevoPaciente.grupo_sanguineo,
      nuevoPaciente.alergias,
      nuevoPaciente.antecedentes_medicos,
      nuevoPaciente.contacto_emergencia_nombre,
      nuevoPaciente.contacto_emergencia_telefono
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear paciente: ${error.message}`);
    }
  }

  // Obtiene un paciente por su ID de usuario
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM pacientes WHERE id_usuario = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener paciente: ${error.message}`);
    }
  }

  // Obtiene un paciente por su RUT
  static async obtenerPorRut(rut) {
    const query = 'SELECT * FROM pacientes WHERE rut = $1';
    
    try {
      const { rows } = await db.query(query, [rut]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener paciente por RUT: ${error.message}`);
    }
  }

  // Obtiene todos los pacientes
  static async obtenerTodos() {
    const query = `
      SELECT p.*, u.nombre, u.email 
      FROM pacientes p
      JOIN usuarios u ON p.id_usuario = u.id
      ORDER BY u.nombre
    `;
    
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener pacientes: ${error.message}`);
    }
  }

  // Actualiza un paciente
  static async actualizar(id, pacienteActualizado) {
    const query = `
      UPDATE pacientes 
      SET 
        rut = $2,
        telefono = $3,
        direccion = $4,
        fecha_nacimiento = $5,
        sexo = $6,
        grupo_sanguineo = $7,
        alergias = $8,
        antecedentes_medicos = $9,
        contacto_emergencia_nombre = $10,
        contacto_emergencia_telefono = $11
      WHERE id_usuario = $1
      RETURNING *
    `;
    
    const values = [
      id,
      pacienteActualizado.rut,
      pacienteActualizado.telefono,
      pacienteActualizado.direccion,
      pacienteActualizado.fecha_nacimiento,
      pacienteActualizado.sexo,
      pacienteActualizado.grupo_sanguineo,
      pacienteActualizado.alergias,
      pacienteActualizado.antecedentes_medicos,
      pacienteActualizado.contacto_emergencia_nombre,
      pacienteActualizado.contacto_emergencia_telefono
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar paciente: ${error.message}`);
    }
  }

  // Elimina un paciente
  static async eliminar(id) {
    const query = 'DELETE FROM pacientes WHERE id_usuario = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar paciente: ${error.message}`);
    }
  }
}

export default Paciente; 