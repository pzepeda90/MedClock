import { db } from '../database/database.js';

class Servicio {
  constructor(servicio) {
    this.id = servicio.id;
    this.nombre = servicio.nombre;
    this.descripcion = servicio.descripcion;
    this.duracion_min = servicio.duracion_min;
    this.precio = servicio.precio;
    this.requiere_preparacion = servicio.requiere_preparacion;
    this.instrucciones_preparacion = servicio.instrucciones_preparacion;
  }

  // Crea un nuevo servicio o procedimiento
  static async crear(nuevoServicio) {
    const query = `
      INSERT INTO servicios_procedimientos (
        nombre, descripcion, duracion_min, precio, 
        requiere_preparacion, instrucciones_preparacion
      ) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      nuevoServicio.nombre,
      nuevoServicio.descripcion,
      nuevoServicio.duracion_min,
      nuevoServicio.precio,
      nuevoServicio.requiere_preparacion,
      nuevoServicio.instrucciones_preparacion
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear servicio: ${error.message}`);
    }
  }

  // Obtiene un servicio por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM servicios_procedimientos WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener servicio: ${error.message}`);
    }
  }

  // Obtiene un servicio por su nombre
  static async obtenerPorNombre(nombre) {
    const query = 'SELECT * FROM servicios_procedimientos WHERE nombre = $1';
    
    try {
      const { rows } = await db.query(query, [nombre]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener servicio por nombre: ${error.message}`);
    }
  }

  // Obtiene todos los servicios
  static async obtenerTodos() {
    const query = 'SELECT * FROM servicios_procedimientos ORDER BY nombre';
    
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  }

  // Obtiene servicios por rango de precio
  static async obtenerPorRangoPrecio(precioMinimo, precioMaximo) {
    const query = `
      SELECT * FROM servicios_procedimientos 
      WHERE precio BETWEEN $1 AND $2
      ORDER BY precio
    `;
    
    try {
      const { rows } = await db.query(query, [precioMinimo, precioMaximo]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener servicios por rango de precio: ${error.message}`);
    }
  }

  // Obtiene servicios por duración
  static async obtenerPorDuracion(duracionMin) {
    const query = `
      SELECT * FROM servicios_procedimientos 
      WHERE duracion_min <= $1
      ORDER BY duracion_min
    `;
    
    try {
      const { rows } = await db.query(query, [duracionMin]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener servicios por duración: ${error.message}`);
    }
  }

  // Actualiza un servicio
  static async actualizar(id, servicioActualizado) {
    const query = `
      UPDATE servicios_procedimientos 
      SET 
        nombre = $2,
        descripcion = $3,
        duracion_min = $4,
        precio = $5,
        requiere_preparacion = $6,
        instrucciones_preparacion = $7
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      servicioActualizado.nombre,
      servicioActualizado.descripcion,
      servicioActualizado.duracion_min,
      servicioActualizado.precio,
      servicioActualizado.requiere_preparacion,
      servicioActualizado.instrucciones_preparacion
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar servicio: ${error.message}`);
    }
  }

  // Elimina un servicio
  static async eliminar(id) {
    const query = 'DELETE FROM servicios_procedimientos WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar servicio: ${error.message}`);
    }
  }

  // Obtiene todos los profesionales que ofrecen un servicio específico
  static async obtenerProfesionales(idServicio) {
    const query = `
      SELECT ps.*, u.nombre, u.email, em.nombre as especialidad 
      FROM profesionales_salud ps
      JOIN rel_profesional_servicio rps ON ps.id_usuario = rps.id_profesional
      JOIN usuarios u ON ps.id_usuario = u.id
      LEFT JOIN especialidades_medicas em ON ps.especialidad_id = em.id
      WHERE rps.id_servicio = $1
      ORDER BY u.nombre
    `;
    
    try {
      const { rows } = await db.query(query, [idServicio]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener profesionales para el servicio: ${error.message}`);
    }
  }

  // Asigna un servicio a un profesional
  static async asignarProfesional(idServicio, idProfesional) {
    const query = `
      INSERT INTO rel_profesional_servicio (id_servicio, id_profesional)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [idServicio, idProfesional]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al asignar profesional: ${error.message}`);
    }
  }

  // Elimina un profesional de un servicio
  static async eliminarProfesional(idServicio, idProfesional) {
    const query = `
      DELETE FROM rel_profesional_servicio 
      WHERE id_servicio = $1 AND id_profesional = $2
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [idServicio, idProfesional]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar profesional del servicio: ${error.message}`);
    }
  }
}

export default Servicio; 