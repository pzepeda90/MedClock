import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../providers/UserProvider";
import Avatar from "./Avatar";
import MedClockLogo from "./MedClockLogo";

export default function Navbar({ className, toggleSidebar }) {
  const { user, token, logout, changeRole } = useContext(UserContext);
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const roleMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const roles = [
    { id: "admin", nombre: "Administrador" },
    { id: "medico", nombre: "Médico" },
    { id: "recepcionista", nombre: "Recepcionista" },
    { id: "paciente", nombre: "Paciente" }
  ];

  // Cerrar los menús cuando se hace clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setRoleMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRoleChange = (role) => {
    changeRole(role);
    setRoleMenuOpen(false);
  };

  // La navegación al perfil ahora se maneja directamente con el componente Link

  return (
    <nav className={`bg-white text-gray-800 p-3 shadow-md ${className}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {token && (
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to="/" className="flex items-center">
            <MedClockLogo size="default" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {token ? (
            <>
              {/* Selector de roles (solo para desarrollo) */}
              <div className="relative" ref={roleMenuRef}>
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <span className="hidden md:inline-block">
                    Rol: {user?.rol || "Usuario"}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 font-semibold border-b">
                      Cambiar rol (desarrollo)
                    </div>
                    {roles.map(role => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleChange(role.id)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          user?.rol === role.id 
                            ? 'bg-blue-100 text-blue-800 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {role.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de perfil de usuario */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="p-0 border-0 bg-transparent hover:opacity-90 transition-opacity focus:outline-none"
                  aria-label="Perfil"
                >
                  <Avatar user={user} size="md" />
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                      {user?.nombre} {user?.apellido}
                      <div className="text-xs font-normal text-gray-500 mt-1">{user?.email}</div>
                    </div>
                    <Link
                      to="/perfil"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Ver perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 