#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsDir = path.join(__dirname, '..', 'models');

/**
 * Actualiza un archivo de modelo para usar la nueva configuración de base de datos
 * @param {string} filePath - Ruta del archivo a procesar
 */
async function updateModelFile(filePath) {
  try {
    // Leer el contenido del archivo
    const content = await fs.readFile(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`📝 Procesando ${fileName}...`);
    
    // Verificar si ya está actualizado
    if (content.includes('import db from "../database/database.js";')) {
      console.log(`✅ ${fileName} ya está actualizado.`);
      return;
    }
    
    // Reemplazar las importaciones de pool por db
    let updatedContent = content.replace(
      /import\s+{\s*pool\s*}\s+from\s+(['"])\.\.\/database\/(connection|db)\.js\1;/g,
      'import db from "../database/database.js";'
    );
    
    // Reemplazar usos de pool.query por db.query
    updatedContent = updatedContent.replace(/pool\.query/g, 'db.query');
    
    // Si es una clase, reemplazar las funciones de transacción
    if (content.includes('class ')) {
      // Buscar secciones donde se utilizan transacciones
      const transactionRegex = /const\s+client\s*=\s*await\s+pool\.connect\(\);[\s\S]*?client\.release\(\);/g;
      let match;
      
      // Reemplazar cada sección de transacción
      while ((match = transactionRegex.exec(content)) !== null) {
        const transactionBlock = match[0];
        let updatedBlock = transactionBlock;
        
        // Reemplazar begin/commit/rollback
        updatedBlock = updatedBlock.replace(
          /const\s+client\s*=\s*await\s+pool\.connect\(\);/g,
          'const client = await db.getClient();'
        );
        
        updatedContent = updatedContent.replace(transactionBlock, updatedBlock);
      }
    }
    
    // Agregar más manejo de errores en cada función async (si no lo tiene ya)
    if (!content.includes('try {') && content.includes('async')) {
      // Aquí se podría implementar una lógica más avanzada para agregar
      // bloques try-catch a funciones que no los tienen
    }
    
    // Escribir el contenido actualizado
    await fs.writeFile(filePath, updatedContent, 'utf8');
    console.log(`✅ ${fileName} actualizado con éxito.`);
    
  } catch (error) {
    console.error(`❌ Error al procesar ${path.basename(filePath)}:`, error);
  }
}

/**
 * Procesa todos los archivos de modelo en el directorio
 */
async function processModels() {
  try {
    console.log('🔍 Buscando archivos de modelo...');
    
    // Listar todos los archivos .js en el directorio de modelos
    const files = await fs.readdir(modelsDir);
    const modelFiles = files.filter(file => file.endsWith('.model.js'));
    
    console.log(`📊 Encontrados ${modelFiles.length} archivos de modelo.`);
    
    // Procesar cada archivo
    const promises = modelFiles.map(file => {
      const filePath = path.join(modelsDir, file);
      return updateModelFile(filePath);
    });
    
    await Promise.all(promises);
    
    console.log('✨ Proceso completado con éxito.');
    
  } catch (error) {
    console.error('❌ Error al procesar los modelos:', error);
  }
}

// Ejecutar el script
processModels(); 