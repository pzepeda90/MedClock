import { BadRequestError, NotFoundError } from "../utils/errors.js";

// Lista de roles disponibles en el sistema
const availableRoles = [
  { 
    id: 'admin', 
    name: 'Administrador', 
    description: 'Acceso completo al sistema' 
  },
  { 
    id: 'medico', 
    name: 'Médico', 
    description: 'Profesional médico que atiende citas' 
  },
  { 
    id: 'paciente', 
    name: 'Paciente', 
    description: 'Usuario que recibe atención médica' 
  },
  { 
    id: 'recepcionista', 
    name: 'Recepcionista', 
    description: 'Gestiona citas y atención al cliente' 
  },
  { 
    id: 'enfermero', 
    name: 'Enfermero', 
    description: 'Asistente de atención médica' 
  },
  { 
    id: 'tecnologo', 
    name: 'Tecnólogo', 
    description: 'Realiza exámenes médicos específicos' 
  }
];

// Permisos por cada rol
const rolePermissions = {
  admin: [
    'ver_todo', 'crear_todo', 'editar_todo', 'eliminar_todo',
    'gestionar_usuarios', 'gestionar_pagos', 'gestionar_configuracion',
    'ver_reportes', 'exportar_datos'
  ],
  medico: [
    'ver_citas_propias', 'crear_citas_propias', 'editar_citas_propias',
    'ver_pacientes', 'crear_diagnosticos', 'crear_recetas',
    'ver_historial_propio'
  ],
  paciente: [
    'ver_citas_propias', 'solicitar_cita', 'cancelar_cita_propia',
    'ver_historial_propio', 'ver_pagos_propios'
  ],
  recepcionista: [
    'ver_citas', 'crear_citas', 'editar_citas', 'cancelar_citas',
    'ver_pacientes', 'registrar_pacientes', 'gestionar_pagos'
  ],
  enfermero: [
    'ver_citas', 'registrar_signos_vitales', 'preparar_pacientes',
    'ver_pacientes'
  ],
  tecnologo: [
    'ver_citas_propias', 'registrar_resultados', 'ver_pacientes'
  ]
};

/**
 * Obtiene todos los roles disponibles
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getAllRoles = async (req, res) => {
  try {
    return res.status(200).json({
      roles: availableRoles
    });
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

/**
 * Obtiene información detallada de un rol específico
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getRoleDetails = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    // Verificar si el rol existe
    const role = availableRoles.find(r => r.id === roleId);
    if (!role) {
      throw new NotFoundError(`Rol '${roleId}' no encontrado`);
    }
    
    // Obtener permisos
    const permissions = rolePermissions[roleId] || [];
    
    return res.status(200).json({
      ...role,
      permissions
    });
  } catch (error) {
    console.error("Error al obtener detalles del rol:", error);
    
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        error: true,
        message: error.message
      });
    }
    
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const checkPermission = async (req, res) => {
  try {
    const { permission } = req.params;
    
    // Obtener rol del usuario autenticado
    const userRole = req.user.role;
    
    // Verificar si el permiso existe para el rol
    const permissions = rolePermissions[userRole] || [];
    const hasPermission = permissions.includes(permission);
    
    return res.status(200).json({
      hasPermission
    });
  } catch (error) {
    console.error("Error al verificar permiso:", error);
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor"
    });
  }
};

export const roleController = {
  getAllRoles,
  getRoleDetails,
  checkPermission
}; 