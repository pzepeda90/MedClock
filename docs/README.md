# Sistema de Agendamiento Médico

Este proyecto implementa un sistema completo de agendamiento médico con PostgreSQL como base de datos.

## Estructura de la Base de Datos

### Tablas Principales

1. **usuarios**
   - Almacena todos los usuarios del sistema
   - Roles: admin, médico, enfermera, tens, secretario, paciente
   - Maneja autenticación y control de acceso

2. **pacientes**
   - Información completa de los pacientes
   - Vinculada a la tabla usuarios mediante id_usuario
   - Incluye datos personales y médicos básicos

3. **profesionales_salud**
   - Información de los profesionales de la salud
   - Vinculada a usuarios y especialidades médicas
   - Incluye credenciales profesionales

4. **especialidades_medicas**
   - Catálogo de especialidades médicas disponibles

5. **consultorios**
   - Información de los centros de atención

6. **horarios_disponibles**
   - Define la disponibilidad de los profesionales
   - Base para la generación de horas disponibles

7. **horas_agendadas**
   - Registro de todas las citas médicas
   - Estados: reservada, anulada, completada, reprogramada, no asistió

8. **servicios_procedimientos**
   - Catálogo de servicios y procedimientos ofrecidos
   - Incluye información como duración y precio

### Tablas de Relación

1. **rel_profesional_servicio**
   - Relación muchos a muchos entre profesionales y servicios

### Tablas Complementarias

1. **notificaciones**
   - Sistema de notificaciones para usuarios

2. **pagos_facturacion**
   - Gestión de pagos y facturación

3. **logs_auditoria**
   - Registro detallado de actividad para seguridad y cumplimiento

4. **documentos_clinicos**
   - Almacenamiento de documentos médicos

5. **historial_medico**
   - Registro de consultas y diagnósticos

6. **medicamentos**
   - Catálogo de medicamentos

7. **recetas_medicamentos**
   - Relación entre historial médico y medicamentos

8. **licencias_medicas**
   - Gestión de licencias médicas emitidas

## Índices

Se han creado índices para optimizar consultas frecuentes:
- Búsqueda de horas por fecha
- Búsqueda de horas por profesional
- Búsqueda de horas por paciente
- Búsqueda de notificaciones por usuario
- Búsqueda de profesionales por especialidad
- Búsqueda de historial médico por paciente

## Relaciones y Restricciones

- Integridad referencial mediante claves foráneas
- Restricciones CHECK para validar datos
- Eliminación en cascada cuando es apropiado
- Restricciones UNIQUE para garantizar unicidad

## Cómo utilizar

Para conectarse a la base de datos:
```bash
psql -d bd_agenda_medica
```

Para ver todas las tablas:
```bash
\dt
```

Para ver la estructura de una tabla específica:
```bash
\d nombre_tabla
``` 