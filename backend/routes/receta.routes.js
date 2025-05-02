import express from 'express';
import * as RecetaController from '../controllers/receta.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear una nueva receta
router.post('/', RecetaController.crearReceta);

// Obtener una receta por su ID
router.get('/:id', RecetaController.obtenerRecetaPorId);

// Obtener todas las recetas asociadas a un historial médico
router.get('/historial/:id_historial', RecetaController.obtenerRecetasPorHistorial);

// Obtener todas las recetas recetadas a un paciente
router.get('/paciente/:id_paciente', RecetaController.obtenerRecetasPorPaciente);

// Obtener todas las recetas emitidas por un profesional
router.get('/profesional/:id_profesional', RecetaController.obtenerRecetasPorProfesional);

// Actualizar una receta
router.put('/:id', RecetaController.actualizarReceta);

// Eliminar una receta
router.delete('/:id', RecetaController.eliminarReceta);

// Generar PDF de una receta
router.get('/:id/pdf', RecetaController.generarPDFReceta);

export default router; 