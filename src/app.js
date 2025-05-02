const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

// Importar las rutas
const authRoutes = require('./routes/auth.routes');
const especialidadRoutes = require('./routes/especialidad.routes');
const pacienteRoutes = require('./routes/paciente.routes');
const profesionalRoutes = require('./routes/profesional.routes');
const consultorioRoutes = require('./routes/consultorio.routes');
const horarioRoutes = require('./routes/horario.routes');
const servicioRoutes = require('./routes/servicio.routes');
const citaRoutes = require('./routes/cita.routes');
const diagnosticoRoutes = require('./routes/diagnostico.routes');
const reporteRoutes = require('./routes/reporte.routes');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Agenda Médica', 
    status: 'online',
    version: '1.0.0'
  });
});

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/profesionales', profesionalRoutes);
app.use('/api/consultorios', consultorioRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/diagnosticos', diagnosticoRoutes);
app.use('/api/reportes', reporteRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada'
  });
});

// Iniciar el servidor
app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  
  // Probar la conexión a la base de datos
  await testConnection();
});

module.exports = app; 