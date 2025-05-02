import express from 'express';
import * as MedicamentoController from '../controllers/medicamento.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Crear un nuevo medicamento
router.post('/', MedicamentoController.crearMedicamento);

// Obtener un medicamento por su ID
router.get('/:id', MedicamentoController.obtenerMedicamentoPorId);

// Obtener todos los medicamentos (con filtros opcionales por nombre o principio activo)
router.get('/', MedicamentoController.obtenerMedicamentos);

// Buscar medicamentos por nombre, principio activo o indicaciones
router.get('/buscar', MedicamentoController.buscarMedicamentos);

// Actualizar un medicamento
router.put('/:id', MedicamentoController.actualizarMedicamento);

// Eliminar un medicamento
router.delete('/:id', MedicamentoController.eliminarMedicamento);

// Obtener todas las recetas que incluyen este medicamento
router.get('/:id/recetas', MedicamentoController.obtenerRecetasMedicamento);

export default router; 