import Pago from '../models/pago.model.js';
import Paciente from '../models/paciente.model.js';
import Cita from '../models/cita.model.js';
import { db } from '../database/database.js';

// Crear un nuevo pago
export const crearPago = async (req, res) => {
  try {
    const { 
      id_paciente, 
      id_cita, 
      monto, 
      fecha_pago, 
      estado, 
      metodo_pago, 
      numero_comprobante, 
      notas 
    } = req.body;

    // Verificar campos obligatorios
    if (!id_paciente || !id_cita || !monto || !estado) {
      return res.status(400).json({
        error: true,
        mensaje: 'ID de paciente, ID de cita, monto y estado son obligatorios'
      });
    }

    // Verificar si el paciente existe
    const paciente = await Paciente.obtenerPorId(id_paciente);
    if (!paciente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    }

    // Verificar si la cita existe
    const cita = await Cita.obtenerPorId(id_cita);
    if (!cita) {
      return res.status(404).json({
        error: true,
        mensaje: 'Cita no encontrada'
      });
    }

    // Verificar si ya existe un pago para esta cita
    const pagoExistente = await Pago.obtenerPorCita(id_cita);
    if (pagoExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ya existe un pago registrado para esta cita'
      });
    }

    // Crear el nuevo pago
    const nuevoPago = {
      id_paciente,
      id_cita,
      monto,
      fecha_pago: fecha_pago || null,
      estado,
      metodo_pago: metodo_pago || null,
      numero_comprobante: numero_comprobante || null,
      notas: notas || null
    };

    const pagoCreado = await Pago.crear(nuevoPago);

    res.status(201).json({
      error: false,
      mensaje: 'Pago registrado exitosamente',
      pago: pagoCreado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al registrar pago: ${error.message}`
    });
  }
};

// Obtener un pago por su ID
export const obtenerPagoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.obtenerPorId(id);

    if (!pago) {
      return res.status(404).json({
        error: true,
        mensaje: 'Pago no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      pago
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener pago: ${error.message}`
    });
  }
};

// Obtener pagos por paciente
export const obtenerPagosPorPaciente = async (req, res) => {
  try {
    const { id_paciente } = req.params;

    // Verificar si el paciente existe
    const paciente = await Paciente.obtenerPorId(id_paciente);
    if (!paciente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    }

    const pagos = await Pago.obtenerPorPaciente(id_paciente);

    res.status(200).json({
      error: false,
      total: pagos.length,
      pagos
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener pagos del paciente: ${error.message}`
    });
  }
};

// Obtener pago por cita
export const obtenerPagoPorCita = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const pago = await Pago.obtenerPorCita(id_cita);

    if (!pago) {
      return res.status(404).json({
        error: true,
        mensaje: 'No se encontró un pago para esta cita'
      });
    }

    res.status(200).json({
      error: false,
      pago
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener pago de la cita: ${error.message}`
    });
  }
};

