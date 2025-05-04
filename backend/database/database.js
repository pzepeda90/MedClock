import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

/**
 * Configuración de la pool de conexiones a PostgreSQL
 * Las variables de entorno se cargan desde .env, con valores por defecto como fallback
 */
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agenda_medica',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
  // Configuraciones de rendimiento
  max: 20,                         // máximo número de clientes en el pool
  idleTimeoutMillis: 30000,        // tiempo de inactividad en milisegundos
  connectionTimeoutMillis: 2000,   // tiempo límite de conexión en milisegundos
  allowExitOnIdle: true            // permitir que el proceso termine cuando está inactivo
});

// Eventos para monitorear la conexión
pool.on('connect', () => {
  console.log('🔌 Conexión a PostgreSQL establecida correctamente');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a PostgreSQL:', err.message);
});

// Inicialización - verificar que la conexión funcione
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`✅ Base de datos conectada - ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Ejecutar test de conexión al importar el módulo
testConnection();

/**
 * Objeto db para exponer métodos simplificados para consultas
 */
export const db = {
  /**
   * Ejecuta una consulta SQL con parámetros opcionales
   * @param {string} text - Consulta SQL
   * @param {Array} params - Parámetros para la consulta
   * @returns {Promise} - Resultado de la consulta
   */
  query: (text, params) => pool.query(text, params),
  
  /**
   * Obtiene un cliente del pool para transacciones
   * @returns {Promise} - Cliente de la base de datos
   */
  getClient: async () => {
    const client = await pool.connect();
    
    // Redefinir método query para incluir logging automático
    const originalQuery = client.query;
    client.query = (...args) => {
      const [query, params] = args;
      console.log(`🔍 Ejecutando consulta: ${query}${params ? ` con parámetros: ${JSON.stringify(params)}` : ''}`);
      return originalQuery.apply(client, args);
    };
    
    return client;
  },
  
  /**
   * Ejecuta operaciones dentro de una transacción
   * @param {Function} callback - Función que recibe el cliente y ejecuta operaciones
   * @returns {Promise} - Resultado de la transacción
   */
  transaction: async (callback) => {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  /**
   * Cierra todas las conexiones en el pool
   * @returns {Promise} - Promesa de cierre
   */
  end: () => pool.end(),
};

// Exportar tanto el pool (para acceso directo) como el objeto db (para funcionalidad extendida)
export { pool, testConnection };
export default db; 