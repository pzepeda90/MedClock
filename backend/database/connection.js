import pkg from "pg";
import "dotenv/config";
const { Pool } = pkg;

// cambia los datos de acuerdo a tu configuracion de postgres
export const pool = new Pool({
  allowExitOnIdle: true,
});

try {
  await pool.query("SELECT NOW()");
  console.log("Database connected");
} catch (error) {
  console.log(error);
}
