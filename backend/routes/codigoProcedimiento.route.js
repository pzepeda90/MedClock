import { Router } from "express";
import codigoProcedimientoController from "../controllers/codigoProcedimiento.controller.js";
import { verifyToken, hasRole } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /codigos-procedimientos:
 *   post:
 *     summary: Crea un nuevo código de procedimiento
 *     tags: [Códigos Procedimientos]
 *     description: Crea un nuevo código de procedimiento (solo accesible para administradores)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nombre
 *               - tipo
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código único del procedimiento (ej. código Fonasa)
 *               nombre:
 *                 type: string
 *                 description: Nombre descriptivo del procedimiento
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del procedimiento
 *               tipo:
 *                 type: string
 *                 description: Tipo de código (fonasa, particular, isapre, etc.)
 *               precio_referencia:
 *                 type: number
 *                 description: Precio de referencia para el procedimiento
 *               activo:
 *                 type: boolean
 *                 description: Indica si el código está activo
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de servicios a asociar con este código
 *     responses:
 *       201:
 *         description: Código creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       409:
 *         description: El código ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", verifyToken, hasRole(['admin']), codigoProcedimientoController.crearCodigo);

/**
 * @swagger
 * /codigos-procedimientos:
 *   get:
 *     summary: Obtiene todos los códigos de procedimientos
 *     tags: [Códigos Procedimientos]
 *     description: Obtiene la lista de códigos de procedimientos con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activos
 *         schema:
 *           type: string
 *           enum: [true, false, todos]
 *         description: Filtrar por estado de activación
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de código
 *       - in: query
 *         name: codigo
 *         schema:
 *           type: string
 *         description: Buscar por código
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: number
 *         description: Precio máximo
 *     responses:
 *       200:
 *         description: Lista de códigos obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", verifyToken, codigoProcedimientoController.obtenerCodigos);

/**
 * @swagger
 * /codigos-procedimientos/{id}:
 *   get:
 *     summary: Obtiene un código de procedimiento por su ID
 *     tags: [Códigos Procedimientos]
 *     description: Obtiene información detallada de un código de procedimiento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de procedimiento
 *     responses:
 *       200:
 *         description: Información del código obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Código no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", verifyToken, codigoProcedimientoController.obtenerCodigoPorId);

/**
 * @swagger
 * /codigos-procedimientos/{id}:
 *   put:
 *     summary: Actualiza un código de procedimiento
 *     tags: [Códigos Procedimientos]
 *     description: Actualiza la información de un código de procedimiento existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de procedimiento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               tipo:
 *                 type: string
 *               precio_referencia:
 *                 type: number
 *               activo:
 *                 type: boolean
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Código actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Código no encontrado
 *       409:
 *         description: Conflicto con otro código existente
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", verifyToken, hasRole(['admin']), codigoProcedimientoController.actualizarCodigo);

/**
 * @swagger
 * /codigos-procedimientos/{id}:
 *   delete:
 *     summary: Elimina un código de procedimiento
 *     tags: [Códigos Procedimientos]
 *     description: Elimina un código de procedimiento existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de procedimiento
 *     responses:
 *       200:
 *         description: Código eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Código no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", verifyToken, hasRole(['admin']), codigoProcedimientoController.eliminarCodigo);

/**
 * @swagger
 * /codigos-procedimientos/{idCodigo}/servicios:
 *   get:
 *     summary: Obtiene los servicios asociados a un código
 *     tags: [Códigos Procedimientos]
 *     description: Obtiene la lista de servicios asociados a un código de procedimiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCodigo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de procedimiento
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Código no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:idCodigo/servicios", verifyToken, codigoProcedimientoController.obtenerServiciosAsociados);

/**
 * @swagger
 * /codigos-procedimientos/{idCodigo}/servicios/{idServicio}:
 *   post:
 *     summary: Asocia un servicio a un código
 *     tags: [Códigos Procedimientos]
 *     description: Asocia un servicio existente a un código de procedimiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCodigo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de procedimiento
 *       - in: path
 *         name: idServicio
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Servicio asociado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Código o servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/:idCodigo/servicios/:idServicio", verifyToken, hasRole(['admin']), codigoProcedimientoController.asociarServicio);

/**
 * @swagger
 * /codigos-procedimientos/{idCodigo}/servicios/{idServicio}:
 *   delete:
 *     summary: Desasocia un servicio de un código
 *     tags: [Códigos Procedimientos]
 *     description: Elimina la asociación entre un servicio y un código de procedimiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCodigo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de procedimiento
 *       - in: path
 *         name: idServicio
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Servicio desasociado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Código o servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:idCodigo/servicios/:idServicio", verifyToken, hasRole(['admin']), codigoProcedimientoController.desasociarServicio);

export default router; 