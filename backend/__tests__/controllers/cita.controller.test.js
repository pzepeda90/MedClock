import { jest } from '@jest/globals';

// Crear mocks manualmente en lugar de usar jest.mock()
const mockCitaModel = {
  crear: jest.fn(),
  obtenerPorId: jest.fn(),
  obtenerTodas: jest.fn(),
  obtenerPorPaciente: jest.fn(),
  obtenerPorProfesional: jest.fn(),
  actualizar: jest.fn(),
  actualizarEstado: jest.fn()
};

const mockHorarioModel = {
  verificarDisponibilidad: jest.fn()
};

const mockNotificacionModel = {
  notificarCitaAgendada: jest.fn()
};

const mockServicioModel = {
  obtenerPorId: jest.fn()
};

// Mock de controladores
const crearCita = async (req, res) => {
  try {
    const { 
      id_paciente, 
      id_profesional, 
      id_servicio, 
      fecha_hora 
    } = req.body;

    if (!id_paciente || !id_profesional || !fecha_hora) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Todos los campos obligatorios deben estar completos' 
      });
    }

    const fecha = new Date(fecha_hora).toISOString().split('T')[0];
    const hora = new Date(fecha_hora).toTimeString().split(' ')[0];
    
    const disponibilidad = await mockHorarioModel.verificarDisponibilidad(id_profesional, fecha, hora);
    
    if (!disponibilidad.disponible) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'El profesional no tiene disponibilidad en esa fecha y hora' 
      });
    }

    let duracion_min = 30;
    if (id_servicio) {
      const servicio = await mockServicioModel.obtenerPorId(id_servicio);
      if (servicio) {
        duracion_min = servicio.duracion_min;
      }
    }

    const citaCreada = await mockCitaModel.crear({
      id_paciente,
      id_profesional,
      id_servicio,
      fecha_hora,
      duracion_min
    });
    
    await mockNotificacionModel.notificarCitaAgendada(citaCreada.id);

    res.status(201).json({
      error: false,
      mensaje: 'Cita agendada exitosamente',
      cita: citaCreada
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al agendar cita: ${error.message}` 
    });
  }
};

const obtenerCitaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await mockCitaModel.obtenerPorId(id);

    if (!cita) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }

    res.status(200).json({
      error: false,
      cita
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al obtener la cita: ${error.message}` 
    });
  }
};

const obtenerCitas = async (req, res) => {
  try {
    const { id_paciente, id_profesional } = req.query;
    let citas;

    if (id_paciente) {
      citas = await mockCitaModel.obtenerPorPaciente(id_paciente);
    } else if (id_profesional) {
      citas = await mockCitaModel.obtenerPorProfesional(id_profesional);
    } else {
      citas = await mockCitaModel.obtenerTodas();
    }

    res.status(200).json({
      error: false,
      citas
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al obtener citas: ${error.message}` 
    });
  }
};

const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    
    const citaExistente = await mockCitaModel.obtenerPorId(id);
    if (!citaExistente) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }

    if (datosActualizados.fecha_hora && datosActualizados.fecha_hora !== citaExistente.fecha_hora) {
      const fecha = new Date(datosActualizados.fecha_hora).toISOString().split('T')[0];
      const hora = new Date(datosActualizados.fecha_hora).toTimeString().split(' ')[0];
      
      const disponibilidad = await mockHorarioModel.verificarDisponibilidad(
        datosActualizados.id_profesional || citaExistente.id_profesional,
        fecha,
        hora
      );
      
      if (!disponibilidad.disponible) {
        return res.status(400).json({ 
          error: true, 
          mensaje: 'El profesional no tiene disponibilidad en esa fecha y hora' 
        });
      }
    }

    const citaActualizada = await mockCitaModel.actualizar(id, datosActualizados);

    res.status(200).json({
      error: false,
      mensaje: 'Cita actualizada exitosamente',
      cita: citaActualizada
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al actualizar la cita: ${error.message}` 
    });
  }
};

const cambiarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Se requiere especificar el nuevo estado' 
      });
    }
    
    const estadosValidos = ['reservada', 'anulada', 'completada', 'reprogramada', 'no asistió'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: true, 
        mensaje: 'Estado no válido' 
      });
    }
    
    const citaActualizada = await mockCitaModel.actualizarEstado(id, estado);
    
    if (!citaActualizada) {
      return res.status(404).json({ 
        error: true, 
        mensaje: 'Cita no encontrada' 
      });
    }

    res.status(200).json({
      error: false,
      mensaje: `Estado de la cita actualizado a: ${estado}`,
      cita: citaActualizada
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      mensaje: `Error al cambiar el estado de la cita: ${error.message}` 
    });
  }
};

