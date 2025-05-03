import { useState, useEffect, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";
import TablaGeneral from "../components/TablaGeneral";

export default function Pacientes() {
  const { user } = useContext(UserContext);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPaciente, setCurrentPaciente] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    apellido: "",
    rut: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    email: "",
    direccion: "",
    prevision: ""
  });

  // Columnas para la tabla
  const columnas = [
    { campo: "nombre", titulo: "Nombre" },
    { campo: "apellido", titulo: "Apellido" },
    { campo: "rut", titulo: "RUT" },
    { 
      campo: "fecha_nacimiento", 
      titulo: "Fecha Nacimiento",
      renderizado: (valor) => {
        if (!valor) return "";
        const fecha = new Date(valor);
        return fecha.toLocaleDateString("es-CL");
      }
    },
    { campo: "telefono", titulo: "Teléfono" },
    { campo: "email", titulo: "Email" },
    { 
      campo: "prevision", 
      titulo: "Previsión",
      renderizado: (valor) => {
        return valor ? valor.toUpperCase() : "";
      }
    }
  ];

  // Cargar datos de pacientes (simulado)
  useEffect(() => {
    // Simulamos una carga de datos de la API
    setTimeout(() => {
      const pacientesMock = [
        {
          id: 1,
          nombre: "Juan",
          apellido: "Pérez",
          rut: "12.345.678-9",
          fecha_nacimiento: "1980-05-15",
          genero: "M",
          telefono: "+56 9 1234 5678",
          email: "juan.perez@ejemplo.com",
          direccion: "Av. Principal 123, Santiago",
          prevision: "Fonasa"
        },
        {
          id: 2,
          nombre: "María",
          apellido: "González",
          rut: "9.876.543-2",
          fecha_nacimiento: "1975-11-20",
          genero: "F",
          telefono: "+56 9 8765 4321",
          email: "maria.gonzalez@ejemplo.com",
          direccion: "Calle Secundaria 456, Concepción",
          prevision: "Isapre"
        },
        {
          id: 3,
          nombre: "Carlos",
          apellido: "Rodríguez",
          rut: "15.678.901-3",
          fecha_nacimiento: "1990-02-28",
          genero: "M",
          telefono: "+56 9 5555 6666",
          email: "carlos.rodriguez@ejemplo.com",
          direccion: "Pasaje Los Olmos 789, Viña del Mar",
          prevision: "Fonasa"
        }
      ];
      
      setPacientes(pacientesMock);
      setLoading(false);
    }, 1000);
  }, []);

  // Acciones para la tabla
  const acciones = (paciente) => {
    return (
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => handleEditar(paciente)}
          className="text-blue-600 hover:text-blue-800"
        >
          Editar
        </button>
        <button 
          onClick={() => handleVerDetalle(paciente)}
          className="text-green-600 hover:text-green-800"
        >
          Ver
        </button>
        <button 
          onClick={() => handleEliminar(paciente)}
          className="text-red-600 hover:text-red-800"
        >
          Eliminar
        </button>
      </div>
    );
  };

  // Manejadores de acciones
  const handleEditar = (paciente) => {
    setCurrentPaciente(paciente);
    setFormData({
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      rut: paciente.rut,
      fecha_nacimiento: paciente.fecha_nacimiento,
      genero: paciente.genero,
      telefono: paciente.telefono,
      email: paciente.email,
      direccion: paciente.direccion,
      prevision: paciente.prevision
    });
    setModalOpen(true);
  };

  const handleVerDetalle = (paciente) => {
    setCurrentPaciente(paciente);
    // Aquí podrías redireccionar a una página de detalle o abrir un modal con detalles
    alert(`Detalle del paciente: ${paciente.nombre} ${paciente.apellido}`);
  };

  const handleEliminar = (paciente) => {
    if (window.confirm(`¿Está seguro de eliminar a ${paciente.nombre} ${paciente.apellido}?`)) {
      // Simulamos eliminación
      setPacientes(prevPacientes => prevPacientes.filter(p => p.id !== paciente.id));
    }
  };

  const handleNuevoPaciente = () => {
    setCurrentPaciente(null);
    setFormData({
      id: "",
      nombre: "",
      apellido: "",
      rut: "",
      fecha_nacimiento: "",
      genero: "",
      telefono: "",
      email: "",
      direccion: "",
      prevision: ""
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentPaciente) {
      // Actualizar paciente existente
      setPacientes(prevPacientes => 
        prevPacientes.map(p => p.id === currentPaciente.id ? { ...formData } : p)
      );
    } else {
      // Crear nuevo paciente
      const newId = Math.max(0, ...pacientes.map(p => p.id)) + 1;
      setPacientes(prevPacientes => [
        ...prevPacientes,
        { ...formData, id: newId }
      ]);
    }
    
    setModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>
            <p className="text-gray-600">
              Gestiona el registro de pacientes de la clínica
            </p>
          </div>
          
          <button
            onClick={handleNuevoPaciente}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuevo Paciente
          </button>
        </div>
      </div>
      
      <TablaGeneral
        titulo="Listado de Pacientes"
        columnas={columnas}
        datos={pacientes}
        acciones={acciones}
        cargando={loading}
        busqueda={true}
        paginacion={true}
        itemsPorPagina={10}
      />
      
      {/* Modal para crear/editar paciente */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {currentPaciente ? "Editar Paciente" : "Nuevo Paciente"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RUT
                    </label>
                    <input
                      type="text"
                      name="rut"
                      value={formData.rut}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Género
                    </label>
                    <select
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previsión
                    </label>
                    <select
                      name="prevision"
                      value={formData.prevision}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione...</option>
                      <option value="Fonasa">Fonasa</option>
                      <option value="Isapre">Isapre</option>
                      <option value="Particular">Particular</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
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
                    {currentPaciente ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
} 