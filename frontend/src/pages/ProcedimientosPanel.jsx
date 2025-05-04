import { useState, useContext, useEffect } from "react";
import { UserContext } from "../providers/UserProvider";
import { ProcedimientosContext } from "../providers/ProcedimientosProvider";
import MainLayout from "../components/MainLayout";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const ProcedimientosPanel = () => {
  const { user } = useContext(UserContext);
  const { 
    procedimientos, 
    procedimientosFiltrados, 
    aplicarFiltros,
    tienePermiso
  } = useContext(ProcedimientosContext);

  // Estados para filtros
  const [filtroPaciente, setFiltroPaciente] = useState("");
  const [filtroRut, setFiltroRut] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroProcedimiento, setFiltroProcedimiento] = useState("");
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  
  // Estado para vista activa
  const [vistaActiva, setVistaActiva] = useState("tabla");
  
  // Estados para análisis
  const [agrupacion, setAgrupacion] = useState("tipo");
  
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

  // Verificar permisos de admin al cargar la página
  useEffect(() => {
    if (user?.rol !== 'admin') {
      alert("No tienes permiso para acceder a esta sección");
      // Aquí iría redirección a Dashboard normal
      // history.push('/dashboard');
    }
    
    // Cargar todos los procedimientos inicialmente
    aplicarFiltros({});
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
    aplicarFiltros({
      paciente: filtroPaciente,
      rut: filtroRut,
      estado: filtroEstado,
      tipo: filtroProcedimiento,
      fechaDesde: filtroFechaDesde,
      fechaHasta: filtroFechaHasta,
      medicoId: filtroMedico ? parseInt(filtroMedico) : undefined,
      categoria: filtroCategoria
    });
  };
  
  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltroPaciente("");
    setFiltroRut("");
    setFiltroEstado("");
    setFiltroProcedimiento("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setFiltroMedico("");
    setFiltroCategoria("");
    aplicarFiltros({});
  };
  
  // Preparar datos para los gráficos
  const datosPorTipo = [
    { name: 'Inyección Intravítrea', value: procedimientosFiltrados.filter(p => p.tipo === "Inyección Intravítrea").length },
    { name: 'Láser', value: procedimientosFiltrados.filter(p => p.tipo === "Láser").length },
    { name: 'Cirugía', value: procedimientosFiltrados.filter(p => p.tipo === "Cirugía").length }
  ];
  
  const COLORS = ['#FCD34D', '#6EE7B7', '#93C5FD', '#F87171', '#A78BFA'];
  
  // Lista de médicos únicos para filtros
  const medicosUnicos = [...new Set(procedimientos.map(p => p.medicoId))];
  const listaMedicos = medicosUnicos.map(medicoId => {
    const procedimientosMedico = procedimientos.filter(p => p.medicoId === medicoId);
    return {
      id: medicoId,
      nombre: procedimientosMedico[0]?.medicoAsignado || `Médico ID ${medicoId}`
    };
  });
  
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
      case "medico":
        return medicosUnicos.map(medicoId => {
          const procedimientosMedico = procedimientosFiltrados.filter(p => p.medicoId === medicoId);
          return {
            name: procedimientosMedico[0]?.medicoAsignado || `Médico ID ${medicoId}`,
            value: procedimientosMedico.length
          };
        });
      default:
        return datosPorTipo;
    }
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Procedimientos</h1>
        <p className="text-gray-600">
          Visualización y análisis detallado de todos los procedimientos
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
              Médico
            </label>
            <select
              value={filtroMedico}
              onChange={(e) => setFiltroMedico(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los médicos</option>
              {listaMedicos.map(medico => (
                <option key={medico.id} value={medico.id}>{medico.nombre}</option>
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
              Categoría
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              <option value="procedimiento">Procedimientos</option>
              <option value="consulta">Consultas</option>
              <option value="examen">Exámenes</option>
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
          <h2 className="text-lg font-semibold mb-4">Tabla de Procedimientos</h2>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {procedimientosFiltrados.map(procedimiento => (
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
                    <td className="px-4 py-3 whitespace-nowrap">{procedimiento.categoria || 'procedimiento'}</td>
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
                <option value="medico">Médico</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Circular */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Distribución por {agrupacion === 'tipo' ? 'Tipo' : agrupacion === 'estado' ? 'Estado' : 'Médico'}</h3>
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
              <h3 className="font-medium text-gray-700 mb-3 text-center">Comparativa por {agrupacion === 'tipo' ? 'Tipo' : agrupacion === 'estado' ? 'Estado' : 'Médico'}</h3>
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
              <h3 className="font-medium text-gray-700 mb-3 text-center">Resumen de Estadísticas</h3>
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
    </MainLayout>
  );
};

export default ProcedimientosPanel; 