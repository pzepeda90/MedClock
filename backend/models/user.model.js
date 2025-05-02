import { pool } from "../database/connection.js";

const findOneEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

const create = async ({ email, password }) => {
  const query =
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *";
  const { rows } = await pool.query(query, [email, password]);
  return rows[0];
};

export const userModel = {
  findOneEmail,
  create,
};
