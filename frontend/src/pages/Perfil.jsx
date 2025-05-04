import { useState, useContext, useEffect } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";
import Avatar from "../components/Avatar";

// Formulario de perfil general para todos los usuarios
const PerfilGeneral = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    direccion: user?.direccion || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...user,
      ...formData
    });
    alert("Perfil actualizado con éxito");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Información Personal</h3>
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};

// Componente específico para médicos
const PerfilMedico = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    especialidad: user?.especialidad || "",
    subespecialidad: user?.subespecialidad || "",
    estudios: user?.estudios || "",
    curriculum: user?.curriculum || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...user,
      ...formData
    });
    alert("Perfil profesional actualizado con éxito");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold border-b pb-2">Información Profesional</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            required
          />
        </div>
        
        <div>
          <label htmlFor="subespecialidad" className="block text-sm font-medium text-gray-700 mb-1">
            Subespecialidad
          </label>
          <input
            type="text"
            id="subespecialidad"
            name="subespecialidad"
            value={formData.subespecialidad}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="estudios" className="block text-sm font-medium text-gray-700 mb-1">
          Estudios y Certificaciones
        </label>
        <textarea
          id="estudios"
          name="estudios"
          value={formData.estudios}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="curriculum" className="block text-sm font-medium text-gray-700 mb-1">
          Currículum Abreviado
        </label>
        <textarea
          id="curriculum"
          name="curriculum"
          value={formData.curriculum}
          onChange={handleChange}
          rows="5"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">
          Este texto se mostrará en su perfil público.
        </p>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Guardar Información Profesional
        </button>
      </div>
    </form>
  );
};

// Componente específico para recepcionistas
const PerfilRecepcionista = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    turno: user?.turno || "mañana",
    area: user?.area || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...user,
      ...formData
    });
    alert("Información de trabajo actualizada con éxito");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold border-b pb-2">Información de Trabajo</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="turno" className="block text-sm font-medium text-gray-700 mb-1">
            Turno de Trabajo
          </label>
          <select
            id="turno"
            name="turno"
            value={formData.turno}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
            <option value="rotativo">Rotativo</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
            Área de Trabajo
          </label>
          <input
            type="text"
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Guardar Información
        </button>
      </div>
    </form>
  );
};

// Componente específico para pacientes
const PerfilPaciente = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    fechaNacimiento: user?.fechaNacimiento || "",
    genero: user?.genero || "",
    contactoEmergencia: user?.contactoEmergencia || "",
    telefonoEmergencia: user?.telefonoEmergencia || "",
    grupoSanguineo: user?.grupoSanguineo || "",
    alergias: user?.alergias || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...user,
      ...formData
    });
    alert("Información médica actualizada con éxito");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold border-b pb-2">Información Médica</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">
            Género
          </label>
          <select
            id="genero"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="otro">Otro</option>
            <option value="prefiero-no-decir">Prefiero no decirlo</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contactoEmergencia" className="block text-sm font-medium text-gray-700 mb-1">
            Contacto de Emergencia
          </label>
          <input
            type="text"
            id="contactoEmergencia"
            name="contactoEmergencia"
            value={formData.contactoEmergencia}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="telefonoEmergencia" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono de Emergencia
          </label>
          <input
            type="tel"
            id="telefonoEmergencia"
            name="telefonoEmergencia"
            value={formData.telefonoEmergencia}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="grupoSanguineo" className="block text-sm font-medium text-gray-700 mb-1">
            Grupo Sanguíneo
          </label>
          <select
            id="grupoSanguineo"
            name="grupoSanguineo"
            value={formData.grupoSanguineo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="alergias" className="block text-sm font-medium text-gray-700 mb-1">
          Alergias
        </label>
        <textarea
          id="alergias"
          name="alergias"
          value={formData.alergias}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Lista de alergias conocidas"
        ></textarea>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Guardar Información Médica
        </button>
      </div>
    </form>
  );
};

// Componente específico para administradores
const PerfilAdmin = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    departamento: user?.departamento || "",
    nivelAcceso: user?.nivelAcceso || "completo"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...user,
      ...formData
    });
    alert("Información administrativa actualizada con éxito");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold border-b pb-2">Información Administrativa</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-1">
            Departamento
          </label>
          <input
            type="text"
            id="departamento"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="nivelAcceso" className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de Acceso
          </label>
          <select
            id="nivelAcceso"
            name="nivelAcceso"
            value={formData.nivelAcceso}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="completo">Completo</option>
            <option value="parcial">Parcial</option>
            <option value="restringido">Restringido</option>
          </select>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Guardar Información Administrativa
        </button>
      </div>
    </form>
  );
};

// Componente principal de la página de perfil
export default function Perfil() {
  const { user, changeRole } = useContext(UserContext);
  const [userData, setUserData] = useState(user);

  // Actualizar datos del usuario cuando cambia el contexto
  useEffect(() => {
    setUserData(user);
  }, [user]);

  // Función para actualizar el perfil del usuario
  const handleUpdateUser = (updatedData) => {
    // En un caso real, aquí se enviarían los datos al backend
    // Simulamos una actualización local para el desarrollo
    setUserData(updatedData);
    
    // Si el rol cambió, actualizamos también el contexto
    if (updatedData.rol !== user.rol) {
      changeRole(updatedData.rol);
    }
  };

  // Renderizar componentes específicos según el rol
  const renderRoleSpecificForm = () => {
    switch (userData?.rol) {
      case 'medico':
        return <PerfilMedico user={userData} onUpdate={handleUpdateUser} />;
      case 'recepcionista':
        return <PerfilRecepcionista user={userData} onUpdate={handleUpdateUser} />;
      case 'paciente':
        return <PerfilPaciente user={userData} onUpdate={handleUpdateUser} />;
      case 'admin':
        return <PerfilAdmin user={userData} onUpdate={handleUpdateUser} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
        <p className="text-gray-600">
          Gestiona tu información personal y profesional
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Cabecera con avatar */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-6 border-b border-gray-200">
          <div className="relative group p-0 border-0 bg-transparent">
            <Avatar user={userData} size="xl" />
            
            <label className="cursor-pointer absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // En un escenario real, aquí se subiría la imagen a un servidor
                    // Por ahora, convertimos el archivo a una URL de datos para mostrarla
                    const reader = new FileReader();
                    reader.onload = () => {
                      handleUpdateUser({
                        ...userData,
                        foto: reader.result
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{userData?.nombre} {userData?.apellido}</h2>
            <p className="text-gray-600">{userData?.email}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                userData?.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                userData?.rol === 'medico' ? 'bg-blue-100 text-blue-800' :
                userData?.rol === 'recepcionista' ? 'bg-green-100 text-green-800' :
                userData?.rol === 'paciente' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {userData?.rol === 'admin' ? 'Administrador' :
                userData?.rol === 'medico' ? 'Médico' :
                userData?.rol === 'recepcionista' ? 'Recepcionista' :
                userData?.rol === 'paciente' ? 'Paciente' :
                'Usuario'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Información general para todos los usuarios */}
        <PerfilGeneral user={userData} onUpdate={handleUpdateUser} />
        
        {/* Componente específico según el rol */}
        {renderRoleSpecificForm()}
      </div>
    </MainLayout>
  );
} 