#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../database/database.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta del archivo de migración
const migrationFile = path.join(__dirname, '../database/migrations/02_codigos_procedimientos.sql');

async function executeMigration() {
  try {
    console.log(chalk.blue('📝 Leyendo archivo de migración...'));
    
    const migration = fs.readFileSync(migrationFile, 'utf8');
    
    console.log(chalk.blue('🔄 Conectando a la base de datos...'));
    
    console.log(chalk.blue('🚀 Ejecutando migración...'));
    await db.query(migration);
    
    console.log(chalk.green('✅ Migración completada exitosamente'));
    
    // Insertar algunos ejemplos de códigos Fonasa si se solicita
    const args = process.argv.slice(2);
    if (args.includes('--with-samples')) {
      console.log(chalk.blue('🌱 Insertando datos de ejemplo...'));
      await insertSampleData();
      console.log(chalk.green('✅ Datos de ejemplo insertados correctamente'));
    }
    
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

async function insertSampleData() {
  // Códigos de ejemplo para Fonasa
  const fonasaCodes = [
    { codigo: 'F001', nombre: 'Consulta médica general', descripcion: 'Consulta médica de atención primaria', tipo: 'fonasa', precio_referencia: 15000 },
    { codigo: 'F002', nombre: 'Consulta médica especialista', descripcion: 'Consulta médica con especialista', tipo: 'fonasa', precio_referencia: 25000 },
    { codigo: 'F003', nombre: 'Radiografía simple', descripcion: 'Radiografía de una zona anatómica', tipo: 'fonasa', precio_referencia: 18000 },
    { codigo: 'F004', nombre: 'Ecografía abdominal', descripcion: 'Ecografía de abdomen completo', tipo: 'fonasa', precio_referencia: 30000 },
    { codigo: 'F005', nombre: 'Electrocardiograma', descripcion: 'Registro de la actividad eléctrica del corazón', tipo: 'fonasa', precio_referencia: 12000 },
    { codigo: 'F006', nombre: 'Hemograma completo', descripcion: 'Análisis completo de sangre', tipo: 'fonasa', precio_referencia: 8000 },
    { codigo: 'F007', nombre: 'Perfil bioquímico', descripcion: 'Análisis bioquímico de sangre', tipo: 'fonasa', precio_referencia: 15000 },
    { codigo: 'F008', nombre: 'Consulta psicológica', descripcion: 'Atención con psicólogo clínico', tipo: 'fonasa', precio_referencia: 22000 }
  ];

  // Códigos de ejemplo para Isapre
  const isapreCodes = [
    { codigo: 'I001', nombre: 'Consulta médica general', descripcion: 'Consulta médica de atención primaria', tipo: 'isapre', precio_referencia: 18000 },
    { codigo: 'I002', nombre: 'Consulta médica especialista', descripcion: 'Consulta médica con especialista', tipo: 'isapre', precio_referencia: 35000 },
    { codigo: 'I003', nombre: 'Radiografía simple', descripcion: 'Radiografía de una zona anatómica', tipo: 'isapre', precio_referencia: 25000 },
    { codigo: 'I004', nombre: 'Resonancia magnética', descripcion: 'Resonancia magnética de una región anatómica', tipo: 'isapre', precio_referencia: 120000 }
  ];

  // Códigos de ejemplo para atención particular
  const particularCodes = [
    { codigo: 'P001', nombre: 'Consulta médica general', descripcion: 'Consulta médica de atención primaria', tipo: 'particular', precio_referencia: 25000 },
    { codigo: 'P002', nombre: 'Consulta médica especialista', descripcion: 'Consulta médica con especialista', tipo: 'particular', precio_referencia: 50000 },
    { codigo: 'P003', nombre: 'Cirugía menor', descripcion: 'Procedimiento quirúrgico menor', tipo: 'particular', precio_referencia: 150000 },
    { codigo: 'P004', nombre: 'Cirugía mayor ambulatoria', descripcion: 'Procedimiento quirúrgico mayor sin hospitalización', tipo: 'particular', precio_referencia: 350000 }
  ];

  // Combinar todos los códigos
  const allCodes = [...fonasaCodes, ...isapreCodes, ...particularCodes];

  // Insertar códigos en la base de datos
  for (const code of allCodes) {
    try {
      const query = `
        INSERT INTO codigos_procedimientos (codigo, nombre, descripcion, tipo, precio_referencia, activo)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (codigo) DO NOTHING
      `;
      
      await db.query(query, [
        code.codigo,
        code.nombre,
        code.descripcion,
        code.tipo,
        code.precio_referencia
      ]);
      
      console.log(chalk.green(`✓ Código insertado: ${code.codigo} - ${code.nombre}`));
    } catch (error) {
      console.error(chalk.red(`✗ Error al insertar código ${code.codigo}:`), error.message);
    }
  }
}

// Ejecutar la migración
executeMigration(); 