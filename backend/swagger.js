import swaggerJsdoc from 'swagger-jsdoc';
import 'dotenv/config';

/**
 * Opciones para la configuración de Swagger
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Agenda Médica',
      version: '1.0.0',
      description: 'API para sistema de agendamiento médico con arquitectura MVC',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'info@agendamedica.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3005}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Error de autenticación',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'No autorizado: token no proporcionado',
                  },
                },
              },
            },
          },
        },
        BadRequestError: {
          description: 'Error en la solicitud',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Error de validación en los datos enviados',
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          example: 'email',
                        },
                        message: {
                          type: 'string',
                          example: 'Debe proporcionar un correo electrónico válido',
                        },
                        value: {
                          type: 'string',
                          example: 'correo-invalido',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Error interno del servidor',
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            email: {
              type: 'string',
              example: 'usuario@ejemplo.com',
            },
            nombre: {
              type: 'string',
              example: 'Juan Pérez',
            },
            role: {
              type: 'string',
              enum: ['admin', 'medico', 'paciente', 'recepcionista'],
              example: 'medico',
            },
          },
        },
        Credenciales: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'usuario@ejemplo.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Contraseña123',
            },
          },
        },
        RegistroUsuario: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'nuevo@ejemplo.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Contraseña123',
            },
            nombre: {
              type: 'string',
              example: 'Juan Pérez',
            },
            role: {
              type: 'string',
              enum: ['admin', 'medico', 'paciente', 'recepcionista'],
              example: 'paciente',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ],
};

const specs = swaggerJsdoc(options);

export default specs; 