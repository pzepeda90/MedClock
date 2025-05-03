import pkg from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const { Pool } = pkg;

// Configuración de la pool de conexiones a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'patriciozepeda',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agenda_medica',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  max: 20, // máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // tiempo de inactividad en milisegundos
  connectionTimeoutMillis: 2000, // tiempo límite de conexión en milisegundos
});

// Objeto db para exponer métodos simplificados para consultas
export const db = {
  /**
   * Ejecuta una consulta SQL con parámetros opcionales
   * @param {string} text - Consulta SQL
   * @param {Array} params - Parámetros para la consulta
   * @returns {Promise} - Resultado de la consulta
   */
  query: (text, params) => pool.query(text, params),
  
  /**
   * Obtiene un cliente del pool
   * @returns {Promise} - Cliente de la base de datos
   */
  getClient: async () => {
    const client = await pool.connect();
    return client;
  },
  
  /**
   * Cierra todas las conexiones en el pool
   * @returns {Promise} - Promesa de cierre
   */
  end: () => pool.end(),
};

// Evento para cuando se crea un cliente
pool.on('connect', () => {
  console.log('Conexión a PostgreSQL establecida correctamente');
});

// Evento para cuando ocurre un error
pool.on('error', (err) => {
  console.error('Error en la conexión a PostgreSQL:', err);
});

export default db; 