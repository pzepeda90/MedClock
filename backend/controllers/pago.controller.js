import Pago from '../models/pago.model.js';
import Paciente from '../models/paciente.model.js';
import Cita from '../models/cita.model.js';
import CodigoProcedimiento from '../models/codigoProcedimiento.model.js';
import { db } from '../database/database.js';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError 
} from '../utils/errors.js';

// Crear un nuevo pago
export const crearPago = async (req, res, next) => {
  try {
    const { 
      id_paciente, 
      id_cita, 
      monto, 
      fecha_pago, 
      estado, 
      metodo_pago, 
      numero_comprobante, 
      notas,
      id_codigo_procedimiento
    } = req.body;

    // Verificar campos obligatorios
    if (!id_paciente || !id_cita || !estado) {
      throw new BadRequestError('ID de paciente, ID de cita y estado son obligatorios');
    }

    // Si no se proporciona un monto pero sí un código de procedimiento, usamos el precio de referencia
    let montoFinal = monto;
    
    if (id_codigo_procedimiento) {
      // Verificar si el código existe
      const codigo = await CodigoProcedimiento.obtenerPorId(id_codigo_procedimiento);
      if (!codigo) {
        throw new NotFoundError('Código de procedimiento no encontrado');
      }
      
      // Si no se proporcionó un monto, usar el precio de referencia del código
      if (!montoFinal && codigo.precio_referencia) {
        montoFinal = codigo.precio_referencia;
      }
    } else if (!montoFinal) {
      // Si no hay ni monto ni código, error
      throw new BadRequestError('Debe proporcionar un monto o un código de procedimiento');
    }

    // Verificar si el paciente existe
    const paciente = await Paciente.obtenerPorId(id_paciente);
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }

    // Verificar si la cita existe
    const cita = await Cita.obtenerPorId(id_cita);
    if (!cita) {
      throw new NotFoundError('Cita no encontrada');
    }

    // Verificar si ya existe un pago para esta cita
    const pagoExistente = await Pago.obtenerPorCita(id_cita);
    if (pagoExistente) {
      throw new ConflictError('Ya existe un pago registrado para esta cita');
    }

    // Crear el nuevo pago
    const nuevoPago = {
      id_paciente,
      id_cita,
      monto: montoFinal,
      fecha_pago: fecha_pago || null,
      estado,
      metodo_pago: metodo_pago || null,
      numero_comprobante: numero_comprobante || null,
      notas: notas || null,
      id_codigo_procedimiento: id_codigo_procedimiento || null
    };

    const pagoCreado = await Pago.crear(nuevoPago);

    res.status(201).json({
      error: false,
      mensaje: 'Pago registrado exitosamente',
      pago: pagoCreado
    });

  } catch (error) {
    next(error);
  }
};

// Obtener un pago por su ID
export const obtenerPagoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const pago = await Pago.obtenerPorId(id);
    if (!pago) {
      throw new NotFoundError('Pago no encontrado');
    }
    
    res.status(200).json({
      error: false,
      pago
    });
    
  } catch (error) {
    next(error);
  }
};

// Obtener pagos por paciente
export const obtenerPagosPorPaciente = async (req, res, next) => {
  try {
    const { id_paciente } = req.params;
    
    // Verificar si el paciente existe
    const paciente = await Paciente.obtenerPorId(id_paciente);
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }
    
    const pagos = await Pago.obtenerPorPaciente(id_paciente);
    
    res.status(200).json({
      error: false,
      total: pagos.length,
      pagos
    });
    
  } catch (error) {
    next(error);
  }
};

// Obtener pago por cita
export const obtenerPagoPorCita = async (req, res, next) => {
  try {
    const { id_cita } = req.params;
    
    // Verificar si la cita existe
    const cita = await Cita.obtenerPorId(id_cita);
    if (!cita) {
      throw new NotFoundError('Cita no encontrada');
    }
    
    const pago = await Pago.obtenerPorCita(id_cita);
    if (!pago) {
      throw new NotFoundError('No se encontró pago para esta cita');
    }
    
    res.status(200).json({
      error: false,
      pago
    });
    
  } catch (error) {
    next(error);
  }
};

