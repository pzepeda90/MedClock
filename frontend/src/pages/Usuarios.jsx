import { useState, useEffect, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";

export default function Usuarios() {
  const { user } = useContext(UserContext);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "",
    departamento: "",
    especialidad: ""
  });
  
  // Lista de roles disponibles
  const roles = [
    { id: "medico", nombre: "Médico" },
    { id: "recepcionista", nombre: "Recepcionista" },
    { id: "enfermera", nombre: "Enfermera" },
    { id: "tens", nombre: "TENS" },
    { id: "tecnologo_medico", nombre: "Tecnólogo Médico" },
    { id: "admin", nombre: "Administrador" },
    { id: "otro", nombre: "Otro personal" }
  ];
  
  // Departamentos para seleccionar
  const departamentos = [
    "Administración",
    "Admisión",
    "Urgencias",
    "Consulta Externa",
    "Oftalmología",
    "Pediatría",
    "Cirugía",
    "Enfermería",
    "Laboratorio",
    "Imagenología",
    "Farmacia"
  ];
  
  // Cargar datos de usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        // Aquí iría la llamada a la API real
        // Por ahora, usamos datos de ejemplo
        const mockUsuarios = [
          {
            id: 1,
            nombre: "Juan",
            apellido: "Pérez",
            email: "juan@ejemplo.com",
            rol: "medico",
            departamento: "Oftalmología",
            especialidad: "Oftalmología General",
            fecha_creacion: "2023-01-15",
            estado: "activo"
          },
          {
            id: 2,
            nombre: "María",
            apellido: "López",
            email: "maria@ejemplo.com",
            rol: "recepcionista",
            departamento: "Admisión",
            especialidad: "",
            fecha_creacion: "2023-02-20",
            estado: "activo"
          },
          {
            id: 3,
            nombre: "Carlos",
            apellido: "García",
            email: "carlos@ejemplo.com",
            rol: "enfermera",
            departamento: "Enfermería",
            especialidad: "Oftalmología",
            fecha_creacion: "2023-03-10",
            estado: "activo"
          }
        ];
        
        setTimeout(() => {
          setUsuarios(mockUsuarios);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        setLoading(false);
      }
    };
    
    fetchUsuarios();
  }, []);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Abrir modal para crear nuevo usuario
  const handleNuevoUsuario = () => {
    setUsuarioSeleccionado(null);
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      rol: "",
      departamento: "",
      especialidad: ""
    });
    setModalOpen(true);
  };
  
  // Abrir modal para editar usuario existente
  const handleEditarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: "", // No mostrar contraseña actual
      rol: usuario.rol,
      departamento: usuario.departamento || "",
      especialidad: usuario.especialidad || ""
    });
    setModalOpen(true);
  };
  
  // Enviar formulario para crear o editar usuario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (usuarioSeleccionado) {
      // Actualizar usuario existente
      const usuariosActualizados = usuarios.map(u => 
        u.id === usuarioSeleccionado.id 
          ? { ...u, ...formData, id: usuarioSeleccionado.id } 
          : u
      );
      setUsuarios(usuariosActualizados);
      alert("Usuario actualizado con éxito");
    } else {
      // Crear nuevo usuario
      const nuevoUsuario = {
        ...formData,
        id: usuarios.length + 1,
        fecha_creacion: new Date().toISOString().split('T')[0],
        estado: "activo"
      };
      setUsuarios([...usuarios, nuevoUsuario]);
      alert("Usuario creado con éxito");
    }
    
    setModalOpen(false);
  };
  
  // Cambiar estado de usuario (activar/desactivar)
  const toggleEstadoUsuario = (id) => {
    const usuariosActualizados = usuarios.map(u => 
      u.id === id 
        ? { ...u, estado: u.estado === "activo" ? "inactivo" : "activo" } 
        : u
    );
    setUsuarios(usuariosActualizados);
  };
  
  // Obtener color de badge según rol
  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "medico":
        return "bg-blue-100 text-blue-800";
      case "recepcionista":
        return "bg-green-100 text-green-800";
      case "enfermera":
        return "bg-pink-100 text-pink-800";
      case "tens":
        return "bg-indigo-100 text-indigo-800";
      case "tecnologo_medico":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Obtener nombre legible del rol
  const getRoleName = (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    return rol ? rol.nombre : rolId;
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Administración de Usuarios</h1>
            <p className="text-gray-600">
              Gestiona los usuarios del sistema médico
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleNuevoUsuario}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Listado de Usuarios</h2>
            <div className="mt-3 md:mt-0">
              <input
                type="text"
                placeholder="Buscar usuario..."
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                              {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.nombre} {usuario.apellido}</div>
                            <div className="text-xs text-gray-500">Creado: {usuario.fecha_creacion}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{usuario.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(usuario.rol)}`}>
                          {getRoleName(usuario.rol)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {usuario.departamento || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          usuario.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {usuario.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditarUsuario(usuario)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleEstadoUsuario(usuario.id)}
                          className={`${
                            usuario.estado === "activo" ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {usuario.estado === "activo" ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal para crear/editar usuario */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {usuarioSeleccionado ? "Editar Usuario" : "Nuevo Usuario"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {usuarioSeleccionado ? "Contraseña (dejar en blanco para mantener actual)" : "Contraseña"}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...(usuarioSeleccionado ? {} : { required: true })}
                  />
                </div>
                
                <div>
                  <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(rol => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <select
                    id="departamento"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar departamento</option>
                    {departamentos.map(depto => (
                      <option key={depto} value={depto}>{depto}</option>
                    ))}
                  </select>
                </div>
                
                {formData.rol === "medico" && (
                  <div>
                    <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidad
                    </label>
                    <input
                      type="text"
                      id="especialidad"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
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
                  {usuarioSeleccionado ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
} 