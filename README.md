# Sistema de Agendamiento Médico

Aplicación web para gestionar citas médicas y servicios relacionados utilizando una arquitectura MVC.

## Estructura MVC

El proyecto sigue una arquitectura Modelo-Vista-Controlador (MVC) para una clara separación de responsabilidades:

### Modelo

Los modelos gestionan los datos y la lógica de negocio:

- `src/models/` - Clases que representan las entidades y manejan el acceso a datos
  - `usuario.model.js` - Operaciones CRUD para usuarios

### Vista 

Las vistas manejan la presentación y la interfaz de usuario:

- El frontend será implementado en una aplicación separada que consume la API RESTful

### Controlador

Los controladores procesan las solicitudes HTTP y coordinan la interacción entre modelos y vistas:

- `src/controllers/` - Controladores para las distintas entidades
  - `auth.controller.js` - Maneja autenticación y autorización

### Componentes adicionales

- `src/routes/` - Define los endpoints de la API
- `src/middlewares/` - Funciones intermedias para procesamiento de peticiones
- `src/config/` - Configuración de la aplicación
- `src/utils/` - Funciones y utilidades compartidas

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```
   npm install
   ```
3. Configurar variables de entorno (copiar `.env.example` a `.env` y ajustar)
4. Iniciar el servidor en modo desarrollo:
   ```
   npm run dev
   ```

## Base de datos

La aplicación utiliza PostgreSQL como base de datos. La estructura completa está documentada en `docs/`.

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión y obtener token JWT
- `GET /api/auth/me` - Obtener información del usuario autenticado
- `POST /api/auth/change-password` - Cambiar contraseña

### Usuarios (próximamente)

- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Detalles de un usuario
- `PUT /api/usuarios/:id` - Actualizar un usuario
- `DELETE /api/usuarios/:id` - Eliminar un usuario

### Otros endpoints (en desarrollo)

## Tecnologías utilizadas

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación basada en tokens
- **bcrypt** - Encriptación de contraseñas

## Documentación relacionada

Para más detalles sobre la estructura de la base de datos y consultas SQL, consulta la carpeta `docs/`. # MedClock
