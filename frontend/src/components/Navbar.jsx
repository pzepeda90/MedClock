import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../providers/UserProvider";

export default function Navbar({ className, toggleSidebar }) {
  const { user, token, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={`bg-blue-600 text-white p-4 shadow-md ${className}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {token && (
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded hover:bg-blue-700 transition-colors"
              aria-label="Menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to="/" className="text-xl font-bold">Agenda Médica</Link>
        </div>

        <div className="flex items-center gap-4">
          {token ? (
            <>
              <span className="hidden md:inline-block">
                Bienvenido, {user?.nombre || "Usuario"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
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