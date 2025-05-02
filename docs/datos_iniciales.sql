-- Datos de ejemplo para la base de datos de agendamiento médico

-- Insertar especialidades médicas
INSERT INTO especialidades_medicas (nombre, descripcion) VALUES
('Medicina General', 'Atención médica general y preventiva'),
('Pediatría', 'Especialidad médica enfocada en niños y adolescentes'),
('Cardiología', 'Diagnóstico y tratamiento de enfermedades del corazón'),
('Dermatología', 'Especialidad médica enfocada en la piel'),
('Traumatología', 'Tratamiento de lesiones musculoesqueléticas'),
('Ginecología', 'Salud del sistema reproductor femenino');

-- Insertar usuarios (contraseña hash para "password123" - en una implementación real se haría con bcrypt o similar)
INSERT INTO usuarios (nombre, email, password_hash, rol, fecha_creacion, estado) VALUES
-- Administrador
('Admin Sistema', 'admin@clinica.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'admin', CURRENT_TIMESTAMP, TRUE),

-- Médicos
('Dr. Juan Pérez', 'juan.perez@clinica.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'médico', CURRENT_TIMESTAMP, TRUE),
('Dra. María López', 'maria.lopez@clinica.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'médico', CURRENT_TIMESTAMP, TRUE),
('Dr. Carlos Rodríguez', 'carlos.rodriguez@clinica.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'médico', CURRENT_TIMESTAMP, TRUE),

-- Enfermeras
('Enfermera Ana Gómez', 'ana.gomez@clinica.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'enfermera', CURRENT_TIMESTAMP, TRUE),
('Enfermero Pedro Sánchez', 'pedro.sanchez@clinica.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'enfermera', CURRENT_TIMESTAMP, TRUE),

-- Secretarios
('Secretaria Laura Martínez', 'laura.martinez@clinica.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'secretario', CURRENT_TIMESTAMP, TRUE),

-- TENS
('TENS Sofía Castro', 'sofia.castro@clinica.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'tens', CURRENT_TIMESTAMP, TRUE),

-- Pacientes
('Pablo Silva', 'pablo.silva@gmail.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'paciente', CURRENT_TIMESTAMP, TRUE),
('Carmen Vega', 'carmen.vega@hotmail.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'paciente', CURRENT_TIMESTAMP, TRUE),
('Roberto Díaz', 'roberto.diaz@yahoo.com', 'e8d5bf65d4b5eacf8298f3f344887a04', 'paciente', CURRENT_TIMESTAMP, TRUE);

-- Insertar profesionales
INSERT INTO profesionales_salud (id_usuario, especialidad_id, numero_registro, biografia, anos_experiencia, educacion)
VALUES
(2, 1, 'MG-12345', 'Médico general con experiencia en atención primaria', 10, 'Universidad de Chile, MD'),
(3, 2, 'PD-23456', 'Pediatra especializada en desarrollo infantil', 8, 'Universidad Católica, MD, Especialidad en Pediatría'),
(4, 3, 'CR-34567', 'Cardiólogo especializado en enfermedades coronarias', 15, 'Universidad de Santiago, MD, Especialidad en Cardiología');

-- Insertar pacientes
INSERT INTO pacientes (id_usuario, rut, telefono, direccion, fecha_nacimiento, sexo, grupo_sanguineo)
VALUES
(9, '12.345.678-9', '+56912345678', 'Av. Principal 123, Santiago', '1980-05-15', 'M', 'O+'),
(10, '14.567.890-1', '+56923456789', 'Calle Los Olmos 456, Providencia', '1975-10-20', 'F', 'A-'),
(11, '17.890.123-4', '+56934567890', 'Pasaje Las Rosas 789, La Florida', '1990-02-28', 'M', 'B+');

-- Insertar consultorios
INSERT INTO consultorios (nombre, direccion, comuna, region, telefono, email, horario_apertura, horario_cierre)
VALUES
('Consultorio Central', 'Av. Principal 1000', 'Santiago', 'Metropolitana', '+56226789012', 'central@clinica.com', '08:00:00', '20:00:00'),
('Consultorio Norte', 'Av. Los Leones 2000', 'Providencia', 'Metropolitana', '+56226789013', 'norte@clinica.com', '08:00:00', '20:00:00'),
('Consultorio Sur', 'Av. Departamental 3000', 'La Florida', 'Metropolitana', '+56226789014', 'sur@clinica.com', '08:00:00', '20:00:00');

-- Insertar servicios y procedimientos
INSERT INTO servicios_procedimientos (nombre, descripcion, duracion_min, precio)
VALUES
('Consulta General', 'Consulta médica general', 30, 25000),
('Consulta Pediátrica', 'Consulta médica pediátrica', 30, 30000),
('Consulta Cardiológica', 'Consulta médica cardiológica', 45, 40000),
('Electrocardiograma', 'Examen de actividad eléctrica del corazón', 20, 35000),
('Control de Niño Sano', 'Evaluación integral de salud infantil', 40, 32000);

-- Relacionar profesionales con servicios
INSERT INTO rel_profesional_servicio (id_profesional, id_servicio) VALUES
(2, 1), -- Dr. Juan Pérez puede hacer consultas generales
(3, 2), -- Dra. María López puede hacer consultas pediátricas
(3, 5), -- Dra. María López puede hacer control niño sano
(4, 3), -- Dr. Carlos Rodríguez puede hacer consultas cardiológicas
(4, 4); -- Dr. Carlos Rodríguez puede hacer electrocardiogramas

-- Insertar horarios disponibles
INSERT INTO horarios_disponibles (id_profesional, dia_semana, hora_inicio, hora_fin, consultorio_id)
VALUES
-- Dr. Juan Pérez
(2, 1, '09:00:00', '13:00:00', 1), -- Lunes mañana
(2, 1, '15:00:00', '18:00:00', 1), -- Lunes tarde
(2, 3, '09:00:00', '13:00:00', 2), -- Miércoles mañana
(2, 5, '09:00:00', '13:00:00', 3), -- Viernes mañana

-- Dra. María López
(3, 2, '09:00:00', '13:00:00', 1), -- Martes mañana
(3, 2, '15:00:00', '18:00:00', 1), -- Martes tarde
(3, 4, '09:00:00', '13:00:00', 2), -- Jueves mañana

-- Dr. Carlos Rodríguez
(4, 1, '15:00:00', '19:00:00', 2), -- Lunes tarde
(4, 3, '15:00:00', '19:00:00', 1), -- Miércoles tarde
(4, 5, '09:00:00', '13:00:00', 1); -- Viernes mañana

-- Insertar algunas horas agendadas
INSERT INTO horas_agendadas (id_paciente, id_profesional, id_servicio, fecha_hora, duracion_min, estado, consultorio_id)
VALUES
-- Pablo Silva con Dr. Juan Pérez
(9, 2, 1, CURRENT_DATE + INTERVAL '10 hours', 30, 'reservada', 1),
-- Carmen Vega con Dra. María López
(10, 3, 2, CURRENT_DATE + INTERVAL '11 hours', 30, 'reservada', 1),
-- Roberto Díaz con Dr. Carlos Rodríguez
(11, 4, 3, CURRENT_DATE + INTERVAL '16 hours', 45, 'reservada', 2);

-- Insertar notificaciones
INSERT INTO notificaciones (id_usuario, mensaje, tipo, fecha_envio)
VALUES
(9, 'Recordatorio: Tiene una cita mañana a las 10:00 AM con Dr. Juan Pérez', 'recordatorio', CURRENT_TIMESTAMP),
(10, 'Recordatorio: Tiene una cita mañana a las 11:00 AM con Dra. María López', 'recordatorio', CURRENT_TIMESTAMP),
(11, 'Recordatorio: Tiene una cita mañana a las 4:00 PM con Dr. Carlos Rodríguez', 'recordatorio', CURRENT_TIMESTAMP);

-- Insertar medicamentos comunes
INSERT INTO medicamentos (nombre, principio_activo, presentacion, concentracion)
VALUES
('Paracetamol', 'Paracetamol', 'Comprimido', '500 mg'),
('Ibuprofeno', 'Ibuprofeno', 'Comprimido', '400 mg'),
('Amoxicilina', 'Amoxicilina', 'Cápsula', '500 mg'),
('Loratadina', 'Loratadina', 'Comprimido', '10 mg'),
('Omeprazol', 'Omeprazol', 'Cápsula', '20 mg');

-- Documentos clínicos ejemplo
INSERT INTO documentos_clinicos (id_paciente, id_profesional, tipo, titulo, contenido, fecha_creacion)
VALUES
(9, 2, 'Informe médico', 'Informe clínico general', 'El paciente presenta síntomas de gripe común. Se recomienda reposo y hidratación.', CURRENT_TIMESTAMP),
(10, 3, 'Informe pediátrico', 'Control mensual', 'La paciente muestra un desarrollo normal para su edad.', CURRENT_TIMESTAMP);

-- Ejemplo de historial médico
INSERT INTO historial_medico (id_paciente, id_profesional, diagnostico, tratamiento, observaciones)
VALUES
(9, 2, 'Resfriado común', 'Paracetamol cada 8 horas. Reposo y abundante líquido.', 'Paciente con síntomas hace 2 días'),
(10, 3, 'Control regular', 'Continuar con vacunación programada', 'Desarrollo normal para la edad');

-- Ejemplo de receta médica
INSERT INTO recetas_medicamentos (id_historial, id_medicamento, dosis, frecuencia, duracion)
VALUES
(1, 1, '1 comprimido', 'Cada 8 horas', '5 días');

-- Ejemplo de log de auditoría
INSERT INTO logs_auditoria (id_usuario, accion, tabla_afectada, registro_id, fecha_hora, ip)
VALUES
(1, 'Creación de usuario', 'usuarios', 9, CURRENT_TIMESTAMP, '192.168.1.100'),
(1, 'Agendamiento de hora', 'horas_agendadas', 1, CURRENT_TIMESTAMP, '192.168.1.100'); 