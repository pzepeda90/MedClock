import { db } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    // Leer el archivo SQL de migración
    const migrationPath = path.join(__dirname, 'migrations', 'update_pacientes_table.sql');
    let migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Verificar si la tabla pacientes existe
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pacientes'
      );
    `;
    
    const tableExists = await db.query(checkTableQuery);
    
    if (!tableExists.rows[0].exists) {
      console.log('La tabla "pacientes" no existe todavía. Saltando la migración de pacientes_old.');
      // Si la tabla no existe, no necesitamos renombrar o migrar datos
      // Solo crear la nueva tabla
      
      // Obtener solo la parte de creación de la nueva tabla desde el archivo SQL
      const createTableRegex = /CREATE TABLE pacientes \([\s\S]*?(?=-- Migrar los datos de la tabla antigua a la nueva)/;
      const triggerRegex = /-- Crear un trigger[\s\S]*$/;
      
      const createTableMatch = migrationSQL.match(createTableRegex);
      const triggerMatch = migrationSQL.match(triggerRegex);
      
      if (createTableMatch && triggerMatch) {
        migrationSQL = createTableMatch[0] + triggerMatch[0];
      } else {
        throw new Error('No se pudo extraer la parte de creación de la tabla del archivo SQL');
      }
    }

    // Iniciar una transacción
    await db.query('BEGIN');
    
    // Ejecutar el script de migración
    console.log('Ejecutando migración de la tabla pacientes...');
    await db.query(migrationSQL);
    
    // Confirmar la transacción
    await db.query('COMMIT');
    
    console.log('Migración completada exitosamente.');
  } catch (error) {
    // Revertir la transacción en caso de error
    await db.query('ROLLBACK');
    console.error('Error al ejecutar la migración:', error);
  } finally {
    // Cerrar la conexión
    await db.end();
  }
};

// Ejecutar la migración
runMigration(); 