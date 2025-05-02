-- Esquema para base de datos de Agenda Médica

-- Tabla usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'médico', 'enfermera', 'tens', 'secretario', 'paciente')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla especialidades_medicas
CREATE TABLE especialidades_medicas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla pacientes
CREATE TABLE pacientes (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    rut VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_nacimiento DATE,
    sexo CHAR(1) CHECK (sexo IN ('M', 'F', 'O')),
    grupo_sanguineo VARCHAR(5),
    alergias TEXT,
    antecedentes_medicos TEXT,
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(20)
);

-- Tabla profesionales_salud
CREATE TABLE profesionales_salud (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    especialidad_id INTEGER REFERENCES especialidades_medicas(id),
    numero_registro VARCHAR(50) UNIQUE,
    biografia TEXT,
    anos_experiencia INTEGER,
    educacion TEXT,
    foto_url VARCHAR(255)
);

-- Tabla consultorios
CREATE TABLE consultorios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    comuna VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    horario_apertura TIME,
    horario_cierre TIME
);

-- Tabla horarios_disponibles
CREATE TABLE horarios_disponibles (
    id SERIAL PRIMARY KEY,
    id_profesional INTEGER REFERENCES profesionales_salud(id_usuario) ON DELETE CASCADE,
    dia_semana INTEGER CHECK (dia_semana BETWEEN 1 AND 7),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,
    CONSTRAINT horario_valido CHECK (hora_fin > hora_inicio)
);

-- Tabla servicios_procedimientos
CREATE TABLE servicios_procedimientos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_min INTEGER NOT NULL,
    precio DECIMAL(10, 2),
    requiere_preparacion BOOLEAN DEFAULT FALSE,
    instrucciones_preparacion TEXT
);

-- Tabla rel_profesional_servicio (relación entre profesionales y servicios)
CREATE TABLE rel_profesional_servicio (
    id_profesional INTEGER REFERENCES profesionales_salud(id_usuario) ON DELETE CASCADE,
    id_servicio INTEGER REFERENCES servicios_procedimientos(id) ON DELETE CASCADE,
    PRIMARY KEY (id_profesional, id_servicio)
);

-- Tabla horas_agendadas
CREATE TABLE horas_agendadas (
    id SERIAL PRIMARY KEY,
    id_paciente INTEGER REFERENCES pacientes(id_usuario) ON DELETE CASCADE,
    id_profesional INTEGER REFERENCES profesionales_salud(id_usuario) ON DELETE CASCADE,
    id_servicio INTEGER REFERENCES servicios_procedimientos(id),
    fecha_hora TIMESTAMP NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_min INTEGER NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('reservada', 'anulada', 'completada', 'reprogramada', 'no asistió')),
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,
    notas_previas TEXT,
    notas_posteriores TEXT
);

-- Tabla notificaciones
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    tipo VARCHAR(50) NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP
);

-- Tabla pagos_facturacion
CREATE TABLE pagos_facturacion (
    id SERIAL PRIMARY KEY,
    id_paciente INTEGER REFERENCES pacientes(id_usuario) ON DELETE CASCADE,
    id_cita INTEGER REFERENCES horas_agendadas(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'pagado', 'anulado', 'reembolsado')),
    metodo_pago VARCHAR(50),
    numero_comprobante VARCHAR(100),
    notas TEXT
);

-- Tabla logs_auditoria
CREATE TABLE logs_auditoria (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion TEXT NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INTEGER,
    datos_previos JSONB,
    datos_nuevos JSONB,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45)
);

-- Tabla documentos_clinicos
CREATE TABLE documentos_clinicos (
    id SERIAL PRIMARY KEY,
    id_paciente INTEGER REFERENCES pacientes(id_usuario) ON DELETE CASCADE,
    id_profesional INTEGER REFERENCES profesionales_salud(id_usuario),
    id_cita INTEGER REFERENCES horas_agendadas(id),
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    archivo_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    es_confidencial BOOLEAN DEFAULT FALSE
);

-- Tabla historial_medico
CREATE TABLE historial_medico (
    id SERIAL PRIMARY KEY,
    id_paciente INTEGER REFERENCES pacientes(id_usuario) ON DELETE CASCADE,
    id_cita INTEGER REFERENCES horas_agendadas(id),
    id_profesional INTEGER REFERENCES profesionales_salud(id_usuario),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diagnostico TEXT,
    tratamiento TEXT,
    receta TEXT,
    observaciones TEXT
);

-- Tabla medicamentos
CREATE TABLE medicamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    principio_activo VARCHAR(100),
    presentacion VARCHAR(100),
    concentracion VARCHAR(50),
    indicaciones TEXT
);

-- Tabla recetas_medicamentos
CREATE TABLE recetas_medicamentos (
    id SERIAL PRIMARY KEY,
    id_historial INTEGER REFERENCES historial_medico(id) ON DELETE CASCADE,
    id_medicamento INTEGER REFERENCES medicamentos(id),
    dosis VARCHAR(50),
    frecuencia VARCHAR(50),
    duracion VARCHAR(50),
    indicaciones_especiales TEXT
);

-- Tabla licencias_medicas
CREATE TABLE licencias_medicas (
    id SERIAL PRIMARY KEY,
    id_paciente INTEGER REFERENCES pacientes(id_usuario) ON DELETE CASCADE,
    id_profesional INTEGER REFERENCES profesionales_salud(id_usuario),
    id_cita INTEGER REFERENCES horas_agendadas(id),
    fecha_inicio DATE NOT NULL,
    fecha_termino DATE NOT NULL,
    diagnostico TEXT NOT NULL,
    tipo_reposo VARCHAR(50),
    observaciones TEXT,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_horas_agendadas_fecha ON horas_agendadas(fecha_hora);
CREATE INDEX idx_horas_agendadas_profesional ON horas_agendadas(id_profesional);
CREATE INDEX idx_horas_agendadas_paciente ON horas_agendadas(id_paciente);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(id_usuario);
CREATE INDEX idx_profesionales_especialidad ON profesionales_salud(especialidad_id);
CREATE INDEX idx_historial_paciente ON historial_medico(id_paciente); 