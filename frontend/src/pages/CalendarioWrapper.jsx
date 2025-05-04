import { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../providers/UserProvider";
import { ProcedimientosContext } from "../providers/ProcedimientosProvider";
import MainLayout from "../components/MainLayout";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

export default function CalendarioWrapper() {
  const { user } = useContext(UserContext);
  const { obtenerEventosProcedimientos, actualizarProcedimiento, tienePermiso } = useContext(ProcedimientosContext);
  const [vista, setVista] = useState("dayGridMonth"); // dayGridMonth, timeGridWeek, timeGridDay
  const calendarRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    paciente: "",
    doctor: "",
    tipo: "",
    fecha: "",
    hora: "",
    duracion: "30",
    notas: ""
  });
  
  // Estados para el menú contextual
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuDate, setContextMenuDate] = useState(null);
  const [menuTipoCitaVisible, setMenuTipoCitaVisible] = useState(false);
  const [selectedTipoCita, setSelectedTipoCita] = useState(null);
  const [showProcedimientoOptions, setShowProcedimientoOptions] = useState(false);
  
  // Estados para la gestión de eventos
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventContextMenuVisible, setEventContextMenuVisible] = useState(false);
  
  // Configuración de permisos por rol - Actualizada para ser más específica
  const rolPermisos = {
    admin: {
      puedeVerTodo: true,
      puedeCrearCualquierCita: true,
      puedeEditarCualquierCita: true,
      puedeEliminarCualquierCita: true,
      tiposCitaPermitidos: ['consulta', 'procedimiento', 'examen'],
      procedimientosPermitidos: ['inyeccion_intravitrea', 'laser', 'cirugia_menor', 'cirugia_mayor']
    },
    medico: {
      puedeVerTodo: false,
      puedeVerPropias: true,
      puedeCrearCualquierCita: false,
      puedeCrearPropias: true,
      puedeEditarCualquierCita: false,
      puedeEditarPropias: true,
      puedeEliminarCualquierCita: false,
      puedeEliminarPropias: true,
      tiposCitaPermitidos: ['consulta', 'procedimiento', 'examen'],
      procedimientosPermitidos: ['inyeccion_intravitrea', 'laser', 'cirugia_menor', 'cirugia_mayor']
    },
    enfermero: {
      puedeVerTodo: true,
      puedeCrearCualquierCita: false,
      puedeCrearPropias: true,
      puedeEditarCualquierCita: false,
      puedeEditarPropias: true,
      puedeEliminarCualquierCita: false,
      puedeEliminarPropias: false,
      tiposCitaPermitidos: ['examen'],
      procedimientosPermitidos: ['inyeccion_intravitrea']
    },
    recepcionista: {
      puedeVerTodo: true,
      puedeCrearCualquierCita: true,
      puedeEditarCualquierCita: true,
      puedeEliminarCualquierCita: false,
      tiposCitaPermitidos: ['consulta', 'examen'],
      procedimientosPermitidos: []
    },
    tecnologo: {
      puedeVerTodo: false,
      puedeVerPropias: true,
      puedeCrearCualquierCita: false,
      puedeCrearPropias: true,
      puedeEditarCualquierCita: false,
      puedeEditarPropias: true,
      puedeEliminarCualquierCita: false,
      puedeEliminarPropias: false,
      tiposCitaPermitidos: ['examen'],
      procedimientosPermitidos: []
    }
  };
  
  // Obtener permisos del usuario actual
  const getPermisosUsuario = () => {
    const rol = user?.rol || 'enfermero'; // Por defecto, menos privilegios
    return rolPermisos[rol] || rolPermisos.enfermero;
  };
  
  // Verificar si un evento es propio del usuario
  const esEventoPropio = (evento) => {
    if (!user || !user.id) return false;
    
    // Para procedimientos quirúrgicos
    if (evento.id.startsWith('proc-') && evento.extendedProps && evento.extendedProps.medicoId) {
      return evento.extendedProps.medicoId === user.id;
    }
    
    // Para citas regulares (buscar por el médico asignado)
    if (evento.extendedProps && evento.extendedProps.doctor) {
      const doctorEvento = medicos.find(m => m.nombre === evento.extendedProps.doctor);
      return doctorEvento && doctorEvento.id === user.id;
    }
    
    return false;
  };
  
  // Verificar si el usuario puede ver un evento
  const puedeVerEvento = (evento) => {
    const permisos = getPermisosUsuario();
    
    if (permisos.puedeVerTodo) return true;
    if (permisos.puedeVerPropias && esEventoPropio(evento)) return true;
    
    return false;
  };
  
  // Verificar si el usuario puede editar un evento
  const puedeEditarEvento = (evento) => {
    const permisos = getPermisosUsuario();
    
    if (permisos.puedeEditarCualquierCita) return true;
    if (permisos.puedeEditarPropias && esEventoPropio(evento)) return true;
    
    return false;
  };
  
  // Verificar si el usuario puede eliminar un evento
  const puedeEliminarEvento = (evento) => {
    const permisos = getPermisosUsuario();
    
    if (permisos.puedeEliminarCualquierCita) return true;
    if (permisos.puedeEliminarPropias && esEventoPropio(evento)) return true;
    
    return false;
  };
  
  // Filtrar tipos de cita según permisos
  const getTiposCitaPermitidos = () => {
    const permisos = getPermisosUsuario();
    
    if (permisos.puedeCrearCualquierCita) {
      return tiposCita; // Todos los tipos
    }
    
    return tiposCita.filter(tipo => 
      permisos.tiposCitaPermitidos?.includes(tipo.id)
    );
  };
  
  const [medicos, setMedicos] = useState([
    { id: 1, nombre: "Dra. González" },
    { id: 2, nombre: "Dr. Sánchez" },
    { id: 3, nombre: "Dra. Martínez" }
  ]);
  const [pacientes, setPacientes] = useState([
    { id: 1, nombre: "Juan", primer_apellido: "Pérez", segundo_apellido: "Gómez", run: "12.345.678-9" },
    { id: 2, nombre: "María", primer_apellido: "López", segundo_apellido: "Soto", run: "9.876.543-2" },
    { id: 3, nombre: "Carlos", primer_apellido: "Rodríguez", segundo_apellido: "Miranda", run: "15.678.901-3" }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [showPacientesList, setShowPacientesList] = useState(false);
  
  // Arrays para los distintos tipos de procedimientos
  const tiposCita = [
    { id: 'consulta', nombre: 'Consulta', color: '#93C5FD', subtypes: [
      { id: 'primera_visita', nombre: 'Primera visita', duracion: 30 },
      { id: 'control', nombre: 'Control', duracion: 15 },
      { id: 'urgencia', nombre: 'Urgencia', duracion: 30 },
      { id: 'consulta_general', nombre: 'Consulta General', duracion: 30 }
    ]},
    { id: 'procedimiento', nombre: 'Procedimiento', color: '#FCD34D', subtypes: [
      { id: 'inyeccion_intravitrea', nombre: 'Inyección Intravítrea', duracion: 30 },
      { id: 'laser', nombre: 'Procedimiento Láser', duracion: 45 },
      { id: 'cirugia_menor', nombre: 'Cirugía Menor', duracion: 60 },
      { id: 'cirugia_mayor', nombre: 'Cirugía Mayor', duracion: 120 }
    ]},
    { id: 'examen', nombre: 'Examen', color: '#6EE7B7', subtypes: [
      { id: 'fondo_ojo', nombre: 'Fondo de Ojo', duracion: 30 },
      { id: 'oct', nombre: 'OCT', duracion: 30 },
      { id: 'campo_visual', nombre: 'Campo Visual', duracion: 45 },
      { id: 'angiografia', nombre: 'Angiografía', duracion: 60 }
    ]}
  ];
  
  // Estado para los eventos del calendario
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Juan Pérez - Consulta General',
      start: '2023-11-15T10:30:00',
      end: '2023-11-15T11:00:00',
      backgroundColor: '#FCD34D',
      borderColor: '#F59E0B',
      extendedProps: {
        paciente: 'Juan Pérez',
        doctor: 'Dra. González',
        estado: 'pendiente'
      }
    },
    {
      id: '2',
      title: 'María López - Control',
      start: '2023-11-15T11:15:00',
      end: '2023-11-15T11:45:00',
      backgroundColor: '#6EE7B7',
      borderColor: '#10B981',
      extendedProps: {
        paciente: 'María López',
        doctor: 'Dr. Sánchez',
        estado: 'confirmada'
      }
    },
    {
      id: '3',
      title: 'Carlos Rodríguez - Primera visita',
      start: '2023-11-16T09:00:00',
      end: '2023-11-16T10:00:00',
      backgroundColor: '#93C5FD',
      borderColor: '#3B82F6',
      extendedProps: {
        paciente: 'Carlos Rodríguez',
        doctor: 'Dra. Martínez',
        estado: 'confirmada'
      }
    }
  ]);

  // Combinar eventos de citas regulares con procedimientos quirúrgicos
  useEffect(() => {
    const procedimientosEventos = obtenerEventosProcedimientos();
    const citasRegulares = events.filter(evento => !evento.id.startsWith('proc-'));
    
    // Filtrar los eventos según los permisos
    let todosEventos = [...citasRegulares, ...procedimientosEventos];
    
    // Si el usuario no puede ver todo, filtrar solo los eventos permitidos
    const permisos = getPermisosUsuario();
    if (!permisos.puedeVerTodo) {
      todosEventos = todosEventos.filter(evento => puedeVerEvento(evento));
    }
    
    setEvents(todosEventos);
  }, [obtenerEventosProcedimientos, user]);

  // Estados para los filtros
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroTipoCita, setFiltroTipoCita] = useState("");
  const [filtrosEstado, setFiltrosEstado] = useState({
    pendiente: false,
    confirmada: false,
    completada: false,
    cancelada: false
  });
  
  // Estado para los eventos filtrados
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  
  // Función para aplicar los filtros
  const aplicarFiltros = () => {
    let resultado = [...events];
    
    // Filtrar por médico
    if (filtroMedico) {
      resultado = resultado.filter(event => 
        event.extendedProps.doctor === filtroMedico
      );
    }
    
    // Filtrar por tipo de cita
    if (filtroTipoCita) {
      resultado = resultado.filter(event => 
        event.title.includes(filtroTipoCita) || 
        (event.extendedProps.tipo && event.extendedProps.tipo.includes(filtroTipoCita))
      );
    }
    
    // Filtrar por estado
    const estadosSeleccionados = Object.entries(filtrosEstado)
      .filter(([_, seleccionado]) => seleccionado)
      .map(([estado, _]) => estado);
    
    if (estadosSeleccionados.length > 0) {
      resultado = resultado.filter(event => 
        estadosSeleccionados.includes(event.extendedProps.estado)
      );
    }
    
    // Actualizar eventos filtrados
    setEventosFiltrados(resultado);
    
    console.log('Filtros aplicados:', {
      medico: filtroMedico,
      tipoCita: filtroTipoCita,
      estados: estadosSeleccionados,
      resultados: resultado.length
    });
  };
  
  // Manejar cambios en los filtros de estado (checkboxes)
  const handleEstadoChange = (estado) => {
    setFiltrosEstado({
      ...filtrosEstado,
      [estado]: !filtrosEstado[estado]
    });
  };
  
  // Inicializar eventos filtrados con todos los eventos al principio
  useEffect(() => {
    setEventosFiltrados(events);
  }, [events]);

  // Función para filtrar pacientes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPacientes([]);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = pacientes.filter(paciente => 
      paciente.nombre.toLowerCase().includes(searchLower) ||
      paciente.primer_apellido.toLowerCase().includes(searchLower) ||
      paciente.segundo_apellido?.toLowerCase().includes(searchLower) ||
      paciente.run.toLowerCase().includes(searchLower)
    );
    
    setFilteredPacientes(filtered);
  }, [searchTerm, pacientes]);

  // Función para seleccionar un paciente
  const handleSelectPaciente = (paciente) => {
    setFormData({
      ...formData,
      paciente: paciente.id.toString()
    });
    setSearchTerm(`${paciente.nombre} ${paciente.primer_apellido} (${paciente.run})`);
    setShowPacientesList(false);
  };

  // Función para cambiar la vista del calendario
  const handleViewChange = (newView) => {
    setVista(newView);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(newView);
      
      // Forzar actualización de eventos al cambiar de vista
      setTimeout(() => {
        // Actualizar eventos para la nueva vista
        calendarApi.refetchEvents();
        console.log(`Vista cambiada a ${newView}, actualizando eventos...`);
        
        // Reforzar la visualización de eventos
        if (events.length > 0) {
          calendarApi.removeAllEvents();
          calendarApi.addEventSource(events);
        }
      }, 100);
    }
  };

  // Función para navegar por el calendario
  const handleNavigate = (direction) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (direction === 'prev') {
        calendarApi.prev();
      } else if (direction === 'next') {
        calendarApi.next();
      } else if (direction === 'today') {
        calendarApi.today();
      }
      setCurrentDate(calendarApi.getDate());
    }
  };

  // Obtener el título del calendario (mes/semana/día actual)
  const getCalendarTitle = () => {
    const options = { month: 'long', year: 'numeric' };
    if (vista === 'timeGridDay') {
      options.day = 'numeric';
    }
    return new Date(currentDate).toLocaleDateString('es-ES', options);
  };

  // Manejar el evento cuando se hace clic en una fecha
  const handleDateClick = (info) => {
    const clickedDate = new Date(info.date);
    const formattedDate = clickedDate.toISOString().split('T')[0];
    const formattedTime = info.date.toTimeString().slice(0, 5);
    
    setSelectedDate(clickedDate);
    setFormData({
      ...formData,
      fecha: formattedDate,
      hora: formattedTime || '08:00'
    });
    setModalOpen(true);
  };

  // Manejar el evento cuando se hace clic en un evento existente
  const handleEventClick = (info) => {
    const evento = info.event;
    
    // Verificar si el usuario puede ver los detalles de este evento
    if (!puedeVerEvento(evento)) {
      alert('No tienes permiso para ver los detalles de esta cita.');
      return;
    }
    
    // Verificar si es un procedimiento quirúrgico
    if (evento.id.startsWith('proc-')) {
      const procedimientoId = evento.extendedProps.procedimientoId;
      
      // Mostrar información del procedimiento de manera amigable
      const mensaje = `
        Procedimiento: ${evento.extendedProps.tipo} (${evento.extendedProps.ojo})
        Paciente: ${evento.extendedProps.paciente} - ${evento.extendedProps.rut}
        Médico: ${evento.extendedProps.medicoAsignado || 'No asignado'}
        Estado: ${evento.extendedProps.estado}
        
        Diagnóstico: ${evento.extendedProps.detalles?.diagnostico || 'No especificado'}
        
        ¿Desea ver más detalles en el Dashboard médico?
      `;
      
      if (confirm(mensaje)) {
        // Redirigir al dashboard médico
        window.location.href = "/dashboard";
      }
      
      return;
    }
    
    // Manejo regular de eventos de citas
    setSelectedEvent(evento);
    setIsEditMode(false); // Inicialmente solo mostramos la información
    setModalOpen(true);
  };

  // Esta función ha sido reemplazada por la lógica directa en eventDidMount
  
  // Función para editar una cita existente
  const editarCita = (event) => {
    // Verificar si el usuario puede editar este evento
    if (!puedeEditarEvento(event)) {
      alert('No tienes permiso para editar esta cita.');
      return;
    }
    
    // Obtener la información del evento
    const pacienteNombre = event.extendedProps.paciente;
    const paciente = pacientes.find(p => `${p.nombre} ${p.primer_apellido}` === pacienteNombre);
    
    const doctorNombre = event.extendedProps.doctor;
    const doctor = medicos.find(m => m.nombre === doctorNombre);
    
    // Convertir fechas a formato adecuado
    const fechaInicio = new Date(event.start);
    const formattedDate = fechaInicio.toISOString().split('T')[0];
    const formattedTime = fechaInicio.toTimeString().slice(0, 5);
    
    // Calcular duración en minutos
    const fechaFin = new Date(event.end);
    const duracionMinutos = (fechaFin - fechaInicio) / (1000 * 60);
    
    // Preparar datos del formulario
    setFormData({
      id: event.id,
      paciente: paciente ? paciente.id.toString() : "",
      doctor: doctor ? doctor.id.toString() : "",
      tipo: event.extendedProps.tipo || event.title.split(' - ')[1] || "",
      fecha: formattedDate,
      hora: formattedTime,
      duracion: duracionMinutos.toString(),
      notas: event.extendedProps.notas || ""
    });
    
    // Configurar el autocompletado para el nombre del paciente
    if (paciente) {
      setSearchTerm(`${paciente.nombre} ${paciente.primer_apellido} (${paciente.run})`);
    }
    
    // Activar modo edición y abrir modal
    setIsEditMode(true);
    setModalOpen(true);
  };
  
  // Función para eliminar una cita
  const eliminarCita = (eventId) => {
    // Encontrar el evento a eliminar para verificar permisos
    const eventoAEliminar = events.find(event => event.id === eventId);
    if (!eventoAEliminar) {
      console.error('No se encontró la cita a eliminar');
      return;
    }
    
    // Verificar si el usuario puede eliminar este evento
    if (!puedeEliminarEvento(eventoAEliminar)) {
      alert('No tienes permiso para eliminar esta cita.');
      return;
    }
    
    console.log('Eliminando cita con ID:', eventId);
    
    // Para procedimientos quirúrgicos, usar el contexto de procedimientos
    if (eventId.startsWith('proc-')) {
      const procedimientoId = parseInt(eventId.replace('proc-', ''));
      const resultado = eliminarProcedimiento(procedimientoId);
      
      if (!resultado) {
        alert('No se pudo eliminar el procedimiento. Verifica tus permisos.');
        return;
      }
    }
    
    // Filtrar para eliminar el evento
    const eventosActualizados = events.filter(event => event.id !== eventId);
    setEvents(eventosActualizados);
    
    // Mostrar confirmación de eliminación
    alert('✅ La cita ha sido eliminada correctamente');
    
    // Cerrar menús contextuales
    setEventContextMenuVisible(false);
    setShowDeleteConfirm(false);
    
    // Quitar la clase selected de todos los eventos
    document.querySelectorAll('.calendar-event-item').forEach(el => {
      el.classList.remove('selected');
    });
    
    console.log('Cita eliminada correctamente');
  };
  
  // Función para agregar un sobrecupo (cita en el mismo horario)
  const agregarSobrecupo = () => {
    if (!selectedEvent) return;
    
    // Verificar permisos según el rol
    const permisos = getPermisosUsuario();
    
    if (!permisos.puedeCrearCualquierCita) {
      alert('No tienes permiso para agregar sobrecupos.');
      return;
    }
    
    // Obtener la fecha y hora del evento seleccionado
    const fechaEvento = new Date(selectedEvent.start);
    
    // Configurar fecha para el nuevo sobrecupo
    const formattedDate = fechaEvento.toISOString().split('T')[0];
    const formattedTime = fechaEvento.toTimeString().slice(0, 5);
    
    // Resetear el formulario con la fecha/hora del evento seleccionado
    setFormData({
      paciente: "",
      doctor: "",
      tipo: "",
      fecha: formattedDate,
      hora: formattedTime,
      duracion: "15", // Típicamente sobrecupos son más cortos
      notas: "SOBRECUPO"
    });
    
    // Cerrar menú contextual y abrir modal para nueva cita
    setEventContextMenuVisible(false);
    setIsEditMode(false);
    setModalOpen(true);
  };

  // Abrir el modal de nueva cita
  const handleNuevaCita = () => {
    // Verificar permisos para crear citas
    const permisos = getPermisosUsuario();
    if (!permisos.puedeCrearCualquierCita && !permisos.puedeCrearPropias) {
      alert('No tienes permiso para crear citas.');
      return;
    }
    
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
    // Pre-seleccionar el médico si es un médico creando su propia cita
    let doctorId = "";
    if (user?.rol === 'medico' && user?.id) {
      doctorId = user.id.toString();
    }
    
    setSelectedDate(now);
    setFormData({
      ...formData,
      fecha: formattedDate,
      hora: '08:00',
      doctor: doctorId
    });
    setModalOpen(true);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Verificar permisos nuevamente
    const permisos = getPermisosUsuario();
    const esCitaPropia = formData.doctor === user?.id?.toString();
    
    if (
      (!permisos.puedeCrearCualquierCita && !esCitaPropia) ||
      (!permisos.puedeCrearPropias && esCitaPropia)
    ) {
      alert('No tienes permiso para crear esta cita.');
      return;
    }
    
    const pacienteNombre = pacientes.find(p => p.id === parseInt(formData.paciente))?.nombre || "";
    const pacienteApellido = pacientes.find(p => p.id === parseInt(formData.paciente))?.primer_apellido || "";
    const doctorNombre = medicos.find(d => d.id === parseInt(formData.doctor))?.nombre || "";
    
    const startDate = new Date(`${formData.fecha}T${formData.hora}`);
    const endDate = new Date(startDate.getTime() + parseInt(formData.duracion) * 60000);

    // Determinar si estamos en modo edición o creación
    if (isEditMode && formData.id) {
      // Verificar permiso para editar si estamos editando
      const eventoExistente = events.find(e => e.id === formData.id);
      if (eventoExistente && !puedeEditarEvento(eventoExistente)) {
        alert('No tienes permiso para editar esta cita.');
        return;
      }
      
      // Actualizar evento existente
      const updatedEvents = events.map(event => {
        if (event.id === formData.id) {
          // Mantener el mismo color que tenía antes
          const originalEvent = events.find(e => e.id === formData.id);
          
          return {
            ...event,
            title: `${pacienteNombre} ${pacienteApellido} - ${formData.tipo}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            backgroundColor: originalEvent.backgroundColor,
            borderColor: originalEvent.borderColor,
            extendedProps: {
              ...event.extendedProps,
              paciente: `${pacienteNombre} ${pacienteApellido}`,
              doctor: doctorNombre,
              tipo: formData.tipo,
              notas: formData.notas
            }
          };
        }
        return event;
      });
      
      setEvents(updatedEvents);
      
      // Forzar actualización del calendario
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }
      
      // Mostrar confirmación de éxito
      alert(`✅ Cita actualizada con éxito para ${pacienteNombre} ${pacienteApellido} con ${doctorNombre} el ${new Date(startDate).toLocaleDateString('es-ES')} a las ${new Date(startDate).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`);
    } else {
      // Crear nuevo evento
      let backgroundColor = '#93C5FD'; // Color por defecto (azul)
      let borderColor = '#3B82F6';
      
      // Elegir color según el tipo de cita
      if (formData.tipo.includes('Procedimiento') || formData.tipo.includes('Láser') || formData.tipo.includes('Inyección')) {
        backgroundColor = '#FCD34D'; // Amarillo
        borderColor = '#F59E0B';
      } else if (formData.tipo.includes('Examen') || formData.tipo.includes('OCT') || formData.tipo.includes('Campo')) {
        backgroundColor = '#6EE7B7'; // Verde
        borderColor = '#10B981';
      }
      
      // Marcar visualmente los sobrecupos
      if (formData.notas.includes('SOBRECUPO')) {
        backgroundColor = '#FDA4AF'; // Rojo claro
        borderColor = '#E11D48'; // Rojo
      }
      
      const newEvent = {
        id: formData.id || (events.length + 1).toString(),
        title: `${pacienteNombre} ${pacienteApellido} - ${formData.tipo}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor,
        borderColor,
        extendedProps: {
          paciente: `${pacienteNombre} ${pacienteApellido}`,
          doctor: doctorNombre,
          estado: 'pendiente',
          tipo: formData.tipo,
          notas: formData.notas,
          // Agregar ID del médico para facilitar los permisos
          medicoId: parseInt(formData.doctor)
        }
      };
      
      // Añadir el nuevo evento al array de eventos
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      
      // Forzar actualización del calendario después de añadir el evento
      if (calendarRef.current) {
        setTimeout(() => {
          const calendarApi = calendarRef.current.getApi();
          // Añadir el evento directamente a la instancia del calendario
          calendarApi.addEvent(newEvent);
          
          // Si estamos en otra vista diferente a la que corresponde al nuevo evento,
          // navegar a la fecha del evento para visualizarlo correctamente
          if (vista !== 'dayGridMonth') {
            calendarApi.gotoDate(startDate);
          }
        }, 50);
      }
      
      // Mostrar confirmación de éxito
      alert(`✅ Cita creada con éxito para ${pacienteNombre} ${pacienteApellido} con ${doctorNombre} el ${new Date(startDate).toLocaleDateString('es-ES')} a las ${new Date(startDate).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`);
    }
    
    // Cerrar el modal y resetear el formulario
    setModalOpen(false);
    setIsEditMode(false);
    setFormData({
      paciente: "",
      doctor: "",
      tipo: "",
      fecha: "",
      hora: "",
      duracion: "30",
      notas: ""
    });
    setSearchTerm("");
  };

  // Función para mostrar menú contextual para eventos
  const handleCalendarContextMenu = (info) => {
    // Prevenir que se muestre el menú contextual por defecto del navegador
    info.jsEvent.preventDefault();
    
    // Guardar la fecha seleccionada
    const clickedDate = new Date(info.dateStr);
    setContextMenuDate(clickedDate);
    
    // Posicionar y mostrar el menú contextual
    const position = ajustarPosicionMenu({ 
      x: info.jsEvent.clientX, 
      y: info.jsEvent.clientY 
    }, 220, 250);
    
    setContextMenuPosition(position);
    
    // Cerrar otros menús primero
    setEventContextMenuVisible(false);
    
    // Mostrar este menú
    setTimeout(() => {
      setContextMenuVisible(true);
      // Añadir clase al body para gestionar los eventos a nivel global
      document.body.classList.add('has-context-menu');
      
      // Ocultar submenús
      setMenuTipoCitaVisible(false);
      setShowProcedimientoOptions(false);
      setSelectedTipoCita(null);
    }, 10);
  };
  
  // Función para seleccionar un tipo de cita desde el menú contextual
  const handleTipoCitaSelect = (tipo) => {
    console.log('Tipo de cita seleccionado:', tipo.nombre);
    
    // Primero actualizar el estado
    setSelectedTipoCita(tipo);
    
    // Si se selecciona procedimiento, mostrar opciones adicionales
    if (tipo.id === 'procedimiento' || (tipo.subtypes && tipo.subtypes.length > 0)) {
      console.log('Mostrando opciones para:', tipo.nombre);
      
      // Obtener los subtipos permitidos
      const subtiposDisponibles = getSubtiposPermitidos(tipo);
      
      // Si solo hay un subtipo, no mostrar menú y usarlo directamente
      if (subtiposDisponibles.length === 1) {
        console.log('Solo hay un subtipo disponible, usando directamente:', subtiposDisponibles[0].nombre);
        const tipoCompleto = {
          ...tipo,
          subtype: subtiposDisponibles[0]
        };
        
        // Cerrar menús y abrir formulario
        setMenuTipoCitaVisible(false);
        setShowProcedimientoOptions(false);
        setTimeout(() => {
          abrirFormularioCita(tipoCompleto);
        }, 50);
        return;
      }
      
      // Establecer estado para mostrar submenú de procedimientos
      setMenuTipoCitaVisible(true); // Mantener visible el primer menú 
      
      // Usar setTimeout para asegurar que el estado se actualice antes de mostrar el submenú
      setTimeout(() => {
        setShowProcedimientoOptions(true);
        // Añadir clase 'active' al menú principal para enfatizar visualmente
        const mainMenu = document.getElementById('main-context-menu');
        if (mainMenu) {
          mainMenu.classList.add('active');
        }
      }, 10);
    } else {
      // Para otro tipo de citas que no tienen subtipos, ir directamente al formulario
      console.log('Abriendo directamente formulario para:', tipo.nombre);
      
      // Cerrar menús y abrir formulario
      setMenuTipoCitaVisible(false);
      setShowProcedimientoOptions(false);
      setTimeout(() => {
        abrirFormularioCita(tipo);
      }, 50);
    }
  };
  
  // Función para seleccionar un subtipo y abrir el formulario
  const handleSubtypeSelect = (subtype) => {
    console.log('Subtipo seleccionado:', subtype.nombre);
    if (!selectedTipoCita) {
      console.error('Error: No hay tipo de cita seleccionado');
      return;
    }
    
    const tipoCompleto = {
      ...selectedTipoCita,
      subtype: subtype
    };
    console.log('Tipo completo:', tipoCompleto);
    
    // Cerrar todos los submenús antes de abrir el formulario
    setMenuTipoCitaVisible(false);
    setShowProcedimientoOptions(false);
    
    // Usar setTimeout para asegurar que los estados se actualicen antes de continuar
    setTimeout(() => {
      abrirFormularioCita(tipoCompleto);
    }, 50);
  };
  
  // Función para abrir el formulario con los datos prellenados
  const abrirFormularioCita = (tipoSeleccionado) => {
    if (!tipoSeleccionado) {
      console.error('Error: No se recibió tipo de cita');
      return;
    }
    
    if (!contextMenuDate) {
      console.error('Error: No hay fecha seleccionada');
      return;
    }
  
    console.log('Abriendo formulario con tipo:', tipoSeleccionado.nombre || tipoSeleccionado.id);
    
    // Formatear fecha
    const formattedDate = contextMenuDate.toISOString().split('T')[0];
    const hora = contextMenuDate.getHours().toString().padStart(2, '0') + ':' + 
                contextMenuDate.getMinutes().toString().padStart(2, '0');
    
    // Determinar duración según el subtipo
    const duracion = tipoSeleccionado.subtype ? 
                    tipoSeleccionado.subtype.duracion.toString() : "30";
    
    // Determinar título según el tipo y subtipo
    const tipoNombre = tipoSeleccionado.subtype ? 
                      tipoSeleccionado.subtype.nombre :
                      (tipoSeleccionado.subtypes && tipoSeleccionado.subtypes.length > 0) ? 
                      tipoSeleccionado.subtypes[0].nombre : tipoSeleccionado.nombre || "Consulta General";
    
    // Preseleccionar médico si el usuario es médico
    let doctorId = "";
    if (user?.rol === 'medico' && user?.id) {
      doctorId = user.id.toString();
    }
    
    console.log('Datos de formulario:', {
      fecha: formattedDate,
      hora,
      duracion,
      tipo: tipoNombre,
      doctor: doctorId
    });
    
    // Configurar formulario
    setFormData({
      ...formData,
      fecha: formattedDate,
      hora: hora,
      duracion: duracion,
      tipo: tipoNombre,
      doctor: doctorId
    });
    
    // Cerrar menús y abrir modal
    setContextMenuVisible(false);
    setMenuTipoCitaVisible(false);
    setShowProcedimientoOptions(false);
    
    // Usar setTimeout para asegurarse de que los menús se hayan cerrado antes de abrir el modal
    setTimeout(() => {
      console.log('Abriendo modal de cita');
      setModalOpen(true);
    }, 50);
  };

  // Función para mostrar menú contextual para eventos
  const handleEventContextMenu = (event, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!event) {
      console.error('No hay evento seleccionado');
      return;
    }
    
    console.log('Abriendo menú contextual para evento:', event.title);
    
    // Guardar evento seleccionado
    setSelectedEvent(event);
    
    // Cerrar otros menús primero
    setContextMenuVisible(false);
    setMenuTipoCitaVisible(false);
    setShowProcedimientoOptions(false);
    
    // Posicionar y mostrar el menú contextual
    const position = ajustarPosicionMenu({ 
      x: e.clientX, 
      y: e.clientY 
    }, 220, 200);
    
    console.log('Posición del menú:', position);
    
    setContextMenuPosition(position);
    
    // Mostrar este menú con un pequeño retraso para evitar problemas de renderizado
    setTimeout(() => {
      setEventContextMenuVisible(true);
      // Añadir clase al body para gestionar los eventos a nivel global
      document.body.classList.add('has-context-menu');
      
      // Asegurarse de que el botón de eliminar sea visible
      console.log('Menú de evento abierto, botón de eliminar debería ser visible');
      
      // Resetear estado de confirmación
      setShowDeleteConfirm(false);
    }, 10);
    
    return false;
  };

  // Cerrar el menú contextual si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      // No cerrar si se hizo clic en un elemento del menú contextual
      if (
        e.target.closest('.calendar-context-menu') ||
        e.target.closest('.calendar-contextmenu-trigger')
      ) {
        // Solo permitir el cierre si se hace clic en un botón específico dentro del menú
        if (e.target.closest('[data-close-menu="true"]')) {
          console.log('Cerrando menú por clic en botón de cierre');
          closeAllContextMenus();
        }
        return;
      }
      
      // Cerrar todos los menús contextuales
      console.log('Cerrando menú por clic fuera');
      closeAllContextMenus();
    };
    
    // Función auxiliar para cerrar todos los menús contextuales
    const closeAllContextMenus = () => {
      // Quitar clase 'active' del menú principal
      const mainMenu = document.getElementById('main-context-menu');
      if (mainMenu) {
        mainMenu.classList.remove('active');
      }
      
      // Cerrar todos los menús
      setContextMenuVisible(false);
      setMenuTipoCitaVisible(false);
      setShowProcedimientoOptions(false);
      setEventContextMenuVisible(false);
      document.body.classList.remove('has-context-menu');
    };
    
    // Usar mousedown en lugar de click para capturar el evento antes
    document.addEventListener('mousedown', handleClickOutside);
    
    // También cerrar el menú al presionar Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        console.log('Cerrando menú con tecla Escape');
        closeAllContextMenus();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  
  // Función para asegurar que el menú contextual aparezca dentro de los límites de la pantalla
  const ajustarPosicionMenu = (posicion, anchoMenu = 200, altoMenu = 200) => {
    const { innerWidth, innerHeight } = window;
    
    // Ajustar posición horizontal
    let x = posicion.x;
    // Si estamos muy cerca del borde derecho, mostrar el menú hacia la izquierda
    if (x + anchoMenu > innerWidth - 20) {
      x = posicion.x - anchoMenu;
    }
    
    // Si después de ajustar aún está fuera de la pantalla por la izquierda
    if (x < 10) {
      x = 10; // Mínimo margen de 10px desde la izquierda
    }
    
    // Ajustar posición vertical
    let y = posicion.y;
    if (y + altoMenu > innerHeight) {
      y = innerHeight - altoMenu - 10; // 10px de margen
    }
    
    // Si la posición Y es menor que 10px, ajustarla
    if (y < 10) {
      y = 10;
    }
    
    return { x, y };
  };
  
  // Efecto para manejar el menú contextual de eventos
  useEffect(() => {
    // Agregar clase al body cuando hay un menú contextual visible
    if (eventContextMenuVisible || contextMenuVisible) {
      document.body.classList.add('has-context-menu');
    } else {
      document.body.classList.remove('has-context-menu');
    }
    
    // Imprimir cuando el menú contextual de eventos cambia de estado
    console.log('Estado del menú contextual de eventos:', eventContextMenuVisible ? 'VISIBLE' : 'OCULTO');
    if (selectedEvent) {
      console.log('Evento seleccionado:', selectedEvent.title);
      console.log('Posición del menú:', contextMenuPosition);
    }
    
    // Verificar si hay botón de eliminar visible
    setTimeout(() => {
      if (eventContextMenuVisible) {
        const deleteButton = document.querySelector('#event-context-menu button');
        console.log('Botón de eliminar encontrado:', deleteButton ? 'SÍ' : 'NO');
        if (deleteButton) {
          console.log('Estilos del botón:', {
            display: window.getComputedStyle(deleteButton).display,
            visibility: window.getComputedStyle(deleteButton).visibility,
            opacity: window.getComputedStyle(deleteButton).opacity,
            zIndex: window.getComputedStyle(deleteButton).zIndex
          });
        }
      }
    }, 100);
  }, [eventContextMenuVisible, contextMenuVisible, selectedEvent, contextMenuPosition]);

  // Efecto para limpiar la selección visual cuando se cierra el menú
  useEffect(() => {
    if (!eventContextMenuVisible) {
      // Cuando se cierra el menú contextual, quitar la marca visual de selección
      document.querySelectorAll('.calendar-event-item.selected').forEach(el => {
        el.classList.remove('selected');
      });
    }
  }, [eventContextMenuVisible]);

  useEffect(() => {
    // Función para asegurar que todos los eventos del calendario tengan el listener de clic derecho correcto
    const agregarListenerContextMenu = () => {
      console.log("Agregando listeners a eventos del calendario...");
      
      // Seleccionar todos los eventos del calendario
      const eventosCalendario = document.querySelectorAll('.fc-event');
      console.log(`Se encontraron ${eventosCalendario.length} eventos en el calendario`);
      
      eventosCalendario.forEach(elemento => {
        // Verificar si ya tiene clase identificativa
        if (!elemento.classList.contains('calendar-event-item')) {
          elemento.classList.add('calendar-event-item');
          
          // Agregar estilos para mejorar visibilidad y clickabilidad
          elemento.style.cursor = 'pointer';
          elemento.style.position = 'relative';
          elemento.style.zIndex = '100';
          
          // Obtener el ID del evento
          const eventId = elemento.getAttribute('data-event-id');
          console.log(`Agregando listener a evento con ID: ${eventId || 'desconocido'}`);
          
          // Agregar listener de clic derecho
          elemento.addEventListener('contextmenu', (e) => {
            console.log("Clic derecho capturado en evento:", eventId);
            e.preventDefault();
            e.stopPropagation();
            
            // Buscar el evento correspondiente
            const fcEvent = events.find(ev => ev.id === eventId);
            if (fcEvent) {
              // Seleccionar visualmente el evento
              eventosCalendario.forEach(el => el.classList.remove('selected'));
              elemento.classList.add('selected');
              
              // Guardar el evento y mostrar menú contextual
              setSelectedEvent(fcEvent);
              setContextMenuVisible(false);
              
              // Calcular posición
              const position = { 
                x: e.clientX, 
                y: e.clientY 
              };
              setContextMenuPosition(position);
              
              // Mostrar menú
              setTimeout(() => {
                setEventContextMenuVisible(true);
                document.body.classList.add('has-context-menu');
              }, 10);
            }
          }, { capture: true, passive: false });
        }
      });
    };
    
    // Ejecutar al montar y cada vez que cambie la vista o events
    agregarListenerContextMenu();
    
    // También ejecutar periódicamente para capturar eventos que se rendericen dinámicamente
    const intervalo = setInterval(agregarListenerContextMenu, 2000);
    
    return () => clearInterval(intervalo);
  }, [events, vista]);

  // Efecto para agregar listeners de clic derecho directo a todos los eventos del calendario
  useEffect(() => {
    // Esta función buscará todos los eventos del calendario y les agregará listeners
    const agregarListenersEventos = () => {
      console.log('Agregando listeners de clic derecho a eventos del calendario...');
      const eventosCalendario = document.querySelectorAll('.fc-event');
      
      if (eventosCalendario.length === 0) {
        console.log('No se encontraron eventos en el calendario');
        return;
      }
      
      console.log(`Se encontraron ${eventosCalendario.length} eventos en el calendario`);
      
      // Para cada evento encontrado
      eventosCalendario.forEach(elemento => {
        // Verificar si ya tiene nuestro data attribute personalizado
        if (!elemento.hasAttribute('data-contextmenu-added')) {
          // Marcar que ya procesamos este elemento
          elemento.setAttribute('data-contextmenu-added', 'true');
          
          // Buscar el ID del evento (que debería estar en data-event-id)
          const eventId = elemento.getAttribute('data-event-id');
          
          // Agregar estilos inline para asegurar que sea clickeable
          elemento.style.cursor = 'pointer';
          elemento.style.position = 'relative';
          elemento.style.zIndex = '500';
          elemento.style.pointerEvents = 'auto';
          
          // Crear un handler específico para este evento
          const eventRightClickHandler = (e) => {
            console.log('Clic derecho capturado en evento:', eventId);
            e.preventDefault();
            e.stopPropagation();
            
            // Buscar el evento correspondiente
            const fcEvent = events.find(ev => ev.id === eventId);
            if (fcEvent) {
              // Seleccionar visualmente el evento
              document.querySelectorAll('.calendar-event-item').forEach(el => {
                el.classList.remove('selected');
              });
              elemento.classList.add('selected');
              
              // Guardar el evento seleccionado
              setSelectedEvent(fcEvent);
              setContextMenuVisible(false);
              
              // Calcular posición
              const position = { 
                x: e.clientX, 
                y: e.clientY 
              };
              
              setContextMenuPosition(position);
              
              // Mostrar menú
              setTimeout(() => {
                setEventContextMenuVisible(true);
                document.body.classList.add('has-context-menu');
              }, 10);
            }
          };
          
          // Agregar listener con captura para asegurar que sea capturado antes de cualquier otro
          elemento.addEventListener('contextmenu', eventRightClickHandler, {
            capture: true,
            passive: false
          });
          
          console.log(`Listener agregado a evento: ${elemento.textContent}`);
        }
      });
    };
    
    // Ejecutar inicialmente
    agregarListenersEventos();
    
    // Crear un observador para detectar cuando se añaden nuevos eventos
    const observer = new MutationObserver((mutations) => {
      // Si hay cambios en el DOM, intentar agregar los listeners
      agregarListenersEventos();
    });
    
    // Iniciar observación del calendario
    const calendarElement = document.querySelector('.fc');
    if (calendarElement) {
      observer.observe(calendarElement, { 
        childList: true, 
        subtree: true 
      });
      console.log('Observador del calendario iniciado');
    }
    
    // También crear un intervalo para asegurarnos de que todos los eventos tengan listeners
    const interval = setInterval(agregarListenersEventos, 2000);
    
    return () => {
      // Limpiar al desmontar
      clearInterval(interval);
      observer.disconnect();
    };
  }, [events, contextMenuVisible, eventContextMenuVisible]); // Ejecutar cuando cambian los eventos o el estado de los menús
  
  // Efecto para sincronizar los eventos al cambiar de vista
  useEffect(() => {
    // Asegurar que el calendario se actualice cuando cambia la vista
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      
      // Forzar actualización de eventos al cambiar de vista
      calendarApi.refetchEvents();
      
      console.log(`Vista cambiada a ${vista}, actualizando eventos...`);
      console.log('Eventos actuales:', events.length);
      
      // Reforzar que los eventos se muestren en todas las vistas
      setTimeout(() => {
        // Volver a renderizar eventos en caso de que no se muestren
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(events);
      }, 100);
    }
  }, [vista, events]); // Ejecutar cuando cambia la vista o los eventos
  
  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Calendario</h1>
            <p className="text-gray-600">
              Gestiona y visualiza todas las citas programadas
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                vista === "dayGridMonth"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
              onClick={() => handleViewChange("dayGridMonth")}
            >
              Mensual
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                vista === "timeGridWeek"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
              onClick={() => handleViewChange("timeGridWeek")}
            >
              Semanal
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                vista === "timeGridDay"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
              onClick={() => handleViewChange("timeGridDay")}
            >
              Diario
            </button>
          </div>
        </div>
      </div>
      
      {/* Filtros - Primero en la nueva organización */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Médico
            </label>
            <select 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-whitesmoke focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filtroMedico}
              onChange={(e) => setFiltroMedico(e.target.value)}
            >
              <option value="">Todos los médicos</option>
              {medicos.map(medico => (
                <option key={medico.id} value={medico.nombre}>{medico.nombre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cita
            </label>
            <select 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-whitesmoke focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filtroTipoCita}
              onChange={(e) => setFiltroTipoCita(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {tiposCita.flatMap(tipo => 
                tipo.subtypes.map(subtype => (
                  <option key={`${tipo.id}-${subtype.id}`} value={subtype.nombre}>
                    {subtype.nombre}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <input
                  id="pendiente"
                  name="estado"
                  type="checkbox"
                  className="text-blue-600 focus:ring-blue-500"
                  checked={filtrosEstado.pendiente}
                  onChange={() => handleEstadoChange('pendiente')}
                />
                <label htmlFor="pendiente" className="ml-2 block text-sm text-gray-700">
                  Pendiente
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="confirmada"
                  name="estado"
                  type="checkbox"
                  className="text-blue-600 focus:ring-blue-500"
                  checked={filtrosEstado.confirmada}
                  onChange={() => handleEstadoChange('confirmada')}
                />
                <label htmlFor="confirmada" className="ml-2 block text-sm text-gray-700">
                  Confirmada
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="completada"
                  name="estado"
                  type="checkbox"
                  className="text-blue-600 focus:ring-blue-500"
                  checked={filtrosEstado.completada}
                  onChange={() => handleEstadoChange('completada')}
                />
                <label htmlFor="completada" className="ml-2 block text-sm text-gray-700">
                  Completada
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="cancelada"
                  name="estado"
                  type="checkbox"
                  className="text-blue-600 focus:ring-blue-500"
                  checked={filtrosEstado.cancelada}
                  onChange={() => handleEstadoChange('cancelada')}
                />
                <label htmlFor="cancelada" className="ml-2 block text-sm text-gray-700">
                  Cancelada
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          {/* Información sobre los filtros aplicados */}
          <div className="text-sm text-gray-600">
            {eventosFiltrados.length === events.length ? (
              "Mostrando todas las citas"
            ) : (
              `Mostrando ${eventosFiltrados.length} de ${events.length} citas`
            )}
          </div>
          
          <button 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={aplicarFiltros}
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Barra de navegación - Ahora después de los filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => handleNavigate('prev')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold">{getCalendarTitle()}</h2>
            <button 
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => handleNavigate('next')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              className="ml-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              onClick={() => handleNavigate('today')}
            >
              Hoy
            </button>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <button 
              onClick={handleNuevaCita}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Cita
            </button>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar citas..."
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        {eventosFiltrados.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl font-medium mb-1">No hay citas que coincidan con los filtros</p>
            <p className="text-sm">Prueba a cambiar los criterios de filtrado</p>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={vista}
            headerToolbar={false} // Ocultamos la barra de herramientas por defecto
            locale={esLocale}
            events={eventosFiltrados} // Ahora muestra los eventos filtrados
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            aspectRatio={1.8}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            slotDuration="00:15:00"
            selectable={true}
            editable={true}
            nowIndicator={true}
            dayMaxEvents={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            customButtons={{
              contextMenu: {
                text: 'Menú Contextual'
              }
            }}
            // Evento para el clic derecho
            dayCellDidMount={(info) => {
              info.el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                setContextMenuDate(info.date);
                // Mostrar menú contextual
                handleCalendarContextMenu({
                  dateStr: info.date.toISOString(),
                  jsEvent: e
                });
              });
            }}
            // Evento para el clic derecho en celdas de tiempo
            slotLabelDidMount={(info) => {
              info.el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const date = new Date(info.date);
                setContextMenuDate(date);
                // Mostrar menú contextual
                handleCalendarContextMenu({
                  dateStr: date.toISOString(),
                  jsEvent: e
                });
              });
            }}
            // Evento para el clic derecho en celdas de tiempo
            slotDidMount={(info) => {
              info.el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const date = new Date(info.date);
                setContextMenuDate(date);
                // Mostrar menú contextual
                handleCalendarContextMenu({
                  dateStr: date.toISOString(),
                  jsEvent: e
                });
              });
            }}
            // Evento para el clic derecho en eventos
            eventDidMount={(info) => {
              // Añadir un ID único al elemento del evento para depuración
              info.el.setAttribute('data-event-id', info.event.id);
              
              // Añadir clase para identificar que es un evento de calendario
              info.el.classList.add('calendar-event-item');
              
              // Hacer que el elemento sea claramente clickeable y con mayor z-index para garantizar interacción
              info.el.style.cursor = 'pointer';
              info.el.style.position = 'relative';
              info.el.style.zIndex = '500';
              info.el.style.pointerEvents = 'auto';
              
              // Agregar un log para verificar que se está montando correctamente
              console.log('Evento montado:', info.event.title, info.el);
              
              // Función handler para el clic derecho con alta prioridad
              const handleRightClick = (e) => {
                console.log('CLIC DERECHO EN EVENTO detectado:', info.event.title);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Detener propagación inmediata
                
                // Eliminar la clase selected de todos los eventos
                document.querySelectorAll('.calendar-event-item').forEach(el => {
                  el.classList.remove('selected');
                });
                
                // Agregar la clase selected al evento actual
                info.el.classList.add('selected');
                
                // Cerrar cualquier menú contextual abierto
                setContextMenuVisible(false);
                setMenuTipoCitaVisible(false);
                setShowProcedimientoOptions(false);
                setEventContextMenuVisible(false);
                
                // Guardar el evento seleccionado para que esté disponible en el menú
                setSelectedEvent(info.event);
                
                // Mostrar el menú contextual inmediatamente sin setTimeout
                const position = { 
                  x: e.clientX, 
                  y: e.clientY 
                };
                setContextMenuPosition(position);
                
                document.body.classList.add('has-context-menu');
                setEventContextMenuVisible(true);
                console.log('Menú contextual de evento mostrado en posición:', position);
                
                // Usar setTimeout solo para verificar que el menú esté visible
                setTimeout(() => {
                  const menu = document.getElementById('event-context-menu');
                  if (menu) {
                    console.log('Menú visible:', menu.style.display);
                    const deleteButton = menu.querySelector('button');
                    if (deleteButton) {
                      console.log('Botón eliminar encontrado');
                    } else {
                      console.log('Botón eliminar NO encontrado');
                    }
                  } else {
                    console.log('Menú NO encontrado');
                  }
                }, 100);
                
                return false;
              };
              
              // Remover listeners anteriores si existen
              info.el.removeEventListener('contextmenu', handleRightClick, true);
              
              // Agregar nuevo listener con captura
              info.el.addEventListener('contextmenu', handleRightClick, {
                capture: true, 
                passive: false
              });
              
              // Handler para clic izquierdo (ahora solo selecciona el evento sin abrir modal)
              const handleLeftClick = (e) => {
                // Evitar propagación para que no se capture doblemente
                e.stopPropagation();
                
                if (!info.event.dragging && !info.event.resizing) {
                  // Llamar a la función de selección de evento
                  handleEventClick({ event: info.event, el: info.el });
                }
              };
              
              // Eliminar listener previo si existe
              info.el.removeEventListener('click', handleLeftClick);
              
              // Agregar listener para clic izquierdo
              info.el.addEventListener('click', handleLeftClick);
            }}
          />
        )}
        
        {/* Evento para capturar clic derecho en el calendario */}
        <div 
          className="absolute inset-0 z-10" 
          onContextMenu={(e) => {
            e.preventDefault();
            
            // Obtener la fecha del punto donde se hizo clic
            if (calendarRef.current) {
              // FullCalendar no tiene método dateFromPoint, usaremos una aproximación
              // Intentar obtener la celda del calendario en esa posición
              const date = new Date(); // Fecha actual como respaldo
              
              // Buscar el elemento en el DOM que corresponde a esa posición
              const element = document.elementFromPoint(e.clientX, e.clientY);
              
              // Intentar obtener una fecha de los atributos de datos
              if (element) {
                // Buscar el elemento de fecha más cercano (puede ser una celda o un slot de tiempo)
                const dateCell = element.closest('.fc-day') || 
                                element.closest('.fc-timegrid-slot') || 
                                element.closest('.fc-daygrid-day');
                
                if (dateCell) {
                  // Obtener la fecha del atributo data-date si existe
                  const dateAttr = dateCell.getAttribute('data-date');
                  
                  if (dateAttr) {
                    const timeElement = element.closest('.fc-timegrid-slot');
                    let timeString = '';
                    
                    // Si es una vista de tiempo, intentar obtener la hora
                    if (timeElement) {
                      timeString = timeElement.getAttribute('data-time') || '08:00:00';
                      // Combinar fecha y hora
                      const dateTimeStr = `${dateAttr}T${timeString}`;
                      date.setTime(new Date(dateTimeStr).getTime());
                    } else {
                      // Solo fecha sin hora específica
                      date.setTime(new Date(dateAttr).getTime());
                      // Usar la hora actual para tener una referencia
                      date.setHours(new Date().getHours());
                      date.setMinutes(new Date().getMinutes());
                    }
                  }
                }
              }
              
              console.log("Fecha seleccionada:", date);
              // Guardar la fecha y mostrar el menú contextual
              setContextMenuDate(date);
              
              // Mostrar menú contextual
              handleCalendarContextMenu({ 
                dateStr: date.toISOString(),
                jsEvent: e
              });
            }
          }}
          style={{ pointerEvents: 'auto' }}
        ></div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Próximas Citas</h3>
            <div className="overflow-x-auto">
              {eventosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <p className="text-lg font-medium">No hay citas que coincidan con los filtros aplicados</p>
                  <p className="text-sm mt-2">Prueba a modificar los criterios de filtrado o añade nuevas citas</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eventosFiltrados.map(event => (
                      <tr key={event.id}>
                        <td className="px-4 py-3 whitespace-nowrap">{event.extendedProps.paciente}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(event.start).toLocaleDateString('es-ES')}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(event.start).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{event.extendedProps.doctor}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.extendedProps.estado === 'pendiente' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : event.extendedProps.estado === 'confirmada' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {event.extendedProps.estado.charAt(0).toUpperCase() + event.extendedProps.estado.slice(1)}
                          </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-800 mr-2">Editar</button>
                        <button className="text-red-600 hover:text-red-800">Cancelar</button>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        
        {/* Eliminamos la sección de filtros que estaba aquí */}
      </div>

      {/* Modal para crear/editar cita */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {formData.tipo ? `Nueva Cita: ${formData.tipo}` : 'Nueva Cita'}
              </h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paciente <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowPacientesList(true);
                        }}
                        onClick={() => setShowPacientesList(true)}
                        placeholder="Buscar por nombre, apellido o RUT..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-whitesmoke"
                        required
                      />
                      {showPacientesList && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredPacientes.length > 0 ? (
                            filteredPacientes.map((paciente) => (
                              <div
                                key={paciente.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSelectPaciente(paciente)}
                              >
                                <div className="font-medium">{paciente.nombre} {paciente.primer_apellido} {paciente.segundo_apellido || ''}</div>
                                <div className="text-sm text-gray-500">RUT: {paciente.run}</div>
                              </div>
                            ))
                          ) : searchTerm.trim() !== "" ? (
                            <div className="px-4 py-2 text-gray-500">No se encontraron pacientes</div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Médico <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleFormChange}
                      required
                      disabled={user?.rol === 'medico'} // Deshabilitar si el usuario es médico
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-whitesmoke"
                    >
                      <option value="">Seleccione un médico</option>
                      {medicos.map(medico => (
                        <option key={medico.id} value={medico.id}>{medico.nombre}</option>
                      ))}
                    </select>
                    {user?.rol === 'medico' && (
                      <p className="mt-1 text-xs text-gray-500">Como médico, solo puedes agendar citas para ti mismo.</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Cita <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione el tipo</option>
                      {getTiposCitaPermitidos().flatMap(tipo => 
                        tipo.subtypes.map(subtype => (
                          <option key={`${tipo.id}-${subtype.id}`} value={subtype.nombre}>
                            {subtype.nombre}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="duracion"
                      value={formData.duracion}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="15">15 minutos</option>
                      <option value="30">30 minutos</option>
                      <option value="45">45 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="90">1 hora 30 minutos</option>
                      <option value="120">2 horas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={formData.hora}
                      onChange={handleFormChange}
                      required
                      min="08:00"
                      max="20:00"
                      step="900" // 15 minutos
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-whitesmoke"
                    />
                  </div>
                </div>
                
                {/* Campos específicos según el tipo de cita */}
                {formData.tipo && formData.tipo.includes('Inyección Intravítrea') && (
                  <div className="border p-4 rounded-lg bg-yellow-50">
                    <h3 className="font-medium text-gray-800 mb-3">Detalles de Inyección Intravítrea</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medicamento
                        </label>
                        <select
                          name="medicamento"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Seleccione medicamento</option>
                          <option value="ranibizumab">Ranibizumab</option>
                          <option value="aflibercept">Aflibercept</option>
                          <option value="bevacizumab">Bevacizumab</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ojo
                        </label>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input type="radio" name="ojo" value="izquierdo" className="h-4 w-4" />
                            <span className="ml-2 text-sm">Izquierdo</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="radio" name="ojo" value="derecho" className="h-4 w-4" />
                            <span className="ml-2 text-sm">Derecho</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="radio" name="ojo" value="ambos" className="h-4 w-4" />
                            <span className="ml-2 text-sm">Ambos</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.tipo && formData.tipo.includes('Láser') && (
                  <div className="border p-4 rounded-lg bg-blue-50">
                    <h3 className="font-medium text-gray-800 mb-3">Detalles de Procedimiento Láser</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Láser
                        </label>
                        <select
                          name="tipoLaser"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Seleccione tipo</option>
                          <option value="argon">Láser Argón</option>
                          <option value="yag">Láser YAG</option>
                          <option value="selectivo">Láser Selectivo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ojo
                        </label>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input type="radio" name="ojoLaser" value="izquierdo" className="h-4 w-4" />
                            <span className="ml-2 text-sm">Izquierdo</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="radio" name="ojoLaser" value="derecho" className="h-4 w-4" />
                            <span className="ml-2 text-sm">Derecho</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.tipo && formData.tipo.includes('Cirugía') && (
                  <div className="border p-4 rounded-lg bg-red-50">
                    <h3 className="font-medium text-gray-800 mb-3">Detalles de Cirugía</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Cirugía
                        </label>
                        <select
                          name="tipoCirugia"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Seleccione tipo</option>
                          <option value="catarata">Cirugía de Catarata</option>
                          <option value="vitrectomia">Vitrectomía</option>
                          <option value="retina">Desprendimiento de Retina</option>
                          <option value="glaucoma">Cirugía de Glaucoma</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Requiere Anestesista
                        </label>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input type="radio" name="anestesista" value="si" className="h-4 w-4" />
                            <span className="ml-2 text-sm">Sí</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="radio" name="anestesista" value="no" className="h-4 w-4" />
                            <span className="ml-2 text-sm">No</span>
                          </label>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pabellón
                        </label>
                        <select
                          name="pabellon"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Seleccione pabellón</option>
                          <option value="1">Pabellón 1</option>
                          <option value="2">Pabellón 2</option>
                          <option value="3">Pabellón 3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Añade notas o comentarios sobre la cita..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Menú contextual para agregar cita */}
      {contextMenuVisible && (
        <div 
          id="main-context-menu"
          className={`calendar-context-menu bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 ${
            ajustarPosicionMenu(contextMenuPosition, 220, 250).x > (window.innerWidth - 450) ? 'right-edge' : ''
          }`}
          style={{
            position: 'fixed',
            left: ajustarPosicionMenu(contextMenuPosition, 220, 250).x,
            top: ajustarPosicionMenu(contextMenuPosition, 220, 250).y,
            width: '220px',
            zIndex: 9999
          }}
        >
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-800">Agendar Cita</h3>
            <p className="text-xs text-blue-600 mt-1">
              {contextMenuDate && contextMenuDate.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          <div className="py-1">
            {getTiposCitaPermitidos().map(tipo => (
              <div
                key={tipo.id}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700"
                onClick={() => handleTipoCitaSelect(tipo)}
              >
                {tipo.nombre}
                {tipo.id === 'procedimiento' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-auto inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Submenú para tipos de procedimiento */}
      {contextMenuVisible && menuTipoCitaVisible && selectedTipoCita && (
        <div 
          className={`calendar-context-menu bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 ${
            ajustarPosicionMenu(contextMenuPosition, 220, 250).x > (window.innerWidth - 450) ? 'right-edge' : ''
          }`}
          style={{
            position: 'fixed',
            left: ajustarPosicionMenu(contextMenuPosition, 220, 250).x > (window.innerWidth - 450) 
              ? ajustarPosicionMenu(contextMenuPosition, 220, 250).x - 230 // Mostrar hacia la izquierda
              : ajustarPosicionMenu(contextMenuPosition, 220, 250).x + 220, // Mostrar hacia la derecha
            top: ajustarPosicionMenu(contextMenuPosition, 220, 250).y,
            width: '220px',
            zIndex: 10000
          }}
        >
          <div className="px-4 py-3 border-b border-gray-200 bg-yellow-50">
            <h3 className="text-sm font-semibold text-yellow-800">Tipo de {selectedTipoCita.nombre}</h3>
          </div>
          
          <div className="py-1">
            {selectedTipoCita && getSubtiposPermitidos(selectedTipoCita).map(subtype => (
              <div
                key={subtype.id}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 flex justify-between items-center"
                onClick={() => handleSubtypeSelect(subtype)}
              >
                <span>{subtype.nombre}</span>
                <span className="text-xs text-gray-500">{subtype.duracion} min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menú contextual para eventos */}
      {eventContextMenuVisible && selectedEvent && (
        <div 
          id="event-context-menu"
          className={`calendar-context-menu bg-white rounded-lg shadow-lg overflow-visible border-2 border-blue-500 ${
            ajustarPosicionMenu(contextMenuPosition, 250, 250).x > (window.innerWidth - 450) ? 'right-edge' : ''
          }`}
          style={{
            position: 'fixed',
            left: ajustarPosicionMenu(contextMenuPosition, 250, 250).x,
            top: ajustarPosicionMenu(contextMenuPosition, 250, 250).y,
            width: '280px', /* Aumentamos el ancho para dar más espacio al botón */
            zIndex: 9999999, /* Aumentamos el z-index para asegurar que esté por encima de todo */
            display: 'block !important',
            visibility: 'visible !important',
            opacity: 1,
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 truncate">{selectedEvent.title}</h3>
            <p className="text-xs text-blue-600 mt-1">
              {new Date(selectedEvent.start).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          <div className="py-1">
            {/* Botón Editar */}
            <div
              className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 flex items-center"
              onClick={() => {
                editarCita(selectedEvent);
                setEventContextMenuVisible(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar cita
            </div>
            
            {/* Botón Agregar Sobrecupo */}
            <div
              className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 flex items-center"
              onClick={() => {
                agregarSobrecupo();
                setEventContextMenuVisible(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar sobrecupo
            </div>
            
            {/* BOTÓN ELIMINAR - MUY VISIBLE Y AGRESIVO */}
            <button
              className="w-full mt-4 mb-4 bg-red-500 hover:bg-red-600 text-white py-3 px-4 text-sm font-bold rounded-md flex items-center justify-center"
              style={{
                margin: '15px auto',
                width: 'calc(100% - 30px)',
                padding: '12px',
                boxShadow: '0 4px 8px rgba(239, 68, 68, 0.5)',
                display: 'flex !important',
                visibility: 'visible !important',
                opacity: '1 !important',
                zIndex: 9999999
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón de eliminar clickeado');
                if (window.confirm(`¿Está seguro de eliminar la cita "${selectedEvent.title}"?`)) {
                  eliminarCita(selectedEvent.id);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              ELIMINAR CITA
            </button>
          </div>
        </div>
      )}
      
      {/* Panel flotante para cita seleccionada */}
      {selectedEvent && !eventContextMenuVisible && (
        <div 
          className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border-2 border-blue-500 flex gap-2 items-center"
          style={{ zIndex: 9999 }}
        >
          <span className="text-sm font-medium mr-2">
            {selectedEvent.title}
          </span>
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
            onClick={() => editarCita(selectedEvent)}
          >
            Editar
          </button>
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
            onClick={() => {
              if (window.confirm(`¿Está seguro de eliminar la cita "${selectedEvent.title}"?`)) {
                eliminarCita(selectedEvent.id);
                setSelectedEvent(null);
              }
            }}
          >
            Eliminar
          </button>
          <button 
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-400 ml-2"
            onClick={() => setSelectedEvent(null)}
          >
            ×
          </button>
        </div>
      )}
    </MainLayout>
  );
} 