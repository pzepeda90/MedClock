-- Tabla para auditoría y trazabilidad de pagos
CREATE TABLE IF NOT EXISTS auditoria_pagos (
    id SERIAL PRIMARY KEY,
    id_pago INTEGER REFERENCES pagos_facturacion(id),
    tipo_cambio VARCHAR(50) NOT NULL, -- creacion, actualizacion, pago, anulacion, asignacion_codigo
    detalles TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id),
    metodo_pago VARCHAR(50),
    monto DECIMAL(10, 2),
    codigo_procedimiento VARCHAR(50),
    motivo TEXT
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_auditoria_id_pago ON auditoria_pagos (id_pago);
CREATE INDEX IF NOT EXISTS idx_auditoria_tipo_cambio ON auditoria_pagos (tipo_cambio);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria_pagos (fecha);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_pagos (usuario_id);

-- Función para insertar un registro de auditoría
CREATE OR REPLACE FUNCTION registrar_auditoria_pago(
    p_id_pago INTEGER,
    p_tipo_cambio VARCHAR(50),
    p_detalles TEXT,
    p_usuario_id INTEGER,
    p_metodo_pago VARCHAR(50) DEFAULT NULL,
    p_monto DECIMAL(10, 2) DEFAULT NULL,
    p_codigo_procedimiento VARCHAR(50) DEFAULT NULL,
    p_motivo TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO auditoria_pagos (
        id_pago, 
        tipo_cambio, 
        detalles, 
        usuario_id, 
        metodo_pago, 
        monto, 
        codigo_procedimiento, 
        motivo
    ) VALUES (
        p_id_pago, 
        p_tipo_cambio, 
        p_detalles, 
        p_usuario_id, 
        p_metodo_pago, 
        p_monto, 
        p_codigo_procedimiento, 
        p_motivo
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger para auditar la creación de pagos
CREATE OR REPLACE FUNCTION trigger_auditoria_pago_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM registrar_auditoria_pago(
        NEW.id,
        'creacion',
        'Creación del registro de pago',
        NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auditoria_pago_insert ON pagos_facturacion;
CREATE TRIGGER auditoria_pago_insert
AFTER INSERT ON pagos_facturacion
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_pago_insert();

-- Trigger para auditar la actualización de pagos
CREATE OR REPLACE FUNCTION trigger_auditoria_pago_update()
RETURNS TRIGGER AS $$
DECLARE
    cambios TEXT := '';
    usuario_id INTEGER;
BEGIN
    -- Intentar obtener el ID del usuario actual
    BEGIN
        usuario_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        usuario_id := NULL;
    END;
    
    -- Detectar qué campos cambiaron
    IF OLD.estado <> NEW.estado THEN
        cambios := cambios || 'Estado: ' || OLD.estado || ' -> ' || NEW.estado || '; ';
        
        -- Si el estado cambió a "pagado", registrar como un pago
        IF NEW.estado = 'pagado' AND OLD.estado <> 'pagado' THEN
            PERFORM registrar_auditoria_pago(
                NEW.id,
                'pago',
                'Pago registrado',
                usuario_id,
                NEW.metodo_pago,
                NEW.monto
            );
            RETURN NEW;
        END IF;
        
        -- Si el estado cambió a "anulado", registrar como anulación
        IF NEW.estado = 'anulado' AND OLD.estado <> 'anulado' THEN
            PERFORM registrar_auditoria_pago(
                NEW.id,
                'anulacion',
                'Pago anulado',
                usuario_id,
                NULL,
                NULL,
                NULL,
                NEW.notas
            );
            RETURN NEW;
        END IF;
    END IF;
    
    IF OLD.monto <> NEW.monto THEN
        cambios := cambios || 'Monto: ' || OLD.monto || ' -> ' || NEW.monto || '; ';
    END IF;
    
    IF COALESCE(OLD.metodo_pago, '') <> COALESCE(NEW.metodo_pago, '') THEN
        cambios := cambios || 'Método de pago: ' || COALESCE(OLD.metodo_pago, 'No definido') || ' -> ' || COALESCE(NEW.metodo_pago, 'No definido') || '; ';
    END IF;
    
    IF COALESCE(OLD.id_codigo_procedimiento, 0) <> COALESCE(NEW.id_codigo_procedimiento, 0) THEN
        -- Si se asignó un código de procedimiento
        IF NEW.id_codigo_procedimiento IS NOT NULL AND OLD.id_codigo_procedimiento IS NULL THEN
            -- Buscar el código del procedimiento
            DECLARE
                codigo_proc VARCHAR(50);
            BEGIN
                SELECT codigo INTO codigo_proc
                FROM codigos_procedimientos
                WHERE id = NEW.id_codigo_procedimiento;
                
                PERFORM registrar_auditoria_pago(
                    NEW.id,
                    'asignacion_codigo',
                    'Asignación de código de procedimiento',
                    usuario_id,
                    NULL,
                    NEW.monto,
                    codigo_proc
                );
                RETURN NEW;
            END;
        ELSE
            cambios := cambios || 'Código de procedimiento: ' || COALESCE(OLD.id_codigo_procedimiento::TEXT, 'No asignado') || ' -> ' || COALESCE(NEW.id_codigo_procedimiento::TEXT, 'No asignado') || '; ';
        END IF;
    END IF;
    
    -- Si hay cambios, registrarlos como actualización general
    IF cambios <> '' THEN
        PERFORM registrar_auditoria_pago(
            NEW.id,
            'actualizacion',
            cambios,
            usuario_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auditoria_pago_update ON pagos_facturacion;
CREATE TRIGGER auditoria_pago_update
AFTER UPDATE ON pagos_facturacion
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_pago_update();

-- Comentarios para documentar
COMMENT ON TABLE auditoria_pagos IS 'Tabla para registrar el historial de cambios en pagos para auditoría y trazabilidad';
COMMENT ON COLUMN auditoria_pagos.tipo_cambio IS 'Tipo de cambio realizado: creación, actualización, pago, anulación, etc.';
COMMENT ON COLUMN auditoria_pagos.detalles IS 'Detalles específicos del cambio realizado';
COMMENT ON COLUMN auditoria_pagos.usuario_id IS 'ID del usuario que realizó el cambio';
COMMENT ON COLUMN auditoria_pagos.metodo_pago IS 'Método de pago utilizado (para registros de tipo "pago")';
COMMENT ON COLUMN auditoria_pagos.monto IS 'Monto del pago (para registros de tipo "pago")';
COMMENT ON COLUMN auditoria_pagos.codigo_procedimiento IS 'Código de procedimiento asignado (para registros de tipo "asignacion_codigo")';
COMMENT ON COLUMN auditoria_pagos.motivo IS 'Motivo de la anulación (para registros de tipo "anulacion")'; 