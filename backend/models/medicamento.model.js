import { db } from '../database/database.js';

class Medicamento {
  constructor(medicamento) {
    this.id = medicamento.id;
    this.nombre = medicamento.nombre;
    this.principio_activo = medicamento.principio_activo;
    this.presentacion = medicamento.presentacion;
    this.concentracion = medicamento.concentracion;
    this.indicaciones = medicamento.indicaciones;
  }

  // Crea un nuevo medicamento
  static async crear(nuevoMedicamento) {
    const query = `
      INSERT INTO medicamentos (
        nombre, principio_activo, presentacion, concentracion, indicaciones
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      nuevoMedicamento.nombre,
      nuevoMedicamento.principio_activo,
      nuevoMedicamento.presentacion,
      nuevoMedicamento.concentracion,
      nuevoMedicamento.indicaciones
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear medicamento: ${error.message}`);
    }
  }

  // Obtiene un medicamento por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM medicamentos WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener medicamento: ${error.message}`);
    }
  }

  // Obtiene un medicamento por su nombre
  static async obtenerPorNombre(nombre) {
    const query = 'SELECT * FROM medicamentos WHERE nombre = $1';
    
    try {
      const { rows } = await db.query(query, [nombre]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener medicamento por nombre: ${error.message}`);
    }
  }

  // Obtiene medicamentos por principio activo
  static async obtenerPorPrincipioActivo(principioActivo) {
    const query = 'SELECT * FROM medicamentos WHERE principio_activo ILIKE $1 ORDER BY nombre';
    
    try {
      const { rows } = await db.query(query, [`%${principioActivo}%`]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener medicamentos por principio activo: ${error.message}`);
    }
  }

  // Obtiene todos los medicamentos
  static async obtenerTodos() {
    const query = 'SELECT * FROM medicamentos ORDER BY nombre';
    
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener medicamentos: ${error.message}`);
    }
  }

  // Busca medicamentos por nombre, principio activo o indicaciones
  static async buscar(terminoBusqueda) {
    const query = `
      SELECT * FROM medicamentos 
      WHERE nombre ILIKE $1 
      OR principio_activo ILIKE $1 
      OR indicaciones ILIKE $1
      ORDER BY nombre
    `;
    
    try {
      const { rows } = await db.query(query, [`%${terminoBusqueda}%`]);
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar medicamentos: ${error.message}`);
    }
  }

  // Actualiza un medicamento
  static async actualizar(id, medicamentoActualizado) {
    const query = `
      UPDATE medicamentos 
      SET 
        nombre = $2,
        principio_activo = $3,
        presentacion = $4,
        concentracion = $5,
        indicaciones = $6
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      medicamentoActualizado.nombre,
      medicamentoActualizado.principio_activo,
      medicamentoActualizado.presentacion,
      medicamentoActualizado.concentracion,
      medicamentoActualizado.indicaciones
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar medicamento: ${error.message}`);
    }
  }

  // Elimina un medicamento
  static async eliminar(id) {
    const query = 'DELETE FROM medicamentos WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar medicamento: ${error.message}`);
    }
  }

  // Obtiene todas las recetas que incluyen este medicamento
  static async obtenerRecetas(idMedicamento) {
    const query = `
      SELECT rm.*, h.id_paciente, u1.nombre as nombre_paciente, 
             h.id_profesional, u2.nombre as nombre_profesional,
             h.fecha as fecha_historial
      FROM recetas_medicamentos rm
      JOIN historial_medico h ON rm.id_historial = h.id
      JOIN usuarios u1 ON h.id_paciente = u1.id
      JOIN usuarios u2 ON h.id_profesional = u2.id
      WHERE rm.id_medicamento = $1
      ORDER BY h.fecha DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idMedicamento]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener recetas del medicamento: ${error.message}`);
    }
  }
}

export default Medicamento; 