import CodigoProcedimiento from '../models/codigoProcedimiento.model.js';
import Servicio from '../models/servicio.model.js';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError, 
  ValidationError 
} from '../utils/errors.js';

/**
 * Crea un nuevo código de procedimiento
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const crearCodigo = async (req, res, next) => {
  try {
    const { 
      codigo, 
      nombre, 
      descripcion, 
      tipo, 
      precio_referencia, 
      activo 
    } = req.body;

    // Validar datos obligatorios
    if (!codigo || !nombre || !tipo) {
      throw new ValidationError('Código, nombre y tipo son obligatorios');
    }

    // Verificar si ya existe un código con este valor
    const codigoExistente = await CodigoProcedimiento.obtenerPorCodigo(codigo);
    if (codigoExistente) {
      throw new ConflictError(`Ya existe un procedimiento con el código: ${codigo}`);
    }

    const nuevoCodigo = {
      codigo,
      nombre,
      descripcion,
      tipo,
      precio_referencia,
      activo
    };

    const codigoCreado = await CodigoProcedimiento.crear(nuevoCodigo);

    // Si se incluyen servicios, asociarlos al código
    if (req.body.servicios && Array.isArray(req.body.servicios)) {
      for (const idServicio of req.body.servicios) {
        // Verificar que el servicio existe
        const servicio = await Servicio.obtenerPorId(idServicio);
        if (servicio) {
          await CodigoProcedimiento.asociarServicio(codigoCreado.id, idServicio);
        }
      }
    }

    res.status(201).json({
      error: false,
      mensaje: 'Código de procedimiento creado exitosamente',
      codigo: codigoCreado
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene todos los códigos de procedimientos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const obtenerCodigos = async (req, res, next) => {
  try {
    const { 
      activos, 
      tipo, 
      codigo, 
      nombre, 
      precio_min, 
      precio_max 
    } = req.query;

    let codigos;

    // Si hay filtros específicos, usar la búsqueda
    if (tipo || codigo || nombre || precio_min || precio_max) {
      const filtros = {};
      
      if (tipo) filtros.tipo = tipo;
      if (codigo) filtros.codigo = codigo;
      if (nombre) filtros.nombre = nombre;
      if (precio_min) filtros.precio_min = parseFloat(precio_min);
      if (precio_max) filtros.precio_max = parseFloat(precio_max);
      
      // Determinar si incluir solo activos o todos
      if (activos === 'false') {
        filtros.activo = false;
      } else if (activos === 'todos') {
        // No filtrar por activo
      } else {
        filtros.activo = true; // Por defecto, solo activos
      }

      codigos = await CodigoProcedimiento.buscar(filtros);
    } else {
      // Determinar si incluir solo activos o todos
      const soloActivos = activos === 'false' ? false : (activos === 'todos' ? undefined : true);
      codigos = await CodigoProcedimiento.obtenerTodos(soloActivos);
    }

    res.status(200).json({
      error: false,
      total: codigos.length,
      codigos
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un código de procedimiento por su ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const obtenerCodigoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const codigo = await CodigoProcedimiento.obtenerPorId(id);
    if (!codigo) {
      throw new NotFoundError(`Código de procedimiento con ID ${id} no encontrado`);
    }

    // Obtener servicios asociados al código
    const serviciosAsociados = await CodigoProcedimiento.obtenerServiciosAsociados(id);

    res.status(200).json({
      error: false,
      codigo,
      servicios: serviciosAsociados
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza un código de procedimiento
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const actualizarCodigo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      codigo, 
      nombre, 
      descripcion, 
      tipo, 
      precio_referencia, 
      activo,
      servicios 
    } = req.body;

    // Verificar que el código existe
    const codigoExistente = await CodigoProcedimiento.obtenerPorId(id);
    if (!codigoExistente) {
      throw new NotFoundError(`Código de procedimiento con ID ${id} no encontrado`);
    }

    // Si se cambia el código, verificar que no exista otro igual
    if (codigo && codigo !== codigoExistente.codigo) {
      const duplicado = await CodigoProcedimiento.obtenerPorCodigo(codigo);
      if (duplicado && duplicado.id !== parseInt(id)) {
        throw new ConflictError(`Ya existe un procedimiento con el código: ${codigo}`);
      }
    }

    // Preparar datos para actualizar
    const datosActualizados = {};
    if (codigo !== undefined) datosActualizados.codigo = codigo;
    if (nombre !== undefined) datosActualizados.nombre = nombre;
    if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
    if (tipo !== undefined) datosActualizados.tipo = tipo;
    if (precio_referencia !== undefined) datosActualizados.precio_referencia = precio_referencia;
    if (activo !== undefined) datosActualizados.activo = activo;

    // Actualizar datos básicos
    const codigoActualizado = await CodigoProcedimiento.actualizar(id, datosActualizados);

    // Si se incluyen servicios, manejar las asociaciones
    if (servicios && Array.isArray(servicios)) {
      // Obtener servicios actualmente asociados
      const serviciosActuales = await CodigoProcedimiento.obtenerServiciosAsociados(id);
      const idsActuales = serviciosActuales.map(s => s.id);

      // Identificar servicios a agregar y a eliminar
      const idsNuevos = servicios;
      const idsAgregar = idsNuevos.filter(idNuevo => !idsActuales.includes(idNuevo));
      const idsEliminar = idsActuales.filter(idActual => !idsNuevos.includes(idActual));

      // Asociar nuevos servicios
      for (const idServicio of idsAgregar) {
        // Verificar que el servicio existe
        const servicio = await Servicio.obtenerPorId(idServicio);
        if (servicio) {
          await CodigoProcedimiento.asociarServicio(id, idServicio);
        }
      }

      // Desasociar servicios eliminados
      for (const idServicio of idsEliminar) {
        await CodigoProcedimiento.desasociarServicio(id, idServicio);
      }
    }

    // Obtener servicios asociados actualizados
    const serviciosActualizados = await CodigoProcedimiento.obtenerServiciosAsociados(id);

    res.status(200).json({
      error: false,
      mensaje: 'Código de procedimiento actualizado exitosamente',
      codigo: codigoActualizado,
      servicios: serviciosActualizados
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un código de procedimiento
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const eliminarCodigo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el código existe
    const codigo = await CodigoProcedimiento.obtenerPorId(id);
    if (!codigo) {
      throw new NotFoundError(`Código de procedimiento con ID ${id} no encontrado`);
    }

    // Eliminar el código (las relaciones se eliminarán por la restricción ON DELETE CASCADE)
    const codigoEliminado = await CodigoProcedimiento.eliminar(id);

    res.status(200).json({
      error: false,
      mensaje: 'Código de procedimiento eliminado exitosamente',
      codigo: codigoEliminado
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Asocia un código de procedimiento con un servicio
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const asociarServicio = async (req, res, next) => {
  try {
    const { idCodigo, idServicio } = req.params;

    // Verificar que el código existe
    const codigo = await CodigoProcedimiento.obtenerPorId(idCodigo);
    if (!codigo) {
      throw new NotFoundError(`Código de procedimiento con ID ${idCodigo} no encontrado`);
    }

    // Verificar que el servicio existe
    const servicio = await Servicio.obtenerPorId(idServicio);
    if (!servicio) {
      throw new NotFoundError(`Servicio con ID ${idServicio} no encontrado`);
    }

    // Asociar servicio
    await CodigoProcedimiento.asociarServicio(idCodigo, idServicio);

    res.status(200).json({
      error: false,
      mensaje: 'Servicio asociado exitosamente al código de procedimiento',
      codigo_id: parseInt(idCodigo),
      servicio_id: parseInt(idServicio)
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Desasocia un código de procedimiento de un servicio
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const desasociarServicio = async (req, res, next) => {
  try {
    const { idCodigo, idServicio } = req.params;

    // Verificar que el código existe
    const codigo = await CodigoProcedimiento.obtenerPorId(idCodigo);
    if (!codigo) {
      throw new NotFoundError(`Código de procedimiento con ID ${idCodigo} no encontrado`);
    }

    // Verificar que el servicio existe
    const servicio = await Servicio.obtenerPorId(idServicio);
    if (!servicio) {
      throw new NotFoundError(`Servicio con ID ${idServicio} no encontrado`);
    }

    // Desasociar servicio
    const resultado = await CodigoProcedimiento.desasociarServicio(idCodigo, idServicio);

    res.status(200).json({
      error: false,
      mensaje: resultado 
        ? 'Servicio desasociado exitosamente del código de procedimiento'
        : 'No existía asociación entre el código y el servicio',
      codigo_id: parseInt(idCodigo),
      servicio_id: parseInt(idServicio)
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene servicios asociados a un código de procedimiento
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const obtenerServiciosAsociados = async (req, res, next) => {
  try {
    const { idCodigo } = req.params;

    // Verificar que el código existe
    const codigo = await CodigoProcedimiento.obtenerPorId(idCodigo);
    if (!codigo) {
      throw new NotFoundError(`Código de procedimiento con ID ${idCodigo} no encontrado`);
    }

    // Obtener servicios asociados
    const servicios = await CodigoProcedimiento.obtenerServiciosAsociados(idCodigo);

    res.status(200).json({
      error: false,
      total: servicios.length,
      servicios
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene códigos asociados a un servicio
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export const obtenerCodigosAsociados = async (req, res, next) => {
  try {
    const { idServicio } = req.params;

    // Verificar que el servicio existe
    const servicio = await Servicio.obtenerPorId(idServicio);
    if (!servicio) {
      throw new NotFoundError(`Servicio con ID ${idServicio} no encontrado`);
    }

    // Obtener códigos asociados
    const codigos = await CodigoProcedimiento.obtenerCodigosAsociados(idServicio);

    res.status(200).json({
      error: false,
      total: codigos.length,
      codigos
    });

  } catch (error) {
    next(error);
  }
};

// Exportar controlador
export default {
  crearCodigo,
  obtenerCodigos,
  obtenerCodigoPorId,
  actualizarCodigo,
  eliminarCodigo,
  asociarServicio,
  desasociarServicio,
  obtenerServiciosAsociados,
  obtenerCodigosAsociados
}; 