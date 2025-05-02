import { db } from '../database/database.js';

class Consultorio {
  constructor(consultorio) {
    this.id = consultorio.id;
    this.nombre = consultorio.nombre;
    this.direccion = consultorio.direccion;
    this.comuna = consultorio.comuna;
    this.region = consultorio.region;
    this.telefono = consultorio.telefono;
    this.email = consultorio.email;
    this.horario_apertura = consultorio.horario_apertura;
    this.horario_cierre = consultorio.horario_cierre;
  }

  // Crea un nuevo consultorio
  static async crear(nuevoConsultorio) {
    const query = `
      INSERT INTO consultorios (
        nombre, direccion, comuna, region, telefono, 
        email, horario_apertura, horario_cierre
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      nuevoConsultorio.nombre,
      nuevoConsultorio.direccion,
      nuevoConsultorio.comuna,
      nuevoConsultorio.region,
      nuevoConsultorio.telefono,
      nuevoConsultorio.email,
      nuevoConsultorio.horario_apertura,
      nuevoConsultorio.horario_cierre
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear consultorio: ${error.message}`);
    }
  }

  // Obtiene un consultorio por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM consultorios WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener consultorio: ${error.message}`);
    }
  }

  // Obtiene un consultorio por su nombre
  static async obtenerPorNombre(nombre) {
    const query = 'SELECT * FROM consultorios WHERE nombre = $1';
    
    try {
      const { rows } = await db.query(query, [nombre]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener consultorio por nombre: ${error.message}`);
    }
  }

  // Obtiene todos los consultorios
  static async obtenerTodos() {
    const query = 'SELECT * FROM consultorios ORDER BY nombre';
    
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener consultorios: ${error.message}`);
    }
  }

  // Obtiene consultorios por comuna
  static async obtenerPorComuna(comuna) {
    const query = 'SELECT * FROM consultorios WHERE comuna = $1 ORDER BY nombre';
    
    try {
      const { rows } = await db.query(query, [comuna]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener consultorios por comuna: ${error.message}`);
    }
  }

  // Obtiene consultorios por región
  static async obtenerPorRegion(region) {
    const query = 'SELECT * FROM consultorios WHERE region = $1 ORDER BY nombre';
    
    try {
      const { rows } = await db.query(query, [region]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener consultorios por región: ${error.message}`);
    }
  }

  // Actualiza un consultorio
  static async actualizar(id, consultorioActualizado) {
    const query = `
      UPDATE consultorios 
      SET 
        nombre = $2,
        direccion = $3,
        comuna = $4,
        region = $5,
        telefono = $6,
        email = $7,
        horario_apertura = $8,
        horario_cierre = $9
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      consultorioActualizado.nombre,
      consultorioActualizado.direccion,
      consultorioActualizado.comuna,
      consultorioActualizado.region,
      consultorioActualizado.telefono,
      consultorioActualizado.email,
      consultorioActualizado.horario_apertura,
      consultorioActualizado.horario_cierre
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar consultorio: ${error.message}`);
    }
  }

  // Elimina un consultorio
  static async eliminar(id) {
    const query = 'DELETE FROM consultorios WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar consultorio: ${error.message}`);
    }
  }

  // Obtiene todas las citas programadas en un consultorio
  static async obtenerCitas(idConsultorio) {
    const query = `
      SELECT c.*, p.rut as paciente_rut, u1.nombre as paciente_nombre,
             u2.nombre as profesional_nombre, s.nombre as servicio
      FROM horas_agendadas c
      JOIN pacientes p ON c.id_paciente = p.id_usuario
      JOIN usuarios u1 ON p.id_usuario = u1.id
      JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
      JOIN usuarios u2 ON ps.id_usuario = u2.id
      LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
      WHERE c.consultorio_id = $1
      ORDER BY c.fecha_hora
    `;
    
    try {
      const { rows } = await db.query(query, [idConsultorio]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener citas del consultorio: ${error.message}`);
    }
  }

  // Obtiene todos los profesionales que atienden en un consultorio
  static async obtenerProfesionales(idConsultorio) {
    const query = `
      SELECT DISTINCT ps.*, u.nombre, u.email, em.nombre as especialidad
      FROM horarios_disponibles hd
      JOIN profesionales_salud ps ON hd.id_profesional = ps.id_usuario
      JOIN usuarios u ON ps.id_usuario = u.id
      LEFT JOIN especialidades_medicas em ON ps.especialidad_id = em.id
      WHERE hd.consultorio_id = $1
      ORDER BY u.nombre
    `;
    
    try {
      const { rows } = await db.query(query, [idConsultorio]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener profesionales del consultorio: ${error.message}`);
    }
  }
}

export default Consultorio; 