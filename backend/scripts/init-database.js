#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../database/database.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de los archivos SQL en orden de ejecución
const migrationFiles = [
  path.join(__dirname, '../database/migrations/01_init_schema.sql'),
  path.join(__dirname, '../database/migrations/02_codigos_procedimientos.sql'),
  path.join(__dirname, '../database/migrations/03_auditoria_pagos.sql')
];

async function initDatabase() {
  const args = process.argv.slice(2);
  const forceRecreate = args.includes('--force');
  
  try {
    console.log(chalk.blue('🔍 Verificando estado actual de la base de datos...'));
    
    // Verificar tablas existentes
    const queryTables = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const { rows: tablesBeforeMigration } = await db.query(queryTables);
    console.log(chalk.green(`Se encontraron ${tablesBeforeMigration.length} tablas existentes.`));
    
    if (tablesBeforeMigration.length > 0) {
      console.log(chalk.blue('Tablas actuales:'));
      tablesBeforeMigration.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
      
      // Si se pasa la opción --force, eliminar todas las tablas existentes
      if (forceRecreate) {
        console.log(chalk.yellow('\n⚠️ Se ha solicitado recrear la base de datos desde cero'));
        console.log(chalk.red('⚠️ ATENCIÓN: Se eliminarán todas las tablas y datos existentes'));
        
        // Desactivar restricciones de clave foránea temporalmente
        await db.query('SET session_replication_role = replica;');
        
        for (const table of tablesBeforeMigration) {
          try {
            console.log(chalk.yellow(`Eliminando tabla ${table.table_name}...`));
            await db.query(`DROP TABLE IF EXISTS ${table.table_name} CASCADE;`);
            console.log(chalk.green(`✅ Tabla ${table.table_name} eliminada correctamente`));
          } catch (error) {
            console.error(chalk.red(`❌ Error al eliminar tabla ${table.table_name}:`), error.message);
          }
        }
        
        // Restaurar restricciones de clave foránea
        await db.query('SET session_replication_role = DEFAULT;');
        
        console.log(chalk.green('✅ Todas las tablas han sido eliminadas. Se procederá a recrearlas.'));
      }
    }
    
    // Leer y ejecutar archivos de migración en orden
    for (const filePath of migrationFiles) {
      const fileName = path.basename(filePath);
      console.log(chalk.blue(`\n📄 Ejecutando migración: ${fileName}`));
      
      try {
        if (!fs.existsSync(filePath)) {
          console.error(chalk.red(`❌ El archivo de migración ${fileName} no existe en la ruta especificada.`));
          continue;
        }
        
        const migrationSql = fs.readFileSync(filePath, 'utf8');
        await db.query(migrationSql);
        console.log(chalk.green(`✅ Migración ${fileName} ejecutada correctamente`));
      } catch (error) {
        console.error(chalk.red(`❌ Error al ejecutar migración ${fileName}:`), error.message);
        
        // Si ocurre un error en una migración y no estamos en modo forzado, detener el proceso
        if (!forceRecreate) {
          console.error(chalk.red(`\n🛑 Se detendrá el proceso debido a errores en la migración.`));
          console.error(chalk.yellow(`👉 Pruebe a ejecutar de nuevo con la opción --force para recrear la base de datos desde cero.`));
          process.exit(1);
        }
        // Si estamos en modo forzado, continuamos con la siguiente migración
      }
    }
    
    // Verificar tablas creadas después de las migraciones
    const { rows: tablesAfterMigration } = await db.query(queryTables);
    console.log(chalk.green(`\n✅ Se tienen ahora ${tablesAfterMigration.length} tablas en la base de datos.`));
    
    // Mostrar las tablas creadas
    const newTables = tablesAfterMigration.filter(t => 
      !tablesBeforeMigration.some(existingTable => existingTable.table_name === t.table_name)
    );
    
    if (newTables.length > 0) {
      console.log(chalk.green('Tablas creadas en esta ejecución:'));
      newTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // Tablas importantes que deberían existir después de las migraciones
    const requiredTables = [
      'usuarios', 
      'pacientes', 
      'profesionales_salud',
      'especialidades_medicas',
      'consultorios',
      'servicios_procedimientos',
      'pagos_facturacion',
      'codigos_procedimientos',
      'auditoria_pagos'
    ];
    
    const missingTables = requiredTables.filter(requiredTable => 
      !tablesAfterMigration.some(t => t.table_name === requiredTable)
    );
    
    if (missingTables.length > 0) {
      console.log(chalk.yellow('\n⚠️ Aún faltan algunas tablas importantes:'));
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    } else {
      console.log(chalk.green('\n✅ Todas las tablas requeridas fueron creadas correctamente.'));
    }
    
    // Insertar datos de ejemplo si se solicita
    if (args.includes('--with-samples')) {
      console.log(chalk.blue('\n🌱 Insertando datos de ejemplo...'));
      const seedFile = path.join(__dirname, '../database/seeds/01_sample_data.sql');
      
      if (fs.existsSync(seedFile)) {
        const seedSql = fs.readFileSync(seedFile, 'utf8');
        await db.query(seedSql);
        console.log(chalk.green('✅ Datos de ejemplo insertados correctamente'));
      } else {
        console.error(chalk.red('❌ Archivo de datos de ejemplo no encontrado.'));
      }
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error general al inicializar la base de datos:'), error);
    process.exit(1);
  } finally {
    try {
      await db.end();
      console.log(chalk.blue('\n👋 Conexión a la base de datos cerrada'));
    } catch (error) {
      console.error(chalk.red('❌ Error al cerrar la conexión:'), error);
    }
  }
}

// Ejecutar la inicialización
initDatabase(); 