import cors from "cors";
import "dotenv/config";
import express from "express";

import todoRoute from "./routes/todo.route.js";
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

const app = express();

app.use(express.json());
app.use(cors());

// Rutas API
app.use("/todos", todoRoute);
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
