import { db } from '../database/database.js';

class Paciente {
  constructor(paciente) {
    this.id_usuario = paciente.id_usuario;
    
    // Información personal
    this.primer_nombre = paciente.primer_nombre;
    this.segundo_nombre = paciente.segundo_nombre;
    this.primer_apellido = paciente.primer_apellido;
    this.segundo_apellido = paciente.segundo_apellido;
    this.rut = paciente.rut;
    this.fecha_nacimiento = paciente.fecha_nacimiento;
    this.sexo = paciente.sexo;
    this.genero = paciente.genero;
    this.nacionalidad = paciente.nacionalidad;
    this.estado_civil = paciente.estado_civil;
    this.foto_url = paciente.foto_url;
    
    // Información de contacto
    this.calle = paciente.calle;
    this.numero = paciente.numero;
    this.depto = paciente.depto;
    this.comuna = paciente.comuna;
    this.region = paciente.region;
    this.codigo_postal = paciente.codigo_postal;
    this.telefono_fijo = paciente.telefono_fijo;
    this.celular = paciente.celular;
    this.email = paciente.email;
    
    // Información médica
    this.grupo_sanguineo = paciente.grupo_sanguineo;
    this.alergias = paciente.alergias;
    this.antecedentes_medicos = paciente.antecedentes_medicos;
    
    // Contacto de emergencia
    this.contacto_emergencia_nombre = paciente.contacto_emergencia_nombre;
    this.contacto_emergencia_telefono = paciente.contacto_emergencia_telefono;
  }

  // Crea un nuevo paciente
  static async crear(nuevoPaciente) {
    const query = `
      INSERT INTO pacientes (
        id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        rut, fecha_nacimiento, sexo, genero, nacionalidad, estado_civil, foto_url,
        calle, numero, depto, comuna, region, codigo_postal,
        telefono_fijo, celular, email,
        grupo_sanguineo, alergias, antecedentes_medicos,
        contacto_emergencia_nombre, contacto_emergencia_telefono
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *
    `;
    
    const values = [
      nuevoPaciente.id_usuario,
      nuevoPaciente.primer_nombre,
      nuevoPaciente.segundo_nombre,
      nuevoPaciente.primer_apellido,
      nuevoPaciente.segundo_apellido,
      nuevoPaciente.rut,
      nuevoPaciente.fecha_nacimiento,
      nuevoPaciente.sexo,
      nuevoPaciente.genero,
      nuevoPaciente.nacionalidad,
      nuevoPaciente.estado_civil,
      nuevoPaciente.foto_url,
      nuevoPaciente.calle,
      nuevoPaciente.numero,
      nuevoPaciente.depto,
      nuevoPaciente.comuna,
      nuevoPaciente.region,
      nuevoPaciente.codigo_postal,
      nuevoPaciente.telefono_fijo,
      nuevoPaciente.celular,
      nuevoPaciente.email,
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
      SELECT p.*, u.email as user_email 
      FROM pacientes p
      JOIN usuarios u ON p.id_usuario = u.id
      ORDER BY p.primer_apellido, p.primer_nombre
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
        primer_nombre = $2,
        segundo_nombre = $3,
        primer_apellido = $4,
        segundo_apellido = $5,
        rut = $6,
        fecha_nacimiento = $7,
        sexo = $8,
        genero = $9,
        nacionalidad = $10,
        estado_civil = $11,
        foto_url = $12,
        calle = $13,
        numero = $14,
        depto = $15,
        comuna = $16,
        region = $17,
        codigo_postal = $18,
        telefono_fijo = $19,
        celular = $20,
        email = $21,
        grupo_sanguineo = $22,
        alergias = $23,
        antecedentes_medicos = $24,
        contacto_emergencia_nombre = $25,
        contacto_emergencia_telefono = $26
      WHERE id_usuario = $1
      RETURNING *
    `;
    
    const values = [
      id,
      pacienteActualizado.primer_nombre,
      pacienteActualizado.segundo_nombre,
      pacienteActualizado.primer_apellido,
      pacienteActualizado.segundo_apellido,
      pacienteActualizado.rut,
      pacienteActualizado.fecha_nacimiento,
      pacienteActualizado.sexo,
      pacienteActualizado.genero,
      pacienteActualizado.nacionalidad,
      pacienteActualizado.estado_civil,
      pacienteActualizado.foto_url,
      pacienteActualizado.calle,
      pacienteActualizado.numero,
      pacienteActualizado.depto,
      pacienteActualizado.comuna,
      pacienteActualizado.region,
      pacienteActualizado.codigo_postal,
      pacienteActualizado.telefono_fijo,
      pacienteActualizado.celular,
      pacienteActualizado.email,
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