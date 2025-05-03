import { useState, useEffect, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";
import TablaGeneral from "../components/TablaGeneral";

export default function Citas() {
  const { user } = useContext(UserContext);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCita, setCurrentCita] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    paciente_id: "",
    medico_id: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
    estado: "programada"
  });

  // Columnas para la tabla
  const columnas = [
    { 
      campo: "paciente", 
      titulo: "Paciente",
      renderizado: (valor) => `${valor.nombre} ${valor.apellido}`
    },
    { 
      campo: "medico", 
      titulo: "Médico",
      renderizado: (valor) => `Dr. ${valor.nombre} ${valor.apellido}`
    },
    { 
      campo: "fecha", 
      titulo: "Fecha",
      renderizado: (valor) => {
        if (!valor) return "";
        const fecha = new Date(valor);
        return fecha.toLocaleDateString("es-CL");
      }
    },
    { 
      campo: "hora_inicio", 
      titulo: "Hora Inicio" 
    },
    { 
      campo: "hora_fin", 
      titulo: "Hora Fin" 
    },
    { 
      campo: "estado", 
      titulo: "Estado",
      renderizado: (valor) => {
        const estados = {
          programada: <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Programada</span>,
          completada: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completada</span>,
          cancelada: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Cancelada</span>,
          ausente: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Ausente</span>
        };
        return estados[valor] || valor;
      }
    }
  ];

  // Cargar datos simulados
  useEffect(() => {
    setTimeout(() => {
      // Datos de médicos
      const medicosMock = [
        {
          id: 1,
          nombre: "Ana",
          apellido: "Martínez",
          especialidad: "Cardiología"
        },
        {
          id: 2,
          nombre: "Roberto",
          apellido: "Sánchez",
          especialidad: "Dermatología"
        },
        {
          id: 3,
          nombre: "Carolina",
          apellido: "Muñoz",
          especialidad: "Pediatría"
        }
      ];
      
      // Datos de pacientes
      const pacientesMock = [
        {
          id: 1,
          nombre: "Juan",
          apellido: "Pérez",
          rut: "12.345.678-9"
        },
        {
          id: 2,
          nombre: "María",
          apellido: "González",
          rut: "9.876.543-2"
        },
        {
          id: 3,
          nombre: "Carlos",
          apellido: "Rodríguez",
          rut: "15.678.901-3"
        }
      ];
      
      // Datos de citas
      const citasMock = [
        {
          id: 1,
          paciente_id: 1,
          medico_id: 3,
          paciente: pacientesMock[0],
          medico: medicosMock[2],
          fecha: "2023-11-25",
          hora_inicio: "09:00",
          hora_fin: "09:30",
          motivo: "Control mensual",
          estado: "programada"
        },
        {
          id: 2,
          paciente_id: 2,
          medico_id: 1,
          paciente: pacientesMock[1],
          medico: medicosMock[0],
          fecha: "2023-11-26",
          hora_inicio: "10:00",
          hora_fin: "10:30",
          motivo: "Consulta por dolor en el pecho",
          estado: "programada"
        },
        {
          id: 3,
          paciente_id: 3,
          medico_id: 2,
          paciente: pacientesMock[2],
          medico: medicosMock[1],
          fecha: "2023-11-24",
          hora_inicio: "15:00",
          hora_fin: "15:30",
          motivo: "Revisión dermatológica",
          estado: "completada"
        },
        {
          id: 4,
          paciente_id: 1,
          medico_id: 3,
          paciente: pacientesMock[0],
          medico: medicosMock[2],
          fecha: "2023-11-20",
          hora_inicio: "11:00",
          hora_fin: "11:30",
          motivo: "Vacunación",
          estado: "cancelada"
        }
      ];
      
      setCitas(citasMock);
      setPacientes(pacientesMock);
      setMedicos(medicosMock);
      setLoading(false);
    }, 1000);
  }, []);

  // Acciones para la tabla
  const acciones = (cita) => {
    return (
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => handleEditar(cita)}
          className="text-blue-600 hover:text-blue-800"
        >
          Editar
        </button>
        <button 
          onClick={() => handleVerDetalle(cita)}
          className="text-green-600 hover:text-green-800"
        >
          Ver
        </button>
        <button 
          onClick={() => handleEliminar(cita)}
          className="text-red-600 hover:text-red-800"
        >
          Eliminar
        </button>
      </div>
    );
  };

  // Manejadores de acciones
  const handleEditar = (cita) => {
    setCurrentCita(cita);
    setFormData({
      id: cita.id,
      paciente_id: cita.paciente_id,
      medico_id: cita.medico_id,
      fecha: cita.fecha,
      hora_inicio: cita.hora_inicio,
      hora_fin: cita.hora_fin,
      motivo: cita.motivo,
      estado: cita.estado
    });
    setModalOpen(true);
  };

  const handleVerDetalle = (cita) => {
    setCurrentCita(cita);
    alert(`Cita: ${cita.paciente.nombre} ${cita.paciente.apellido} con Dr(a). ${cita.medico.nombre} ${cita.medico.apellido} el ${new Date(cita.fecha).toLocaleDateString("es-CL")} a las ${cita.hora_inicio}`);
  };

  const handleEliminar = (cita) => {
    if (window.confirm(`¿Está seguro de eliminar la cita de ${cita.paciente.nombre} ${cita.paciente.apellido}?`)) {
      // Simulamos eliminación
      setCitas(prevCitas => prevCitas.filter(c => c.id !== cita.id));
    }
  };

  const handleNuevaCita = () => {
    setCurrentCita(null);
    setFormData({
      id: "",
      paciente_id: "",
      medico_id: "",
      fecha: "",
      hora_inicio: "",
      hora_fin: "",
      motivo: "",
      estado: "programada"
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
    
    const paciente = pacientes.find(p => p.id.toString() === formData.paciente_id.toString());
    const medico = medicos.find(m => m.id.toString() === formData.medico_id.toString());
    
    if (currentCita) {
      // Actualizar cita existente
      setCitas(prevCitas => 
        prevCitas.map(c => c.id === currentCita.id ? {
          ...formData,
          paciente,
          medico
        } : c)
      );
    } else {
      // Crear nueva cita
      const newId = Math.max(0, ...citas.map(c => c.id)) + 1;
      setCitas(prevCitas => [
        ...prevCitas,
        {
          ...formData,
          id: newId,
          paciente,
          medico
        }
      ]);
    }
    
    setModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Citas Médicas</h1>
            <p className="text-gray-600">
              Gestiona las citas médicas de la clínica
            </p>
          </div>
          
          <button
            onClick={handleNuevaCita}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nueva Cita
          </button>
        </div>
      </div>
      
      <TablaGeneral
        titulo="Listado de Citas"
        columnas={columnas}
        datos={citas}
        acciones={acciones}
        cargando={loading}
        busqueda={true}
        paginacion={true}
        itemsPorPagina={10}
      />
      
      {/* Modal para crear/editar cita */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {currentCita ? "Editar Cita" : "Nueva Cita"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paciente
                    </label>
                    <select
                      name="paciente_id"
                      value={formData.paciente_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione paciente...</option>
                      {pacientes.map(paciente => (
                        <option key={paciente.id} value={paciente.id}>
                          {paciente.nombre} {paciente.apellido} - {paciente.rut}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Médico
                    </label>
                    <select
                      name="medico_id"
                      value={formData.medico_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione médico...</option>
                      {medicos.map(medico => (
                        <option key={medico.id} value={medico.id}>
                          Dr. {medico.nombre} {medico.apellido} - {medico.especialidad}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora Inicio
                      </label>
                      <input
                        type="time"
                        name="hora_inicio"
                        value={formData.hora_inicio}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora Fin
                      </label>
                      <input
                        type="time"
                        name="hora_fin"
                        value={formData.hora_fin}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo
                    </label>
                    <textarea
                      name="motivo"
                      value={formData.motivo}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="programada">Programada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="ausente">Ausente</option>
                    </select>
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
                    {currentCita ? "Actualizar" : "Crear"}
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