// Obtener pagos por filtros (estado, método de pago, rango de fechas)
export const obtenerPagos = async (req, res) => {
  try {
    const { estado, metodo_pago, fecha_inicio, fecha_fin } = req.query;
    
    let pagos;
    
    if (estado) {
      pagos = await Pago.obtenerPorEstado(estado);
    } else if (metodo_pago) {
      pagos = await Pago.obtenerPorMetodoPago(metodo_pago);
    } else if (fecha_inicio && fecha_fin) {
      pagos = await Pago.obtenerPorRangoFechas(fecha_inicio, fecha_fin);
    } else {
      // Implementar una consulta para obtener todos los pagos si no se proporciona un filtro
      const query = `
        SELECT pf.*, u1.nombre as nombre_paciente, u2.nombre as nombre_profesional, s.nombre as servicio
        FROM pagos_facturacion pf
        JOIN pacientes p ON pf.id_paciente = p.id_usuario
        JOIN usuarios u1 ON p.id_usuario = u1.id
        JOIN horas_agendadas c ON pf.id_cita = c.id
        JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
        JOIN usuarios u2 ON ps.id_usuario = u2.id
        LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
        ORDER BY pf.fecha_pago DESC
        LIMIT 100
      `;
      const { rows } = await db.query(query);
      pagos = rows;
    }

    res.status(200).json({
      error: false,
      total: pagos.length,
      pagos
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener pagos: ${error.message}`
    });
  }
};

// Actualizar un pago
export const actualizarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el pago existe
    const pagoExistente = await Pago.obtenerPorId(id);
    if (!pagoExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Pago no encontrado'
      });
    }

    // Actualizar el pago
    const pagoActualizado = await Pago.actualizar(id, {
      id_paciente: datosActualizados.id_paciente || pagoExistente.id_paciente,
      id_cita: datosActualizados.id_cita || pagoExistente.id_cita,
      monto: datosActualizados.monto || pagoExistente.monto,
      fecha_pago: datosActualizados.fecha_pago || pagoExistente.fecha_pago,
      estado: datosActualizados.estado || pagoExistente.estado,
      metodo_pago: datosActualizados.metodo_pago !== undefined ? datosActualizados.metodo_pago : pagoExistente.metodo_pago,
      numero_comprobante: datosActualizados.numero_comprobante !== undefined ? datosActualizados.numero_comprobante : pagoExistente.numero_comprobante,
      notas: datosActualizados.notas !== undefined ? datosActualizados.notas : pagoExistente.notas
    });

    res.status(200).json({
      error: false,
      mensaje: 'Pago actualizado exitosamente',
      pago: pagoActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar pago: ${error.message}`
    });
  }
};

// Actualizar estado de un pago
export const actualizarEstadoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        error: true,
        mensaje: 'El estado es obligatorio'
      });
    }

    // Verificar si el pago existe
    const pagoExistente = await Pago.obtenerPorId(id);
    if (!pagoExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Pago no encontrado'
      });
    }

    // Verificar que el estado sea válido
    const estadosValidos = ['pendiente', 'pagado', 'anulado', 'reembolsado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: true,
        mensaje: 'Estado no válido'
      });
    }

    // Actualizar el estado del pago
    const pagoActualizado = await Pago.actualizarEstado(id, estado);

    res.status(200).json({
      error: false,
      mensaje: 'Estado del pago actualizado exitosamente',
      pago: pagoActualizado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al actualizar estado del pago: ${error.message}`
    });
  }
};

// Registrar pago (cuando se confirma un pago pendiente)
export const registrarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { metodo_pago, numero_comprobante, notas } = req.body;

    if (!metodo_pago) {
      return res.status(400).json({
        error: true,
        mensaje: 'El método de pago es obligatorio'
      });
    }

    // Verificar si el pago existe
    const pagoExistente = await Pago.obtenerPorId(id);
    if (!pagoExistente) {
      return res.status(404).json({
        error: true,
        mensaje: 'Pago no encontrado'
      });
    }

    // Verificar que el pago esté en estado pendiente
    if (pagoExistente.estado !== 'pendiente') {
      return res.status(400).json({
        error: true,
        mensaje: `No se puede registrar un pago que ya está en estado ${pagoExistente.estado}`
      });
    }

    // Registrar el pago
    const pagoRegistrado = await Pago.registrarPago(id, metodo_pago, numero_comprobante, notas);

    res.status(200).json({
      error: false,
      mensaje: 'Pago registrado exitosamente',
      pago: pagoRegistrado
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al registrar pago: ${error.message}`
    });
  }
};

// Generar reporte de pagos
export const generarReportePagos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: true,
        mensaje: 'Se requieren fecha de inicio y fecha de fin para generar el reporte'
      });
    }

    const reporte = await Pago.generarReporte(fecha_inicio, fecha_fin);

    // Calcular totales
    const totalPagos = reporte.reduce((sum, item) => sum + parseInt(item.cantidad), 0);
    const totalMonto = reporte.reduce((sum, item) => sum + parseFloat(item.total), 0);

    res.status(200).json({
      error: false,
      periodo: {
        inicio: fecha_inicio,
        fin: fecha_fin
      },
      totales: {
        pagos: totalPagos,
        monto: totalMonto
      },
      detalle: reporte
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al generar reporte de pagos: ${error.message}`
    });
  }
}; 