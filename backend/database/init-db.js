import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pkg;

const createDatabase = async () => {
  // Conectar a PostgreSQL sin especificar una base de datos
  const client = new Client({
    user: process.env.DB_USER || 'patriciozepeda',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Conectarse a la base de datos postgres por defecto
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('Conectando a PostgreSQL...');
    await client.connect();
    
    // Verificar si la base de datos existe
    const dbName = process.env.DB_NAME || 'agenda_medica';
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`;
    const { rows } = await client.query(checkDbQuery);
    
    if (rows.length === 0) {
      console.log(`La base de datos "${dbName}" no existe. Creándola...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Base de datos "${dbName}" creada exitosamente.`);
    } else {
      console.log(`La base de datos "${dbName}" ya existe.`);
    }
    
    // Ahora conectamos a la base de datos creada
    await client.end();
    
    const dbClient = new Client({
      user: process.env.DB_USER || 'patriciozepeda',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
    });
    
    await dbClient.connect();
    console.log(`Conectado a la base de datos "${dbName}".`);
    
    // Crear la tabla de usuarios si no existe
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'paciente',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await dbClient.query(createUsersTable);
    console.log('Tabla "usuarios" creada o verificada.');
    
    // Crear la tabla de pacientes inicial
    const createPatientsTable = `
      CREATE TABLE IF NOT EXISTS pacientes (
        id_usuario INT PRIMARY KEY,
        rut VARCHAR(20) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        direccion TEXT,
        fecha_nacimiento DATE,
        sexo VARCHAR(20),
        grupo_sanguineo VARCHAR(10),
        alergias TEXT,
        antecedentes_medicos TEXT,
        contacto_emergencia_nombre VARCHAR(255),
        contacto_emergencia_telefono VARCHAR(20),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `;
    
    await dbClient.query(createPatientsTable);
    console.log('Tabla "pacientes" creada o verificada.');
    
    // Cerrar la conexión
    await dbClient.end();
    console.log('Inicialización completada.');
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    try {
      await client.end();
    } catch (err) {
      // Ignorar errores al cerrar la conexión
    }
  }
};

createDatabase(); 