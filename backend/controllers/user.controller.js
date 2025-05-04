import "dotenv/config";
import bcript from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";
import { sanitizeData } from "../middlewares/validation.middleware.js";
import { 
  BadRequestError, 
  NotFoundError, 
  InternalServerError, 
  ConflictError 
} from "../utils/errors.js";

/**
 * Registra un nuevo usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const register = async (req, res) => {
  try {
    const { email, password, nombre, role } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await userModel.findOneEmail(email);
    if (existingUser) {
      throw new ConflictError("El correo electrónico ya está registrado");
    }
    
    // Crear el nuevo usuario
    const hashedPassword = bcript.hashSync(password, 10);
    
    const newUser = await userModel.create({
      email,
      password: hashedPassword,
      nombre: nombre || 'Usuario',
      role: role || 'paciente'
    });

    return res.status(201).json({ 
      message: "Usuario creado exitosamente",
      user: {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    if (error instanceof ConflictError || error instanceof BadRequestError) {
      return res.status(error.statusCode).json({
        error: true,
        message: error.message
      });
    }

    if (error.code === "23505") {
      return res.status(400).json({
        error: true,
        message: "El usuario ya existe"
      });
    }

    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

/**
 * Inicia sesión con un usuario existente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar el usuario por email
    const user = await userModel.findOneEmail(email);
    if (!user) {
      throw new BadRequestError("Usuario no encontrado");
    }

    // Verificar la contraseña
    const isMatch = bcript.compareSync(password, user.password);
    if (!isMatch) {
      throw new BadRequestError("Credenciales inválidas");
    }

    // Crear el token JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    
    if (error instanceof BadRequestError) {
      return res.status(error.statusCode).json({
        error: true,
        message: error.message
      });
    }
    
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

/**
 * Obtiene el perfil del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    
    // No devolver la contraseña
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        error: true,
        message: error.message
      });
    }
    
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

/**
 * Actualiza el perfil del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Sanitizar los datos permitiendo solo ciertos campos
    const allowedFields = ['nombre', 'email', 'password'];
    const updateData = sanitizeData(req.body, allowedFields);
    
    // Si se incluye una nueva contraseña, hashearla
    if (updateData.password) {
      updateData.password = bcript.hashSync(updateData.password, 10);
    }
    
    const updatedUser = await userModel.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundError("Usuario no encontrado");
    }
    
    // No devolver la contraseña
    const { password, ...userWithoutPassword } = updatedUser;
    
    return res.status(200).json({
      message: "Perfil actualizado exitosamente",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        error: true,
        message: error.message
      });
    }
    
    if (error.code === "23505") {
      return res.status(400).json({
        error: true,
        message: "El correo electrónico ya está en uso"
      });
    }
    
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

/**
 * Obtiene todos los usuarios (solo para admin)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getAllUsers = async (req, res) => {
  try {
    // La verificación de permisos se hace con el middleware hasRole
    const users = await userModel.findAll();
    
    // No devolver contraseñas
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return res.status(200).json({
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error);
    
    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        error: true,
        message: error.message
      });
    }
    
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

/**
 * Busca usuarios por criterios
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const searchUsers = async (req, res) => {
  try {
    const criteria = {
      query: req.query.query,
      role: req.query.role
    };
    
    // Implementar búsqueda en el modelo
    const users = await userModel.search(criteria);
    
    // No devolver contraseñas
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return res.status(200).json({
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

export const userController = {
  login,
  register,
  getProfile,
  updateProfile,
  getAllUsers,
  searchUsers
};
