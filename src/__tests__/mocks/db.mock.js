/**
 * Mock para la base de datos
 */

// Mock para el pool de conexiones
const mockPool = {
  query: jest.fn(),
  connect: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    release: jest.fn(),
    on: jest.fn()
  }))
};

// Mock de resultados de consultas comunes
const mockQueryResults = {
  // Diagnósticos
  diagnósticos: [
    { id: 1, codigo: 'J00', nombre: 'Resfriado común', descripcion: null, categoria: 'Enfermedades respiratorias' },
    { id: 2, codigo: 'E11', nombre: 'Diabetes mellitus tipo 2', descripcion: null, categoria: 'Enfermedades endocrinas' }
  ],
  
  // Citas
  citas: [
    { 
      id: 1, 
      horario_id: 1, 
      paciente_id: 1, 
      servicio_id: 1, 
      estado: 'agendada',
      observaciones: null,
      fecha_agendamiento: '2023-01-01T10:00:00.000Z',
      motivo_consulta: 'Control mensual',
      fecha: '2023-01-10',
      hora_inicio: '10:00:00',
      hora_fin: '10:30:00',
      id_profesional: 1,
      nombre_profesional: 'Dr. Juan Pérez',
      rol_profesional: 'médico',
      nombre_paciente: 'Ana',
      apellido_paciente: 'González',
      rut_paciente: '12345678-9',
      fecha_nacimiento_paciente: '1990-05-15',
      servicio: 'Consulta general',
      duracion_minutos: 30,
      precio: 25000,
      especialidad_id: 1,
      especialidad: 'Medicina general',
      consultorio: 'Consultorio Central',
      direccion_consultorio: 'Av. Principal 123'
    },
    { 
      id: 2, 
      horario_id: 2, 
      paciente_id: 2, 
      servicio_id: 2, 
      estado: 'completada',
      observaciones: 'Paciente con síntomas de gripe',
      fecha_agendamiento: '2023-01-02T11:00:00.000Z',
      motivo_consulta: 'Fiebre y dolor de garganta',
      fecha: '2023-01-11',
      hora_inicio: '11:00:00',
      hora_fin: '11:30:00',
      id_profesional: 2,
      nombre_profesional: 'Dra. María López',
      rol_profesional: 'médico',
      nombre_paciente: 'Carlos',
      apellido_paciente: 'Rodríguez',
      rut_paciente: '98765432-1',
      fecha_nacimiento_paciente: '1985-08-20',
      servicio: 'Consulta especialista',
      duracion_minutos: 30,
      precio: 35000,
      especialidad_id: 2,
      especialidad: 'Otorrinolaringología',
      consultorio: 'Consultorio Norte',
      direccion_consultorio: 'Calle Secundaria 456'
    }
  ],

  // Estadísticas para reportes
  estadisticasGenerales: {
    total_pacientes: 150,
    total_medicos: 10,
    total_especialidades: 5,
    total_consultorios: 3,
    total_servicios: 15,
    total_horarios: 200,
    total_citas: 80,
    total_diagnosticos: 50
  },

  citasPorPeriodo: [
    { periodo: '2023-01-01', total_citas: 5, agendadas: 2, completadas: 2, canceladas: 1 },
    { periodo: '2023-01-02', total_citas: 8, agendadas: 3, completadas: 4, canceladas: 1 },
    { periodo: '2023-01-03', total_citas: 6, agendadas: 2, completadas: 3, canceladas: 1 }
  ],

  diagnosticosFrecuentes: [
    { id: 1, codigo: 'J00', nombre: 'Resfriado común', categoria: 'Enfermedades respiratorias', total: 12 },
    { id: 3, codigo: 'J03', nombre: 'Amigdalitis aguda', categoria: 'Enfermedades respiratorias', total: 8 },
    { id: 7, codigo: 'I10', nombre: 'Hipertensión esencial', categoria: 'Enfermedades cardiovasculares', total: 7 }
  ]
};

// Configurar respuestas predeterminadas para el mock
mockPool.query.mockImplementation((sql, params) => {
  // Diagnósticos
  if (sql.includes('FROM diagnosticos')) {
    return Promise.resolve({ rows: mockQueryResults.diagnósticos, rowCount: mockQueryResults.diagnósticos.length });
  }
  
  // Citas
  if (sql.includes('FROM horas_agendadas')) {
    return Promise.resolve({ rows: mockQueryResults.citas, rowCount: mockQueryResults.citas.length });
  }

  // Estadísticas generales
  if (sql.includes('total_pacientes')) {
    return Promise.resolve({ rows: [mockQueryResults.estadisticasGenerales], rowCount: 1 });
  }

  // Citas por período
  if (sql.includes('GROUP BY periodo')) {
    return Promise.resolve({ rows: mockQueryResults.citasPorPeriodo, rowCount: mockQueryResults.citasPorPeriodo.length });
  }

  // Diagnósticos frecuentes
  if (sql.includes('GROUP BY d.id, d.codigo, d.nombre, d.categoria')) {
    return Promise.resolve({ rows: mockQueryResults.diagnosticosFrecuentes, rowCount: mockQueryResults.diagnosticosFrecuentes.length });
  }

  // Respuesta por defecto
  return Promise.resolve({ rows: [], rowCount: 0 });
});

module.exports = {
  mockPool,
  mockQueryResults
}; 