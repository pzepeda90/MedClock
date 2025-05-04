import { useState, useEffect, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";
import AuditoriaPagos from "../components/AuditoriaPagos";
import axios from "axios";

const GestionPagos = () => {
  const { user, token } = useContext(UserContext);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState("");
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroTipoCodigo, setFiltroTipoCodigo] = useState("");
  
  // Estado para modal de auditoría
  const [modalAuditoriaVisible, setModalAuditoriaVisible] = useState(false);
  const [pagoSeleccionadoId, setPagoSeleccionadoId] = useState(null);
  
  // Cargar datos al iniciar
  useEffect(() => {
    if (user?.rol !== 'admin') {
      alert("No tienes permiso para acceder a esta sección");
      window.location.href = "/dashboard";
      return;
    }
    
    const cargarPagos = async () => {
      setLoading(true);
      try {
        // Obtener todos los pagos
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/pagos`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            estado: filtroEstado || undefined,
            tipo_codigo: filtroTipoCodigo || undefined
          }
        });
        
        setPagos(res.data.pagos || []);
      } catch (err) {
        console.error("Error al cargar pagos:", err);
        setError("Error al cargar datos de pagos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarPagos();
  }, [user, token, filtroEstado, filtroTipoCodigo]);
  
  // Aplicar filtros adicionales (los que no se mandan al backend)
  const pagosFiltrados = pagos.filter(pago => {
    const cumpleFiltroPaciente = !filtroPaciente || 
      (pago.nombre_paciente && pago.nombre_paciente.toLowerCase().includes(filtroPaciente.toLowerCase()));
    
    const cumpleFiltroMedico = !filtroMedico || 
      (pago.nombre_profesional && pago.nombre_profesional.toLowerCase().includes(filtroMedico.toLowerCase()));
    
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
    
    return cumpleFiltroPaciente && cumpleFiltroMedico && cumpleFechaDesde && 
           cumpleFechaHasta && cumpleFiltroCodigo;
  });
  
  // Abrir modal de auditoría
  const verAuditoria = (id) => {
    setPagoSeleccionadoId(id);
    setModalAuditoriaVisible(true);
  };
  
  // Cerrar modal de auditoría
  const cerrarModalAuditoria = () => {
    setModalAuditoriaVisible(false);
  };
  
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
  
  // Obtener color según tipo de código
  const getColorTipo = (tipo) => {
    switch(tipo) {
      case "fonasa":
        return "bg-blue-100 text-blue-800";
      case "isapre":
        return "bg-purple-100 text-purple-800";
      case "particular":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Calcular totales
  const totalPagado = pagosFiltrados
    .filter(pago => pago.estado === "pagado")
    .reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
    
  const totalPendiente = pagosFiltrados
    .filter(pago => pago.estado === "pendiente")
    .reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
  
  const totalGeneral = pagosFiltrados
    .reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
  
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
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Pagos</h1>
        <p className="text-gray-600">
          Administración y revisión de todos los pagos del sistema
        </p>
      </div>
      
      {/* Panel de filtros y acciones */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros de búsqueda</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
            <input
              type="text"
              value={filtroMedico}
              onChange={(e) => setFiltroMedico(e.target.value)}
              placeholder="Nombre del médico..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => setFiltroFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Pagado</h3>
          <p className="text-3xl font-bold text-green-600">${totalPagado.toLocaleString('es-CL')}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Pendiente</h3>
          <p className="text-3xl font-bold text-yellow-600">${totalPendiente.toLocaleString('es-CL')}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total General</h3>
          <p className="text-3xl font-bold text-blue-600">${totalGeneral.toLocaleString('es-CL')}</p>
        </div>
      </div>
      
      {/* Tabla de pagos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((pago) => (
                  <tr key={pago.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{pago.nombre_paciente || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pago.nombre_profesional || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pago.codigo_procedimiento ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorTipo(pago.tipo_codigo)}`}>
                          {pago.codigo_procedimiento}
                        </span>
                      ) : "N/A"}
                    </td>
                    <td className="px-6 py-4">{pago.nombre_codigo_procedimiento || pago.servicio || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">${parseFloat(pago.monto).toLocaleString('es-CL')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatearFecha(pago.fecha_pago)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorEstado(pago.estado)}`}>
                        {pago.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => verAuditoria(pago.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Historia
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron pagos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de auditoría */}
      {modalAuditoriaVisible && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <AuditoriaPagos 
            idPago={pagoSeleccionadoId} 
            onClose={cerrarModalAuditoria} 
          />
        </div>
      )}
    </MainLayout>
  );
};

export default GestionPagos; 