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
  }

  // Crea un nuevo registro de pago
  static async crear(nuevoPago) {
    const query = `
      INSERT INTO pagos_facturacion (
        id_paciente, id_cita, monto, fecha_pago, estado,
        metodo_pago, numero_comprobante, notas
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      nuevoPago.id_paciente,
      nuevoPago.id_cita,
      nuevoPago.monto,
      nuevoPago.fecha_pago || 'NOW()',
      nuevoPago.estado,
      nuevoPago.metodo_pago,
      nuevoPago.numero_comprobante,
      nuevoPago.notas
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear registro de pago: ${error.message}`);
    }
  }

  // Obtiene un pago por su ID
  static async obtenerPorId(id) {
    const query = 'SELECT * FROM pagos_facturacion WHERE id = $1';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener pago: ${error.message}`);
    }
  }

  // Obtiene todos los pagos de un paciente
  static async obtenerPorPaciente(idPaciente) {
    const query = `
      SELECT pf.*, c.fecha_hora as fecha_cita, u.nombre as nombre_profesional, s.nombre as servicio
      FROM pagos_facturacion pf
      JOIN horas_agendadas c ON pf.id_cita = c.id
      JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
      JOIN usuarios u ON ps.id_usuario = u.id
      LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
      WHERE pf.id_paciente = $1
      ORDER BY pf.fecha_pago DESC
    `;
    
    try {
      const { rows } = await db.query(query, [idPaciente]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener pagos del paciente: ${error.message}`);
    }
  }

  // Obtiene el pago asociado a una cita
  static async obtenerPorCita(idCita) {
    const query = 'SELECT * FROM pagos_facturacion WHERE id_cita = $1';
    
    try {
      const { rows } = await db.query(query, [idCita]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener pago de la cita: ${error.message}`);
    }
  }

  // Obtiene pagos por estado
  static async obtenerPorEstado(estado) {
    const query = `
      SELECT pf.*, u1.nombre as nombre_paciente, u2.nombre as nombre_profesional, s.nombre as servicio
      FROM pagos_facturacion pf
      JOIN pacientes p ON pf.id_paciente = p.id_usuario
      JOIN usuarios u1 ON p.id_usuario = u1.id
      JOIN horas_agendadas c ON pf.id_cita = c.id
      JOIN profesionales_salud ps ON c.id_profesional = ps.id_usuario
      JOIN usuarios u2 ON ps.id_usuario = u2.id
      LEFT JOIN servicios_procedimientos s ON c.id_servicio = s.id
      WHERE pf.estado = $1
      ORDER BY pf.fecha_pago DESC
    `;
    
    try {
      const { rows } = await db.query(query, [estado]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener pagos por estado: ${error.message}`);
    }
  }

  // Obtiene pagos por método de pago
  static async obtenerPorMetodoPago(metodoPago) {
    const query = `
      SELECT * FROM pagos_facturacion 
      WHERE metodo_pago = $1
      ORDER BY fecha_pago DESC
    `;
    
    try {
      const { rows } = await db.query(query, [metodoPago]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener pagos por método de pago: ${error.message}`);
    }
  }

  // Obtiene pagos por rango de fechas
  static async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    const query = `
      SELECT * FROM pagos_facturacion 
      WHERE fecha_pago BETWEEN $1 AND $2
      ORDER BY fecha_pago
    `;
    
    try {
      const { rows } = await db.query(query, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener pagos por rango de fechas: ${error.message}`);
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
        notas = $9
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
      pagoActualizado.notas
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar pago: ${error.message}`);
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
      throw new Error(`Error al actualizar estado del pago: ${error.message}`);
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
      throw new Error(`Error al registrar pago: ${error.message}`);
    }
  }

  // Genera un reporte de pagos para un período específico
  static async generarReporte(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        SUM(monto) as total,
        COUNT(*) as cantidad,
        estado,
        metodo_pago
      FROM pagos_facturacion 
      WHERE fecha_pago BETWEEN $1 AND $2
      GROUP BY estado, metodo_pago
      ORDER BY estado, metodo_pago
    `;
    
    try {
      const { rows } = await db.query(query, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      throw new Error(`Error al generar reporte de pagos: ${error.message}`);
    }
  }

  // Elimina un pago
  static async eliminar(id) {
    const query = 'DELETE FROM pagos_facturacion WHERE id = $1 RETURNING *';
    
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar pago: ${error.message}`);
    }
  }
}

export default Pago; 