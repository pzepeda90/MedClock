#!/usr/bin/env node

import fetch from 'node-fetch';
import chalk from 'chalk';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BASE_URL = 'http://localhost:3005';
let authToken = null;

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Realiza una solicitud HTTP al servidor
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {string} endpoint - Endpoint a llamar
 * @param {Object} data - Datos a enviar (para POST, PUT, etc.)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function makeRequest(method, endpoint, data = null) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const options = {
      method,
      headers,
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    return {
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error(chalk.red('Error al realizar la solicitud:'), error.message);
    return {
      status: 500,
      data: { error: true, message: error.message }
    };
  }
}

/**
 * Imprime información formateada en la consola
 * @param {string} title - Título de la información
 * @param {Object} data - Datos a mostrar
 * @param {number} status - Código de estado HTTP
 */
function printResult(title, data, status) {
  console.log('\n' + chalk.bold(chalk.cyan('==== ' + title + ' ====')));
  
  if (status >= 200 && status < 300) {
    console.log(chalk.green(`✅ Estado: ${status}`));
  } else {
    console.log(chalk.red(`❌ Estado: ${status}`));
  }
  
  console.log(chalk.yellow('Respuesta:'));
  console.log(JSON.stringify(data, null, 2));
  console.log('\n');
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log(chalk.bold(chalk.green('Sistema de Prueba de Autenticación y Autorización')));
    console.log(chalk.gray('===============================================\n'));
    
    // Prueba 1: Verificar conexión al servidor
    const healthCheck = await makeRequest('GET', '/');
    printResult('Verificación de Servidor', healthCheck.data, healthCheck.status);
    
    // Prueba 2: Iniciar sesión
    console.log(chalk.bold('Inicio de Sesión'));
    const email = await question('Email: ');
    const password = await question('Contraseña: ');
    
    const loginResponse = await makeRequest('POST', '/users/login', { email, password });
    printResult('Inicio de Sesión', loginResponse.data, loginResponse.status);
    
    if (loginResponse.status === 200) {
      authToken = loginResponse.data.token;
      console.log(chalk.green('✅ Autenticación exitosa'));
      
      // Prueba 3: Obtener perfil
      const profileResponse = await makeRequest('GET', '/users/profile');
      printResult('Perfil de Usuario', profileResponse.data, profileResponse.status);
      
      // Prueba 4: Obtener roles disponibles
      const rolesResponse = await makeRequest('GET', '/roles');
      printResult('Roles Disponibles', rolesResponse.data, rolesResponse.status);
      
      // Prueba 5: Obtener detalles del rol del usuario
      const userRole = profileResponse.data.user.role;
      const roleDetailsResponse = await makeRequest('GET', `/roles/${userRole}`);
      printResult(`Detalles del Rol: ${userRole}`, roleDetailsResponse.data, roleDetailsResponse.status);
      
      // Prueba 6: Verificar permiso
      const permissionToCheck = 'ver_todo';
      const permissionResponse = await makeRequest('GET', `/roles/check/${permissionToCheck}`);
      printResult(`Verificación de Permiso: ${permissionToCheck}`, permissionResponse.data, permissionResponse.status);
      
      // Prueba 7: Intentar acceder a administración de usuarios (solo admin)
      const adminAccessResponse = await makeRequest('GET', '/users');
      printResult('Acceso Administración de Usuarios', adminAccessResponse.data, adminAccessResponse.status);
    } else {
      console.log(chalk.red('❌ Error de autenticación'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error en el script:'), error);
  } finally {
    rl.close();
  }
}

// Ejecutar script
main(); 