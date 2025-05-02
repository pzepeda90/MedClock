import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Crear una aplicación Express simple para pruebas
const app = express();

// Ruta simple para get
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'GET success' });
});

// Ruta simple para post
app.post('/api/test', express.json(), (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: 'Nombre requerido' });
  }
  res.status(201).json({ message: 'POST success', data: { nombre } });
});

// Ruta con parámetros
app.get('/api/test/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: 'GET by ID success', id });
});

describe('Pruebas de Rutas Simples', () => {
  describe('GET /api/test', () => {
    it('debe responder con status 200', async () => {
      const response = await request(app)
        .get('/api/test');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'GET success' });
    });
  });

  describe('POST /api/test', () => {
    it('debe crear un recurso con los datos enviados', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ nombre: 'Test' });
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ 
        message: 'POST success', 
        data: { nombre: 'Test' } 
      });
    });

    it('debe retornar 400 cuando faltan datos requeridos', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Nombre requerido' });
    });
  });

  describe('GET /api/test/:id', () => {
    it('debe obtener un recurso por ID', async () => {
      const response = await request(app)
        .get('/api/test/123');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 
        message: 'GET by ID success', 
        id: '123' 
      });
    });
  });
}); 