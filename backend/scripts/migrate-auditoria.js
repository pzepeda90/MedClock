#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../database/database.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta del archivo de migración
const migrationFile = path.join(__dirname, '../database/migrations/03_auditoria_pagos.sql');

async function executeMigration() {
  try {
    console.log(chalk.blue('📝 Leyendo archivo de migración de auditoría...'));
    
    const migration = fs.readFileSync(migrationFile, 'utf8');
    
    console.log(chalk.blue('🔄 Conectando a la base de datos...'));
    
    // Verificar si existen las tablas necesarias
    console.log(chalk.blue('🔍 Verificando dependencias...'));
    
    const requiredTables = ['pagos_facturacion', 'codigos_procedimientos', 'usuarios'];
    const missingTables = [];
    
    for (const tableName of requiredTables) {
      const { rows } = await db.query(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      `, [tableName]);
      
      if (rows.length === 0) {
        missingTables.push(tableName);
      }
    }
    
    if (missingTables.length > 0) {
      console.error(chalk.red(`❌ No se puede ejecutar la migración de auditoría porque faltan tablas requeridas:`));
      missingTables.forEach(table => {
        console.error(chalk.red(`   - ${table}`));
      });
      console.error(chalk.yellow('ℹ️ Ejecute primero "npm run db:init:all" para crear todas las tablas necesarias.'));
      process.exit(1);
    }
    
    console.log(chalk.green('✅ Todas las tablas dependientes existen'));
    console.log(chalk.blue('🚀 Ejecutando migración de auditoría...'));
    
    await db.query(migration);
    
    console.log(chalk.green('✅ Migración de auditoría completada exitosamente'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error al ejecutar la migración:'), error);
    process.exit(1);
  } finally {
    // Cerrar la conexión a la base de datos
    try {
      await db.end();
      console.log(chalk.blue('👋 Conexión a la base de datos cerrada'));
    } catch (error) {
      console.error(chalk.red('❌ Error al cerrar la conexión:'), error);
    }
  }
}

// Ejecutar la migración
executeMigration(); 