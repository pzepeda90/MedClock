import { db } from '../database/database.js';

class Especialidad {
  constructor(especialidad) {
    this.id = especialidad.id;
    this.nombre = especialidad.nombre;
    this.descripcion = especialidad.descripcion;
  }

  // Crea una nueva especialidad médica
  static async crear(nuevaEspecialidad) {
    const query = `
      INSERT INTO especialidades_medicas (nombre, descripcion) 
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const values = [
      nuevaEspecialidad.nombre,
      nuevaEspecialidad.descripcion
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear especialidad: ${error.message}`);
    }
  }

  // Obtiene una especialidad por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM especialidades_medicas WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener especialidad: ${error.message}`);
    }
  }

  // Obtiene una especialidad por su nombre
  static async obtenerPorNombre(nombre) {
    const query = 'SELECT * FROM especialidades_medicas WHERE nombre = $1';
    
    try {
      const { rows } = await db.query(query, [nombre]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener especialidad por nombre: ${error.message}`);
    }
  }

  // Obtiene todas las especialidades
  static async obtenerTodas() {
    const query = 'SELECT * FROM especialidades_medicas ORDER BY nombre';
    
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener especialidades: ${error.message}`);
    }
  }

  // Actualiza una especialidad
  static async actualizar(id, especialidadActualizada) {
    const query = `
      UPDATE especialidades_medicas 
      SET 
        nombre = $2,
        descripcion = $3
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      especialidadActualizada.nombre,
      especialidadActualizada.descripcion
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar especialidad: ${error.message}`);
    }
  }

  // Elimina una especialidad
  static async eliminar(id) {
    const query = 'DELETE FROM especialidades_medicas WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar especialidad: ${error.message}`);
    }
  }

  // Obtiene todos los profesionales de una especialidad
  static async obtenerProfesionales(idEspecialidad) {
    const query = `
      SELECT ps.*, u.nombre, u.email
      FROM profesionales_salud ps
      JOIN usuarios u ON ps.id_usuario = u.id
      WHERE ps.especialidad_id = $1
      ORDER BY u.nombre
    `;
    
    try {
      const { rows } = await db.query(query, [idEspecialidad]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener profesionales de la especialidad: ${error.message}`);
    }
  }
}

export default Especialidad; 