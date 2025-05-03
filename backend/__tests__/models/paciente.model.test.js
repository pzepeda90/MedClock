import { jest } from '@jest/globals';

// Mock de la base de datos antes de importar el módulo Paciente
jest.mock('../../database/database.js', () => {
  return {
    db: {
      query: jest.fn()
    }
  };
});

// Importar después del mock para usar la versión mockeada
import Paciente from '../../models/paciente.model.js';
import { db } from '../../database/database.js';

describe('Modelo de Paciente', () => {
  // Limpiar mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reiniciar la implementación de las funciones mockeadas
    db.query.mockImplementation(() => ({
      rows: []
    }));
  });

  test('debería crear un nuevo paciente correctamente', async () => {
    // Datos de prueba
    const nuevoPaciente = {
      id_usuario: 1,
      primer_nombre: 'Juan',
      primer_apellido: 'Pérez',
      rut: '12345678-9',
      celular: '56912345678'
    };

    // Mock de respuesta de la base de datos
    const mockRows = [{ ...nuevoPaciente, id_usuario: 1 }];
    db.query.mockImplementation(() => ({
      rows: mockRows
    }));

    // Llamar al método
    const resultado = await Paciente.crear(nuevoPaciente);

    // Verificar resultado
    expect(db.query).toHaveBeenCalled();
    expect(resultado).toEqual(mockRows[0]);
  });

  test('debería obtener todos los pacientes', async () => {
    // Mock de respuesta de la base de datos
    const mockPacientes = [
      { id_usuario: 1, primer_nombre: 'Juan', primer_apellido: 'Pérez', rut: '12345678-9' },
      { id_usuario: 2, primer_nombre: 'María', primer_apellido: 'López', rut: '98765432-1' }
    ];
    db.query.mockImplementation(() => ({
      rows: mockPacientes
    }));

    // Llamar al método
    const resultado = await Paciente.obtenerTodos();

    // Verificar resultado
    expect(db.query).toHaveBeenCalled();
    expect(resultado).toEqual(mockPacientes);
  });

  test('debería obtener un paciente por ID', async () => {
    // Mock de respuesta de la base de datos
    const mockPaciente = { 
      id_usuario: 1, 
      primer_nombre: 'Juan', 
      primer_apellido: 'Pérez', 
      rut: '12345678-9' 
    };
    db.query.mockImplementation(() => ({
      rows: [mockPaciente]
    }));

    // Llamar al método
    const resultado = await Paciente.obtenerPorId(1);

    // Verificar resultado
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(resultado).toEqual(mockPaciente);
  });

  test('debería devolver null si el paciente no existe', async () => {
    // Mock de respuesta vacía de la base de datos
    db.query.mockImplementation(() => ({
      rows: []
    }));

    // Llamar al método
    const resultado = await Paciente.obtenerPorId(999);

    // Verificar resultado
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [999]);
    expect(resultado).toBeUndefined();
  });

  test('debería actualizar un paciente correctamente', async () => {
    // Datos de prueba
    const datosActualizados = {
      primer_nombre: 'Juan Carlos',
      celular: '56987654321'
    };

    // Mock de respuesta de la base de datos
    const mockPacienteActualizado = { 
      id_usuario: 1, 
      primer_nombre: 'Juan Carlos', 
      primer_apellido: 'Pérez', 
      rut: '12345678-9',
      celular: '56987654321'
    };
    db.query.mockImplementation(() => ({
      rows: [mockPacienteActualizado]
    }));

    // Llamar al método
    const resultado = await Paciente.actualizar(1, datosActualizados);

    // Verificar resultado
    expect(db.query).toHaveBeenCalled();
    expect(db.query.mock.calls[0][0]).toContain('UPDATE pacientes');
    expect(resultado).toEqual(mockPacienteActualizado);
  });

  test('debería eliminar un paciente correctamente', async () => {
    // Mock de respuesta de la base de datos
    const mockPacienteEliminado = { 
      id_usuario: 1, 
      primer_nombre: 'Juan', 
      primer_apellido: 'Pérez', 
      rut: '12345678-9' 
    };
    db.query.mockImplementation(() => ({
      rows: [mockPacienteEliminado]
    }));

    // Llamar al método
    const resultado = await Paciente.eliminar(1);

    // Verificar resultado
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM pacientes'), [1]);
    expect(resultado).toEqual(mockPacienteEliminado);
  });
}); 