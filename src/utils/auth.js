const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Clave secreta para JWT (idealmente en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_agenda_medica';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';

/**
 * Genera un hash para una contraseña
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compara una contraseña con un hash almacenado
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado
 * @returns {Promise<boolean>} - true si coinciden, false si no
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Genera un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} - Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verifica un token JWT
 * @param {string} token - Token JWT
 * @returns {Object|null} - Payload descodificado o null si es inválido
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
}; 