import { useState, useEffect, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";
import TablaGeneral from "../components/TablaGeneral";

export default function Medicos() {
  const { user } = useContext(UserContext);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMedico, setCurrentMedico] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    apellido: "",
    rut: "",
    especialidad: "",
    telefono: "",
    email: "",
    disponible: true
  });

  // Columnas para la tabla
  const columnas = [
    { campo: "nombre", titulo: "Nombre" },
    { campo: "apellido", titulo: "Apellido" },
    { campo: "rut", titulo: "RUT" },
    { campo: "especialidad", titulo: "Especialidad" },
    { campo: "telefono", titulo: "Teléfono" },
    { campo: "email", titulo: "Email" },
    { 
      campo: "disponible", 
      titulo: "Disponible",
      renderizado: (valor) => {
        return valor ? 
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Sí</span> : 
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">No</span>;
      }
    }
  ];

  // Cargar datos de médicos (simulado)
  useEffect(() => {
    // Simulamos una carga de datos de la API
    setTimeout(() => {
      const medicosMock = [
        {
          id: 1,
          nombre: "Ana",
          apellido: "Martínez",
          rut: "15.432.109-8",
          especialidad: "Cardiología",
          telefono: "+56 9 8765 4321",
          email: "ana.martinez@clinica.cl",
          disponible: true
        },
        {
          id: 2,
          nombre: "Roberto",
          apellido: "Sánchez",
          rut: "10.567.890-1",
          especialidad: "Dermatología",
          telefono: "+56 9 7654 3210",
          email: "roberto.sanchez@clinica.cl",
          disponible: true
        },
        {
          id: 3,
          nombre: "Carolina",
          apellido: "Muñoz",
          rut: "17.890.123-4",
          especialidad: "Pediatría",
          telefono: "+56 9 6543 2109",
          email: "carolina.munoz@clinica.cl",
          disponible: false
        }
      ];
      
      setMedicos(medicosMock);
      setLoading(false);
    }, 1000);
  }, []);

  // Acciones para la tabla
  const acciones = (medico) => {
    return (
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => handleEditar(medico)}
          className="text-blue-600 hover:text-blue-800"
        >
          Editar
        </button>
        <button 
          onClick={() => handleVerDetalle(medico)}
          className="text-green-600 hover:text-green-800"
        >
          Ver
        </button>
        <button 
          onClick={() => handleEliminar(medico)}
          className="text-red-600 hover:text-red-800"
        >
          Eliminar
        </button>
      </div>
    );
  };

  // Manejadores de acciones
  const handleEditar = (medico) => {
    setCurrentMedico(medico);
    setFormData({
      id: medico.id,
      nombre: medico.nombre,
      apellido: medico.apellido,
      rut: medico.rut,
      especialidad: medico.especialidad,
      telefono: medico.telefono,
      email: medico.email,
      disponible: medico.disponible
    });
    setModalOpen(true);
  };

  const handleVerDetalle = (medico) => {
    setCurrentMedico(medico);
    alert(`Detalle del médico: ${medico.nombre} ${medico.apellido}, Especialidad: ${medico.especialidad}`);
  };

  const handleEliminar = (medico) => {
    if (window.confirm(`¿Está seguro de eliminar a ${medico.nombre} ${medico.apellido}?`)) {
      // Simulamos eliminación
      setMedicos(prevMedicos => prevMedicos.filter(m => m.id !== medico.id));
    }
  };

  const handleNuevoMedico = () => {
    setCurrentMedico(null);
    setFormData({
      id: "",
      nombre: "",
      apellido: "",
      rut: "",
      especialidad: "",
      telefono: "",
      email: "",
      disponible: true
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentMedico) {
      // Actualizar médico existente
      setMedicos(prevMedicos => 
        prevMedicos.map(m => m.id === currentMedico.id ? { ...formData } : m)
      );
    } else {
      // Crear nuevo médico
      const newId = Math.max(0, ...medicos.map(m => m.id)) + 1;
      setMedicos(prevMedicos => [
        ...prevMedicos,
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
            <h1 className="text-2xl font-bold text-gray-800">Médicos</h1>
            <p className="text-gray-600">
              Gestiona el registro de médicos de la clínica
            </p>
          </div>
          
          <button
            onClick={handleNuevoMedico}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuevo Médico
          </button>
        </div>
      </div>
      
      <TablaGeneral
        titulo="Listado de Médicos"
        columnas={columnas}
        datos={medicos}
        acciones={acciones}
        cargando={loading}
        busqueda={true}
        paginacion={true}
        itemsPorPagina={10}
      />
      
      {/* Modal para crear/editar médico */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {currentMedico ? "Editar Médico" : "Nuevo Médico"}
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
                      Especialidad
                    </label>
                    <select
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione...</option>
                      <option value="Medicina General">Medicina General</option>
                      <option value="Cardiología">Cardiología</option>
                      <option value="Dermatología">Dermatología</option>
                      <option value="Pediatría">Pediatría</option>
                      <option value="Traumatología">Traumatología</option>
                      <option value="Ginecología">Ginecología</option>
                      <option value="Oftalmología">Oftalmología</option>
                      <option value="Neurología">Neurología</option>
                      <option value="Psiquiatría">Psiquiatría</option>
                      <option value="Oncología">Oncología</option>
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
                      required
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
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center h-full">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="disponible"
                        checked={formData.disponible}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Disponible para atención</span>
                    </label>
                  </div>
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
                    {currentMedico ? "Actualizar" : "Crear"}
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