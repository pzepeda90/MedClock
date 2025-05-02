-- Consultas útiles para el sistema de agendamiento médico

-- 1. Obtener todas las horas agendadas para un día específico
SELECT ha.id, up.nombre as paciente, um.nombre as profesional, 
       sp.nombre as servicio, ha.fecha_hora, ha.estado, c.nombre as consultorio 
FROM horas_agendadas ha 
JOIN pacientes p ON ha.id_paciente = p.id_usuario 
JOIN usuarios up ON p.id_usuario = up.id 
JOIN profesionales_salud ps ON ha.id_profesional = ps.id_usuario 
JOIN usuarios um ON ps.id_usuario = um.id 
JOIN servicios_procedimientos sp ON ha.id_servicio = sp.id 
JOIN consultorios c ON ha.consultorio_id = c.id 
WHERE DATE(ha.fecha_hora) = '2025-05-01'
ORDER BY ha.fecha_hora;

-- 2. Obtener todas las horas agendadas para un profesional específico
SELECT ha.id, up.nombre as paciente, ha.fecha_hora, 
       sp.nombre as servicio, ha.estado, c.nombre as consultorio 
FROM horas_agendadas ha 
JOIN pacientes p ON ha.id_paciente = p.id_usuario 
JOIN usuarios up ON p.id_usuario = up.id 
JOIN servicios_procedimientos sp ON ha.id_servicio = sp.id 
JOIN consultorios c ON ha.consultorio_id = c.id 
WHERE ha.id_profesional = 2 -- Dr. Juan Pérez
ORDER BY ha.fecha_hora;

-- 3. Obtener el historial de citas de un paciente
SELECT ha.id, ha.fecha_hora, um.nombre as profesional, 
       sp.nombre as servicio, ha.estado, c.nombre as consultorio,
       ha.notas_posteriores
FROM horas_agendadas ha 
JOIN profesionales_salud ps ON ha.id_profesional = ps.id_usuario 
JOIN usuarios um ON ps.id_usuario = um.id 
JOIN servicios_procedimientos sp ON ha.id_servicio = sp.id 
JOIN consultorios c ON ha.consultorio_id = c.id 
WHERE ha.id_paciente = 9 -- Pablo Silva
ORDER BY ha.fecha_hora DESC;

-- 4. Obtener disponibilidad de un profesional para un día específico (comparando horarios y horas ya agendadas)
WITH horas_ocupadas AS (
    SELECT fecha_hora, duracion_min
    FROM horas_agendadas
    WHERE id_profesional = 2 -- Dr. Juan Pérez
    AND DATE(fecha_hora) = CURRENT_DATE
    AND estado != 'anulada'
)
SELECT hd.hora_inicio, hd.hora_fin, c.nombre as consultorio,
       CASE WHEN EXISTS (
           SELECT 1 FROM horas_ocupadas ho
           WHERE EXTRACT(HOUR FROM ho.fecha_hora) * 60 + EXTRACT(MINUTE FROM ho.fecha_hora) 
                 BETWEEN EXTRACT(HOUR FROM hd.hora_inicio) * 60 + EXTRACT(MINUTE FROM hd.hora_inicio)
                 AND EXTRACT(HOUR FROM hd.hora_fin) * 60 + EXTRACT(MINUTE FROM hd.hora_fin) - 1
       ) THEN 'Ocupado' ELSE 'Disponible' END as estado
FROM horarios_disponibles hd
JOIN consultorios c ON hd.consultorio_id = c.id
WHERE hd.id_profesional = 2 -- Dr. Juan Pérez
AND hd.dia_semana = EXTRACT(DOW FROM CURRENT_DATE) + 1; -- PostgreSQL DOW es 0-6, usamos 1-7

-- 5. Buscar pacientes por nombre o RUT
SELECT u.id, u.nombre, p.rut, p.telefono, p.direccion
FROM usuarios u
JOIN pacientes p ON u.id = p.id_usuario
WHERE u.nombre ILIKE '%Silva%' OR p.rut LIKE '%12.345%';

-- 6. Obtener profesionales por especialidad
SELECT u.id, u.nombre, ps.numero_registro, ps.anos_experiencia
FROM usuarios u
JOIN profesionales_salud ps ON u.id = ps.id_usuario
WHERE ps.especialidad_id = 1; -- Medicina General

