import express from 'express';
import * as NotificacionController from '../controllers/notificacion.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear una nueva notificación
router.post('/', NotificacionController.crearNotificacion);

// Obtener una notificación por su ID
router.get('/:id', NotificacionController.obtenerNotificacionPorId);

// Obtener notificaciones por usuario
router.get('/usuario/:id_usuario', NotificacionController.obtenerNotificacionesPorUsuario);

// Marcar notificación como leída
router.patch('/:id/leer', NotificacionController.marcarComoLeida);

// Marcar todas las notificaciones como leídas
router.patch('/usuario/:id_usuario/leer-todas', NotificacionController.marcarTodasComoLeidas);

// Eliminar una notificación
router.delete('/:id', NotificacionController.eliminarNotificacion);

// Eliminar todas las notificaciones de un usuario
router.delete('/usuario/:id_usuario', NotificacionController.eliminarTodasNotificaciones);

// Notificar cita agendada
router.post('/cita/:id_cita/agendar', NotificacionController.notificarCitaAgendada);

// Notificar recordatorio de cita
router.post('/cita/:id_cita/recordar', NotificacionController.notificarRecordatorioCita);

export default router;