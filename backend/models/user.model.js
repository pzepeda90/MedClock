import { pool } from "../database/connection.js";

const findOneEmail = async (email) => {
  const query = "SELECT * FROM usuarios WHERE email = $1";
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

const create = async ({ email, password, nombre = 'Usuario', role = 'paciente' }) => {
  const query =
    "INSERT INTO usuarios (email, password, nombre, role) VALUES ($1, $2, $3, $4) RETURNING *";
  const { rows } = await pool.query(query, [email, password, nombre, role]);
  return rows[0];
};

const findById = async (id) => {
  const query = "SELECT * FROM usuarios WHERE id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const userModel = {
  findOneEmail,
  create,
  findById
};
