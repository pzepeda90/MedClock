import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import Cita from '../models/cita.model.js';

const router = express.Router();

/**
 * @route GET /api/citas
 * @desc Obtener todas las citas
 * @access Privado
 */
router.get('/', async (req, res) => {
  try {
    const citas = await Cita.getCitas(req.query);
    res.json({ error: false, data: citas });
  } catch (error) {
    console.error('Error en GET /citas:', error);
    res.status(500).json({ error: true, message: 'Error al obtener citas' });
  }
});

/**
 * @route GET /api/citas/:id
 * @desc Obtener una cita por su ID
 * @access Privado
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.getCitaById(id);
    
    if (!cita) {
      return res.status(404).json({ error: true, message: 'Cita no encontrada' });
    }
    
    res.json({ error: false, data: cita });
  } catch (error) {
    console.error(`Error en GET /citas/${req.params.id}:`, error);
    res.status(500).json({ error: true, message: 'Error al obtener la cita' });
  }
});

/**
 * @route POST /api/citas
 * @desc Crear una nueva cita
 * @access Privado
 */
router.post('/', async (req, res) => {
  try {
    const { paciente_id, horario_id, servicio_id, motivo_consulta } = req.body;
    
    // Validación básica
    if (!paciente_id || !horario_id || !servicio_id) {
      return res.status(400).json({ 
        error: true, 
        message: 'Se requieren los campos paciente_id, horario_id y servicio_id' 
      });
    }
    
    const nuevaCita = await Cita.createCita(req.body);
    
    res.status(201).json({ 
      error: false, 
      data: nuevaCita, 
      message: 'Cita creada correctamente' 
    });
  } catch (error) {
    console.error('Error en POST /citas:', error);
    res.status(500).json({ error: true, message: 'Error al crear la cita' });
  }
});

/**
 * @route PUT /api/citas/:id
 * @desc Actualizar una cita existente
 * @access Privado
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const citaActualizada = await Cita.updateCita(id, req.body);
    
    if (!citaActualizada) {
      return res.status(404).json({ error: true, message: 'Cita no encontrada' });
    }
    
    res.json({ 
      error: false, 
      data: citaActualizada, 
      message: 'Cita actualizada correctamente' 
    });
  } catch (error) {
    console.error(`Error en PUT /citas/${req.params.id}:`, error);
    res.status(500).json({ error: true, message: 'Error al actualizar la cita' });
  }
});

/**
 * @route DELETE /api/citas/:id
 * @desc Eliminar una cita
 * @access Privado
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const citaEliminada = await Cita.deleteCita(id);
    
    if (!citaEliminada) {
      return res.status(404).json({ error: true, message: 'Cita no encontrada' });
    }
    
    res.json({ 
      error: false, 
      message: 'Cita eliminada correctamente', 
      data: citaEliminada 
    });
  } catch (error) {
    console.error(`Error en DELETE /citas/${req.params.id}:`, error);
    res.status(500).json({ error: true, message: 'Error al eliminar la cita' });
  }
});

export default router; 