import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { loginValidator, registerValidator, updateUserValidator } from "../validators/user.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { verifyToken, hasRole } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/security.middleware.js";

const router = Router();

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Inicia sesión en el sistema
 *     tags: [Autenticación]
 *     description: Endpoint para autenticar un usuario existente y obtener un token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Credenciales'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inicio de sesión exitoso
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/login", authLimiter, loginValidator, validate, userController.login);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     description: Endpoint para crear un nuevo usuario en el sistema
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroUsuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario creado exitosamente
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/register", authLimiter, registerValidator, validate, userController.register);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Usuarios]
 *     description: Endpoint para obtener la información del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/profile", verifyToken, userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Actualiza el perfil del usuario autenticado
 *     tags: [Usuarios]
 *     description: Endpoint para actualizar la información del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez Actualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan.actualizado@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NuevaContraseña123
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Perfil actualizado exitosamente
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/profile", verifyToken, updateUserValidator, validate, userController.updateProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios (solo admin)
 *     tags: [Administración]
 *     description: Endpoint para obtener la lista de todos los usuarios (solo accesible para administradores)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tiene permiso para acceder a esta información
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", verifyToken, hasRole(['admin']), userController.getAllUsers);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Busca usuarios por criterios (solo admin y recepcionista)
 *     tags: [Administración]
 *     description: Endpoint para buscar usuarios según criterios específicos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Texto para buscar en nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, medico, paciente, recepcionista]
 *         description: Filtrar por rol específico
 *     responses:
 *       200:
 *         description: Búsqueda completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tiene permiso para acceder a esta información
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/search", verifyToken, hasRole(['admin', 'recepcionista']), userController.searchUsers);

export default router;
