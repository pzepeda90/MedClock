-- Tabla para almacenar diagnósticos médicos (ej: basados en CIE-10)
CREATE TABLE IF NOT EXISTS diagnosticos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100)
);

-- Tabla para asociar diagnósticos a citas
CREATE TABLE IF NOT EXISTS citas_diagnosticos (
    id SERIAL PRIMARY KEY,
    cita_id INTEGER NOT NULL REFERENCES horas_agendadas(id) ON DELETE CASCADE,
    diagnostico_id INTEGER NOT NULL REFERENCES diagnosticos(id) ON DELETE RESTRICT,
    notas TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cita_id, diagnostico_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_diagnosticos_codigo ON diagnosticos(codigo);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_nombre ON diagnosticos(nombre);
CREATE INDEX IF NOT EXISTS idx_citas_diagnosticos_cita ON citas_diagnosticos(cita_id);
CREATE INDEX IF NOT EXISTS idx_citas_diagnosticos_diagnostico ON citas_diagnosticos(diagnostico_id);

-- Comentarios en las tablas
COMMENT ON TABLE diagnosticos IS 'Almacena catálogo de diagnósticos médicos basados en clasificaciones estándar como CIE-10';
COMMENT ON TABLE citas_diagnosticos IS 'Relaciona diagnósticos con citas médicas';

-- Diagnósticos de ejemplo (CIE-10)
INSERT INTO diagnosticos (codigo, nombre, categoria) VALUES
('J00', 'Resfriado común', 'Enfermedades respiratorias'),
('J01', 'Sinusitis aguda', 'Enfermedades respiratorias'),
('J02', 'Faringitis aguda', 'Enfermedades respiratorias'),
('J03', 'Amigdalitis aguda', 'Enfermedades respiratorias'),
('J04', 'Laringitis y traqueítis agudas', 'Enfermedades respiratorias'),
('J06', 'Infecciones agudas de las vías respiratorias superiores', 'Enfermedades respiratorias'),
('I10', 'Hipertensión esencial (primaria)', 'Enfermedades cardiovasculares'),
('I21', 'Infarto agudo de miocardio', 'Enfermedades cardiovasculares'),
('E11', 'Diabetes mellitus tipo 2', 'Enfermedades endocrinas'),
('E66', 'Obesidad', 'Enfermedades endocrinas'),
('M54', 'Dorsalgia', 'Enfermedades osteomusculares'),
('G44', 'Otros síndromes de cefalea', 'Enfermedades neurológicas'),
('K29', 'Gastritis y duodenitis', 'Enfermedades digestivas'),
('A09', 'Diarrea y gastroenteritis de presunto origen infeccioso', 'Enfermedades infecciosas')
ON CONFLICT (codigo) DO NOTHING; 