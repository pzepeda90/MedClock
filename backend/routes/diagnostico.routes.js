import express from 'express';
import DiagnosticoController from '../controllers/diagnostico.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Obtener todos los diagnósticos (con filtros opcionales)
router.get('/', DiagnosticoController.getAll);

// Obtener un diagnóstico por ID
router.get('/:id', DiagnosticoController.getById);

// Obtener un diagnóstico por código
router.get('/codigo/:codigo', DiagnosticoController.getByCodigo);

// Crear un nuevo diagnóstico
router.post('/', DiagnosticoController.create);

// Asociar diagnóstico a cita
router.post('/cita/:citaId', DiagnosticoController.asociarACita);

// Obtener diagnósticos de una cita
router.get('/cita/:citaId', DiagnosticoController.getDiagnosticosByCita);

export default router; 