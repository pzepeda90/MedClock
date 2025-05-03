-- Primero, hacemos una copia de seguridad de la tabla actual
ALTER TABLE pacientes RENAME TO pacientes_old;

-- Crear la nueva tabla pacientes con los campos actualizados
CREATE TABLE pacientes (
    id_usuario INT PRIMARY KEY,
    primer_nombre VARCHAR(100) NOT NULL,
    segundo_nombre VARCHAR(100),
    primer_apellido VARCHAR(100) NOT NULL,
    segundo_apellido VARCHAR(100),
    rut VARCHAR(20) UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    sexo VARCHAR(20), -- M/F/Intersexual/Otro
    genero VARCHAR(50), -- Campo opcional para género autoidentificado
    nacionalidad VARCHAR(50),
    estado_civil VARCHAR(20), -- soltero, casado, etc.
    foto_url TEXT, -- URL o path a la fotografía (opcional)
    
    -- Información de contacto desglosada
    calle VARCHAR(200),
    numero VARCHAR(20),
    depto VARCHAR(20),
    comuna VARCHAR(100),
    region VARCHAR(100),
    codigo_postal VARCHAR(20),
    
    telefono_fijo VARCHAR(20),
    celular VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    
    -- Información médica
    grupo_sanguineo VARCHAR(5),
    alergias TEXT,
    antecedentes_medicos TEXT,
    
    -- Contacto de emergencia
    contacto_emergencia_nombre VARCHAR(200),
    contacto_emergencia_telefono VARCHAR(20),
    
    -- Campos de auditoría
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Migrar los datos de la tabla antigua a la nueva
INSERT INTO pacientes (
    id_usuario, 
    primer_nombre, -- Asumimos que nombre está en la tabla usuarios
    primer_apellido, -- Asumimos que apellido está en la tabla usuarios
    rut, 
    fecha_nacimiento, 
    sexo, 
    grupo_sanguineo,
    alergias,
    antecedentes_medicos,
    contacto_emergencia_nombre,
    contacto_emergencia_telefono,
    celular, -- Lo mismo que telefono en la tabla antigua
    calle, -- Parte de dirección en la tabla antigua
    email -- De la tabla usuarios
)
SELECT 
    p.id_usuario,
    SPLIT_PART(u.nombre, ' ', 1) AS primer_nombre,
    COALESCE(SPLIT_PART(u.nombre, ' ', 2), 'No especificado') AS primer_apellido,
    p.rut,
    p.fecha_nacimiento,
    p.sexo,
    p.grupo_sanguineo,
    p.alergias,
    p.antecedentes_medicos,
    p.contacto_emergencia_nombre,
    p.contacto_emergencia_telefono,
    p.telefono AS celular,
    p.direccion AS calle,
    u.email
FROM 
    pacientes_old p
JOIN 
    usuarios u ON p.id_usuario = u.id;

-- Crear un trigger para actualizar el timestamp cuando se actualiza un registro
CREATE OR REPLACE FUNCTION update_paciente_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paciente_timestamp_trigger
BEFORE UPDATE ON pacientes
FOR EACH ROW
EXECUTE FUNCTION update_paciente_timestamp();

-- Opcional: Eliminar la tabla antigua después de verificar la migración
-- DROP TABLE pacientes_old; 