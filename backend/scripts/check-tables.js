#!/usr/bin/env node

import db from '../database/database.js';
import chalk from 'chalk';

async function checkDatabaseTables() {
  try {
    console.log(chalk.blue('🔍 Verificando tablas existentes en la base de datos...'));
    
    // Obtener todas las tablas del esquema público
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const { rows } = await db.query(query);
    
    if (rows.length === 0) {
      console.log(chalk.yellow('⚠️ No se encontraron tablas en la base de datos.'));
    } else {
      console.log(chalk.green(`✅ Se encontraron ${rows.length} tablas:`));
      rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // Verificar si existen las tablas necesarias para la migración
    const requiredTables = [
      'servicios_procedimientos',
      'rel_profesional_servicio',
      'horas_agendadas',
      'pagos_facturacion'
    ];
    
    const missingTables = [];
    
    for (const table of requiredTables) {
      const exists = rows.some(row => row.table_name === table);
      if (!exists) {
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.log(chalk.yellow(`⚠️ Las siguientes tablas requeridas no existen:`));
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
      
      // Preguntar si se quieren crear las tablas básicas
      console.log(chalk.yellow('\n⚠️ Es necesario crear las tablas básicas antes de ejecutar la migración de códigos'));
      console.log(chalk.blue('Sugerencia: Ejecute la migración inicial con "npm run init:db" primero.'));
    } else {
      console.log(chalk.green('✅ Todas las tablas requeridas existen.'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error al verificar tablas:'), error);
  } finally {
    try {
      await db.end();
      console.log(chalk.blue('👋 Conexión a la base de datos cerrada'));
    } catch (error) {
      console.error(chalk.red('❌ Error al cerrar la conexión:'), error);
    }
  }
}

// Ejecutar la verificación
checkDatabaseTables(); 