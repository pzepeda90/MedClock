import { useState, useEffect, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";
import axios from "axios";

const CodigosProcedimiento = () => {
  const { user, token } = useContext(UserContext);
  const [codigos, setCodigos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  
  // Estado para edición/creación
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [codigoSeleccionado, setCodigoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    tipo: "fonasa",
    precio_referencia: 0,
    activo: true,
    servicios: []
  });
  
  // Tipos de código disponibles
  const tiposCodigo = ["fonasa", "isapre", "particular", "otros"];
  
  // Cargar datos al iniciar
  useEffect(() => {
    if (user?.rol !== 'admin') {
      alert("No tienes permiso para acceder a esta sección");
      window.location.href = "/dashboard";
      return;
    }
    
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Cargar códigos
        const resCodigos = await axios.get(`${import.meta.env.VITE_API_URL}/codigos-procedimientos`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { activos: mostrarInactivos ? 'todos' : 'true' }
        });
        
        // Cargar servicios para asociación
        const resServicios = await axios.get(`${import.meta.env.VITE_API_URL}/servicios`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCodigos(resCodigos.data.codigos);
        setServicios(resServicios.data.servicios);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar datos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [user, token, mostrarInactivos]);
  
  // Filtrar códigos según criterios
  const codigosFiltrados = codigos.filter(codigo => {
    return (
      codigo.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()) &&
      codigo.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      (filtroTipo === "" || codigo.tipo === filtroTipo)
    );
  });
  
  // Manejadores de formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'precio_referencia' ? parseFloat(value) || 0 : value
    });
  };
  
  const handleServicioChange = (e) => {
    const servicioId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setFormData({
        ...formData,
        servicios: [...formData.servicios, servicioId]
      });
    } else {
      setFormData({
        ...formData,
        servicios: formData.servicios.filter(id => id !== servicioId)
      });
    }
  };
  
  // Abrir formulario para crear nuevo código
  const crearNuevoCodigo = () => {
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      tipo: "fonasa",
      precio_referencia: 0,
      activo: true,
      servicios: []
    });
    setModoEdicion(false);
    setModalVisible(true);
  };
  
  // Abrir formulario para editar código existente
  const editarCodigo = async (id) => {
    try {
      setLoading(true);
      
      // Obtener detalles del código incluyendo servicios asociados
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/codigos-procedimientos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const codigo = res.data.codigo;
      const serviciosAsociados = res.data.servicios.map(s => s.id);
      
      setCodigoSeleccionado(codigo);
      setFormData({
        codigo: codigo.codigo,
        nombre: codigo.nombre,
        descripcion: codigo.descripcion || "",
        tipo: codigo.tipo,
        precio_referencia: codigo.precio_referencia,
        activo: codigo.activo,
        servicios: serviciosAsociados
      });
      
      setModoEdicion(true);
      setModalVisible(true);
    } catch (err) {
      console.error("Error al obtener detalles del código:", err);
      setError("Error al cargar los detalles del código.");
    } finally {
      setLoading(false);
    }
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (modoEdicion) {
        // Actualizar código existente
        await axios.put(
          `${import.meta.env.VITE_API_URL}/codigos-procedimientos/${codigoSeleccionado.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Crear nuevo código
        await axios.post(
          `${import.meta.env.VITE_API_URL}/codigos-procedimientos`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Actualizar la lista y cerrar el modal
      const resCodigos = await axios.get(`${import.meta.env.VITE_API_URL}/codigos-procedimientos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { activos: mostrarInactivos ? 'todos' : 'true' }
      });
      
      setCodigos(resCodigos.data.codigos);
      setModalVisible(false);
      
    } catch (err) {
      console.error("Error al guardar código:", err);
      setError(err.response?.data?.mensaje || "Error al guardar el código. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  
  // Cambiar estado (activar/desactivar)
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/codigos-procedimientos/${id}`,
        { activo: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar la lista
      const resCodigos = await axios.get(`${import.meta.env.VITE_API_URL}/codigos-procedimientos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { activos: mostrarInactivos ? 'todos' : 'true' }
      });
      
      setCodigos(resCodigos.data.codigos);
      
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError("Error al cambiar el estado del código.");
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
  
  if (loading && codigos.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-800">Administración de Códigos de Procedimiento</h1>
        <p className="text-gray-600">
          Gestiona los códigos de procedimientos médicos (Fonasa, Isapres, etc.)
        </p>
      </div>
      
      {/* Panel de filtros y acciones */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <button
            onClick={crearNuevoCodigo}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Nuevo Código
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              placeholder="Buscar por código..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              {tiposCodigo.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={mostrarInactivos}
                onChange={(e) => setMostrarInactivos(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-sm text-gray-700">Mostrar inactivos</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Tabla de códigos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {codigosFiltrados.length > 0 ? (
                codigosFiltrados.map(codigo => (
                  <tr key={codigo.id} className={!codigo.activo ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{codigo.codigo}</td>
                    <td className="px-6 py-4">{codigo.nombre}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorTipo(codigo.tipo)}`}>
                        {codigo.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">${codigo.precio_referencia.toLocaleString('es-CL')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${codigo.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {codigo.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => editarCodigo(codigo.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      {codigo.activo ? (
                        <button
                          onClick={() => cambiarEstado(codigo.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => cambiarEstado(codigo.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Activar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron códigos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal para crear/editar código */}
      {modalVisible && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalVisible(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {modoEdicion ? "Editar Código de Procedimiento" : "Nuevo Código de Procedimiento"}
                  </h3>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                      <input
                        type="text"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                      <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {tiposCodigo.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Referencia *</label>
                    <input
                      type="number"
                      name="precio_referencia"
                      value={formData.precio_referencia}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleInputChange}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mr-2"
                      />
                      <span className="text-sm text-gray-700">Activo</span>
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Servicios Asociados</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {servicios.length > 0 ? (
                        servicios.map(servicio => (
                          <div key={servicio.id} className="mb-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                value={servicio.id}
                                checked={formData.servicios.includes(servicio.id)}
                                onChange={handleServicioChange}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mr-2"
                              />
                              <span className="text-sm text-gray-700">{servicio.nombre}</span>
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No hay servicios disponibles</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalVisible(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CodigosProcedimiento; 