// Obtener pagos por filtros (estado, método de pago, rango de fechas, código de procedimiento)
export const obtenerPagos = async (req, res, next) => {
  try {
    const { 
      estado, 
      metodo_pago, 
      fecha_inicio, 
      fecha_fin, 
      id_codigo,
      tipo_codigo
    } = req.query;
    
    let pagos;
    
    if (id_codigo) {
      // Verificar si el código existe
      const codigo = await CodigoProcedimiento.obtenerPorId(id_codigo);
      if (!codigo) {
        throw new NotFoundError('Código de procedimiento no encontrado');
      }
      
      pagos = await Pago.obtenerPorCodigoProcedimiento(id_codigo);
    } else if (estado) {
      pagos = await Pago.obtenerPorEstado(estado);
    } else if (metodo_pago) {
      pagos = await Pago.obtenerPorMetodoPago(metodo_pago);
    } else if (fecha_inicio && fecha_fin) {
      pagos = await Pago.obtenerPorRangoFechas(fecha_inicio, fecha_fin);
    } else {
      // Consulta para obtener todos los pagos con información completa
      const query = `
        SELECT 
          pf.*, 
          u1.nombre as nombre_paciente, 
          u2.nombre as nombre_profesional, 
          s.nombre as servicio,
          cp.codigo as codigo_procedimiento,
          cp.nombre as nombre_codigo_procedimiento,
          cp.tipo as tipo_codigo
        FROM pagos_facturacion pf
        JOIN pacientes p ON pf.id_paciente = p.id_usuario
        JOIN usuarios u1 ON p.id_usuario = u1.id
        JOIN horas_agendadas c ON pf.id_cita = c.id
        JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
        JOIN usuarios u2 ON ps.id_usuario = u2.id
        LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
        LEFT JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
        ${tipo_codigo ? 'WHERE cp.tipo = $1' : ''}
        ORDER BY pf.fecha_pago DESC NULLS FIRST, c.fecha_hora DESC
        LIMIT 100
      `;
      
      const { rows } = await db.query(
        query, 
        tipo_codigo ? [tipo_codigo] : []
      );
      pagos = rows;
    }

    res.status(200).json({
      error: false,
      total: pagos.length,
      pagos
    });

  } catch (error) {
    next(error);
  }
};

// Actualizar un pago
export const actualizarPago = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Verificar si el pago existe
    const pagoExistente = await Pago.obtenerPorId(id);
    if (!pagoExistente) {
      throw new NotFoundError('Pago no encontrado');
    }

    // Si se actualiza el código de procedimiento, verificar que existe
    if (datosActualizados.id_codigo_procedimiento) {
      const codigo = await CodigoProcedimiento.obtenerPorId(datosActualizados.id_codigo_procedimiento);
      if (!codigo) {
        throw new NotFoundError('Código de procedimiento no encontrado');
      }
      
      // Si no se especifica un monto nuevo, usar el precio de referencia del código
      if (!datosActualizados.monto && codigo.precio_referencia) {
        datosActualizados.monto = codigo.precio_referencia;
      }
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
      notas: datosActualizados.notas !== undefined ? datosActualizados.notas : pagoExistente.notas,
      id_codigo_procedimiento: datosActualizados.id_codigo_procedimiento !== undefined ? datosActualizados.id_codigo_procedimiento : pagoExistente.id_codigo_procedimiento
    });

    res.status(200).json({
      error: false,
      mensaje: 'Pago actualizado exitosamente',
      pago: pagoActualizado
    });

  } catch (error) {
    next(error);
  }
};

// Actualizar estado de un pago
export const actualizarEstadoPago = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      throw new BadRequestError('El estado es obligatorio');
    }

    // Verificar si el pago existe
    const pagoExistente = await Pago.obtenerPorId(id);
    if (!pagoExistente) {
      throw new NotFoundError('Pago no encontrado');
    }

    // Verificar que el estado sea válido
    const estadosValidos = ['pendiente', 'pagado', 'anulado', 'reembolsado'];
    if (!estadosValidos.includes(estado)) {
      throw new BadRequestError('Estado no válido');
    }

    // Actualizar el estado del pago
    const pagoActualizado = await Pago.actualizarEstado(id, estado);

    res.status(200).json({
      error: false,
      mensaje: 'Estado del pago actualizado exitosamente',
      pago: pagoActualizado
    });

  } catch (error) {
    next(error);
  }
};

// Registrar pago (cuando se confirma un pago pendiente)
export const registrarPago = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { metodo_pago, numero_comprobante, notas } = req.body;

    if (!metodo_pago) {
      throw new BadRequestError('El método de pago es obligatorio');
    }

    // Verificar si el pago existe
    const pagoExistente = await Pago.obtenerPorId(id);
    if (!pagoExistente) {
      throw new NotFoundError('Pago no encontrado');
    }

    // Verificar que el pago esté en estado pendiente
    if (pagoExistente.estado !== 'pendiente') {
      throw new BadRequestError(`No se puede registrar un pago que ya está en estado ${pagoExistente.estado}`);
    }

    // Registrar el pago
    const pagoRegistrado = await Pago.registrarPago(id, metodo_pago, numero_comprobante, notas);

    res.status(200).json({
      error: false,
      mensaje: 'Pago registrado exitosamente',
      pago: pagoRegistrado
    });

  } catch (error) {
    next(error);
  }
};

