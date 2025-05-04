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
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    run: "",
    fecha_nacimiento: "",
    sexo_biologico: "",
    genero: "",
    nacionalidad: "Chilena",
    estado_civil: "",
    foto: "",
    calle: "",
    numero: "",
    depto: "",
    comuna: "",
    region: "",
    codigo_postal: "",
    telefono_fijo: "",
    celular: "",
    email: "",
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
    prevision: ""
  });

  // Columnas para la tabla
  const columnas = [
    { 
      campo: "nombre_completo", 
      titulo: "Nombre Completo",
      renderizado: (_, paciente) => {
        return `${paciente.primer_nombre} ${paciente.primer_apellido} ${paciente.segundo_apellido || ''}`;
      }
    },
    { campo: "run", titulo: "RUN" },
    { 
      campo: "fecha_nacimiento", 
      titulo: "Fecha Nacimiento",
      renderizado: (valor) => {
        if (!valor) return "";
        const fecha = new Date(valor);
        return fecha.toLocaleDateString("es-CL");
      }
    },
    { campo: "celular", titulo: "Celular" },
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
          primer_nombre: "Juan",
          segundo_nombre: "Carlos",
          primer_apellido: "Pérez",
          segundo_apellido: "Gómez",
          run: "12.345.678-9",
          fecha_nacimiento: "1980-05-15",
          sexo_biologico: "M",
          genero: "M",
          nacionalidad: "Chilena",
          estado_civil: "Casado",
          calle: "Av. Principal",
          numero: "123",
          depto: "302",
          comuna: "Santiago",
          region: "Metropolitana",
          codigo_postal: "8320000",
          telefono_fijo: "22 123 4567",
          celular: "+56 9 1234 5678",
          email: "juan.perez@ejemplo.com",
          contacto_emergencia_nombre: "María Pérez",
          contacto_emergencia_telefono: "+56 9 8765 4321",
          prevision: "Fonasa"
        },
        {
          id: 2,
          primer_nombre: "María",
          segundo_nombre: "José",
          primer_apellido: "González",
          segundo_apellido: "Silva",
          run: "9.876.543-2",
          fecha_nacimiento: "1975-11-20",
          sexo_biologico: "F",
          genero: "F",
          nacionalidad: "Chilena",
          estado_civil: "Soltera",
          calle: "Calle Secundaria",
          numero: "456",
          depto: "",
          comuna: "Concepción",
          region: "Biobío",
          codigo_postal: "4030000",
          telefono_fijo: "",
          celular: "+56 9 8765 4321",
          email: "maria.gonzalez@ejemplo.com",
          contacto_emergencia_nombre: "Pedro González",
          contacto_emergencia_telefono: "+56 9 2222 3333",
          prevision: "Isapre"
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
      primer_nombre: paciente.primer_nombre || "",
      segundo_nombre: paciente.segundo_nombre || "",
      primer_apellido: paciente.primer_apellido || "",
      segundo_apellido: paciente.segundo_apellido || "",
      run: paciente.run || "",
      fecha_nacimiento: paciente.fecha_nacimiento || "",
      sexo_biologico: paciente.sexo_biologico || "",
      genero: paciente.genero || "",
      nacionalidad: paciente.nacionalidad || "Chilena",
      estado_civil: paciente.estado_civil || "",
      foto: paciente.foto || "",
      calle: paciente.calle || "",
      numero: paciente.numero || "",
      depto: paciente.depto || "",
      comuna: paciente.comuna || "",
      region: paciente.region || "",
      codigo_postal: paciente.codigo_postal || "",
      telefono_fijo: paciente.telefono_fijo || "",
      celular: paciente.celular || "",
      email: paciente.email || "",
      contacto_emergencia_nombre: paciente.contacto_emergencia_nombre || "",
      contacto_emergencia_telefono: paciente.contacto_emergencia_telefono || "",
      prevision: paciente.prevision || ""
    });
    setModalOpen(true);
  };

  const handleVerDetalle = (paciente) => {
    setCurrentPaciente(paciente);
    // En una aplicación real, podrías redireccionar a una página de detalle o abrir un modal con detalles completos
    alert(`Detalle del paciente: ${paciente.primer_nombre} ${paciente.primer_apellido}`);
  };

  const handleEliminar = (paciente) => {
    if (window.confirm(`¿Está seguro de eliminar a ${paciente.primer_nombre} ${paciente.primer_apellido}?`)) {
      // Simulamos eliminación - en una aplicación real se haría una petición al backend
      setPacientes(prevPacientes => prevPacientes.filter(p => p.id !== paciente.id));
    }
  };

  const handleNuevoPaciente = () => {
    setCurrentPaciente(null);
    setFormData({
      id: "",
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      run: "",
      fecha_nacimiento: "",
      sexo_biologico: "",
      genero: "",
      nacionalidad: "Chilena",
      estado_civil: "",
      foto: "",
      calle: "",
      numero: "",
      depto: "",
      comuna: "",
      region: "",
      codigo_postal: "",
      telefono_fijo: "",
      celular: "",
      email: "",
      contacto_emergencia_nombre: "",
      contacto_emergencia_telefono: "",
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {currentPaciente ? "Editar Paciente" : "Nuevo Paciente"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección: Identificación General */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">1. Identificación General</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primer Nombre <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="primer_nombre"
                        value={formData.primer_nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Segundo Nombre
                      </label>
                      <input
                        type="text"
                        name="segundo_nombre"
                        value={formData.segundo_nombre}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primer Apellido <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="primer_apellido"
                        value={formData.primer_apellido}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Segundo Apellido
                      </label>
                      <input
                        type="text"
                        name="segundo_apellido"
                        value={formData.segundo_apellido}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RUN/RUT <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="run"
                        value={formData.run}
                        onChange={handleChange}
                        required
                        placeholder="12.345.678-9"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Nacimiento <span className="text-red-600">*</span>
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
                        Sexo Biológico <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="sexo_biologico"
                        value={formData.sexo_biologico}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="I">Intersexual</option>
                        <option value="O">Otro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Género Autoidentificado
                      </label>
                      <select
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="NB">No Binario</option>
                        <option value="O">Otro</option>
                        <option value="ND">Prefiero no decirlo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nacionalidad <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="nacionalidad"
                        value={formData.nacionalidad}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado Civil
                      </label>
                      <select
                        name="estado_civil"
                        value={formData.estado_civil}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccione...</option>
                        <option value="Soltero/a">Soltero/a</option>
                        <option value="Casado/a">Casado/a</option>
                        <option value="Viudo/a">Viudo/a</option>
                        <option value="Divorciado/a">Divorciado/a</option>
                        <option value="Separado/a">Separado/a</option>
                        <option value="Conviviente">Conviviente</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Previsión <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="prevision"
                        value={formData.prevision}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccione...</option>
                        <option value="Fonasa A">Fonasa A</option>
                        <option value="Fonasa B">Fonasa B</option>
                        <option value="Fonasa C">Fonasa C</option>
                        <option value="Fonasa D">Fonasa D</option>
                        <option value="Isapre">Isapre</option>
                        <option value="Particular">Particular</option>
                        <option value="Prais">PRAIS</option>
                        <option value="Dipreca">DIPRECA</option>
                        <option value="Capredena">CAPREDENA</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fotografía
                      </label>
                      <input
                        type="file"
                        name="foto"
                        accept="image/*"
                        onChange={(e) => {
                          // En un escenario real, aquí se subiría la imagen a un servidor
                          // y se guardaría la URL en el estado
                          // Por ahora sólo actualizamos el nombre del archivo en la UI
                          setFormData({
                            ...formData,
                            foto: e.target.files[0]?.name || ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.foto && (
                        <p className="text-sm text-gray-500 mt-1">Archivo seleccionado: {formData.foto}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Sección: Información de Contacto */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">2. Información de Contacto</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calle <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="calle"
                        value={formData.calle}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento/Casa
                      </label>
                      <input
                        type="text"
                        name="depto"
                        value={formData.depto}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comuna <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="comuna"
                        value={formData.comuna}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Región <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccione...</option>
                        <option value="Arica y Parinacota">Arica y Parinacota</option>
                        <option value="Tarapacá">Tarapacá</option>
                        <option value="Antofagasta">Antofagasta</option>
                        <option value="Atacama">Atacama</option>
                        <option value="Coquimbo">Coquimbo</option>
                        <option value="Valparaíso">Valparaíso</option>
                        <option value="Metropolitana">Metropolitana de Santiago</option>
                        <option value="O'Higgins">Libertador General Bernardo O'Higgins</option>
                        <option value="Maule">Maule</option>
                        <option value="Ñuble">Ñuble</option>
                        <option value="Biobío">Biobío</option>
                        <option value="Araucanía">La Araucanía</option>
                        <option value="Los Ríos">Los Ríos</option>
                        <option value="Los Lagos">Los Lagos</option>
                        <option value="Aysén">Aysén del General Carlos Ibáñez del Campo</option>
                        <option value="Magallanes">Magallanes y de la Antártica Chilena</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        name="codigo_postal"
                        value={formData.codigo_postal}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono Fijo
                      </label>
                      <input
                        type="tel"
                        name="telefono_fijo"
                        value={formData.telefono_fijo}
                        onChange={handleChange}
                        placeholder="22 123 4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Celular <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        name="celular"
                        value={formData.celular}
                        onChange={handleChange}
                        required
                        placeholder="+56 9 1234 5678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
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
                        Contacto de Emergencia (Nombre) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="contacto_emergencia_nombre"
                        value={formData.contacto_emergencia_nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contacto de Emergencia (Teléfono) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        name="contacto_emergencia_telefono"
                        value={formData.contacto_emergencia_telefono}
                        onChange={handleChange}
                        required
                        placeholder="+56 9 1234 5678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
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