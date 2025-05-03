import request from 'supertest';
import express from 'express';

// Crear un mock simple de la ruta para test
const app = express();
app.use(express.json());

// Simulación de respuestas de la API
app.get('/api/pacientes', (req, res) => {
  res.status(200).json({
    error: false,
    total: 2,
    pacientes: [
      {
        id_usuario: 1,
        primer_nombre: 'Juan',
        primer_apellido: 'Pérez',
        rut: '12345678-9'
      },
      {
        id_usuario: 2,
        primer_nombre: 'María',
        primer_apellido: 'López',
        rut: '98765432-1'
      }
    ]
  });
});

app.get('/api/pacientes/:id', (req, res) => {
  if (req.params.id === '999') {
    return res.status(404).json({
      error: true,
      mensaje: 'Paciente no encontrado'
    });
  }
  
  res.status(200).json({
    error: false,
    paciente: {
      id_usuario: parseInt(req.params.id),
      primer_nombre: 'Juan',
      primer_apellido: 'Pérez',
      rut: '12345678-9'
    }
  });
});

describe('Pruebas Simples para API de Pacientes', () => {
  it('GET /api/pacientes debería devolver lista de pacientes', async () => {
    const response = await request(app)
      .get('/api/pacientes')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body.error).toBe(false);
    expect(response.body.pacientes).toHaveLength(2);
  });
  
  it('GET /api/pacientes/:id debería devolver un paciente existente', async () => {
    const response = await request(app)
      .get('/api/pacientes/1')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body.error).toBe(false);
    expect(response.body.paciente.id_usuario).toBe(1);
  });
  
  it('GET /api/pacientes/:id debería devolver 404 para ID no existente', async () => {
    const response = await request(app)
      .get('/api/pacientes/999')
      .expect('Content-Type', /json/)
      .expect(404);
    
    expect(response.body.error).toBe(true);
    expect(response.body.mensaje).toBe('Paciente no encontrado');
  });
}); 