// Asignar código de procedimiento a un pago
export const asignarCodigoProcedimiento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_codigo } = req.body;

    if (!id_codigo) {
      throw new BadRequestError('El ID del código de procedimiento es obligatorio');
    }

    // Verificar si el pago existe
    const pagoExistente = await Pago.obtenerPorId(id);
    if (!pagoExistente) {
      throw new NotFoundError('Pago no encontrado');
    }

    // Verificar si el código existe
    const codigo = await CodigoProcedimiento.obtenerPorId(id_codigo);
    if (!codigo) {
      throw new NotFoundError('Código de procedimiento no encontrado');
    }

    // Asignar código al pago (esto también actualizará el monto)
    const pagoActualizado = await Pago.asignarCodigoProcedimiento(id, id_codigo);

    res.status(200).json({
      error: false,
      mensaje: 'Código de procedimiento asignado exitosamente',
      pago: pagoActualizado
    });

  } catch (error) {
    next(error);
  }
};

// Generar reporte de pagos
export const generarReportePagos = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin, tipo_codigo } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      throw new BadRequestError('Fecha de inicio y fecha de fin son obligatorias');
    }

    let reporte;

    if (tipo_codigo) {
      // Reporte específico por tipo de código
      reporte = await Pago.generarReportePorTipoCodigo(fecha_inicio, fecha_fin, tipo_codigo);
    } else {
      // Reporte general
      reporte = await Pago.generarReporte(fecha_inicio, fecha_fin);
    }

    res.status(200).json({
      error: false,
      total: reporte.length,
      reporte
    });

  } catch (error) {
    next(error);
  }
};

// Obtener historial de auditoría de un pago
export const obtenerAuditoriaPago = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar si el pago existe
    const pago = await Pago.obtenerPorId(id);
    if (!pago) {
      throw new NotFoundError('Pago no encontrado');
    }
    
    // Consultar la tabla de auditoría
    const query = `
      SELECT 
        a.id,
        a.tipo_cambio,
        a.detalles,
        a.fecha,
        a.usuario_id,
        a.metodo_pago,
        a.monto,
        a.codigo_procedimiento,
        a.motivo,
        u.nombre as usuario,
        cp.nombre as nombre_codigo
      FROM auditoria_pagos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN codigos_procedimientos cp ON a.codigo_procedimiento = cp.codigo
      WHERE a.id_pago = $1
      ORDER BY a.fecha DESC
    `;
    
    const { rows } = await db.query(query, [id]);
    
    res.status(200).json({
      error: false,
      historial: rows
    });
    
  } catch (error) {
    next(error);
  }
};

// Obtener pagos asociados a un médico
export const obtenerPagosPorMedico = async (req, res, next) => {
  try {
    const { id_medico } = req.params;
    
    // Consultar pagos asociados a las citas del médico
    const query = `
      SELECT 
        pf.*,
        c.fecha_hora as fecha_cita,
        s.nombre as servicio,
        s.descripcion as descripcion_servicio,
        u1.nombre as nombre_paciente,
        cp.codigo as codigo_procedimiento,
        cp.nombre as nombre_codigo_procedimiento,
        cp.tipo as tipo_codigo
      FROM pagos_facturacion pf
      JOIN horas_agendadas c ON pf.id_cita = c.id
      JOIN pacientes p ON pf.id_paciente = p.id_usuario
      JOIN usuarios u1 ON p.id_usuario = u1.id
      LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
      LEFT JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE c.id_profesional = $1
      ORDER BY pf.fecha_pago DESC NULLS FIRST, c.fecha_hora DESC
    `;
    
    const { rows } = await db.query(query, [id_medico]);
    
    res.status(200).json({
      error: false,
      total: rows.length,
      pagos: rows
    });
    
  } catch (error) {
    next(error);
  }
};

export default {
  crearPago,
  obtenerPagoPorId,
  obtenerPagosPorPaciente,
  obtenerPagoPorCita,
  obtenerPagos,
  actualizarPago,
  actualizarEstadoPago,
  registrarPago,
  asignarCodigoProcedimiento,
  generarReportePagos,
  obtenerAuditoriaPago,
  obtenerPagosPorMedico
}; 