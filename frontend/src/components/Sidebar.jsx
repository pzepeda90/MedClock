import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../providers/UserProvider";
import MedClockLogo from "./MedClockLogo";

// Componente para permisos basados en rol
export function PermisoRol({ roles, children }) {
  const { user } = useContext(UserContext);
  
  if (!user || !roles.includes(user.rol)) {
    return null;
  }
  
  return children;
}

export default function Sidebar({ className, closeSidebar }) {
  const { user } = useContext(UserContext);
  const location = useLocation();

  // Función para determinar si un link está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Estilo para links activos e inactivos
  const linkBaseClass = "flex items-center gap-3 p-3 rounded-lg transition-colors";
  const linkActiveClass = "bg-blue-100 text-blue-700";
  const linkInactiveClass = "hover:bg-gray-100";

  return (
    <aside className={`bg-white border-r border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col h-full">
        {/* Logo en el sidebar */}
        <div className="mb-6 py-2 flex justify-center border-b border-gray-200">
          <MedClockLogo size="small" vertical={true} />
        </div>
        
        <div className="space-y-1 flex-grow">
          <Link
            to="/dashboard"
            className={`${linkBaseClass} ${isActive("/dashboard") ? linkActiveClass : linkInactiveClass}`}
            onClick={closeSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          
          <Link
            to="/calendario"
            className={`${linkBaseClass} ${isActive("/calendario") ? linkActiveClass : linkInactiveClass}`}
            onClick={closeSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendario
          </Link>
          
          <PermisoRol roles={['admin', 'medico', 'recepcionista']}>
            <Link
              to="/pacientes"
              className={`${linkBaseClass} ${isActive("/pacientes") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pacientes
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['admin', 'recepcionista']}>
            <Link
              to="/medicos"
              className={`${linkBaseClass} ${isActive("/medicos") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Médicos
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['admin', 'medico', 'recepcionista']}>
            <Link
              to="/citas"
              className={`${linkBaseClass} ${isActive("/citas") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Citas
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['admin']}>
            <Link
              to="/usuarios"
              className={`${linkBaseClass} ${isActive("/usuarios") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Usuarios
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['admin']}>
            <Link
              to="/reportes"
              className={`${linkBaseClass} ${isActive("/reportes") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reportes
            </Link>
          </PermisoRol>
        </div>
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {user?.rol && (
              <div className="uppercase font-semibold">
                Rol: {user.rol}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
} 