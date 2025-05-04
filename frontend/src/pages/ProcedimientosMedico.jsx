import { useState, useContext, useEffect } from "react";
import { UserContext } from "../providers/UserProvider";
import { ProcedimientosContext } from "../providers/ProcedimientosProvider";
import MainLayout from "../components/MainLayout";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const ProcedimientosMedico = () => {
  const { user } = useContext(UserContext);
  const { 
    procedimientos, 
    procedimientosFiltrados, 
    aplicarFiltros,
    actualizarProcedimiento,
    eliminarProcedimiento,
    tienePermiso
  } = useContext(ProcedimientosContext);

  // Estados para filtros
  const [filtroPaciente, setFiltroPaciente] = useState("");
  const [filtroRut, setFiltroRut] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroProcedimiento, setFiltroProcedimiento] = useState("");
  const [filtroSubtipo, setFiltroSubtipo] = useState("");
  
  // Estado para vista activa
  const [vistaActiva, setVistaActiva] = useState("tabla");
  
  // Estados para análisis
  const [agrupacion, setAgrupacion] = useState("tipo");
  
  // Estados para modales
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [procedimientoSeleccionado, setProcedimientoSeleccionado] = useState(null);
  
  // Estados para la edición
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [nuevoSubtipo, setNuevoSubtipo] = useState("");
  const [nuevoOjo, setNuevoOjo] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [notaActualizacion, setNotaActualizacion] = useState("");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [observaciones, setObservaciones] = useState("");
  
  // Opciones para subtipos según el tipo de procedimiento
  const opcionesSubtipo = {
    "Inyección Intravítrea": [
      "Ranibizumab (Lucentis)",
      "Aflibercept (Eylea)",
      "Bevacizumab (Avastin)",
      "Faricimab (Vabysmo)",
      "Triamcinolona",
      "Ozurdex"
    ],
    "Láser Argón": [
      "Panfotocoagulación",
      "Focal",
      "Subumbral"
    ],
    "Láser YAG": [
      "Iridotomía",
      "Capsulotomía",
      "SLT (Trabeculoplastia Selectiva)"
    ],
    "Cirugía": [
      "Facoemulsificación + LIO",
      "Trabeculectomía",
      "Extirpación de Pterigión",
      "Vitrectomía con gas",
      "Vitrectomía con silicona",
      "Vitrectomía convencional",
      "VPP + banda"
    ]
  };
  
  // Estados para tipos de láser
  const [tipoLaser, setTipoLaser] = useState("Láser Argón");
  
  // Función para obtener opciones de subtipo según el tipo seleccionado
  const getOpcionesSubtipo = () => {
    if (nuevoTipo === "Inyección Intravítrea") {
      return opcionesSubtipo["Inyección Intravítrea"];
    } else if (nuevoTipo === "Láser") {
      return opcionesSubtipo[tipoLaser];
    } else if (nuevoTipo === "Cirugía") {
      return opcionesSubtipo["Cirugía"];
    }
    return [];
  };
  
  // Efecto para actualizar subtipo cuando cambia el tipo
  useEffect(() => {
    // Si hay opciones disponibles para el tipo seleccionado, seleccionar la primera por defecto
    const opciones = getOpcionesSubtipo();
    if (opciones.length > 0) {
      setNuevoSubtipo(opciones[0]);
    } else {
      setNuevoSubtipo("");
    }
  }, [nuevoTipo, tipoLaser]);
  
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

  // Aplicar filtro inicial para mostrar solo los procedimientos del médico actual
  useEffect(() => {
    if (user?.rol !== 'medico' && user?.rol !== 'admin') {
      alert("No tienes permiso para acceder a esta sección");
      window.location.href = "/dashboard";
      return;
    }
    
    // Si es médico, cargar solo sus procedimientos
    if (user?.rol === 'medico' && user?.id) {
      aplicarFiltros({ medicoId: user.id });
    } else if (user?.rol === 'admin' && user?.medicoId) {
      // Si es admin viendo como médico, filtrar por el ID del médico seleccionado
      aplicarFiltros({ medicoId: user.medicoId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Quitar aplicarFiltros de las dependencias
  
  // Función para obtener color de estado
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
  
  // Aplicar filtros
  const handleAplicarFiltros = () => {
    // Siempre incluir el filtro de medicoId para mostrar solo los procedimientos del médico
    aplicarFiltros({
      paciente: filtroPaciente,
      rut: filtroRut,
      estado: filtroEstado,
      tipo: filtroProcedimiento,
      subtipo: filtroSubtipo,
      fechaDesde: filtroFechaDesde,
      fechaHasta: filtroFechaHasta,
      medicoId: user?.id // Asegurarse de que siempre se filtre por el médico actual
    });
  };
  
  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltroPaciente("");
    setFiltroRut("");
    setFiltroEstado("");
    setFiltroProcedimiento("");
    setFiltroSubtipo("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    
    // Al limpiar filtros, mantenemos el filtro por médico actual
    aplicarFiltros({ medicoId: user?.id });
  };
  
  // Preparar datos para los gráficos
  const datosPorTipo = [
    { name: 'Inyección Intravítrea', value: procedimientosFiltrados.filter(p => p.tipo === "Inyección Intravítrea").length },
    { name: 'Láser', value: procedimientosFiltrados.filter(p => p.tipo === "Láser").length },
    { name: 'Cirugía', value: procedimientosFiltrados.filter(p => p.tipo === "Cirugía").length }
  ];
  
  const COLORS = ['#FCD34D', '#6EE7B7', '#93C5FD', '#F87171', '#A78BFA'];
  
  // Agrupar datos para gráficos según selección
  const getDatosAgrupados = () => {
    switch(agrupacion) {
      case "tipo":
        return datosPorTipo;
      case "estado":
        return [
          { name: 'Indicados', value: procedimientosFiltrados.filter(p => p.estado === "indicado").length },
          { name: 'Programados', value: procedimientosFiltrados.filter(p => p.estado === "programado").length },
          { name: 'Realizados', value: procedimientosFiltrados.filter(p => p.estado === "realizado").length }
        ];
      case "fecha":
        // Agrupar por mes (ejemplo simplificado)
        const procedimientosPorMes = {};
        procedimientosFiltrados.forEach(p => {
          try {
            const fecha = new Date(p.fechaProgramada);
            if (!isNaN(fecha.getTime())) {
              const mes = fecha.toLocaleString('es-CL', { month: 'long' });
              procedimientosPorMes[mes] = (procedimientosPorMes[mes] || 0) + 1;
            }
          } catch (error) {
            // Ignorar fechas inválidas
          }
        });
        return Object.entries(procedimientosPorMes).map(([mes, cantidad]) => ({
          name: mes.charAt(0).toUpperCase() + mes.slice(1),
          value: cantidad
        }));
      default:
        return datosPorTipo;
    }
  };
  
  // Función para abrir modal de detalles
  const verDetalleProcedimiento = (procedimiento) => {
    setProcedimientoSeleccionado(procedimiento);
    setModalDetalleVisible(true);
  };
  
  // Función para abrir modal de edición
  const editarProcedimiento = (procedimiento) => {
    setProcedimientoSeleccionado(procedimiento);
    setNuevoEstado(procedimiento.estado);
    setNuevoTipo(procedimiento.tipo);
    
    // Determinar el tipo de láser si es necesario
    if (procedimiento.tipo === "Láser") {
      if (procedimiento.detallesProcedimiento && procedimiento.detallesProcedimiento.tipo) {
        // Verificar si es Argón o YAG basado en el subtipo
        const laserTipo = procedimiento.detallesProcedimiento.tipo;
        if (["Panfotocoagulación", "Focal", "Subumbral"].includes(laserTipo)) {
          setTipoLaser("Láser Argón");
        } else if (["Iridotomía", "Capsulotomía", "SLT"].includes(laserTipo)) {
          setTipoLaser("Láser YAG");
        } else {
          setTipoLaser("Láser Argón"); // Por defecto
        }
        setNuevoSubtipo(laserTipo);
      } else {
        setTipoLaser("Láser Argón");
        setNuevoSubtipo(opcionesSubtipo["Láser Argón"][0]);
      }
    } else if (procedimiento.tipo === "Inyección Intravítrea") {
      // Establecer el medicamento
      if (procedimiento.detallesProcedimiento && procedimiento.detallesProcedimiento.medicamento) {
        setNuevoSubtipo(procedimiento.detallesProcedimiento.medicamento);
      } else {
        setNuevoSubtipo(opcionesSubtipo["Inyección Intravítrea"][0]);
      }
    } else if (procedimiento.tipo === "Cirugía") {
      // Establecer el tipo de cirugía
      if (procedimiento.detallesProcedimiento && procedimiento.detallesProcedimiento.tipo) {
        setNuevoSubtipo(procedimiento.detallesProcedimiento.tipo);
      } else {
        setNuevoSubtipo(opcionesSubtipo["Cirugía"][0]);
      }
    } else {
      setNuevoSubtipo("");
    }
    
    setNuevoOjo(procedimiento.ojo);
    setNuevaCategoria(procedimiento.categoria || "procedimiento");
    setFechaProgramada(procedimiento.fechaProgramada);
    setObservaciones(procedimiento.observaciones || "");
    setNotaActualizacion("");
    setModalEditarVisible(true);
  };
  
  // Función para guardar cambios de edición
  const guardarCambios = () => {
    if (!procedimientoSeleccionado) return;
    
    // Construir detalles específicos según el tipo de procedimiento
    let detallesProcedimiento = { ...procedimientoSeleccionado.detallesProcedimiento || {} };
    
    if (nuevoTipo === "Inyección Intravítrea") {
      detallesProcedimiento.medicamento = nuevoSubtipo;
    } else if (nuevoTipo === "Láser") {
      detallesProcedimiento.tipo = nuevoSubtipo;
    } else if (nuevoTipo === "Cirugía") {
      detallesProcedimiento.tipo = nuevoSubtipo;
    }
    
    // Preparar datos actualizados
    const datosActualizados = {
      estado: nuevoEstado,
      tipo: nuevoTipo,
      ojo: nuevoOjo,
      categoria: nuevaCategoria,
      fechaProgramada: fechaProgramada,
      observaciones: observaciones + 
        (notaActualizacion ? `\n[${new Date().toLocaleDateString()}] ${notaActualizacion}` : ""),
      detallesProcedimiento: detallesProcedimiento
    };
    
    // Actualizar procedimiento
    actualizarProcedimiento(procedimientoSeleccionado.id, datosActualizados);
    
    // Cerrar modal
    setModalEditarVisible(false);
    alert('Procedimiento actualizado correctamente');
  };
  
  // Función para eliminar el procedimiento
  const handleEliminarProcedimiento = () => {
    if (!procedimientoSeleccionado) return;
    
    if (window.confirm(`¿Estás seguro de eliminar el procedimiento de ${procedimientoSeleccionado.paciente}?`)) {
      // Eliminar procedimiento
      eliminarProcedimiento(procedimientoSeleccionado.id);
      
      // Cerrar modal
      setModalEditarVisible(false);
      alert('Procedimiento eliminado correctamente');
    }
  };
  
  // Obtener todas las opciones de subtipo para el filtro
  const getAllOpcionesSubtipo = () => {
    return [
      ...opcionesSubtipo["Inyección Intravítrea"],
      ...opcionesSubtipo["Láser Argón"],
      ...opcionesSubtipo["Láser YAG"],
      ...opcionesSubtipo["Cirugía"]
    ];
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis Procedimientos</h1>
        <p className="text-gray-600">
          Visualización y análisis detallado de todos tus procedimientos médicos
        </p>
      </div>
      
      {/* Panel de filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              Tipo de Procedimiento
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
              Subtipo
            </label>
            <select
              value={filtroSubtipo}
              onChange={(e) => setFiltroSubtipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los subtipos</option>
              {getAllOpcionesSubtipo().map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
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
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleLimpiarFiltros}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Limpiar filtros
          </button>
          <button
            onClick={handleAplicarFiltros}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
      
      {/* Selector de vista */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <button 
              className={`px-4 py-2 rounded-md ${vistaActiva === 'tabla' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setVistaActiva('tabla')}
            >
              Vista Tabla
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${vistaActiva === 'graficos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setVistaActiva('graficos')}
            >
              Vista Gráficos
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Mostrando {procedimientosFiltrados.length} procedimientos
          </div>
        </div>
      </div>
      
      {/* Vista de Tabla */}
      {vistaActiva === 'tabla' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Mis Procedimientos Médicos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ojo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Programada</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {procedimientosFiltrados.map(procedimiento => (
                  <tr key={procedimiento.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.paciente}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.rut}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.tipo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {procedimiento.tipo === "Inyección Intravítrea" 
                        ? procedimiento.detallesProcedimiento?.medicamento
                        : procedimiento.tipo === "Láser" || procedimiento.tipo === "Cirugía" 
                          ? procedimiento.detallesProcedimiento?.tipo
                          : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.ojo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatearFechaSegura(procedimiento.fechaProgramada)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(procedimiento.estado)}`}>
                        {procedimiento.estado.charAt(0).toUpperCase() + procedimiento.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {tienePermiso('editar', procedimiento) && (
                        <button 
                          className="text-blue-600 hover:text-blue-800 mr-2"
                          onClick={() => editarProcedimiento(procedimiento)}
                        >
                          Editar
                        </button>
                      )}
                      <button 
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => verDetalleProcedimiento(procedimiento)}
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Vista de Gráficos */}
      {vistaActiva === 'graficos' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Visualización y Análisis</h2>
            <div>
              <label className="mr-2 text-sm font-medium text-gray-700">Agrupar por:</label>
              <select
                value={agrupacion}
                onChange={(e) => setAgrupacion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="tipo">Tipo de Procedimiento</option>
                <option value="estado">Estado</option>
                <option value="fecha">Fecha (por mes)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Circular */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">
                Distribución por {agrupacion === 'tipo' ? 'Tipo' : agrupacion === 'estado' ? 'Estado' : 'Mes'}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDatosAgrupados()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getDatosAgrupados().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value} procedimientos`, 'Cantidad']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico de Barras */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">
                Comparativa por {agrupacion === 'tipo' ? 'Tipo' : agrupacion === 'estado' ? 'Estado' : 'Mes'}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getDatosAgrupados()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="value" name="Cantidad" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Estadísticas Rápidas */}
            <div className="border border-gray-200 rounded-lg p-4 lg:col-span-2">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Resumen de Mis Procedimientos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Total Procedimientos</h4>
                  <p className="text-2xl font-bold text-blue-600">{procedimientosFiltrados.length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Indicados</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {procedimientosFiltrados.filter(p => p.estado === "indicado").length}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-indigo-800 mb-1">Programados</h4>
                  <p className="text-2xl font-bold text-indigo-600">
                    {procedimientosFiltrados.filter(p => p.estado === "programado").length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-green-800 mb-1">Realizados</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {procedimientosFiltrados.filter(p => p.estado === "realizado").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {modalDetalleVisible && procedimientoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-gray-800">
                Detalles del Procedimiento
              </h2>
              <button
                onClick={() => setModalDetalleVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paciente</p>
                  <p className="font-medium">{procedimientoSeleccionado.paciente}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">RUT</p>
                  <p>{procedimientoSeleccionado.rut}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Edad</p>
                  <p>{procedimientoSeleccionado.edad} años</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p>{procedimientoSeleccionado.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ojo</p>
                  <p>{procedimientoSeleccionado.ojo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(procedimientoSeleccionado.estado)}`}>
                      {procedimientoSeleccionado.estado.charAt(0).toUpperCase() + procedimientoSeleccionado.estado.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha Indicación</p>
                  <p>{formatearFechaSegura(procedimientoSeleccionado.fechaIndicacion)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha Programada</p>
                  <p>{formatearFechaSegura(procedimientoSeleccionado.fechaProgramada)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Contacto</p>
                <div className="pl-4 mt-1 space-y-1">
                  <p><span className="text-gray-600">Teléfono:</span> {procedimientoSeleccionado.contacto?.telefono}</p>
                  <p><span className="text-gray-600">Email:</span> {procedimientoSeleccionado.contacto?.email}</p>
                  <p><span className="text-gray-600">Dirección:</span> {procedimientoSeleccionado.contacto?.direccion}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Detalles del Procedimiento</p>
                <div className="pl-4 mt-1 space-y-1">
                  <p><span className="text-gray-600">Diagnóstico:</span> {procedimientoSeleccionado.detallesProcedimiento?.diagnostico}</p>
                  
                  {procedimientoSeleccionado.tipo === "Inyección Intravítrea" && (
                    <p>
                      <span className="text-gray-600">Medicamento:</span> 
                      <span className="font-medium ml-1 text-blue-700">{procedimientoSeleccionado.detallesProcedimiento?.medicamento}</span>
                    </p>
                  )}
                  
                  {procedimientoSeleccionado.tipo === "Láser" && (
                    <>
                      <p>
                        <span className="text-gray-600">Tipo de láser:</span> 
                        <span className="font-medium ml-1 text-green-700">
                          {["Panfotocoagulación", "Focal", "Subumbral"].includes(procedimientoSeleccionado.detallesProcedimiento?.tipo) 
                            ? "Láser Argón" 
                            : ["Iridotomía", "Capsulotomía", "SLT"].includes(procedimientoSeleccionado.detallesProcedimiento?.tipo)
                              ? "Láser YAG"
                              : ""}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Procedimiento:</span> 
                        <span className="font-medium ml-1 text-green-700">{procedimientoSeleccionado.detallesProcedimiento?.tipo}</span>
                      </p>
                      {procedimientoSeleccionado.detallesProcedimiento?.parametros && (
                        <p><span className="text-gray-600">Parámetros:</span> {procedimientoSeleccionado.detallesProcedimiento?.parametros}</p>
                      )}
                    </>
                  )}
                  
                  {procedimientoSeleccionado.tipo === "Cirugía" && (
                    <>
                      <p>
                        <span className="text-gray-600">Procedimiento quirúrgico:</span> 
                        <span className="font-medium ml-1 text-purple-700">{procedimientoSeleccionado.detallesProcedimiento?.tipo}</span>
                      </p>
                      {procedimientoSeleccionado.detallesProcedimiento?.lente && (
                        <p><span className="text-gray-600">Lente:</span> {procedimientoSeleccionado.detallesProcedimiento?.lente}</p>
                      )}
                      {procedimientoSeleccionado.detallesProcedimiento?.anestesia && (
                        <p><span className="text-gray-600">Anestesia:</span> {procedimientoSeleccionado.detallesProcedimiento?.anestesia}</p>
                      )}
                    </>
                  )}
                  
                  <p><span className="text-gray-600">Indicaciones:</span> {procedimientoSeleccionado.detallesProcedimiento?.indicaciones}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Observaciones</p>
                <p className="whitespace-pre-line">{procedimientoSeleccionado.observaciones}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              {tienePermiso('editar', procedimientoSeleccionado) && (
                <button
                  onClick={() => {
                    setModalDetalleVisible(false);
                    editarProcedimiento(procedimientoSeleccionado);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                >
                  Editar
                </button>
              )}
              <button
                onClick={() => setModalDetalleVisible(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de edición */}
      {modalEditarVisible && procedimientoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-gray-800">
                Editar Procedimiento
              </h2>
              <button
                onClick={() => setModalEditarVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              {/* Información del paciente */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Datos del Paciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paciente
                    </label>
                    <p className="p-2 border border-gray-300 rounded-md bg-gray-50">{procedimientoSeleccionado.paciente}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RUT
                    </label>
                    <p className="p-2 border border-gray-300 rounded-md bg-gray-50">{procedimientoSeleccionado.rut}</p>
                  </div>
                </div>
              </div>
              
              {/* Información del procedimiento */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-700 mb-2">Información del Procedimiento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
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
                      Fecha Programada
                    </label>
                    <input
                      type="date"
                      value={fechaProgramada ? fechaProgramada.slice(0, 10) : ""}
                      onChange={(e) => setFechaProgramada(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={nuevoTipo}
                      onChange={(e) => setNuevoTipo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Inyección Intravítrea">Inyección Intravítrea</option>
                      <option value="Láser">Láser</option>
                      <option value="Cirugía">Cirugía</option>
                    </select>
                  </div>
                  
                  {/* Campo condicional según el tipo de procedimiento */}
                  {nuevoTipo === "Láser" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Láser
                      </label>
                      <select
                        value={tipoLaser}
                        onChange={(e) => setTipoLaser(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Láser Argón">Láser Argón</option>
                        <option value="Láser YAG">Láser YAG</option>
                      </select>
                    </div>
                  )}
                  
                  {/* Subtipo según el tipo de procedimiento seleccionado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {nuevoTipo === "Inyección Intravítrea" ? "Medicamento" : 
                        nuevoTipo === "Láser" ? "Procedimiento Láser" : 
                        nuevoTipo === "Cirugía" ? "Tipo de Cirugía" : "Subtipo"}
                    </label>
                    <select
                      value={nuevoSubtipo}
                      onChange={(e) => setNuevoSubtipo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getOpcionesSubtipo().map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ojo
                    </label>
                    <select
                      value={nuevoOjo}
                      onChange={(e) => setNuevoOjo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Ojo Derecho">Ojo Derecho</option>
                      <option value="Ojo Izquierdo">Ojo Izquierdo</option>
                      <option value="Ambos Ojos">Ambos Ojos</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="procedimiento">Procedimiento</option>
                      <option value="consulta">Consulta</option>
                      <option value="examen">Examen</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Notas y observaciones */}
              <div className="mb-6 p-3 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-700 mb-2">Notas y Observaciones</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones Previas
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agregar Nota (opcional)
                  </label>
                  <textarea
                    value={notaActualizacion}
                    onChange={(e) => setNotaActualizacion(e.target.value)}
                    placeholder="Agregar una nueva nota o actualización sobre este procedimiento..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalEditarVisible(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
              >
                Cancelar
              </button>
              {tienePermiso('eliminar', procedimientoSeleccionado) && (
                <button
                  onClick={handleEliminarProcedimiento}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mr-2"
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={guardarCambios}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ProcedimientosMedico; 