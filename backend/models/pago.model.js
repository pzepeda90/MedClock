import { db } from '../database/database.js';

class Pago {
  constructor(pago) {
    this.id = pago.id;
    this.id_paciente = pago.id_paciente;
    this.id_cita = pago.id_cita;
    this.monto = pago.monto;
    this.fecha_pago = pago.fecha_pago;
    this.estado = pago.estado;
    this.metodo_pago = pago.metodo_pago;
    this.numero_comprobante = pago.numero_comprobante;
    this.notas = pago.notas;
    this.id_codigo_procedimiento = pago.id_codigo_procedimiento;
  }

  // Crea un nuevo registro de pago
  static async crear(nuevoPago) {
    const query = `
      INSERT INTO pagos_facturacion (
        id_paciente, id_cita, monto, fecha_pago, estado,
        metodo_pago, numero_comprobante, notas, id_codigo_procedimiento
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      nuevoPago.id_paciente,
      nuevoPago.id_cita,
      nuevoPago.monto,
      nuevoPago.fecha_pago || null,
      nuevoPago.estado,
      nuevoPago.metodo_pago,
      nuevoPago.numero_comprobante,
      nuevoPago.notas,
      nuevoPago.id_codigo_procedimiento
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error en crear pago:", error);
      throw error;
    }
  }

  // Obtiene un pago por su ID
  static async obtenerPorId(id) {
    const query = `
      SELECT pf.*, cp.codigo, cp.nombre as nombre_codigo, cp.tipo as tipo_codigo
      FROM pagos_facturacion pf
      LEFT JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE pf.id = $1
    `;
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error("Error en obtenerPorId:", error);
      throw error;
    }
  }

  // Obtiene todos los pagos de un paciente
  static async obtenerPorPaciente(idPaciente) {
    const query = `
      SELECT 
        pf.*, 
        c.fecha_hora as fecha_cita, 
        u.nombre as nombre_profesional, 
        s.nombre as servicio,
        cp.codigo as codigo_procedimiento,
        cp.nombre as nombre_codigo_procedimiento,
        cp.tipo as tipo_codigo
      FROM pagos_facturacion pf
      JOIN horas_agendadas c ON pf.id_cita = c.id
      JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
      JOIN usuarios u ON ps.id_usuario = u.id
      LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
      LEFT JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE pf.id_paciente = $1
      ORDER BY pf.fecha_pago DESC NULLS FIRST, c.fecha_hora DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idPaciente]);
      return rows;
    } catch (error) {
      console.error("Error en obtenerPorPaciente:", error);
      throw error;
    }
  }

  // Obtiene el pago asociado a una cita
  static async obtenerPorCita(idCita) {
    const query = `
      SELECT 
        pf.*, 
        cp.codigo as codigo_procedimiento,
        cp.nombre as nombre_codigo_procedimiento,
        cp.tipo as tipo_codigo
      FROM pagos_facturacion pf
      LEFT JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE pf.id_cita = $1
    `;
    
    try {
      const { rows } = await db.query(query, [idCita]);
      return rows[0];
    } catch (error) {
      console.error("Error en obtenerPorCita:", error);
      throw error;
    }
  }

  // Obtiene pagos por estado
  static async obtenerPorEstado(estado) {
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
      WHERE pf.estado = $1
      ORDER BY pf.fecha_pago DESC NULLS FIRST, c.fecha_hora DESC
    `;
    
    try {
      const { rows } = await db.query(query, [estado]);
      return rows;
    } catch (error) {
      console.error("Error en obtenerPorEstado:", error);
      throw error;
    }
  }

  // Obtiene pagos por código de procedimiento
  static async obtenerPorCodigoProcedimiento(idCodigo) {
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
      JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE pf.id_codigo_procedimiento = $1
      ORDER BY pf.fecha_pago DESC NULLS FIRST, c.fecha_hora DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idCodigo]);
      return rows;
    } catch (error) {
      console.error("Error en obtenerPorCodigoProcedimiento:", error);
      throw error;
    }
  }

  // Obtiene pagos por método de pago
  static async obtenerPorMetodoPago(metodoPago) {
    const query = `
      SELECT 
        pf.*, 
        u1.nombre as nombre_paciente, 
        u2.nombre as nombre_profesional, 
        s.nombre as servicio,
        cp.codigo as codigo_procedimiento,
        cp.nombre as nombre_codigo_procedimiento
      FROM pagos_facturacion pf
      JOIN pacientes p ON pf.id_paciente = p.id_usuario
      JOIN usuarios u1 ON p.id_usuario = u1.id
      JOIN horas_agendadas c ON pf.id_cita = c.id
      JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
      JOIN usuarios u2 ON ps.id_usuario = u2.id
      LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
      LEFT JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE pf.metodo_pago = $1
      ORDER BY pf.fecha_pago DESC NULLS FIRST
    `;
    
    try {
      const { rows } = await db.query(query, [metodoPago]);
      return rows;
    } catch (error) {
      console.error("Error en obtenerPorMetodoPago:", error);
      throw error;
    }
  }

  // Obtiene pagos por rango de fechas
  static async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        pf.*, 
        u1.nombre as nombre_paciente, 
        u2.nombre as nombre_profesional, 
        s.nombre as servicio,
        cp.codigo as codigo_procedimiento,
        cp.nombre as nombre_codigo_procedimiento
      FROM pagos_facturacion pf
      JOIN pacientes p ON pf.id_paciente = p.id_usuario
      JOIN usuarios u1 ON p.id_usuario = u1.id
      JOIN horas_agendadas c ON pf.id_cita = c.id
      JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
      JOIN usuarios u2 ON ps.id_usuario = u2.id
      LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
      LEFT JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE pf.fecha_pago BETWEEN $1 AND $2
      ORDER BY pf.fecha_pago
    `;
    
    try {
      const { rows } = await db.query(query, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      console.error("Error en obtenerPorRangoFechas:", error);
      throw error;
    }
  }

  // Actualiza un pago
  static async actualizar(id, pagoActualizado) {
    const query = `
      UPDATE pagos_facturacion 
      SET 
        id_paciente = $2,
        id_cita = $3,
        monto = $4,
        fecha_pago = $5,
        estado = $6,
        metodo_pago = $7,
        numero_comprobante = $8,
        notas = $9,
        id_codigo_procedimiento = $10
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      pagoActualizado.id_paciente,
      pagoActualizado.id_cita,
      pagoActualizado.monto,
      pagoActualizado.fecha_pago,
      pagoActualizado.estado,
      pagoActualizado.metodo_pago,
      pagoActualizado.numero_comprobante,
      pagoActualizado.notas,
      pagoActualizado.id_codigo_procedimiento
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error en actualizar:", error);
      throw error;
    }
  }

  // Actualiza el estado de un pago
  static async actualizarEstado(id, nuevoEstado) {
    const query = `
      UPDATE pagos_facturacion 
      SET estado = $2
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [id, nuevoEstado]);
      return rows[0];
    } catch (error) {
      console.error("Error en actualizarEstado:", error);
      throw error;
    }
  }

  // Registra un pago
  static async registrarPago(id, metodoPago, numeroComprobante, notas) {
    const query = `
      UPDATE pagos_facturacion 
      SET 
        estado = 'pagado',
        fecha_pago = NOW(),
        metodo_pago = $2,
        numero_comprobante = $3,
        notas = $4
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const { rows } = await db.query(query, [id, metodoPago, numeroComprobante, notas]);
      return rows[0];
    } catch (error) {
      console.error("Error en registrarPago:", error);
      throw error;
    }
  }

  // Asigna un código de procedimiento a un pago existente
  static async asignarCodigoProcedimiento(id, idCodigo) {
    // Primero obtenemos el precio de referencia del código
    const queryPrecio = `
      SELECT precio_referencia FROM codigos_procedimientos WHERE id = $1
    `;
    
    try {
      const { rows: precioCodigo } = await db.query(queryPrecio, [idCodigo]);
      
      if (!precioCodigo.length) {
        throw new Error('Código de procedimiento no encontrado');
      }
      
      const precioReferencia = precioCodigo[0].precio_referencia;
      
      // Ahora actualizamos el pago
      const query = `
        UPDATE pagos_facturacion 
        SET 
          id_codigo_procedimiento = $2,
          monto = $3
        WHERE id = $1
        RETURNING *
      `;
      
      const { rows } = await db.query(query, [id, idCodigo, precioReferencia]);
      return rows[0];
    } catch (error) {
      console.error("Error en asignarCodigoProcedimiento:", error);
      throw error;
    }
  }

  // Genera un reporte de pagos para un período específico
  static async generarReporte(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        SUM(monto) as total,
        COUNT(*) as cantidad,
        estado,
        metodo_pago,
        cp.tipo as tipo_codigo
      FROM pagos_facturacion pf
      LEFT JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE (fecha_pago BETWEEN $1 AND $2) OR (fecha_pago IS NULL AND pf.estado = 'pendiente')
      GROUP BY estado, metodo_pago, cp.tipo
      ORDER BY estado, metodo_pago, cp.tipo
    `;
    
    try {
      const { rows } = await db.query(query, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      console.error("Error en generarReporte:", error);
      throw error;
    }
  }

  // Genera un reporte de pagos por tipo de código de procedimiento
  static async generarReportePorTipoCodigo(fechaInicio, fechaFin, tipoCodigo) {
    const query = `
      SELECT 
        cp.codigo,
        cp.nombre as nombre_codigo,
        COUNT(*) as cantidad,
        SUM(pf.monto) as total,
        pf.estado
      FROM pagos_facturacion pf
      JOIN codigos_procedimientos cp ON pf.id_codigo_procedimiento = cp.id
      WHERE (pf.fecha_pago BETWEEN $1 AND $2 OR pf.fecha_pago IS NULL) AND cp.tipo = $3
      GROUP BY cp.codigo, cp.nombre, pf.estado
      ORDER BY cp.codigo, pf.estado
    `;
    
    try {
      const { rows } = await db.query(query, [fechaInicio, fechaFin, tipoCodigo]);
      return rows;
    } catch (error) {
      console.error("Error en generarReportePorTipoCodigo:", error);
      throw error;
    }
  }

  // Elimina un pago
  static async eliminar(id) {
    const query = 'DELETE FROM pagos_facturacion WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error("Error en eliminar:", error);
      throw error;
    }
  }
}

export default Pago; 