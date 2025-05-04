import db from "../database/database.js";

/**
 * Busca un usuario por su correo electrónico
 * @param {string} email - Correo electrónico a buscar
 * @returns {Object|null} - Usuario encontrado o null
 */
const findOneEmail = async (email) => {
  try {
    const query = "SELECT * FROM usuarios WHERE email = $1";
    const { rows } = await db.query(query, [email]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error en findOneEmail:", error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario a crear
 * @returns {Object} - Usuario creado
 */
const create = async ({ email, password, nombre = 'Usuario', role = 'paciente' }) => {
  try {
    const query =
      "INSERT INTO usuarios (email, password, nombre, role) VALUES ($1, $2, $3, $4) RETURNING *";
    const { rows } = await db.query(query, [email, password, nombre, role]);
    return rows[0];
  } catch (error) {
    console.error("Error en create:", error);
    throw error;
  }
};

/**
 * Busca un usuario por su ID
 * @param {number} id - ID del usuario a buscar
 * @returns {Object|null} - Usuario encontrado o null
 */
const findById = async (id) => {
  try {
    const query = "SELECT * FROM usuarios WHERE id = $1";
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error en findById:", error);
    throw error;
  }
};

/**
 * Actualiza los datos de un usuario
 * @param {number} id - ID del usuario a actualizar
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object|null} - Usuario actualizado o null
 */
const update = async (id, updateData) => {
  try {
    // Construir dinámicamente la consulta SQL según los campos a actualizar
    const fields = Object.keys(updateData);
    if (fields.length === 0) return await findById(id);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = Object.values(updateData);
    
    const query = `UPDATE usuarios SET ${setClause} WHERE id = $1 RETURNING *`;
    const { rows } = await db.query(query, [id, ...values]);
    
    return rows[0] || null;
  } catch (error) {
    console.error("Error en update:", error);
    throw error;
  }
};

/**
 * Obtiene todos los usuarios
 * @returns {Array} - Lista de usuarios
 */
const findAll = async () => {
  try {
    const query = "SELECT * FROM usuarios ORDER BY id";
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Error en findAll:", error);
    throw error;
  }
};

/**
 * Busca usuarios según criterios específicos
 * @param {Object} criteria - Criterios de búsqueda
 * @param {string} [criteria.query] - Texto a buscar en nombre o email
 * @param {string} [criteria.role] - Rol específico a filtrar
 * @returns {Array} - Lista de usuarios que coinciden con los criterios
 */
const search = async (criteria = {}) => {
  try {
    let query = "SELECT * FROM usuarios WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    // Agregar filtro por texto (nombre o email)
    if (criteria.query) {
      query += ` AND (LOWER(nombre) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex})`;
      params.push(`%${criteria.query.toLowerCase()}%`);
      paramIndex++;
    }

    // Agregar filtro por rol
    if (criteria.role) {
      query += ` AND role = $${paramIndex}`;
      params.push(criteria.role);
      paramIndex++;
    }

    // Ordenar resultados
    query += " ORDER BY nombre";

    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error en search:", error);
    throw error;
  }
};

/**
 * Elimina un usuario por su ID
 * @param {number} id - ID del usuario a eliminar
 * @returns {boolean} - true si se eliminó correctamente
 */
const remove = async (id) => {
  try {
    const query = "DELETE FROM usuarios WHERE id = $1 RETURNING id";
    const { rowCount } = await db.query(query, [id]);
    return rowCount > 0;
  } catch (error) {
    console.error("Error en remove:", error);
    throw error;
  }
};

export const userModel = {
  findOneEmail,
  create,
  findById,
  update,
  findAll,
  search,
  remove
};
