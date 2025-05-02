import { db } from '../database/database.js';

// Obtener estadísticas generales para el dashboard
export const obtenerEstadisticasGenerales = async (req, res) => {
  try {
    // Obtener la cantidad de pacientes
    const pacientesQuery = 'SELECT COUNT(*) as total FROM pacientes';
    const { rows: pacientesRows } = await db.query(pacientesQuery);
    const totalPacientes = parseInt(pacientesRows[0].total);

    // Obtener la cantidad de profesionales
    const profesionalesQuery = 'SELECT COUNT(*) as total FROM profesionales_salud';
    const { rows: profesionalesRows } = await db.query(profesionalesQuery);
    const totalProfesionales = parseInt(profesionalesRows[0].total);

    // Obtener la cantidad de especialidades
    const especialidadesQuery = 'SELECT COUNT(*) as total FROM especialidades_medicas';
    const { rows: especialidadesRows } = await db.query(especialidadesQuery);
    const totalEspecialidades = parseInt(especialidadesRows[0].total);

    // Obtener la cantidad de citas pendientes
    const citasPendientesQuery = `
      SELECT COUNT(*) as total FROM horas_agendadas 
      WHERE fecha_hora > NOW() AND estado = 'confirmada'
    `;
    const { rows: citasPendientesRows } = await db.query(citasPendientesQuery);
    const citasPendientes = parseInt(citasPendientesRows[0].total);

    // Obtener la cantidad de citas completadas
    const citasCompletadasQuery = `
      SELECT COUNT(*) as total FROM horas_agendadas 
      WHERE estado = 'completada'
    `;
    const { rows: citasCompletadasRows } = await db.query(citasCompletadasQuery);
    const citasCompletadas = parseInt(citasCompletadasRows[0].total);

    // Obtener la cantidad de pagos pendientes
    const pagosPendientesQuery = `
      SELECT COUNT(*) as total FROM pagos_facturacion 
      WHERE estado = 'pendiente'
    `;
    const { rows: pagosPendientesRows } = await db.query(pagosPendientesQuery);
    const pagosPendientes = parseInt(pagosPendientesRows[0].total);

    // Obtener total de ingresos
    const ingresosQuery = `
      SELECT SUM(monto) as total FROM pagos_facturacion 
      WHERE estado = 'pagado'
    `;
    const { rows: ingresosRows } = await db.query(ingresosQuery);
    const totalIngresos = parseFloat(ingresosRows[0].total || 0);

    res.status(200).json({
      error: false,
      estadisticas: {
        pacientes: totalPacientes,
        profesionales: totalProfesionales,
        especialidades: totalEspecialidades,
        citas: {
          pendientes: citasPendientes,
          completadas: citasCompletadas,
          total: citasPendientes + citasCompletadas
        },
        pagos: {
          pendientes: pagosPendientes,
          totalIngresos: totalIngresos
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener estadísticas generales: ${error.message}`
    });
  }
};

// Obtener estadísticas de citas por mes
export const obtenerEstadisticasCitasPorMes = async (req, res) => {
  try {
    const { anio } = req.query;
    const anioActual = anio || new Date().getFullYear();

    const query = `
      SELECT 
        EXTRACT(MONTH FROM fecha_hora) as mes,
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
      FROM horas_agendadas
      WHERE EXTRACT(YEAR FROM fecha_hora) = $1
      GROUP BY mes
      ORDER BY mes
    `;

    const { rows } = await db.query(query, [anioActual]);

    // Rellenar los meses faltantes con ceros
    const mesesCompletos = Array.from({ length: 12 }, (_, i) => {
      const mesExistente = rows.find(r => parseInt(r.mes) === i + 1);
      return {
        mes: i + 1,
        nombre_mes: new Date(anioActual, i, 1).toLocaleString('es', { month: 'long' }),
        total: mesExistente ? parseInt(mesExistente.total) : 0,
        completadas: mesExistente ? parseInt(mesExistente.completadas) : 0,
        canceladas: mesExistente ? parseInt(mesExistente.canceladas) : 0
      };
    });

    res.status(200).json({
      error: false,
      anio: anioActual,
      estadisticas: mesesCompletos
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener estadísticas de citas por mes: ${error.message}`
    });
  }
};

// Obtener estadísticas de ingresos por mes
export const obtenerEstadisticasIngresosPorMes = async (req, res) => {
  try {
    const { anio } = req.query;
    const anioActual = anio || new Date().getFullYear();

    const query = `
      SELECT 
        EXTRACT(MONTH FROM fecha_pago) as mes,
        SUM(monto) as total_ingresos,
        COUNT(*) as total_pagos
      FROM pagos_facturacion
      WHERE EXTRACT(YEAR FROM fecha_pago) = $1 AND estado = 'pagado'
      GROUP BY mes
      ORDER BY mes
    `;

    const { rows } = await db.query(query, [anioActual]);

    // Rellenar los meses faltantes con ceros
    const mesesCompletos = Array.from({ length: 12 }, (_, i) => {
      const mesExistente = rows.find(r => parseInt(r.mes) === i + 1);
      return {
        mes: i + 1,
        nombre_mes: new Date(anioActual, i, 1).toLocaleString('es', { month: 'long' }),
        total_ingresos: mesExistente ? parseFloat(mesExistente.total_ingresos) : 0,
        total_pagos: mesExistente ? parseInt(mesExistente.total_pagos) : 0
      };
    });

    res.status(200).json({
      error: false,
      anio: anioActual,
      estadisticas: mesesCompletos
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener estadísticas de ingresos por mes: ${error.message}`
    });
  }
};

// Obtener ranking de profesionales por citas
export const obtenerRankingProfesionales = async (req, res) => {
  try {
    const { limite } = req.query;
    const limiteRegistros = limite || 10;

    const query = `
      SELECT 
        ps.id_usuario,
        u.nombre,
        em.nombre as especialidad,
        COUNT(ha.id) as total_citas,
        SUM(CASE WHEN ha.estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas,
        SUM(CASE WHEN ha.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas
      FROM profesionales_salud ps
      JOIN usuarios u ON ps.id_usuario = u.id
      JOIN especialidades_medicas em ON ps.especialidad_id = em.id
      LEFT JOIN horas_agendadas ha ON ps.id_usuario = ha.id_profesional
      GROUP BY ps.id_usuario, u.nombre, em.nombre
      ORDER BY total_citas DESC
      LIMIT $1
    `;

    const { rows } = await db.query(query, [limiteRegistros]);

    res.status(200).json({
      error: false,
      total: rows.length,
      ranking: rows
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener ranking de profesionales: ${error.message}`
    });
  }
};

// Obtener estadísticas por especialidad
export const obtenerEstadisticasPorEspecialidad = async (req, res) => {
  try {
    const query = `
      SELECT 
        em.id,
        em.nombre as especialidad,
        COUNT(ps.id_usuario) as total_profesionales,
        COUNT(DISTINCT ha.id_paciente) as total_pacientes,
        COUNT(ha.id) as total_citas
      FROM especialidades_medicas em
      LEFT JOIN profesionales_salud ps ON em.id = ps.especialidad_id
      LEFT JOIN horas_agendadas ha ON ps.id_usuario = ha.id_profesional
      GROUP BY em.id, em.nombre
      ORDER BY total_citas DESC
    `;

    const { rows } = await db.query(query);

    res.status(200).json({
      error: false,
      total: rows.length,
      estadisticas: rows
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener estadísticas por especialidad: ${error.message}`
    });
  }
};

// Obtener tiempos de espera promedio por especialidad
export const obtenerTiemposEsperaPromedio = async (req, res) => {
  try {
    const query = `
      WITH citas_fechas AS (
        SELECT 
          em.id as especialidad_id,
          em.nombre as especialidad,
          ha.fecha_creacion,
          ha.fecha_hora,
          EXTRACT(EPOCH FROM (ha.fecha_hora - ha.fecha_creacion))/86400 as dias_espera
        FROM horas_agendadas ha
        JOIN profesionales_salud ps ON ha.id_profesional = ps.id_usuario
        JOIN especialidades_medicas em ON ps.especialidad_id = em.id
        WHERE ha.estado = 'completada' AND ha.fecha_creacion IS NOT NULL
      )
      
      SELECT 
        especialidad_id,
        especialidad,
        AVG(dias_espera) as promedio_dias_espera,
        COUNT(*) as total_citas
      FROM citas_fechas
      GROUP BY especialidad_id, especialidad
      ORDER BY promedio_dias_espera DESC
    `;

    const { rows } = await db.query(query);

    res.status(200).json({
      error: false,
      total: rows.length,
      tiempos_espera: rows.map(r => ({
        ...r,
        promedio_dias_espera: parseFloat(r.promedio_dias_espera).toFixed(1)
      }))
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: `Error al obtener tiempos de espera promedio: ${error.message}`
    });
  }
}; 