-- 7. Generar reporte de citas por día y consultorio
SELECT c.nombre as consultorio, COUNT(*) as total_citas,
       SUM(CASE WHEN ha.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
       SUM(CASE WHEN ha.estado = 'anulada' THEN 1 ELSE 0 END) as anuladas,
       SUM(CASE WHEN ha.estado = 'no asistió' THEN 1 ELSE 0 END) as inasistencias
FROM horas_agendadas ha
JOIN consultorios c ON ha.consultorio_id = c.id
WHERE DATE(ha.fecha_hora) = '2025-05-01'
GROUP BY c.nombre;

-- 8. Obtener lista de servicios que ofrece un profesional
SELECT sp.id, sp.nombre, sp.duracion_min, sp.precio
FROM servicios_procedimientos sp
JOIN rel_profesional_servicio rps ON sp.id = rps.id_servicio
WHERE rps.id_profesional = 3; -- Dra. María López

-- 9. Obtener notificaciones pendientes de lectura para un usuario
SELECT id, mensaje, tipo, fecha_envio
FROM notificaciones
WHERE id_usuario = 9 -- Pablo Silva
AND leido = FALSE
ORDER BY fecha_envio DESC;

-- 10. Obtener historial médico completo de un paciente
SELECT hm.id, hm.fecha, um.nombre as profesional, hm.diagnostico, hm.tratamiento,
       hm.observaciones, rm.dosis, rm.frecuencia, m.nombre as medicamento
FROM historial_medico hm
LEFT JOIN profesionales_salud ps ON hm.id_profesional = ps.id_usuario
LEFT JOIN usuarios um ON ps.id_usuario = um.id
LEFT JOIN recetas_medicamentos rm ON hm.id = rm.id_historial
LEFT JOIN medicamentos m ON rm.id_medicamento = m.id
WHERE hm.id_paciente = 10 -- Carmen Vega
ORDER BY hm.fecha DESC;

-- 11. Encontrar espacios disponibles para agendar en un día específico
WITH horarios_prof AS (
    SELECT ps.id_usuario as id_prof, u.nombre as nombre_prof, hd.hora_inicio, hd.hora_fin, 
           hd.consultorio_id, c.nombre as consultorio
    FROM profesionales_salud ps
    JOIN usuarios u ON ps.id_usuario = u.id
    JOIN horarios_disponibles hd ON ps.id_usuario = hd.id_profesional
    JOIN consultorios c ON hd.consultorio_id = c.id
    WHERE hd.dia_semana = EXTRACT(DOW FROM '2025-05-02'::date) + 1 -- Para una fecha específica
),
horas_ocupadas AS (
    SELECT id_profesional, fecha_hora, duracion_min
    FROM horas_agendadas
    WHERE DATE(fecha_hora) = '2025-05-02'
    AND estado != 'anulada'
)
SELECT hp.id_prof, hp.nombre_prof, hp.hora_inicio, hp.hora_fin, 
       hp.consultorio, sp.nombre as servicio, sp.duracion_min
FROM horarios_prof hp
JOIN rel_profesional_servicio rps ON hp.id_prof = rps.id_profesional
JOIN servicios_procedimientos sp ON rps.id_servicio = sp.id
WHERE NOT EXISTS (
    SELECT 1 FROM horas_ocupadas ho
    WHERE ho.id_profesional = hp.id_prof
    AND (EXTRACT(HOUR FROM ho.fecha_hora) * 60 + EXTRACT(MINUTE FROM ho.fecha_hora)) 
        BETWEEN (EXTRACT(HOUR FROM hp.hora_inicio) * 60 + EXTRACT(MINUTE FROM hp.hora_inicio))
        AND (EXTRACT(HOUR FROM hp.hora_fin) * 60 + EXTRACT(MINUTE FROM hp.hora_fin) - sp.duracion_min)
)
ORDER BY hp.nombre_prof, hp.hora_inicio;

-- 12. Obtener estadísticas de citas por especialidad en un rango de fechas
SELECT em.nombre as especialidad, COUNT(*) as total_citas,
       SUM(CASE WHEN ha.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
       SUM(CASE WHEN ha.estado = 'anulada' THEN 1 ELSE 0 END) as anuladas,
       SUM(CASE WHEN ha.estado = 'no asistió' THEN 1 ELSE 0 END) as inasistencias
FROM horas_agendadas ha
JOIN profesionales_salud ps ON ha.id_profesional = ps.id_usuario
JOIN especialidades_medicas em ON ps.especialidad_id = em.id
WHERE ha.fecha_hora BETWEEN '2025-05-01' AND '2025-05-31'
GROUP BY em.nombre
ORDER BY total_citas DESC; 