import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import pacienteRoutes from '../../routes/paciente.routes.js';

// Mock del middleware de autenticación
jest.mock('../../middlewares/auth.middleware.js', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 1, email: 'test@example.com', role: 'admin' };
    next();
  })
}));

// Mock de los modelos
jest.mock('../../models/paciente.model.js', () => {
  return {
    default: {
      obtenerTodos: jest.fn(),
      obtenerPorId: jest.fn(),
      obtenerPorRut: jest.fn(),
      crear: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn()
    }
  };
});

jest.mock('../../models/user.model.js', () => ({
  userModel: {
    findById: jest.fn()
  }
}));

// Importar después del mock para acceder a las versiones mockeadas
import Paciente from '../../models/paciente.model.js';
import { userModel as Usuario } from '../../models/user.model.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

// Crear aplicación Express para pruebas
const app = express();
app.use(express.json());
app.use('/pacientes', pacienteRoutes);

describe('Rutas de Pacientes (Nueva Estructura)', () => {
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('GET /pacientes', () => {
    it('debería obtener todos los pacientes', async () => {
      // Mock de datos de pacientes con nueva estructura
      const mockPacientes = [
        { 
          id_usuario: 1, 
          primer_nombre: 'Juan', 
          segundo_nombre: 'Carlos',
          primer_apellido: 'Pérez', 
          segundo_apellido: 'González',
          rut: '12345678-9',
          celular: '56912345678',
          email: 'juan@example.com'
        },
        { 
          id_usuario: 2, 
          primer_nombre: 'María', 
          segundo_nombre: null,
          primer_apellido: 'López', 
          segundo_apellido: 'Morales',
          rut: '98765432-1',
          celular: '56987654321',
          email: 'maria@example.com'
        }
      ];
      
      // Configurar mock
      Paciente.obtenerTodos.mockResolvedValue(mockPacientes);
      
      // Realizar petición
      const response = await request(app)
        .get('/pacientes')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerTodos).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: false,
        total: 2,
        pacientes: mockPacientes
      });
    });
  });
  
  describe('GET /pacientes/:id', () => {
    it('debería obtener un paciente por su ID con todos los nuevos campos', async () => {
      // Mock de datos del paciente con nueva estructura
      const mockPaciente = { 
        id_usuario: 1, 
        primer_nombre: 'Juan', 
        segundo_nombre: 'Carlos',
        primer_apellido: 'Pérez', 
        segundo_apellido: 'González',
        rut: '12345678-9',
        fecha_nacimiento: '1990-01-01',
        sexo: 'M',
        genero: 'Masculino',
        nacionalidad: 'Chilena',
        estado_civil: 'Soltero',
        foto_url: 'https://example.com/foto.jpg',
        calle: 'Av. Principal',
        numero: '123',
        depto: '45',
        comuna: 'Santiago',
        region: 'Metropolitana',
        codigo_postal: '7500000',
        telefono_fijo: '223334444',
        celular: '56912345678',
        email: 'juan@example.com',
        grupo_sanguineo: 'O+',
        alergias: 'Penicilina',
        antecedentes_medicos: 'Hipertensión',
        contacto_emergencia_nombre: 'Ana Pérez',
        contacto_emergencia_telefono: '56987654321'
      };
      
      // Configurar mock
      Paciente.obtenerPorId.mockResolvedValue(mockPaciente);
      
      // Realizar petición
      const response = await request(app)
        .get('/pacientes/1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('1');
      expect(response.body).toEqual({
        error: false,
        paciente: mockPaciente
      });
    });
    
    it('debería devolver 404 si el paciente no existe', async () => {
      // Configurar mock
      Paciente.obtenerPorId.mockResolvedValue(null);
      
      // Realizar petición
      const response = await request(app)
        .get('/pacientes/999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('999');
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    });
  });
  
  describe('POST /pacientes', () => {
    it('debería crear un nuevo paciente con la nueva estructura de campos', async () => {
      // Datos del usuario y nuevo paciente
      const mockUsuario = { id: 1, nombre: 'Usuario Test', email: 'test@example.com' };
      
      const pacienteData = {
        id_usuario: 1,
        primer_nombre: 'Juan',
        segundo_nombre: 'Carlos',
        primer_apellido: 'Pérez',
        segundo_apellido: 'González',
        rut: '12345678-9',
        fecha_nacimiento: '1990-01-01',
        sexo: 'M',
        genero: 'Masculino',
        nacionalidad: 'Chilena',
        estado_civil: 'Soltero',
        calle: 'Av. Principal',
        numero: '123',
        depto: '45',
        comuna: 'Santiago',
        region: 'Metropolitana',
        codigo_postal: '7500000',
        celular: '56912345678',
        telefono_fijo: '223334444',
        email: 'juan@example.com'
      };
      
      const mockPacienteCreado = {
        ...pacienteData,
        grupo_sanguineo: null,
        alergias: null,
        antecedentes_medicos: null,
        contacto_emergencia_nombre: null,
        contacto_emergencia_telefono: null,
        fecha_creacion: '2025-05-03T12:00:00.000Z',
        fecha_actualizacion: '2025-05-03T12:00:00.000Z'
      };
      
      // Configurar mocks
      Usuario.findById.mockResolvedValue(mockUsuario);
      Paciente.obtenerPorRut.mockResolvedValue(null); // No existe paciente con ese RUT
      Paciente.crear.mockResolvedValue(mockPacienteCreado);
      
      // Realizar petición
      const response = await request(app)
        .post('/pacientes')
        .send(pacienteData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Usuario.findById).toHaveBeenCalledWith(1);
      expect(Paciente.obtenerPorRut).toHaveBeenCalledWith('12345678-9');
      expect(Paciente.crear).toHaveBeenCalled();
      expect(response.body).toEqual({
        error: false,
        mensaje: 'Paciente creado exitosamente',
        paciente: mockPacienteCreado
      });
    });
    
    it('debería devolver error si faltan campos obligatorios', async () => {
      // Datos incompletos
      const pacienteData = {
        id_usuario: 1,
        // Faltan primer_nombre, primer_apellido, rut, celular
      };
      
      // Realizar petición
      const response = await request(app)
        .post('/pacientes')
        .send(pacienteData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(response.body.error).toBeTruthy();
      // Verifica que el mensaje de error mencione los campos faltantes
      expect(response.body.mensaje).toContain('primer nombre');
      expect(response.body.mensaje).toContain('primer apellido');
      expect(response.body.mensaje).toContain('RUT');
      expect(response.body.mensaje).toContain('celular');
    });
  });
  
  describe('PUT /pacientes/:id', () => {
    it('debería actualizar los campos de un paciente existente', async () => {
      // Mock de datos
      const mockPacienteExistente = { 
        id_usuario: 1, 
        primer_nombre: 'Juan', 
        primer_apellido: 'Pérez',
        rut: '12345678-9', 
        celular: '56912345678'
      };
      
      const datosActualizados = {
        celular: '56987654321',
        calle: 'Nueva Calle',
        numero: '456',
        codigo_postal: '7500001'
      };
      
      const mockPacienteActualizado = { 
        ...mockPacienteExistente,
        ...datosActualizados,
        fecha_actualizacion: '2025-05-03T13:00:00.000Z'
      };
      
      // Configurar mocks
      Paciente.obtenerPorId.mockResolvedValue(mockPacienteExistente);
      Paciente.actualizar.mockResolvedValue(mockPacienteActualizado);
      
      // Realizar petición
      const response = await request(app)
        .put('/pacientes/1')
        .send(datosActualizados)
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('1');
      expect(Paciente.actualizar).toHaveBeenCalledWith('1', datosActualizados);
      expect(response.body).toEqual({
        error: false,
        mensaje: 'Paciente actualizado exitosamente',
        paciente: mockPacienteActualizado
      });
    });
    
    it('debería devolver 404 si el paciente a actualizar no existe', async () => {
      // Configurar mock
      Paciente.obtenerPorId.mockResolvedValue(null);
      
      // Realizar petición
      const response = await request(app)
        .put('/pacientes/999')
        .send({ celular: '56987654321' })
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('999');
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    });
  });
  
  describe('DELETE /pacientes/:id', () => {
    it('debería eliminar un paciente', async () => {
      // Mock de datos
      const mockPacienteExistente = { 
        id_usuario: 1, 
        primer_nombre: 'Juan', 
        primer_apellido: 'Pérez',
        rut: '12345678-9'
      };
      
      // Configurar mocks
      Paciente.obtenerPorId.mockResolvedValue(mockPacienteExistente);
      Paciente.eliminar.mockResolvedValue(mockPacienteExistente);
      
      // Realizar petición
      const response = await request(app)
        .delete('/pacientes/1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('1');
      expect(Paciente.eliminar).toHaveBeenCalledWith('1');
      expect(response.body).toEqual({
        error: false,
        mensaje: 'Paciente eliminado exitosamente'
      });
    });
    
    it('debería devolver 404 si el paciente a eliminar no existe', async () => {
      // Configurar mock
      Paciente.obtenerPorId.mockResolvedValue(null);
      
      // Realizar petición
      const response = await request(app)
        .delete('/pacientes/999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Verificar respuesta
      expect(verifyToken).toHaveBeenCalled();
      expect(Paciente.obtenerPorId).toHaveBeenCalledWith('999');
      expect(response.body).toEqual({
        error: true,
        mensaje: 'Paciente no encontrado'
      });
    });
  });
}); 