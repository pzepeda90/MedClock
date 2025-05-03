import { useState, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import MainLayout from "../components/MainLayout";

// Este componente se puede reemplazar con una librería de calendario real
// como FullCalendar o react-big-calendar
const CalendarioPlaceholder = ({ vista }) => {
  const vistaTitulo = {
    mensual: "Vista Mensual",
    semanal: "Vista Semanal",
    diario: "Vista Diaria"
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-[600px] flex flex-col">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">{vistaTitulo[vista]}</h3>
        <p className="text-gray-500">Noviembre 2023</p>
      </div>
      
      <div className="flex-grow border border-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-4">Calendario {vista}</p>
          <p className="text-gray-500">Aquí se mostrará el componente real del calendario con la vista {vista}</p>
          <p className="text-sm text-gray-400 mt-4">Se recomienda implementar con FullCalendar o react-big-calendar</p>
        </div>
      </div>
    </div>
  );
};

export default function CalendarioWrapper() {
  const { user } = useContext(UserContext);
  const [vista, setVista] = useState("mensual"); // mensual, semanal, diario
  
  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Calendario</h1>
            <p className="text-gray-600">
              Gestiona y visualiza todas las citas programadas
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                vista === "mensual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
              onClick={() => setVista("mensual")}
            >
              Mensual
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                vista === "semanal"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
              onClick={() => setVista("semanal")}
            >
              Semanal
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                vista === "diario"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
              onClick={() => setVista("diario")}
            >
              Diario
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold">Noviembre 2023</h2>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="ml-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
              Hoy
            </button>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <button className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Cita
            </button>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar citas..."
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <CalendarioPlaceholder vista={vista} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Próximas Citas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Juan Pérez</td>
                    <td className="px-4 py-3 whitespace-nowrap">15/11/2023</td>
                    <td className="px-4 py-3 whitespace-nowrap">10:30</td>
                    <td className="px-4 py-3 whitespace-nowrap">Dra. González</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">Editar</button>
                      <button className="text-red-600 hover:text-red-800">Cancelar</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">María López</td>
                    <td className="px-4 py-3 whitespace-nowrap">15/11/2023</td>
                    <td className="px-4 py-3 whitespace-nowrap">11:15</td>
                    <td className="px-4 py-3 whitespace-nowrap">Dr. Sánchez</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmada</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">Editar</button>
                      <button className="text-red-600 hover:text-red-800">Cancelar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Filtros</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médico
                </label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="">Todos los médicos</option>
                  <option>Dra. González</option>
                  <option>Dr. Sánchez</option>
                  <option>Dra. Martínez</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Cita
                </label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="">Todos los tipos</option>
                  <option>Primera visita</option>
                  <option>Control</option>
                  <option>Urgencia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="pendiente"
                      name="estado"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="pendiente" className="ml-2 block text-sm text-gray-700">
                      Pendiente
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="confirmada"
                      name="estado"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="confirmada" className="ml-2 block text-sm text-gray-700">
                      Confirmada
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="completada"
                      name="estado"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="completada" className="ml-2 block text-sm text-gray-700">
                      Completada
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="cancelada"
                      name="estado"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="cancelada" className="ml-2 block text-sm text-gray-700">
                      Cancelada
                    </label>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 