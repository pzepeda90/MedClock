-- Tabla para gestionar códigos de procedimientos (como códigos Fonasa)
CREATE TABLE IF NOT EXISTS codigos_procedimientos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL, -- Por ejemplo: 'fonasa', 'particular', 'isapre', etc.
    precio_referencia DECIMAL(10, 2),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para relacionar códigos con servicios_procedimientos
CREATE TABLE IF NOT EXISTS rel_codigo_servicio (
    id_codigo INTEGER REFERENCES codigos_procedimientos(id) ON DELETE CASCADE,
    id_servicio INTEGER REFERENCES servicios_procedimientos(id) ON DELETE CASCADE,
    PRIMARY KEY (id_codigo, id_servicio)
);

-- Añadir campo para códigos de procedimiento en la tabla pagos_facturacion
ALTER TABLE pagos_facturacion 
ADD COLUMN IF NOT EXISTS id_codigo_procedimiento INTEGER REFERENCES codigos_procedimientos(id);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_codigos_procedimientos_codigo ON codigos_procedimientos (codigo);
CREATE INDEX IF NOT EXISTS idx_codigos_procedimientos_tipo ON codigos_procedimientos (tipo);
CREATE INDEX IF NOT EXISTS idx_pagos_codigo_procedimiento ON pagos_facturacion (id_codigo_procedimiento);

-- Función para actualizar automáticamente la fecha de actualización
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar la fecha_actualizacion automáticamente
DROP TRIGGER IF EXISTS update_codigos_procedimientos_fecha ON codigos_procedimientos;
CREATE TRIGGER update_codigos_procedimientos_fecha
BEFORE UPDATE ON codigos_procedimientos
FOR EACH ROW
EXECUTE FUNCTION update_fecha_actualizacion();

-- Comentarios para documentar las tablas
COMMENT ON TABLE codigos_procedimientos IS 'Tabla para almacenar códigos de procedimientos médicos (Fonasa, etc.)';
COMMENT ON TABLE rel_codigo_servicio IS 'Tabla para relacionar códigos de procedimientos con servicios ofrecidos';
COMMENT ON COLUMN codigos_procedimientos.codigo IS 'Código único del procedimiento (ej: código Fonasa)';
COMMENT ON COLUMN codigos_procedimientos.tipo IS 'Tipo de código (fonasa, particular, isapre, etc.)';
COMMENT ON COLUMN codigos_procedimientos.precio_referencia IS 'Precio de referencia sugerido para el procedimiento'; 