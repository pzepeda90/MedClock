#!/usr/bin/env node

import db from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de los archivos SQL
const migrationFiles = [
  path.join(__dirname, 'migrations/01_init_schema.sql'),
  path.join(__dirname, 'migrations/02_codigos_procedimientos.sql')
];

async function initFullDb() {
  try {
    console.log(chalk.blue('🔍 Verificando tablas existentes...'));
    
    // Verificar tablas existentes
    const queryTables = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const { rows: tables } = await db.query(queryTables);
    console.log(chalk.green(`Se encontraron ${tables.length} tablas existentes.`));
    
    // Leer y ejecutar archivos de migración
    for (const filePath of migrationFiles) {
      console.log(chalk.blue(`📄 Ejecutando migración: ${path.basename(filePath)}`));
      
      try {
        const migrationSql = fs.readFileSync(filePath, 'utf8');
        await db.query(migrationSql);
        console.log(chalk.green(`✅ Migración ${path.basename(filePath)} ejecutada correctamente`));
      } catch (error) {
        console.error(chalk.red(`❌ Error al ejecutar migración ${path.basename(filePath)}:`), error.message);
        // Continuar con la siguiente migración
      }
    }
    
    // Verificar tablas creadas
    const { rows: tablesAfter } = await db.query(queryTables);
    console.log(chalk.green(`✅ Se tienen ahora ${tablesAfter.length} tablas en la base de datos.`));
    
    // Mostrar las tablas creadas
    const newTables = tablesAfter.filter(t => !tables.some(existingTable => existingTable.table_name === t.table_name));
    
    if (newTables.length > 0) {
      console.log(chalk.green('Tablas creadas en esta ejecución:'));
      newTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // Verificar si se crearon las tablas principales
    const requiredTables = [
      'usuarios', 
      'pacientes', 
      'profesionales_salud',
      'especialidades',
      'consultorios',
      'servicios_procedimientos',
      'pagos_facturacion',
      'codigos_procedimientos'
    ];
    
    const missingTables = requiredTables.filter(requiredTable => 
      !tablesAfter.some(t => t.table_name === requiredTable)
    );
    
    if (missingTables.length > 0) {
      console.log(chalk.yellow('⚠️ Aún faltan algunas tablas importantes:'));
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    } else {
      console.log(chalk.green('✅ Todas las tablas requeridas fueron creadas correctamente.'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error al inicializar la base de datos:'), error);
  } finally {
    try {
      await db.end();
      console.log(chalk.blue('👋 Conexión a la base de datos cerrada'));
    } catch (error) {
      console.error(chalk.red('❌ Error al cerrar la conexión:'), error);
    }
  }
}

// Ejecutar la inicialización
initFullDb(); 