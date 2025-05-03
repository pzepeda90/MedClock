import pkg from "pg";
import "dotenv/config";
const { Pool } = pkg;

// Configuración de la pool de conexiones a PostgreSQL
export const pool = new Pool({
  user: process.env.DB_USER || 'patriciozepeda',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agenda_medica',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  allowExitOnIdle: true,
});

try {
  await pool.query("SELECT NOW()");
  console.log("Database connected");
} catch (error) {
  console.log(error);
}
