import { createContext, useState, useEffect, useContext } from "react";
import { UserContext } from "./UserProvider";

export const ProcedimientosContext = createContext();

export const ProcedimientosProvider = ({ children }) => {
  // Integrar el contexto de usuario para acceder al rol
  const { user } = useContext(UserContext);
  
  // Datos simulados para procedimientos quirúrgicos
  const procedimientosQuirurgicosIniciales = [
    {
      id: 1,
      paciente: "Juan Pérez",
      rut: "12.345.678-9",
      edad: 45,
      contacto: {
        telefono: "+56 9 1234 5678",
        email: "juan.perez@ejemplo.com",
        direccion: "Av. Principal 123, Santiago"
      },
      tipo: "Inyección Intravítrea",
      ojo: "Derecho",
      medicoAsignado: "Dra. González",
      medicoId: 1,
      detallesProcedimiento: {
        diagnostico: "Degeneración macular húmeda relacionada con la edad (DMAE)",
        medicamento: "Ranibizumab (Lucentis) 0.5mg/0.05ml",
        indicaciones: "Controlar OCT en 4 semanas, aplicación mensual por 3 meses iniciales"
      },
      fechaIndicacion: "2023-11-15",
      fechaProgramada: "2023-11-28",
      estado: "programado",
      observaciones: "Anti-VEGF, Lucentis"
    },
    {
      id: 2,
      paciente: "María López",
      rut: "9.876.543-2",
      edad: 67,
      contacto: {
        telefono: "+56 9 8765 4321",
        email: "maria.lopez@ejemplo.com",
        direccion: "Calle Secundaria 456, Viña del Mar"
      },
      tipo: "Láser",
      ojo: "Izquierdo",
      medicoAsignado: "Dr. Sánchez",
      medicoId: 2,
      detallesProcedimiento: {
        diagnostico: "Opacidad de cápsula posterior (OCP)",
        tipo: "Láser YAG Capsulotomía",
        parametros: "1.8mJ, 12 spots",
        indicaciones: "Control en 2 semanas, AINE tópico 3 veces al día por 5 días"
      },
      fechaIndicacion: "2023-11-20",
      fechaProgramada: "2023-11-30",
      estado: "indicado",
      observaciones: "YAG Láser para opacidad capsular posterior"
    },
    {
      id: 3,
      paciente: "Roberto Sánchez",
      rut: "15.482.963-K",
      edad: 58,
      contacto: {
        telefono: "+56 9 5432 1098",
        email: "roberto.sanchez@ejemplo.com",
        direccion: "Pasaje Los Pinos 789, Concepción"
      },
      tipo: "Cirugía",
      ojo: "Ambos",
      medicoAsignado: "Dra. Martínez",
      medicoId: 3,
      detallesProcedimiento: {
        diagnostico: "Catarata bilateral, más avanzada en OD",
        tipo: "Facoemulsificación + LIO",
        lente: "Monofocal asférico Alcon SN60WF +21.5D OD, pendiente cálculo OI",
        anestesia: "Tópica + intracameral",
        indicaciones: "Programar OI 2 semanas después de OD"
      },
      fechaIndicacion: "2023-11-25",
      fechaProgramada: "2023-12-05",
      estado: "programado",
      observaciones: "Cirugía de catarata OD, programar OI en 2 semanas"
    },
    {
      id: 4,
      paciente: "Ana Torres",
      rut: "17.654.321-8",
      edad: 37,
      contacto: {
        telefono: "+56 9 2468 1357",
        email: "ana.torres@ejemplo.com",
        direccion: "Av. Las Condes 1010, Las Condes, Santiago"
      },
      tipo: "Inyección Intravítrea",
      ojo: "Derecho",
      medicoAsignado: "Dra. González",
      medicoId: 1,
      detallesProcedimiento: {
        diagnostico: "Edema macular diabético (EMD)",
        medicamento: "Aflibercept (Eylea) 2mg/0.05ml",
        indicaciones: "Régimen 5 dosis iniciales, control glicémico, OCT control en 6 semanas"
      },
      fechaIndicacion: "2023-11-10",
      fechaProgramada: "2023-11-20",
      estado: "realizado",
      observaciones: "Anti-VEGF, Eylea, reacción favorable"
    },
    {
      id: 5,
      paciente: "Carlos Ruiz",
      rut: "8.765.432-1",
      edad: 72,
      contacto: {
        telefono: "+56 9 3698 5214",
        email: "carlos.ruiz@ejemplo.com",
        direccion: "Calle El Bosque 222, Temuco"
      },
      tipo: "Láser",
      ojo: "Derecho",
      medicoAsignado: "Dr. Sánchez",
      medicoId: 2,
      detallesProcedimiento: {
        diagnostico: "Desgarro retinal superior temporal OD",
        tipo: "Fotocoagulación Láser Argón",
        parametros: "200-300 micras, 0.2 segundos, 200-300 mW, patrón barrera",
        indicaciones: "Reposo relativo 48h, evitar esfuerzos, retinografía control en 2 semanas"
      },
      fechaIndicacion: "2023-11-12",
      fechaProgramada: "2023-11-22",
      estado: "realizado",
      observaciones: "Láser Argón para desgarro retinal, control en 2 semanas"
    },
    {
      id: 6,
      paciente: "Lucía Gómez",
      rut: "14.765.983-5",
      edad: 51,
      contacto: {
        telefono: "+56 9 7531 4682",
        email: "lucia.gomez@ejemplo.com",
        direccion: "Pasaje Los Alerces 567, Puerto Montt"
      },
      tipo: "Cirugía",
      ojo: "Izquierdo",
      medicoAsignado: "Dra. Martínez",
      medicoId: 3,
      detallesProcedimiento: {
        diagnostico: "Desprendimiento de retina regmatógeno OI",
        tipo: "Vitrectomía pars plana 23G + endoláser + gas",
        anestesia: "General",
        indicaciones: "Posicionamiento boca abajo por 5 días, no viajar en avión 2 semanas",
        complejidad: "Alta, extensión macular"
      },
      fechaIndicacion: null,
      fechaProgramada: "fecha-inválida",
      estado: "indicado",
      observaciones: "Procedimiento pendiente de confirmar fecha"
    }
  ];

  const [procedimientos, setProcedimientos] = useState(procedimientosQuirurgicosIniciales);
  const [procedimientosFiltrados, setProcedimientosFiltrados] = useState(procedimientosQuirurgicosIniciales);
  
  // Mantener un estado para los filtros actuales
  const [filtrosActuales, setFiltrosActuales] = useState({});
  
  // Definición de permisos por rol
  const permisosRol = {
    admin: {
      verTodos: true,
      crearCualquiera: true,
      editarCualquiera: true,
      eliminarCualquiera: true
    },
    medico: {
      verTodos: false,
      verPropios: true,
      crearCualquiera: false,
      crearPropios: true,
      editarCualquiera: false,
      editarPropios: true,
      eliminarCualquiera: false,
      eliminarPropios: true
    },
    recepcionista: {
      verTodos: true,
      crearCualquiera: true,
      editarCualquiera: true,
      eliminarCualquiera: false
    },
    enfermero: {
      verTodos: true,
      crearCualquiera: false,
      editarCualquiera: false,
      editarPropios: false,
      eliminarCualquiera: false
    },
    tecnologo: {
      verTodos: false,
      verPropios: true,
      crearCualquiera: false,
      editarCualquiera: false,
      eliminarCualquiera: false
    }
  };

  // Función para obtener los permisos del usuario actual
  const getPermisosUsuario = () => {
    const rol = user?.rol || 'enfermero'; // Por defecto, menos privilegios
    return permisosRol[rol] || permisosRol.enfermero;
  };

  // Filtrar procedimientos según el rol y permisos del usuario
  useEffect(() => {
    const permisos = getPermisosUsuario();
    
    if (permisos.verTodos) {
      // Admin, recepcionista y enfermeros pueden ver todos
      setProcedimientosFiltrados(procedimientos);
    } else if (permisos.verPropios && user?.id) {
      // Médicos y tecnólogos solo pueden ver los propios
      const procedimientosFiltradosPorMedico = procedimientos.filter(
        p => p.medicoId === user.id
      );
      setProcedimientosFiltrados(procedimientosFiltradosPorMedico);
    } else {
      // Por defecto mostrar una lista vacía si no tiene permisos
      setProcedimientosFiltrados([]);
    }
  }, [user, procedimientos]);
  
  // Función para aplicar filtros 
  const aplicarFiltros = (filtros = {}) => {
    // Guardar los filtros actuales para futuras referencias
    setFiltrosActuales(filtros);
    
    let resultado = [...procedimientos];
    
    // Primero filtrar por permisos
    const permisos = getPermisosUsuario();
    
    if (!permisos.verTodos && permisos.verPropios && user?.id) {
      resultado = resultado.filter(p => p.medicoId === user.id);
    }
    
    // Filtrar por nombre de paciente
    if (filtros.paciente) {
      resultado = resultado.filter(p => 
        p.paciente.toLowerCase().includes(filtros.paciente.toLowerCase())
      );
    }
    
    // Filtrar por RUT
    if (filtros.rut) {
      resultado = resultado.filter(p => 
        p.rut.toLowerCase().includes(filtros.rut.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (filtros.estado) {
      resultado = resultado.filter(p => p.estado === filtros.estado);
    }
    
    // Filtrar por tipo de procedimiento
    if (filtros.tipo) {
      resultado = resultado.filter(p => p.tipo === filtros.tipo);
    }
    
    // Filtrar por fecha desde
    if (filtros.fechaDesde) {
      resultado = resultado.filter(p => {
        try {
          const fecha = new Date(p.fechaProgramada);
          return !isNaN(fecha.getTime()) && fecha >= new Date(filtros.fechaDesde);
        } catch {
          return false;
        }
      });
    }
    
    // Filtrar por fecha hasta
    if (filtros.fechaHasta) {
      resultado = resultado.filter(p => {
        try {
          const fecha = new Date(p.fechaProgramada);
          return !isNaN(fecha.getTime()) && fecha <= new Date(filtros.fechaHasta);
        } catch {
          return false;
        }
      });
    }
    
    // Filtrar por médico asignado
    if (filtros.medicoId) {
      resultado = resultado.filter(p => p.medicoId === filtros.medicoId);
    }
    
    setProcedimientosFiltrados(resultado);
    return resultado;
  };
  
  // Función para validar si el usuario tiene permiso para realizar una acción
  const tienePermiso = (accion, procedimiento = null) => {
    const permisos = getPermisosUsuario();
    
    switch (accion) {
      case 'ver':
        // Permiso para ver un procedimiento específico
        if (permisos.verTodos) return true;
        if (permisos.verPropios && procedimiento && user?.id) {
          return procedimiento.medicoId === user.id;
        }
        return false;
        
      case 'crear':
        // Permiso para crear un nuevo procedimiento
        if (permisos.crearCualquiera) return true;
        if (permisos.crearPropios && procedimiento && user?.id) {
          return procedimiento.medicoId === user.id;
        }
        return false;
        
      case 'editar':
        // Permiso para editar un procedimiento existente
        if (permisos.editarCualquiera) return true;
        if (permisos.editarPropios && procedimiento && user?.id) {
          return procedimiento.medicoId === user.id;
        }
        return false;
        
      case 'eliminar':
        // Permiso para eliminar un procedimiento
        if (permisos.eliminarCualquiera) return true;
        if (permisos.eliminarPropios && procedimiento && user?.id) {
          return procedimiento.medicoId === user.id;
        }
        return false;
        
      default:
        return false;
    }
  };
  
  // Función para agregar un nuevo procedimiento
  const agregarProcedimiento = (nuevoProcedimiento) => {
    // Validar si el usuario tiene permiso para agregar este procedimiento
    if (!tienePermiso('crear', nuevoProcedimiento)) {
      console.error('No tiene permiso para crear este procedimiento');
      return null;
    }
    
    const nuevoId = Math.max(0, ...procedimientos.map(p => p.id)) + 1;
    const procedimientoCompleto = {
      ...nuevoProcedimiento,
      id: nuevoId
    };
    
    setProcedimientos([...procedimientos, procedimientoCompleto]);
    aplicarFiltros(filtrosActuales); // Usar los filtros actuales
    
    return procedimientoCompleto;
  };
  
  // Función para actualizar un procedimiento existente
  const actualizarProcedimiento = (id, datos) => {
    // Buscar el procedimiento que se quiere actualizar
    const procedimientoExistente = procedimientos.find(p => p.id === id);
    
    if (!procedimientoExistente) {
      console.error(`No se encontró el procedimiento con ID ${id}`);
      return null;
    }
    
    // Validar si el usuario tiene permiso para actualizar este procedimiento
    if (!tienePermiso('editar', procedimientoExistente)) {
      console.error('No tiene permiso para actualizar este procedimiento');
      return null;
    }
    
    const procedimientosActualizados = procedimientos.map(p => 
      p.id === id ? { ...p, ...datos } : p
    );
    
    setProcedimientos(procedimientosActualizados);
    aplicarFiltros(filtrosActuales); // Usar los filtros actuales
    
    return procedimientosActualizados.find(p => p.id === id);
  };
  
  // Función para eliminar un procedimiento
  const eliminarProcedimiento = (id) => {
    // Buscar el procedimiento que se quiere eliminar
    const procedimientoExistente = procedimientos.find(p => p.id === id);
    
    if (!procedimientoExistente) {
      console.error(`No se encontró el procedimiento con ID ${id}`);
      return false;
    }
    
    // Validar si el usuario tiene permiso para eliminar este procedimiento
    if (!tienePermiso('eliminar', procedimientoExistente)) {
      console.error('No tiene permiso para eliminar este procedimiento');
      return false;
    }
    
    const procedimientosActualizados = procedimientos.filter(p => p.id !== id);
    setProcedimientos(procedimientosActualizados);
    aplicarFiltros(filtrosActuales); // Usar los filtros actuales
    
    return true;
  };
  
  // Función para convertir un procedimiento en un evento de calendario
  const procedimientoAEvento = (procedimiento) => {
    // Validar si el usuario tiene permiso para ver este procedimiento
    if (!tienePermiso('ver', procedimiento)) {
      return null;
    }
    
    // Solo crear eventos para procedimientos programados
    if (procedimiento.estado !== 'programado' || !procedimiento.fechaProgramada) {
      return null;
    }
    
    try {
      // Validar si la fecha es válida
      const fecha = new Date(procedimiento.fechaProgramada);
      if (isNaN(fecha.getTime())) {
        console.error(`Fecha inválida para procedimiento ID ${procedimiento.id}: ${procedimiento.fechaProgramada}`);
        return null;
      }
      
      // Formatear la fecha para el calendario
      const fechaStr = fecha.toISOString().split('T')[0];
      
      // Para simplificar, asignamos horarios fijos según el tipo de procedimiento
      let horaInicio, horaFin;
      switch(procedimiento.tipo) {
        case 'Inyección Intravítrea':
          horaInicio = '09:00:00';
          horaFin = '09:30:00';
          break;
        case 'Láser':
          horaInicio = '10:00:00';
          horaFin = '10:45:00';
          break;
        case 'Cirugía':
          horaInicio = '11:00:00';
          horaFin = '13:00:00';
          break;
        default:
          horaInicio = '09:00:00';
          horaFin = '10:00:00';
      }
      
      // Determinar color según tipo de procedimiento
      let backgroundColor, borderColor;
      switch(procedimiento.tipo) {
        case 'Inyección Intravítrea':
          backgroundColor = '#FCD34D';
          borderColor = '#F59E0B';
          break;
        case 'Láser':
          backgroundColor = '#6EE7B7';
          borderColor = '#10B981';
          break;
        case 'Cirugía':
          backgroundColor = '#93C5FD';
          borderColor = '#3B82F6';
          break;
        default:
          backgroundColor = '#D1D5DB';
          borderColor = '#6B7280';
      }
      
      return {
        id: `proc-${procedimiento.id}`,
        title: `${procedimiento.paciente} - ${procedimiento.tipo} (${procedimiento.ojo})`,
        start: `${fechaStr}T${horaInicio}`,
        end: `${fechaStr}T${horaFin}`,
        backgroundColor,
        borderColor,
        extendedProps: {
          paciente: procedimiento.paciente,
          rut: procedimiento.rut,
          tipo: procedimiento.tipo,
          ojo: procedimiento.ojo,
          medicoAsignado: procedimiento.medicoAsignado,
          medicoId: procedimiento.medicoId,
          detalles: procedimiento.detallesProcedimiento,
          estado: procedimiento.estado,
          observaciones: procedimiento.observaciones,
          esProcedimiento: true,
          procedimientoId: procedimiento.id
        }
      };
    } catch (error) {
      console.error('Error al convertir procedimiento a evento:', error);
      return null;
    }
  };
  
  // Función para obtener todos los eventos de calendario generados desde procedimientos
  const obtenerEventosProcedimientos = () => {
    // Filtrar primero según permisos
    const permisos = getPermisosUsuario();
    let procedimientosVisibles = procedimientos;
    
    if (!permisos.verTodos && permisos.verPropios && user?.id) {
      procedimientosVisibles = procedimientos.filter(p => p.medicoId === user.id);
    }
    
    const eventos = procedimientosVisibles
      .filter(p => p.estado === 'programado')
      .map(procedimientoAEvento)
      .filter(event => event !== null);
    
    return eventos;
  };

  return (
    <ProcedimientosContext.Provider
      value={{
        procedimientos,
        procedimientosFiltrados,
        aplicarFiltros,
        agregarProcedimiento,
        actualizarProcedimiento,
        eliminarProcedimiento,
        procedimientoAEvento,
        obtenerEventosProcedimientos,
        tienePermiso
      }}
    >
      {children}
    </ProcedimientosContext.Provider>
  );
};

export default ProcedimientosProvider; 