import pg from 'pg';
const { Pool } = pg;

// Configuración para la conexión a la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'agenda_medica',
  port: process.env.DB_PORT || 5432,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo para cerrar conexiones inactivas
  connectionTimeoutMillis: 2000 // Tiempo máximo de espera para una conexión
});

// Eventos para monitorear la conexión
pool.on('connect', () => {
  console.log('🔌 Conexión a la base de datos establecida');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a la base de datos:', err.message);
});

export { pool }; 