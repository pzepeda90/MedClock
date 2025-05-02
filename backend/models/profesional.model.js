import { db } from '../database/database.js';

class Profesional {
  constructor(profesional) {
    this.id_usuario = profesional.id_usuario;
    this.especialidad_id = profesional.especialidad_id;
    this.numero_registro = profesional.numero_registro;
    this.biografia = profesional.biografia;
    this.anos_experiencia = profesional.anos_experiencia;
    this.educacion = profesional.educacion;
    this.foto_url = profesional.foto_url;
  }

  // Crea un nuevo profesional de salud
  static async crear(nuevoProfesional) {
    const query = `
      INSERT INTO profesionales_salud (
        id_usuario, especialidad_id, numero_registro, biografia,
        anos_experiencia, educacion, foto_url
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      nuevoProfesional.id_usuario,
      nuevoProfesional.especialidad_id,
      nuevoProfesional.numero_registro,
      nuevoProfesional.biografia,
      nuevoProfesional.anos_experiencia,
      nuevoProfesional.educacion,
      nuevoProfesional.foto_url
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear profesional: ${error.message}`);
    }
  }

  // Obtiene un profesional por su ID de usuario
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM profesionales_salud WHERE id_usuario = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener profesional: ${error.message}`);
    }
  }

  // Obtiene un profesional por su número de registro
  static async obtenerPorNumeroRegistro(numeroRegistro) {
    const query = 'SELECT * FROM profesionales_salud WHERE numero_registro = $1';
    
    try {
      const { rows } = await db.query(query, [numeroRegistro]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener profesional por número de registro: ${error.message}`);
    }
  }

  // Obtiene todos los profesionales
  static async obtenerTodos() {
    const query = `
      SELECT ps.*, u.nombre, u.email, em.nombre as especialidad 
      FROM profesionales_salud ps
      JOIN usuarios u ON ps.id_usuario = u.id
      LEFT JOIN especialidades_medicas em ON ps.especialidad_id = em.id
      ORDER BY u.nombre
    `;
    
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener profesionales: ${error.message}`);
    }
  }

  // Obtiene profesionales por especialidad
  static async obtenerPorEspecialidad(especialidadId) {
    const query = `
      SELECT ps.*, u.nombre, u.email, em.nombre as especialidad 
      FROM profesionales_salud ps
      JOIN usuarios u ON ps.id_usuario = u.id
      LEFT JOIN especialidades_medicas em ON ps.especialidad_id = em.id
      WHERE ps.especialidad_id = $1
      ORDER BY u.nombre
    `;
    
    try {
      const { rows } = await db.query(query, [especialidadId]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener profesionales por especialidad: ${error.message}`);
    }
  }

  // Actualiza un profesional
  static async actualizar(id, profesionalActualizado) {
    const query = `
      UPDATE profesionales_salud 
      SET 
        especialidad_id = $2,
        numero_registro = $3,
        biografia = $4,
        anos_experiencia = $5,
        educacion = $6,
        foto_url = $7
      WHERE id_usuario = $1
      RETURNING *
    `;
    
    const values = [
      id,
      profesionalActualizado.especialidad_id,
      profesionalActualizado.numero_registro,
      profesionalActualizado.biografia,
      profesionalActualizado.anos_experiencia,
      profesionalActualizado.educacion,
      profesionalActualizado.foto_url
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar profesional: ${error.message}`);
    }
  }

  // Elimina un profesional
  static async eliminar(id) {
    const query = 'DELETE FROM profesionales_salud WHERE id_usuario = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar profesional: ${error.message}`);
    }
  }

  // Obtiene los servicios ofrecidos por un profesional
  static async obtenerServicios(id) {
    const query = `
      SELECT s.* 
      FROM servicios_procedimientos s
      JOIN rel_profesional_servicio rps ON s.id = rps.id_servicio
      WHERE rps.id_profesional = $1
      ORDER BY s.nombre
    `;
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener servicios del profesional: ${error.message}`);
    }
  }

  // Asigna un servicio a un profesional
  static async asignarServicio(idProfesional, idServicio) {
    const query = `
      INSERT INTO rel_profesional_servicio (id_profesional, id_servicio)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [idProfesional, idServicio]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al asignar servicio: ${error.message}`);
    }
  }

  // Elimina un servicio de un profesional
  static async eliminarServicio(idProfesional, idServicio) {
    const query = `
      DELETE FROM rel_profesional_servicio 
      WHERE id_profesional = $1 AND id_servicio = $2
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [idProfesional, idServicio]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar servicio: ${error.message}`);
    }
  }
}

export default Profesional; 