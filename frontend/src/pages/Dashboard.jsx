import { useContext, useState, useEffect } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";

// Componentes específicos según rol
const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Pacientes</h3>
          <p className="text-3xl font-bold">1,248</p>
          <p className="text-blue-100 mt-2">+18 en los últimos 30 días</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold">24</p>
          <p className="text-green-100 mt-2">3 completadas, 21 pendientes</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Médicos Activos</h3>
          <p className="text-3xl font-bold">8</p>
          <p className="text-purple-100 mt-2">2 ausentes hoy</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Próximas Citas</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">Juan Pérez</td>
                  <td className="px-4 py-3 whitespace-nowrap">Dra. González</td>
                  <td className="px-4 py-3 whitespace-nowrap">Hoy, 10:30</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">María López</td>
                  <td className="px-4 py-3 whitespace-nowrap">Dr. Sánchez</td>
                  <td className="px-4 py-3 whitespace-nowrap">Hoy, 11:15</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">Carlos Ruiz</td>
                  <td className="px-4 py-3 whitespace-nowrap">Dra. Martínez</td>
                  <td className="px-4 py-3 whitespace-nowrap">Hoy, 12:00</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <a href="/calendario" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todas las citas →
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen Mensual</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Gráfico de estadísticas mensuales</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-sm">Total Citas</p>
              <p className="text-lg font-semibold">425</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cancelaciones</p>
              <p className="text-lg font-semibold">32</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pacientes Nuevos</p>
              <p className="text-lg font-semibold">48</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicoDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold">12</p>
          <p className="text-blue-100 mt-2">2 completadas, 10 pendientes</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Pacientes Asignados</h3>
          <p className="text-3xl font-bold">156</p>
          <p className="text-green-100 mt-2">3 nuevos esta semana</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Horas Trabajadas</h3>
          <p className="text-3xl font-bold">32h</p>
          <p className="text-purple-100 mt-2">Esta semana</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Próximos Pacientes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">Juan Pérez</td>
                  <td className="px-4 py-3 whitespace-nowrap">10:30</td>
                  <td className="px-4 py-3 whitespace-nowrap">Control</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">María López</td>
                  <td className="px-4 py-3 whitespace-nowrap">11:15</td>
                  <td className="px-4 py-3 whitespace-nowrap">Primera Visita</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">Carlos Ruiz</td>
                  <td className="px-4 py-3 whitespace-nowrap">12:00</td>
                  <td className="px-4 py-3 whitespace-nowrap">Urgencia</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <a href="/calendario" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todas las citas →
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Historial Reciente</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">Juan Pérez - Control Diabetes</p>
              <p className="text-sm text-gray-500">Ayer, 14:30</p>
              <p className="text-sm mt-1">Se ajustó medicación. Programar control en 2 semanas.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">Ana Torres - Primera Consulta</p>
              <p className="text-sm text-gray-500">Hace 2 días, 10:00</p>
              <p className="text-sm mt-1">Nuevos análisis solicitados. Seguimiento telefónico.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">Roberto Núñez - Dolor Lumbar</p>
              <p className="text-sm text-gray-500">Hace 3 días, 16:45</p>
              <p className="text-sm mt-1">Derivado a fisioterapia. Receta para analgésicos.</p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <a href="/consultas" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver historial completo →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecepcionistaDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold">24</p>
          <p className="text-blue-100 mt-2">3 completadas, 21 pendientes</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Llegadas Confirmadas</h3>
          <p className="text-3xl font-bold">16</p>
          <p className="text-green-100 mt-2">8 pendientes de confirmar</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Médicos Disponibles</h3>
          <p className="text-3xl font-bold">6</p>
          <p className="text-purple-100 mt-2">De 8 programados</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Agenda del Día</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">Juan Pérez</td>
                <td className="px-4 py-3 whitespace-nowrap">Dra. González</td>
                <td className="px-4 py-3 whitespace-nowrap">10:30</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Confirmar</button>
                  <button className="text-red-600 hover:text-red-800">Cancelar</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">María López</td>
                <td className="px-4 py-3 whitespace-nowrap">Dr. Sánchez</td>
                <td className="px-4 py-3 whitespace-nowrap">11:15</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Check-in</button>
                  <button className="text-red-600 hover:text-red-800">Cancelar</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">Carlos Ruiz</td>
                <td className="px-4 py-3 whitespace-nowrap">Dra. Martínez</td>
                <td className="px-4 py-3 whitespace-nowrap">12:00</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">En Espera</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Pasar</button>
                  <button className="text-red-600 hover:text-red-800">Cancelar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Próximas 48 horas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <p className="font-medium">Mañana</p>
                <p className="text-sm text-gray-500">28 citas programadas</p>
              </div>
              <a href="/calendario" className="text-blue-600 hover:text-blue-800">
                Ver detalles
              </a>
            </div>
            
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <p className="font-medium">Pasado mañana</p>
                <p className="text-sm text-gray-500">22 citas programadas</p>
              </div>
              <a href="/calendario" className="text-blue-600 hover:text-blue-800">
                Ver detalles
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Cita
            </button>
            
            <button className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Nuevo Paciente
            </button>
            
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamadas
            </button>
            
            <button className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Dashboard principal
export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Renderizado condicional según el rol del usuario
  const renderDashboardByRole = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    switch (user?.rol) {
      case 'admin':
        return <AdminDashboard />;
      case 'medico':
        return <MedicoDashboard />;
      case 'recepcionista':
        return <RecepcionistaDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700">Bienvenido a Agenda Médica</h2>
            <p className="mt-2 text-gray-500">No se ha definido un rol para tu usuario.</p>
          </div>
        );
    }
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, {user?.nombre || "Usuario"}. Aquí tienes un resumen de tu actividad.
        </p>
      </div>
      
      {renderDashboardByRole()}
    </MainLayout>
  );
} 