import cors from "cors";
import "dotenv/config";
import express from "express";
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger.js';
import { testConnection } from "./database/database.js";
import { generalLimiter, sanitizeInputs, securityHeaders } from "./middlewares/security.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

import userRoute from "./routes/user.route.js";
import citaRoute from "./routes/cita.routes.js";
import historialRoute from "./routes/historial.routes.js";
import medicamentoRoute from "./routes/medicamento.routes.js";
import recetaRoute from "./routes/receta.routes.js";
import licenciaRoute from "./routes/licencia.routes.js";
import diagnosticoRoute from "./routes/diagnostico.routes.js";
import reporteRoute from "./routes/reporte.routes.js";
import pacienteRoute from "./routes/paciente.routes.js";
import profesionalRoute from "./routes/profesional.routes.js";
import especialidadRoute from "./routes/especialidad.routes.js";
import consultorioRoute from "./routes/consultorio.routes.js";
import horarioRoute from "./routes/horario.routes.js";
import servicioRoute from "./routes/servicio.routes.js";
import pagoRoute from "./routes/pago.routes.js";
import notificacionRoute from "./routes/notificacion.routes.js";
import estadisticaRoute from "./routes/estadistica.routes.js";
import roleRoute from "./routes/role.route.js";
import codigoProcedimientoRoute from "./routes/codigoProcedimiento.route.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // URL del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(generalLimiter);
app.use(sanitizeInputs);
app.use(securityHeaders);

app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "API de Agenda Médica",
    version: "1.0.0",
    status: "online",
    documentation: "/api-docs"
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  }
}));

app.use("/users", userRoute);
app.use("/citas", citaRoute);
app.use("/historial", historialRoute);
app.use("/medicamentos", medicamentoRoute);
app.use("/recetas", recetaRoute);
app.use("/licencias", licenciaRoute);
app.use("/diagnosticos", diagnosticoRoute);
app.use("/reportes", reporteRoute);
app.use("/pacientes", pacienteRoute);
app.use("/profesionales", profesionalRoute);
app.use("/especialidades", especialidadRoute);
app.use("/consultorios", consultorioRoute);
app.use("/horarios", horarioRoute);
app.use("/servicios", servicioRoute);
app.use("/pagos", pagoRoute);
app.use("/notificaciones", notificacionRoute);
app.use("/estadisticas", estadisticaRoute);
app.use("/roles", roleRoute);
app.use("/codigos-procedimientos", codigoProcedimientoRoute);

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3005;

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error("❌ No se pudo conectar a la base de datos. El servidor no se iniciará.");
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
      console.log(`🌎 Ambiente: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
