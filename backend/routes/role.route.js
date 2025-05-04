import { Router } from "express";
import { roleController } from "../controllers/role.controller.js";
import { verifyToken, hasRole } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Obtiene todos los roles disponibles
 *     tags: [Roles]
 *     description: Endpoint para obtener la lista de todos los roles disponibles en el sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: admin
 *                       name:
 *                         type: string
 *                         example: Administrador
 *                       description:
 *                         type: string
 *                         example: Acceso completo al sistema
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", verifyToken, roleController.getAllRoles);

/**
 * @swagger
 * /roles/{roleId}:
 *   get:
 *     summary: Obtiene detalles de un rol específico
 *     tags: [Roles]
 *     description: Endpoint para obtener información detallada de un rol, incluyendo sus permisos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador del rol
 *     responses:
 *       200:
 *         description: Detalles del rol obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: admin
 *                 name:
 *                   type: string
 *                   example: Administrador
 *                 description:
 *                   type: string
 *                   example: Acceso completo al sistema
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ver_todo
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:roleId", verifyToken, roleController.getRoleDetails);

/**
 * @swagger
 * /roles/check/{permission}:
 *   get:
 *     summary: Verifica si el usuario tiene un permiso específico
 *     tags: [Roles]
 *     description: Endpoint para verificar si el usuario autenticado tiene un permiso específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *         description: Permiso a verificar
 *     responses:
 *       200:
 *         description: Verificación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasPermission:
 *                   type: boolean
 *                   example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/check/:permission", verifyToken, roleController.checkPermission);

export default router; 