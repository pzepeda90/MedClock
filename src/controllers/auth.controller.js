const Usuario = require('../models/usuario.model');
const { comparePassword, generateToken } = require('../utils/auth');
const { pool } = require('../config/database');

/**
 * Controlador para gestionar la autenticación
 */
class AuthController {
  /**
   * Registra un nuevo usuario
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async register(req, res) {
    try {
      // Verificar si el email ya está registrado
      const existingUser = await Usuario.getByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: 'El email ya está registrado'
        });
      }

      // Crear el usuario
      const userData = {
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password,
        rol: req.body.rol || 'paciente' // Por defecto es paciente
      };

      const newUser = await Usuario.create(userData);

      // Si es un paciente, crear entrada en tabla pacientes
      if (userData.rol === 'paciente' && req.body.rut) {
        const pacienteData = {
          id_usuario: newUser.id,
          rut: req.body.rut,
          telefono: req.body.telefono,
          direccion: req.body.direccion,
          fecha_nacimiento: req.body.fecha_nacimiento,
          sexo: req.body.sexo
        };

        await pool.query(
          `INSERT INTO pacientes (id_usuario, rut, telefono, direccion, fecha_nacimiento, sexo)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            pacienteData.id_usuario,
            pacienteData.rut,
            pacienteData.telefono,
            pacienteData.direccion,
            pacienteData.fecha_nacimiento,
            pacienteData.sexo
          ]
        );
      }

      // Si es un profesional, crear entrada en tabla profesionales_salud
      if (['médico', 'enfermera', 'tens'].includes(userData.rol) && req.body.especialidad_id) {
        const profesionalData = {
          id_usuario: newUser.id,
          especialidad_id: req.body.especialidad_id,
          numero_registro: req.body.numero_registro,
          biografia: req.body.biografia,
          anos_experiencia: req.body.anos_experiencia,
          educacion: req.body.educacion
        };

        await pool.query(
          `INSERT INTO profesionales_salud (id_usuario, especialidad_id, numero_registro, biografia, anos_experiencia, educacion)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            profesionalData.id_usuario,
            profesionalData.especialidad_id,
            profesionalData.numero_registro,
            profesionalData.biografia,
            profesionalData.anos_experiencia,
            profesionalData.educacion
          ]
        );
      }

      res.status(201).json({
        error: false,
        message: 'Usuario registrado exitosamente',
        data: {
          id: newUser.id,
          nombre: newUser.nombre,
          email: newUser.email,
          rol: newUser.rol
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: true,
        message: 'Error al registrar usuario'
      });
    }
  }

  /**
   * Inicia sesión de un usuario
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await Usuario.getByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: true,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si el usuario está activo
      if (!user.estado) {
        return res.status(401).json({
          error: true,
          message: 'Usuario desactivado'
        });
      }

      // Verificar contraseña
      const passwordMatch = await comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({
          error: true,
          message: 'Credenciales inválidas'
        });
      }

      // Generar token JWT
      const token = generateToken({
        id: user.id,
        email: user.email,
        rol: user.rol
      });

      // Devolver información de usuario y token
      res.json({
        error: false,
        message: 'Inicio de sesión exitoso',
        data: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          token
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: true,
        message: 'Error al iniciar sesión'
      });
    }
  }

  /**
   * Obtiene la información del usuario actual
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async me(req, res) {
    try {
      // req.user se establece en el middleware de autenticación
      res.json({
        error: false,
        data: req.user
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        error: true,
        message: 'Error al obtener información del usuario'
      });
    }
  }

  /**
   * Cambia la contraseña del usuario
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Obtener usuario con password_hash
      const user = await Usuario.getByEmail(req.user.email);
      
      // Verificar contraseña actual
      const passwordMatch = await comparePassword(currentPassword, user.password_hash);
      if (!passwordMatch) {
        return res.status(400).json({
          error: true,
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Actualizar contraseña
      await Usuario.update(userId, { password: newPassword });

      res.json({
        error: false,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        error: true,
        message: 'Error al cambiar la contraseña'
      });
    }
  }
}

module.exports = AuthController; 