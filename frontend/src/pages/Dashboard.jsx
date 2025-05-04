import { useContext, useState, useEffect } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";

// Componente Tooltip personalizado
const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    // Calcula la posición basada en el evento del mouse
    const x = e.clientX;
    const y = e.clientY - 10; // Ligero desplazamiento hacia arriba
    setPosition({ x, y });
    setShow(true);
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="fixed z-[1000] w-64 p-3 text-sm bg-gray-800 text-white rounded-md shadow-xl border border-gray-700" 
             style={{
               top: `${position.y}px`,
               left: `${position.x}px`,
               transform: 'translate(-50%, -100%)',
             }}>
          <div className="whitespace-normal">{content}</div>
          {/* Flecha hacia abajo */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gray-800 rotate-45 border-r border-b border-gray-700"></div>
        </div>
      )}
    </div>
  );
};

// Función para formatear fechas de manera segura
const formatearFechaSegura = (fechaStr) => {
  if (!fechaStr) return "Fecha no disponible";
  
  // Intenta convertir la cadena a fecha
  const fecha = new Date(fechaStr);
  
  // Comprueba si la fecha es válida
  if (isNaN(fecha.getTime())) {
    return "Fecha inválida";
  }
  
  // Formatea la fecha en formato español
  return fecha.toLocaleDateString('es-CL');
};

