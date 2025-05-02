// Configuración global para las pruebas
const dotenv = require('dotenv');

// Cargar variables de entorno para pruebas
dotenv.config({ path: '.env.test' });

// Sobreescribir la conexión a la base de datos para usar una base de datos de prueba
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = 'test'; 