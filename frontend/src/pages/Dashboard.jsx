import { useContext, useState, useEffect } from "react";
import { UserContext } from "../providers/UserProvider";
import { ProcedimientosContext } from "../providers/ProcedimientosProvider";
import MainLayout from "../components/MainLayout";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

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
  // Obtener datos del contexto de procedimientos
  const { 
    procedimientos,
    procedimientosFiltrados,
    aplicarFiltros,
    tienePermiso
  } = useContext(ProcedimientosContext);
  
  const { user } = useContext(UserContext);
  
  // Estados para filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroPaciente, setFiltroPaciente] = useState("");
  const [filtroRut, setFiltroRut] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroProcedimiento, setFiltroProcedimiento] = useState("");
  const [filtroMedico, setFiltroMedico] = useState("");
  
  // Aplicar filtros cuando cambia el usuario
  useEffect(() => {
    // Como admin, mostrar todos los procedimientos
    aplicarFiltros({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Eliminar aplicarFiltros de las dependencias
  
  // Obtener estadísticas generales
  const totalPacientes = 1248; // Este dato sería obtenido de un backend real
  const citasHoy = 24; // Este dato sería obtenido de un backend real
  const medicosActivos = 8; // Este dato sería obtenido de un backend real
  
  // Estadísticas de procedimientos por estado
  const estadisticasProcedimientos = {
    indicados: procedimientos.filter(p => p.estado === "indicado").length,
    programados: procedimientos.filter(p => p.estado === "programado").length,
    realizados: procedimientos.filter(p => p.estado === "realizado").length,
    total: procedimientos.length
  };
  
  // Estadísticas por tipo de procedimiento
  const contarPorTipo = (tipo) => procedimientos.filter(p => p.tipo === tipo).length;
  
  // Estadísticas por médico
  const medicosUnicos = [...new Set(procedimientos.map(p => p.medicoId))];
  const procedimientosPorMedico = medicosUnicos.map(medicoId => {
    const procedimientosMedico = procedimientos.filter(p => p.medicoId === medicoId);
    const nombreMedico = procedimientosMedico[0]?.medicoAsignado || `Médico ID ${medicoId}`;
    
    return {
      id: medicoId,
      nombre: nombreMedico,
      total: procedimientosMedico.length,
      indicados: procedimientosMedico.filter(p => p.estado === "indicado").length,
      programados: procedimientosMedico.filter(p => p.estado === "programado").length,
      realizados: procedimientosMedico.filter(p => p.estado === "realizado").length
    };
  });
  
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
  
  // Redirigir a página de todos los procedimientos
  const verTodosProcedimientos = () => {
    // Redirección usando window.location
    window.location.href = "/mis-procedimientos";
  };
  
  // Datos para gráficos
  const dataPorTipo = [
    { name: 'Inyección Intravítrea', value: contarPorTipo("Inyección Intravítrea") },
    { name: 'Láser', value: contarPorTipo("Láser") },
    { name: 'Cirugía', value: contarPorTipo("Cirugía") }
  ];
  
  const COLORS = ['#FCD34D', '#6EE7B7', '#93C5FD', '#F87171', '#A78BFA'];
  
  // Preparar los datos para el gráfico de barras
  const dataPorMedico = procedimientosPorMedico.map(medico => ({
    name: medico.nombre.split(' ')[1] || medico.nombre, // Solo apellido para etiquetas más cortas
    Indicados: medico.indicados,
    Programados: medico.programados,
    Realizados: medico.realizados,
    Total: medico.total
  }));
  
  // Datos para el gráfico de línea de tendencia mensual (simulado)
  const mesActual = new Date().getMonth();
  const mesesAnteriores = 5; // Mostrar 6 meses en total
  
  const obtenerNombreMes = (numeroMes) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return meses[((numeroMes % 12) + 12) % 12]; // Para manejar números negativos correctamente
  };
  
  const dataTendencia = Array.from({ length: mesesAnteriores + 1 }, (_, i) => {
    const mes = mesActual - mesesAnteriores + i;
    const factor = 1 + i * 0.2; // Simulando un aumento gradual
    return {
      name: obtenerNombreMes(mes),
      Consultas: Math.round(45 * factor),
      Procedimientos: Math.round(30 * factor),
      Pacientes: Math.round(55 * factor),
    };
  });
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Pacientes</h3>
          <p className="text-3xl font-bold">{totalPacientes}</p>
          <p className="text-blue-100 mt-2">+18 en los últimos 30 días</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold">{citasHoy}</p>
          <p className="text-green-100 mt-2">3 completadas, 21 pendientes</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Médicos Activos</h3>
          <p className="text-3xl font-bold">{medicosActivos}</p>
          <p className="text-purple-100 mt-2">2 ausentes hoy</p>
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
        
        {/* Gráficos de Procedimientos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3 text-center">Procedimientos por Tipo</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPorTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} procedimientos`, 'Cantidad']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3 text-center">Procedimientos por Médico</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataPorMedico}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Programados" stackId="a" fill="#93C5FD" />
                  <Bar dataKey="Realizados" stackId="a" fill="#6EE7B7" />
                  <Bar dataKey="Indicados" stackId="a" fill="#FCD34D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Sección de filtros */}
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
                    Médico
                  </label>
                  <select
                    value={filtroMedico}
                    onChange={(e) => setFiltroMedico(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los médicos</option>
                    {procedimientosPorMedico.map(medico => (
                      <option key={medico.id} value={medico.id.toString()}>{medico.nombre}</option>
                    ))}
                  </select>
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
                  onClick={() => {
                    setFiltroPaciente("");
                    setFiltroRut("");
                    setFiltroEstado("");
                    setFiltroProcedimiento("");
                    setFiltroFechaDesde("");
                    setFiltroFechaHasta("");
                    setFiltroMedico("");
                    aplicarFiltros({});
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => aplicarFiltros({
                    paciente: filtroPaciente,
                    rut: filtroRut,
                    estado: filtroEstado,
                    tipo: filtroProcedimiento,
                    fechaDesde: filtroFechaDesde,
                    fechaHasta: filtroFechaHasta,
                    medicoId: filtroMedico ? parseInt(filtroMedico) : undefined
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          )}
          
          {/* Contador de resultados filtrados */}
          {(filtroPaciente || filtroRut || filtroEstado || filtroProcedimiento || filtroFechaDesde || filtroFechaHasta || filtroMedico) && (
            <div className="text-sm text-gray-600 mb-3">
              Mostrando {procedimientosFiltrados.length} de {procedimientos.length} procedimientos
              {filtroPaciente && ` • Paciente: ${filtroPaciente}`}
              {filtroRut && ` • RUT: ${filtroRut}`}
              {filtroEstado && ` • Estado: ${filtroEstado}`}
              {filtroProcedimiento && ` • Tipo: ${filtroProcedimiento}`}
              {filtroFechaDesde && ` • Desde: ${filtroFechaDesde}`}
              {filtroFechaHasta && ` • Hasta: ${filtroFechaHasta}`}
              {filtroMedico && ` • Médico: ${procedimientosPorMedico.find(m => m.id.toString() === filtroMedico)?.nombre || filtroMedico}`}
            </div>
          )}
        </div>
        
        {/* Tabla de procedimientos recientes */}
        <h4 className="font-medium text-gray-700 mb-3">Procedimientos Recientes</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ojo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Programada</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Mostrar sólo los 5 procedimientos más recientes */}
              {procedimientosFiltrados
                .sort((a, b) => {
                  // Ordenar por fecha programada (más reciente primero)
                  try {
                    const fechaA = new Date(a.fechaProgramada);
                    const fechaB = new Date(b.fechaProgramada);
                    if (isNaN(fechaA.getTime()) || isNaN(fechaB.getTime())) return 0;
                    return fechaB - fechaA;
                  } catch {
                    return 0;
                  }
                })
                .slice(0, 5)
                .map(procedimiento => (
                  <tr key={procedimiento.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.paciente}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.rut}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.tipo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.ojo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.medicoAsignado}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatearFechaSegura(procedimiento.fechaProgramada)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(procedimiento.estado)}`}>
                        {procedimiento.estado.charAt(0).toUpperCase() + procedimiento.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              }
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dataTendencia}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="Consultas" stroke="#3B82F6" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Procedimientos" stroke="#10B981" />
                <Line type="monotone" dataKey="Pacientes" stroke="#F59E0B" />
              </LineChart>
            </ResponsiveContainer>
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
  // Obtenemos los datos y funciones del contexto de procedimientos
  const { 
    procedimientos,
    procedimientosFiltrados,
    aplicarFiltros,
    actualizarProcedimiento,
    agregarProcedimiento,
    eliminarProcedimiento,
    tienePermiso
  } = useContext(ProcedimientosContext);
  
  const { user } = useContext(UserContext);
  
  // Estados para modales y procedimiento seleccionado
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
  const [filtroMedico, setFiltroMedico] = useState("");
  
  // Aplicar filtros iniciales según el rol del usuario
  useEffect(() => {
    // Si el usuario es médico, filtrar para mostrar sólo sus procedimientos
    if (user?.rol === 'medico' && user?.id) {
      aplicarFiltros({ medicoId: user.id });
    } else if (user?.rol === 'tecnologo' && user?.id) {
      aplicarFiltros({ medicoId: user.id });
    } else {
      // Para admin, recepcionista, enfermero: mostrar todos
      aplicarFiltros({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Quitar aplicarFiltros de las dependencias
  
  // Redirigir a página de todos los procedimientos
  const verTodosProcedimientos = () => {
    // Redirección usando window.location
    window.location.href = "/mis-procedimientos";
  };
  
  // Función para abrir modal de detalles
  const verDetalleProcedimiento = (procedimiento) => {
    // Verificar si el usuario tiene permiso para ver este procedimiento
    if (!tienePermiso('ver', procedimiento)) {
      alert("No tienes permiso para ver este procedimiento.");
      return;
    }
    
    setProcedimientoSeleccionado(procedimiento);
    setModalDetalleVisible(true);
  };
  
  // Función para abrir modal de actualización
  const actualizarProcedimientoModal = (procedimiento) => {
    // Verificar si el usuario tiene permiso para editar este procedimiento
    if (!tienePermiso('editar', procedimiento)) {
      alert("No tienes permiso para actualizar este procedimiento.");
      return;
    }
    
    setProcedimientoSeleccionado(procedimiento);
    setNuevoEstado(procedimiento.estado);
    setNotaActualizacion("");
    setModalActualizarVisible(true);
  };
  
  // Función para guardar actualización de estado
  const guardarActualizacion = () => {
    if (!procedimientoSeleccionado || !nuevoEstado) return;
    
    // Verificar nuevamente los permisos
    if (!tienePermiso('editar', procedimientoSeleccionado)) {
      alert("No tienes permiso para actualizar este procedimiento.");
      setModalActualizarVisible(false);
      return;
    }
    
    // Preparar los nuevos datos
    const nuevosDatos = {
      estado: nuevoEstado,
      observaciones: procedimientoSeleccionado.observaciones + 
        (notaActualizacion ? `\n[${new Date().toLocaleDateString()}] ${notaActualizacion}` : "")
    };
    
    // Actualizar el procedimiento usando la función del contexto
    const resultado = actualizarProcedimiento(procedimientoSeleccionado.id, nuevosDatos);
    
    setModalActualizarVisible(false);
    
    if (resultado) {
      // Mensaje de confirmación
      alert(`El estado del procedimiento de ${procedimientoSeleccionado.paciente} ha sido actualizado a: ${nuevoEstado}`);
    } else {
      // Mensaje de error
      alert("Error al actualizar el procedimiento. Verifica tus permisos.");
    }
  };
  
  // Obtener estadísticas de procedimientos por estado
  const estadisticasProcedimientos = {
    indicados: procedimientosFiltrados.filter(p => p.estado === "indicado").length,
    programados: procedimientosFiltrados.filter(p => p.estado === "programado").length,
    realizados: procedimientosFiltrados.filter(p => p.estado === "realizado").length,
    total: procedimientosFiltrados.length
  };
  
  // Obtener estadísticas por tipo de procedimiento
  const contarPorTipo = (tipo) => procedimientosFiltrados.filter(p => p.tipo === tipo).length;
  
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
                
                {/* Filtro por médico - Solo visible para administradores, recepcionistas y enfermeros */}
                {(user?.rol === 'admin' || user?.rol === 'recepcionista' || user?.rol === 'enfermero') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Médico
                    </label>
                    <select
                      value={filtroMedico}
                      onChange={(e) => setFiltroMedico(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos los médicos</option>
                      <option value="1">Dra. González</option>
                      <option value="2">Dr. Sánchez</option>
                      <option value="3">Dra. Martínez</option>
                    </select>
                  </div>
                )}
                
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
                  onClick={() => {
                    setFiltroPaciente("");
                    setFiltroRut("");
                    setFiltroEstado("");
                    setFiltroProcedimiento("");
                    setFiltroFechaDesde("");
                    setFiltroFechaHasta("");
                    setFiltroMedico("");
                    
                    // Si el usuario es médico, aplicar filtro solo por sus procedimientos
                    if (user?.rol === 'medico' && user?.id) {
                      aplicarFiltros({ medicoId: user.id });
                    } else if (user?.rol === 'tecnologo' && user?.id) {
                      aplicarFiltros({ medicoId: user.id });
                    } else {
                      aplicarFiltros({});
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => aplicarFiltros({
                    paciente: filtroPaciente,
                    rut: filtroRut,
                    estado: filtroEstado,
                    tipo: filtroProcedimiento,
                    fechaDesde: filtroFechaDesde,
                    fechaHasta: filtroFechaHasta,
                    medicoId: filtroMedico ? parseInt(filtroMedico) : undefined
                  })}
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
              Mostrando {procedimientosFiltrados.length} de {procedimientos.length} procedimientos
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
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
                  <td className="px-4 py-3 whitespace-nowrap">{procedimiento.medicoAsignado || 'No asignado'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearFechaSegura(procedimiento.fechaIndicacion)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearFechaSegura(procedimiento.fechaProgramada)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(procedimiento.estado)}`}>
                      {procedimiento.estado.charAt(0).toUpperCase() + procedimiento.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {tienePermiso('ver', procedimiento) && (
                      <button 
                        onClick={() => verDetalleProcedimiento(procedimiento)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Ver
                      </button>
                    )}
                    {tienePermiso('editar', procedimiento) && (
                      <button 
                        onClick={() => actualizarProcedimientoModal(procedimiento)}
                        className="text-green-600 hover:text-green-800 mr-2"
                      >
                        Actualizar
                      </button>
                    )}
                    {tienePermiso('eliminar', procedimiento) && (
                      <button 
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de eliminar el procedimiento de ${procedimiento.paciente}?`)) {
                            eliminarProcedimiento(procedimiento.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    )}
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