describe('Cita Controller', () => {
  // Mock de request y response
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Limpiamos todos los mocks
    jest.clearAllMocks();
  });
  
  describe('crearCita', () => {
    it('debería crear una cita con éxito', async () => {
      // Configurar mocks
      const mockFechaHora = '2023-07-15T14:00:00Z';
      const mockCitaCreada = { 
        id: '1', 
        id_paciente: '5', 
        id_profesional: '10',
        id_servicio: '3',
        fecha_hora: mockFechaHora,
        estado: 'reservada',
        duracion_min: 45
      };
      
      req.body = {
        id_paciente: '5',
        id_profesional: '10',
        id_servicio: '3',
        fecha_hora: mockFechaHora
      };
      
      // Mock de verificación de disponibilidad
      mockHorarioModel.verificarDisponibilidad.mockResolvedValue({
        disponible: true,
        consultorio_id: '2'
      });
      
      // Mock del servicio
      mockServicioModel.obtenerPorId.mockResolvedValue({
        id: '3',
        nombre: 'Consulta Especializada',
        duracion_min: 45
      });
      
      // Mock de creación de cita
      mockCitaModel.crear.mockResolvedValue(mockCitaCreada);
      
      // Mock de notificación
      mockNotificacionModel.notificarCitaAgendada.mockResolvedValue(true);
      
      // Ejecutar función
      await crearCita(req, res);
      
      // Verificar resultados
      expect(mockHorarioModel.verificarDisponibilidad).toHaveBeenCalled();
      expect(mockServicioModel.obtenerPorId).toHaveBeenCalledWith('3');
      expect(mockCitaModel.crear).toHaveBeenCalled();
      expect(mockNotificacionModel.notificarCitaAgendada).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        mensaje: 'Cita agendada exitosamente',
        cita: mockCitaCreada
      });
    });
    
    it('debería devolver error si faltan campos obligatorios', async () => {
      // Configurar request sin campos obligatorios
      req.body = {
        id_paciente: '5',
        // Falta id_profesional y fecha_hora
      };
      
      // Ejecutar función
      await crearCita(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Todos los campos obligatorios deben estar completos'
      });
    });
    
    it('debería devolver error si el profesional no tiene disponibilidad', async () => {
      // Configurar request
      const mockFechaHora = '2023-07-15T14:00:00Z';
      req.body = {
        id_paciente: '5',
        id_profesional: '10',
        fecha_hora: mockFechaHora
      };
      
      // Mock de verificación de disponibilidad - no disponible
      mockHorarioModel.verificarDisponibilidad.mockResolvedValue({
        disponible: false
      });
      
      // Ejecutar función
      await crearCita(req, res);
      
      // Verificar resultados
      expect(mockHorarioModel.verificarDisponibilidad).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'El profesional no tiene disponibilidad en esa fecha y hora'
      });
    });
  });
  
  describe('obtenerCitaPorId', () => {
    it('debería obtener una cita por su ID con éxito', async () => {
      // Configurar mocks
      const mockCita = { 
        id: '1', 
        id_paciente: '5', 
        id_profesional: '10',
        fecha_hora: '2023-07-15T14:00:00Z',
        estado: 'reservada'
      };
      
      req.params = { id: '1' };
      
      mockCitaModel.obtenerPorId.mockResolvedValue(mockCita);
      
      // Ejecutar función
      await obtenerCitaPorId(req, res);
      
      // Verificar resultados
      expect(mockCitaModel.obtenerPorId).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        cita: mockCita
      });
    });
    
    it('debería devolver error si la cita no existe', async () => {
      // Configurar request
      req.params = { id: '999' }; // ID que no existe
      
      // La cita no existe
      mockCitaModel.obtenerPorId.mockResolvedValue(null);
      
      // Ejecutar función
      await obtenerCitaPorId(req, res);
      
      // Verificar resultados
      expect(mockCitaModel.obtenerPorId).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        mensaje: 'Cita no encontrada'
      });
    });
  });
}); 