// Componentes específicos según rol
const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Pacientes</h3>
          <p className="text-3xl font-bold">1,248</p>
          <p className="text-blue-100 mt-2">+18 en los últimos 30 días</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold">24</p>
          <p className="text-green-100 mt-2">3 completadas, 21 pendientes</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Médicos Activos</h3>
          <p className="text-3xl font-bold">8</p>
          <p className="text-purple-100 mt-2">2 ausentes hoy</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Próximas Citas</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">Juan Pérez</td>
                  <td className="px-4 py-3 whitespace-nowrap">Dra. González</td>
                  <td className="px-4 py-3 whitespace-nowrap">Hoy, 10:30</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">María López</td>
                  <td className="px-4 py-3 whitespace-nowrap">Dr. Sánchez</td>
                  <td className="px-4 py-3 whitespace-nowrap">Hoy, 11:15</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">Carlos Ruiz</td>
                  <td className="px-4 py-3 whitespace-nowrap">Dra. Martínez</td>
                  <td className="px-4 py-3 whitespace-nowrap">Hoy, 12:00</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <a href="/calendario" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todas las citas →
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen Mensual</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Gráfico de estadísticas mensuales</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-sm">Total Citas</p>
              <p className="text-lg font-semibold">425</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cancelaciones</p>
              <p className="text-lg font-semibold">32</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pacientes Nuevos</p>
              <p className="text-lg font-semibold">48</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicoDashboard = () => {
  // Datos simulados para procedimientos quirúrgicos
  const procedimientosQuirurgicos = [
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
  
  // Estados para modales y procedimiento seleccionado
  const [procedimientosData, setProcedimientosData] = useState(procedimientosQuirurgicos);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [modalActualizarVisible, setModalActualizarVisible] = useState(false);
  const [procedimientoSeleccionado, setProcedimientoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [notaActualizacion, setNotaActualizacion] = useState("");
  
  // Estados para filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroPaciente, setFiltroPaciente] = useState("");
  const [filtroRut, setFiltroRut] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroProcedimiento, setFiltroProcedimiento] = useState("");
  const [procedimientosFiltrados, setProcedimientosFiltrados] = useState(procedimientosQuirurgicos);
  
  // Redirigir a página de todos los procedimientos
  const verTodosProcedimientos = () => {
    // En una aplicación real, esto usaría React Router
    alert("Esta funcionalidad te llevaría a la página completa de procedimientos");
    // Ejemplo de redirección:
    // navigate('/procedimientos');
  };
  
  // Función para abrir modal de detalles
  const verDetalleProcedimiento = (procedimiento) => {
    setProcedimientoSeleccionado(procedimiento);
    setModalDetalleVisible(true);
  };
  
  // Función para abrir modal de actualización
  const actualizarProcedimiento = (procedimiento) => {
    setProcedimientoSeleccionado(procedimiento);
    setNuevoEstado(procedimiento.estado);
    setNotaActualizacion("");
    setModalActualizarVisible(true);
  };
  
  // Función para guardar actualización de estado
  const guardarActualizacion = () => {
    if (!procedimientoSeleccionado || !nuevoEstado) return;
    
    const procedimientosActualizados = procedimientosData.map(p => 
      p.id === procedimientoSeleccionado.id 
        ? {
            ...p,
            estado: nuevoEstado,
            observaciones: p.observaciones + (notaActualizacion ? `\n[${new Date().toLocaleDateString()}] ${notaActualizacion}` : "")
          }
        : p
    );
    
    setProcedimientosData(procedimientosActualizados);
    aplicarFiltros(procedimientosActualizados); // Actualiza también los filtrados
    setModalActualizarVisible(false);
    
    // Mensaje de confirmación
    alert(`El estado del procedimiento de ${procedimientoSeleccionado.paciente} ha sido actualizado a: ${nuevoEstado}`);
  };
  
  // Función para aplicar filtros
  const aplicarFiltros = (datos = procedimientosData) => {
    let resultado = [...datos];
    
    if (filtroPaciente) {
      resultado = resultado.filter(p => 
        p.paciente.toLowerCase().includes(filtroPaciente.toLowerCase())
      );
    }
    
    if (filtroRut) {
      resultado = resultado.filter(p => 
        p.rut.toLowerCase().includes(filtroRut.toLowerCase())
      );
    }
    
    if (filtroEstado) {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }
    
    if (filtroProcedimiento) {
      resultado = resultado.filter(p => p.tipo === filtroProcedimiento);
    }
    
    if (filtroFechaDesde) {
      resultado = resultado.filter(p => {
        try {
          const fecha = new Date(p.fechaProgramada);
          return !isNaN(fecha.getTime()) && fecha >= new Date(filtroFechaDesde);
        } catch {
          return false;
        }
      });
    }
    
    if (filtroFechaHasta) {
      resultado = resultado.filter(p => {
        try {
          const fecha = new Date(p.fechaProgramada);
          return !isNaN(fecha.getTime()) && fecha <= new Date(filtroFechaHasta);
        } catch {
          return false;
        }
      });
    }
    
    setProcedimientosFiltrados(resultado);
  };
  
  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroPaciente("");
    setFiltroRut("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setFiltroEstado("");
    setFiltroProcedimiento("");
    setProcedimientosFiltrados(procedimientosData);
  };
  
  // Obtener estadísticas de procedimientos por estado
  const estadisticasProcedimientos = {
    indicados: procedimientosData.filter(p => p.estado === "indicado").length,
    programados: procedimientosData.filter(p => p.estado === "programado").length,
    realizados: procedimientosData.filter(p => p.estado === "realizado").length,
    total: procedimientosData.length
  };
  
  // Obtener estadísticas por tipo de procedimiento
  const contarPorTipo = (tipo) => procedimientosData.filter(p => p.tipo === tipo).length;
  
  const getBadgeColor = (estado) => {
    switch(estado) {
      case "indicado":
        return "bg-yellow-100 text-yellow-800";
      case "programado":
        return "bg-blue-100 text-blue-800";
      case "realizado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold">12</p>
          <p className="text-blue-100 mt-2">2 completadas, 10 pendientes</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Pacientes Asignados</h3>
          <p className="text-3xl font-bold">156</p>
          <p className="text-green-100 mt-2">3 nuevos esta semana</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Horas Trabajadas</h3>
          <p className="text-3xl font-bold">32h</p>
          <p className="text-purple-100 mt-2">Esta semana</p>
        </div>
      </div>
      
      {/* Estadísticas de Procedimientos Quirúrgicos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen de Procedimientos Quirúrgicos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Indicados</h4>
            <p className="text-2xl font-bold text-blue-600">{estadisticasProcedimientos.indicados}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-indigo-800 mb-1">Programados</h4>
            <p className="text-2xl font-bold text-indigo-600">{estadisticasProcedimientos.programados}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-green-800 mb-1">Realizados</h4>
            <p className="text-2xl font-bold text-green-600">{estadisticasProcedimientos.realizados}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-gray-800 mb-1">Total</h4>
            <p className="text-2xl font-bold text-gray-600">{estadisticasProcedimientos.total}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-amber-200 p-3 rounded-lg bg-amber-50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-amber-800">Inyecciones Intravítreas</h4>
              <span className="text-lg font-bold text-amber-600">{contarPorTipo("Inyección Intravítrea")}</span>
            </div>
          </div>
          <div className="border border-blue-200 p-3 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-blue-800">Procedimientos Láser</h4>
              <span className="text-lg font-bold text-blue-600">{contarPorTipo("Láser")}</span>
            </div>
          </div>
          <div className="border border-purple-200 p-3 rounded-lg bg-purple-50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-purple-800">Cirugías</h4>
              <span className="text-lg font-bold text-purple-600">{contarPorTipo("Cirugía")}</span>
            </div>
          </div>
        </div>
        
        {/* Sección de Filtros */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-700">Filtros de búsqueda</h4>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform ${mostrarFiltros ? "transform rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {mostrarFiltros && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Paciente
                  </label>
                  <input
                    type="text"
                    value={filtroPaciente}
                    onChange={(e) => setFiltroPaciente(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    value={filtroRut}
                    onChange={(e) => setFiltroRut(e.target.value)}
                    placeholder="Buscar por RUT..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="indicado">Indicado</option>
                    <option value="programado">Programado</option>
                    <option value="realizado">Realizado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={filtroProcedimiento}
                    onChange={(e) => setFiltroProcedimiento(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Inyección Intravítrea">Inyección Intravítrea</option>
                    <option value="Láser">Láser</option>
                    <option value="Cirugía">Cirugía</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={filtroFechaDesde}
                    onChange={(e) => setFiltroFechaDesde(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={filtroFechaHasta}
                    onChange={(e) => setFiltroFechaHasta(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => aplicarFiltros()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          )}
          
          {/* Contador de resultados filtrados */}
          {(filtroPaciente || filtroRut || filtroEstado || filtroProcedimiento || filtroFechaDesde || filtroFechaHasta) && (
            <div className="text-sm text-gray-600 mb-3">
              Mostrando {procedimientosFiltrados.length} de {procedimientosData.length} procedimientos
              {filtroPaciente && ` • Paciente: ${filtroPaciente}`}
              {filtroRut && ` • RUT: ${filtroRut}`}
              {filtroEstado && ` • Estado: ${filtroEstado}`}
              {filtroProcedimiento && ` • Tipo: ${filtroProcedimiento}`}
              {filtroFechaDesde && ` • Desde: ${filtroFechaDesde}`}
              {filtroFechaHasta && ` • Hasta: ${filtroFechaHasta}`}
            </div>
          )}
        </div>
        
        {/* Tabla de procedimientos */}
        <h4 className="font-medium text-gray-700 mb-3">Listado de Procedimientos Quirúrgicos</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ojo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Indicación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Programada</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {procedimientosFiltrados.map(procedimiento => (
                <tr key={procedimiento.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Tooltip content={
                      <div>
                        <p className="font-semibold mb-1">Datos de contacto:</p>
                        <p><span className="font-medium">Edad:</span> {procedimiento.edad} años</p>
                        <p><span className="font-medium">Teléfono:</span> {procedimiento.contacto.telefono}</p>
                        <p><span className="font-medium">Email:</span> {procedimiento.contacto.email}</p>
                        <p><span className="font-medium">Dirección:</span> {procedimiento.contacto.direccion}</p>
                      </div>
                    }>
                      <span className="border-b border-dotted border-gray-500">{procedimiento.paciente}</span>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{procedimiento.rut}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Tooltip content={
                      <div>
                        <p className="font-semibold mb-1">Detalles del procedimiento:</p>
                        <p><span className="font-medium">Diagnóstico:</span> {procedimiento.detallesProcedimiento.diagnostico}</p>
                        {procedimiento.tipo === "Cirugía" && (
                          <>
                            <p><span className="font-medium">Técnica:</span> {procedimiento.detallesProcedimiento.tipo}</p>
                            {procedimiento.detallesProcedimiento.lente && (
                              <p><span className="font-medium">Lente:</span> {procedimiento.detallesProcedimiento.lente}</p>
                            )}
                            {procedimiento.detallesProcedimiento.anestesia && (
                              <p><span className="font-medium">Anestesia:</span> {procedimiento.detallesProcedimiento.anestesia}</p>
                            )}
                            {procedimiento.detallesProcedimiento.complejidad && (
                              <p><span className="font-medium">Complejidad:</span> {procedimiento.detallesProcedimiento.complejidad}</p>
                            )}
                          </>
                        )}
                        {procedimiento.tipo === "Láser" && (
                          <>
                            <p><span className="font-medium">Tipo de láser:</span> {procedimiento.detallesProcedimiento.tipo}</p>
                            {procedimiento.detallesProcedimiento.parametros && (
                              <p><span className="font-medium">Parámetros:</span> {procedimiento.detallesProcedimiento.parametros}</p>
                            )}
                          </>
                        )}
                        {procedimiento.tipo === "Inyección Intravítrea" && (
                          <p><span className="font-medium">Medicamento:</span> {procedimiento.detallesProcedimiento.medicamento}</p>
                        )}
                        <p><span className="font-medium">Indicaciones:</span> {procedimiento.detallesProcedimiento.indicaciones}</p>
                      </div>
                    }>
                      <span className="border-b border-dotted border-gray-500">{procedimiento.tipo}</span>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{procedimiento.ojo}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearFechaSegura(procedimiento.fechaIndicacion)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearFechaSegura(procedimiento.fechaProgramada)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(procedimiento.estado)}`}>
                      {procedimiento.estado.charAt(0).toUpperCase() + procedimiento.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button 
                      onClick={() => verDetalleProcedimiento(procedimiento)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => actualizarProcedimiento(procedimiento)}
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button 
            onClick={verTodosProcedimientos}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver todos los procedimientos →
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Próximos Pacientes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">Juan Pérez</td>
                  <td className="px-4 py-3 whitespace-nowrap">10:30</td>
                  <td className="px-4 py-3 whitespace-nowrap">Control</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">María López</td>
                  <td className="px-4 py-3 whitespace-nowrap">11:15</td>
                  <td className="px-4 py-3 whitespace-nowrap">Primera Visita</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">Carlos Ruiz</td>
                  <td className="px-4 py-3 whitespace-nowrap">12:00</td>
                  <td className="px-4 py-3 whitespace-nowrap">Urgencia</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <a href="/calendario" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todas las citas →
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Historial Reciente</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">Juan Pérez - Control Diabetes</p>
              <p className="text-sm text-gray-500">Ayer, 14:30</p>
              <p className="text-sm mt-1">Se ajustó medicación. Programar control en 2 semanas.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">Ana Torres - Primera Consulta</p>
              <p className="text-sm text-gray-500">Hace 2 días, 10:00</p>
              <p className="text-sm mt-1">Nuevos análisis solicitados. Seguimiento telefónico.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">Roberto Núñez - Dolor Lumbar</p>
              <p className="text-sm text-gray-500">Hace 3 días, 16:45</p>
              <p className="text-sm mt-1">Derivado a fisioterapia. Receta para analgésicos.</p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <a href="/consultas" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver historial completo →
            </a>
          </div>
        </div>
      </div>
      
      {/* Modal para ver detalles del procedimiento */}
      {modalDetalleVisible && procedimientoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Detalle del Procedimiento
                </h2>
                <button
                  onClick={() => setModalDetalleVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Paciente:</span>
                  <span className="text-gray-900">{procedimientoSeleccionado.paciente}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">RUT:</span>
                  <span className="text-gray-900">{procedimientoSeleccionado.rut}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Edad:</span>
                  <span className="text-gray-900">{procedimientoSeleccionado.edad} años</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className="text-gray-900">{procedimientoSeleccionado.tipo}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Ojo:</span>
                  <span className="text-gray-900">{procedimientoSeleccionado.ojo}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Fecha de Indicación:</span>
                  <span className="text-gray-900">{formatearFechaSegura(procedimientoSeleccionado.fechaIndicacion)}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Fecha Programada:</span>
                  <span className="text-gray-900">{formatearFechaSegura(procedimientoSeleccionado.fechaProgramada)}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Estado:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(procedimientoSeleccionado.estado)}`}>
                    {procedimientoSeleccionado.estado.charAt(0).toUpperCase() + procedimientoSeleccionado.estado.slice(1)}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700 mb-2">Observaciones:</p>
                  <p className="text-gray-900 whitespace-pre-line">{procedimientoSeleccionado.observaciones}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setModalDetalleVisible(false);
                    actualizarProcedimiento(procedimientoSeleccionado);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                >
                  Actualizar Estado
                </button>
                <button
                  onClick={() => setModalDetalleVisible(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para actualizar estado del procedimiento */}
      {modalActualizarVisible && procedimientoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Actualizar Estado de Procedimiento
                </h2>
                <button
                  onClick={() => setModalActualizarVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Procedimiento para: {procedimientoSeleccionado.paciente}</h3>
                  <p className="text-sm text-gray-600">{procedimientoSeleccionado.tipo} - Ojo {procedimientoSeleccionado.ojo}</p>
                  <p className="text-sm text-gray-600">Indicado: {formatearFechaSegura(procedimientoSeleccionado.fechaIndicacion)}</p>
                  <p className="text-sm text-gray-600">Programado: {formatearFechaSegura(procedimientoSeleccionado.fechaProgramada)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado del Procedimiento
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="indicado">Indicado</option>
                    <option value="programado">Programado</option>
                    <option value="realizado">Realizado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nota de Actualización
                  </label>
                  <textarea
                    value={notaActualizacion}
                    onChange={(e) => setNotaActualizacion(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingrese notas o comentarios sobre esta actualización..."
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setModalActualizarVisible(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarActualizacion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecepcionistaDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold">24</p>
          <p className="text-blue-100 mt-2">3 completadas, 21 pendientes</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Llegadas Confirmadas</h3>
          <p className="text-3xl font-bold">16</p>
          <p className="text-green-100 mt-2">8 pendientes de confirmar</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Médicos Disponibles</h3>
          <p className="text-3xl font-bold">6</p>
          <p className="text-purple-100 mt-2">De 8 programados</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Agenda del Día</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">Juan Pérez</td>
                <td className="px-4 py-3 whitespace-nowrap">Dra. González</td>
                <td className="px-4 py-3 whitespace-nowrap">10:30</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Confirmar</button>
                  <button className="text-red-600 hover:text-red-800">Cancelar</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">María López</td>
                <td className="px-4 py-3 whitespace-nowrap">Dr. Sánchez</td>
                <td className="px-4 py-3 whitespace-nowrap">11:15</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Check-in</button>
                  <button className="text-red-600 hover:text-red-800">Cancelar</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">Carlos Ruiz</td>
                <td className="px-4 py-3 whitespace-nowrap">Dra. Martínez</td>
                <td className="px-4 py-3 whitespace-nowrap">12:00</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">En Espera</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Pasar</button>
                  <button className="text-red-600 hover:text-red-800">Cancelar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Próximas 48 horas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <p className="font-medium">Mañana</p>
                <p className="text-sm text-gray-500">28 citas programadas</p>
              </div>
              <a href="/calendario" className="text-blue-600 hover:text-blue-800">
                Ver detalles
              </a>
            </div>
            
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <p className="font-medium">Pasado mañana</p>
                <p className="text-sm text-gray-500">22 citas programadas</p>
              </div>
              <a href="/calendario" className="text-blue-600 hover:text-blue-800">
                Ver detalles
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Cita
            </button>
            
            <button className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Nuevo Paciente
            </button>
            
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamadas
            </button>
            
            <button className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Dashboard principal
export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Renderizado condicional según el rol del usuario
  const renderDashboardByRole = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    switch (user?.rol) {
      case 'admin':
        return <AdminDashboard />;
      case 'medico':
        return <MedicoDashboard />;
      case 'recepcionista':
        return <RecepcionistaDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700">Bienvenido a Agenda Médica</h2>
            <p className="mt-2 text-gray-500">No se ha definido un rol para tu usuario.</p>
          </div>
        );
    }
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, {user?.nombre || "Usuario"}. Aquí tienes un resumen de tu actividad.
        </p>
      </div>
      
      {renderDashboardByRole()}
    </MainLayout>
  );
} 