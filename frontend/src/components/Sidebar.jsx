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
          
          <PermisoRol roles={['medico']}>
            <Link
              to="/mis-procedimientos"
              className={`${linkBaseClass} ${isActive("/mis-procedimientos") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Mis Procedimientos
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['medico']}>
            <Link
              to="/mis-pagos"
              className={`${linkBaseClass} ${isActive("/mis-pagos") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mis Pagos
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['admin']}>
            <Link
              to="/procedimientos"
              className={`${linkBaseClass} ${isActive("/procedimientos") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Panel Procedimientos
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['admin']}>
            <Link
              to="/codigos-procedimientos"
              className={`${linkBaseClass} ${isActive("/codigos-procedimientos") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Códigos Procedimientos
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['admin']}>
            <Link
              to="/pagos"
              className={`${linkBaseClass} ${isActive("/pagos") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Gestión de Pagos
            </Link>
          </PermisoRol>
          
          <PermisoRol roles={['admin']}>
            <Link
              to="/usuarios"
              className={`${linkBaseClass} ${isActive("/usuarios") ? linkActiveClass : linkInactiveClass}`}
              onClick={closeSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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