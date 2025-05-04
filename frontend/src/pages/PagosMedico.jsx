import { useState, useEffect, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const PagosMedico = () => {
  const { user, token } = useContext(UserContext);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroTipoCodigo, setFiltroTipoCodigo] = useState("");
  const [filtroProcedimientoEstado, setFiltroProcedimientoEstado] = useState("");
  
  // Estado para vista activa
  const [vistaActiva, setVistaActiva] = useState("tabla");
  
  // Estados para reportes
  const [periodoReporte, setPeriodoReporte] = useState("mes");
  const [anioReporte, setAnioReporte] = useState(new Date().getFullYear());
  const [mesReporte, setMesReporte] = useState(new Date().getMonth() + 1);
  
  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A267AC'];
  
  // Cargar datos al iniciar
  useEffect(() => {
    if (user?.rol !== 'medico' && user?.rol !== 'admin') {
      alert("No tienes permiso para acceder a esta sección");
      window.location.href = "/dashboard";
      return;
    }
    
    const cargarPagos = async () => {
      setLoading(true);
      try {
        // Si es un médico, usamos su ID para buscar los pagos
        const medicoId = user.rol === 'medico' ? user.id : (user.medicoId || null);
        
        if (!medicoId) {
          setError("No se pudo identificar al médico para obtener sus pagos");
          setLoading(false);
          return;
        }
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/pagos/medico/${medicoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPagos(res.data.pagos);
      } catch (err) {
        console.error("Error al cargar pagos:", err);
        setError("Error al cargar datos de pagos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarPagos();
  }, [user, token]);
  
  // Aplicar filtros
  const pagosFiltrados = pagos.filter(pago => {
    const cumpleFiltroEstado = !filtroEstado || pago.estado === filtroEstado;
    const cumpleFiltroPaciente = !filtroPaciente || 
      (pago.nombre_paciente && pago.nombre_paciente.toLowerCase().includes(filtroPaciente.toLowerCase()));
    
    // Filtro de fechas
    let cumpleFechaDesde = true;
    let cumpleFechaHasta = true;
    
    if (filtroFechaDesde && pago.fecha_pago) {
      cumpleFechaDesde = new Date(pago.fecha_pago) >= new Date(filtroFechaDesde);
    }
    
    if (filtroFechaHasta && pago.fecha_pago) {
      cumpleFechaHasta = new Date(pago.fecha_pago) <= new Date(filtroFechaHasta + 'T23:59:59');
    }
    
    // Filtro por código
    const cumpleFiltroCodigo = !filtroCodigo || 
      (pago.codigo_procedimiento && pago.codigo_procedimiento.toLowerCase().includes(filtroCodigo.toLowerCase()));
    
    // Filtro por tipo de código
    const cumpleFiltroTipoCodigo = !filtroTipoCodigo || pago.tipo_codigo === filtroTipoCodigo;
    
    // Filtro por estado de procedimiento
    const cumpleFiltroProcedimientoEstado = !filtroProcedimientoEstado || 
      (pago.cita_estado && pago.cita_estado === filtroProcedimientoEstado);
    
    return cumpleFiltroEstado && cumpleFiltroPaciente && cumpleFechaDesde && 
           cumpleFechaHasta && cumpleFiltroCodigo && cumpleFiltroTipoCodigo && cumpleFiltroProcedimientoEstado;
  });
  
  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "Pendiente";
    
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL');
  };
  
  // Obtener color de estado
  const getColorEstado = (estado) => {
    switch(estado) {
      case "pagado":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "anulado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Generar datos para reportes según periodo seleccionado
  const getDatosReporte = () => {
    if (periodoReporte === "mes") {
      // Agrupar pagos por día del mes seleccionado
      const pagosMes = pagosFiltrados.filter(pago => {
        if (!pago.fecha_pago) return false;
        const fecha = new Date(pago.fecha_pago);
        return fecha.getFullYear() === anioReporte && fecha.getMonth() + 1 === mesReporte;
      });
      
      // Crear un objeto para agrupar por día
      const datosPorDia = {};
      
      pagosMes.forEach(pago => {
        const fecha = new Date(pago.fecha_pago);
        const dia = fecha.getDate();
        
        if (!datosPorDia[dia]) {
          datosPorDia[dia] = {
            dia: dia,
            total: 0,
            cantidad: 0
          };
        }
        
        datosPorDia[dia].total += parseFloat(pago.monto);
        datosPorDia[dia].cantidad += 1;
      });
      
      // Convertir a arreglo y ordenar por día
      return Object.values(datosPorDia).sort((a, b) => a.dia - b.dia);
      
    } else if (periodoReporte === "anio") {
      // Agrupar pagos por mes del año seleccionado
      const pagosAnio = pagosFiltrados.filter(pago => {
        if (!pago.fecha_pago) return false;
        const fecha = new Date(pago.fecha_pago);
        return fecha.getFullYear() === anioReporte;
      });
      
      // Nombres de los meses
      const nombresMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      
      // Crear datos para cada mes
      const datosPorMes = nombresMeses.map((nombre, index) => {
        const pagosMes = pagosAnio.filter(pago => {
          const fecha = new Date(pago.fecha_pago);
          return fecha.getMonth() === index;
        });
        
        const total = pagosMes.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
        
        return {
          mes: nombre,
          total: total,
          cantidad: pagosMes.length
        };
      });
      
      return datosPorMes;
    }
    
    return [];
  };
  
  // Datos para gráfico de pastel por tipo de código
  const getDatosPorTipoCodigo = () => {
    const pagosConCodigo = pagosFiltrados.filter(pago => pago.tipo_codigo);
    
    // Agrupar por tipo de código
    const tiposDeCodigo = {};
    
    pagosConCodigo.forEach(pago => {
      const tipo = pago.tipo_codigo;
      
      if (!tiposDeCodigo[tipo]) {
        tiposDeCodigo[tipo] = {
          name: tipo,
          value: 0
        };
      }
      
      tiposDeCodigo[tipo].value += parseFloat(pago.monto);
    });
    
    return Object.values(tiposDeCodigo);
  };
  
  // Calcular totales
  const totalPagado = pagosFiltrados
    .filter(pago => pago.estado === "pagado")
    .reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
    
  const totalPendiente = pagosFiltrados
    .filter(pago => pago.estado === "pendiente")
    .reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
  
  const totalCantidad = pagosFiltrados.length;
  const cantidadPagados = pagosFiltrados.filter(pago => pago.estado === "pagado").length;
  const cantidadPendientes = pagosFiltrados.filter(pago => pago.estado === "pendiente").length;
  
  // Función para calcular métricas de productividad
  const calcularProductividad = () => {
    const totalProcedimientos = pagosFiltrados.length;
    const procedimientosRealizados = pagosFiltrados.filter(p => p.cita_estado === 'completada').length;
    const procedimientosPagados = pagosFiltrados.filter(p => p.estado === 'pagado').length;
    
    // Tasa de realización (procedimientos realizados / total)
    const tasaRealizacion = totalProcedimientos > 0 
      ? (procedimientosRealizados / totalProcedimientos) * 100 
      : 0;
    
    // Tasa de conversión (pagados / realizados)
    const tasaConversion = procedimientosRealizados > 0 
      ? (procedimientosPagados / procedimientosRealizados) * 100 
      : 0;
    
    // Promedio de valor por procedimiento
    const valorPromedio = totalProcedimientos > 0
      ? pagosFiltrados.reduce((sum, p) => sum + parseFloat(p.monto), 0) / totalProcedimientos
      : 0;
    
    // Procedimientos por tipo
    const tiposProcedimiento = {};
    pagosFiltrados.forEach(p => {
      const tipo = p.tipo_codigo || 'sin_tipo';
      if (!tiposProcedimiento[tipo]) {
        tiposProcedimiento[tipo] = {
          total: 0,
          realizados: 0,
          pagados: 0,
          valor: 0
        };
      }
      
      tiposProcedimiento[tipo].total += 1;
      if (p.cita_estado === 'completada') tiposProcedimiento[tipo].realizados += 1;
      if (p.estado === 'pagado') tiposProcedimiento[tipo].pagados += 1;
      tiposProcedimiento[tipo].valor += parseFloat(p.monto);
    });
    
    return {
      totalProcedimientos,
      procedimientosRealizados,
      procedimientosPagados,
      tasaRealizacion,
      tasaConversion,
      valorPromedio,
      tiposProcedimiento
    };
  };
  
  // Calcular métricas de productividad
  const productividad = calcularProductividad();
  
  if (loading && pagos.length === 0) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reporte de Pagos</h1>
        <p className="text-gray-600">
          Visualización y análisis de pagos asociados a sus procedimientos
        </p>
      </div>
      
      {/* Panel de filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
            <input
              type="text"
              value={filtroPaciente}
              onChange={(e) => setFiltroPaciente(e.target.value)}
              placeholder="Nombre del paciente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Código</label>
            <select
              value={filtroTipoCodigo}
              onChange={(e) => setFiltroTipoCodigo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="fonasa">Fonasa</option>
              <option value="isapre">Isapre</option>
              <option value="particular">Particular</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Procedimiento</label>
            <select
              value={filtroProcedimientoEstado}
              onChange={(e) => setFiltroProcedimientoEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="reservada">Programado</option>
              <option value="completada">Realizado</option>
              <option value="anulada">Anulado</option>
              <option value="no asistió">No asistió</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              placeholder="Código de procedimiento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => setFiltroFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Panel de resultados con tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-3 font-medium text-sm ${vistaActiva === 'tabla' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setVistaActiva('tabla')}
          >
            Tabla
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${vistaActiva === 'resumen' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setVistaActiva('resumen')}
          >
            Resumen
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${vistaActiva === 'reportes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setVistaActiva('reportes')}
          >
            Reportes
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${vistaActiva === 'productividad' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setVistaActiva('productividad')}
          >
            Productividad
          </button>
        </div>
        
        {/* Vista de tabla */}
        {vistaActiva === 'tabla' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Procedimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Pago</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagosFiltrados.length > 0 ? (
                  pagosFiltrados.map((pago, index) => (
                    <tr key={pago.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">{pago.nombre_paciente || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pago.codigo_procedimiento ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {pago.codigo_procedimiento}
                          </span>
                        ) : "N/A"}
                      </td>
                      <td className="px-6 py-4">{pago.nombre_codigo_procedimiento || pago.servicio || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">${parseFloat(pago.monto).toLocaleString('es-CL')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatearFecha(pago.fecha_pago)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pago.cita_estado === 'completada' ? 'bg-green-100 text-green-800' : 
                          pago.cita_estado === 'reservada' ? 'bg-blue-100 text-blue-800' : 
                          pago.cita_estado === 'anulada' ? 'bg-red-100 text-red-800' : 
                          pago.cita_estado === 'no asistió' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pago.cita_estado === 'completada' ? 'Realizado' : 
                           pago.cita_estado === 'reservada' ? 'Programado' : 
                           pago.cita_estado === 'anulada' ? 'Anulado' : 
                           pago.cita_estado === 'no asistió' ? 'No asistió' : 
                           pago.cita_estado || 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorEstado(pago.estado)}`}>
                          {pago.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No se encontraron pagos que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Vista de resumen */}
        {vistaActiva === 'resumen' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Cobrado</h3>
                <p className="text-3xl font-bold text-blue-600">${totalPagado.toLocaleString('es-CL')}</p>
                <p className="text-sm text-gray-500 mt-1">{cantidadPagados} procedimientos pagados</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Pendiente</h3>
                <p className="text-3xl font-bold text-yellow-600">${totalPendiente.toLocaleString('es-CL')}</p>
                <p className="text-sm text-gray-500 mt-1">{cantidadPendientes} procedimientos pendientes</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Procedimientos</h3>
                <p className="text-3xl font-bold text-gray-800">{totalCantidad}</p>
                <p className="text-sm text-gray-500 mt-1">Tasa de cobro: {totalCantidad > 0 ? Math.round((cantidadPagados / totalCantidad) * 100) : 0}%</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo de Código</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDatosPorTipoCodigo()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getDatosPorTipoCodigo().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `$${value.toLocaleString('es-CL')}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* Vista de reportes */}
        {vistaActiva === 'reportes' && (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                <select
                  value={periodoReporte}
                  onChange={(e) => setPeriodoReporte(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mes">Mensual</option>
                  <option value="anio">Anual</option>
                </select>
              </div>
              
              {periodoReporte === "mes" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                    <select
                      value={anioReporte}
                      onChange={(e) => setAnioReporte(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[2022, 2023, 2024, 2025].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                    <select
                      value={mesReporte}
                      onChange={(e) => setMesReporte(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                        <option key={month} value={month}>
                          {new Date(2000, month - 1, 1).toLocaleString('es-CL', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {periodoReporte === "anio" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <select
                    value={anioReporte}
                    onChange={(e) => setAnioReporte(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[2022, 2023, 2024, 2025].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getDatosReporte()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={periodoReporte === "mes" ? "dia" : "mes"} 
                    label={{ value: periodoReporte === "mes" ? "Día del Mes" : "Mes", position: "insideBottom", offset: -5 }} 
                  />
                  <YAxis yAxisId="left" label={{ value: "Monto ($)", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: "Cantidad", angle: 90, position: "insideRight" }} />
                  <RechartsTooltip formatter={(value, name) => [
                    name === "total" ? `$${value.toLocaleString('es-CL')}` : value,
                    name === "total" ? "Monto Total" : "Cantidad"
                  ]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="total" name="Monto Total" fill="#0088FE" />
                  <Bar yAxisId="right" dataKey="cantidad" name="Cantidad" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Vista de Productividad */}
        {vistaActiva === 'productividad' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Procedimientos</h3>
                <p className="text-3xl font-bold text-blue-600">{productividad.totalProcedimientos}</p>
                <div className="flex justify-between mt-3">
                  <div>
                    <p className="text-sm text-gray-500">Realizados</p>
                    <p className="font-semibold">{productividad.procedimientosRealizados}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pagados</p>
                    <p className="font-semibold">{productividad.procedimientosPagados}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasas de Conversión</h3>
                <div className="flex flex-col">
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Tasa de Realización</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, productividad.tasaRealizacion)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 font-semibold">{productividad.tasaRealizacion.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tasa de Cobro</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, productividad.tasaConversion)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 font-semibold">{productividad.tasaConversion.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Valor Promedio</h3>
                <p className="text-3xl font-bold text-green-600">${productividad.valorPromedio.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
                <p className="text-sm text-gray-500 mt-1">Por procedimiento</p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Tipo de Procedimiento</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Realizados</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagados</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa Realización</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa Cobro</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(productividad.tiposProcedimiento).map(([tipo, datos]) => {
                    const tasaRealizacion = datos.total > 0 ? (datos.realizados / datos.total) * 100 : 0;
                    const tasaCobro = datos.realizados > 0 ? (datos.pagados / datos.realizados) * 100 : 0;
                    
                    return (
                      <tr key={tipo}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorTipo(tipo)}`}>
                            {tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{datos.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{datos.realizados}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{datos.pagados}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">${datos.valor.toLocaleString('es-CL')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, tasaRealizacion)}%` }}
                              ></div>
                            </div>
                            <span>{tasaRealizacion.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div 
                                className="bg-green-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, tasaCobro)}%` }}
                              ></div>
                            </div>
                            <span>{tasaCobro.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PagosMedico; 