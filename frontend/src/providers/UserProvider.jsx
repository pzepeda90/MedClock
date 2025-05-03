import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

// const BASE_URL = import.meta.env.VITE_BASE_URL;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar si hay token
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // En una implementación real, aquí se haría una llamada a la API
          // para obtener los datos del usuario autenticado
          
          // Simulamos una respuesta para desarrollo
          // TODO: Reemplazar con llamada real a la API
          const mockUser = {
            id: 1,
            nombre: "Juan",
            apellido: "Pérez",
            email: "juan@example.com",
            rol: "admin", // "admin", "medico" o "recepcionista"
          };
          
          setUser(mockUser);
        } catch (error) {
          console.error("Error al cargar usuario:", error);
          localStorage.removeItem("token");
          setToken("");
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí se haría una llamada a la API
      // para autenticar al usuario y obtener un token
      
      // Simulamos una respuesta para desarrollo
      // TODO: Reemplazar con llamada real a la API
      
      // Para propósitos de prueba, aceptamos cualquier email/password
      const mockResponse = {
        token: "mock-jwt-token",
        user: {
          id: 1,
          nombre: "Juan",
          apellido: "Pérez",
          email,
          rol: "admin", // Puedes cambiar esto para probar diferentes roles
        },
      };
      
      const { token: newToken, user: userData } = mockResponse;
      
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí se haría una llamada a la API
      // para registrar al usuario
      
      // Simulamos una respuesta para desarrollo
      // TODO: Reemplazar con llamada real a la API
      const mockUser = {
        id: 2,
        ...userData,
        rol: "recepcionista", // Por defecto, los nuevos usuarios son recepcionistas
      };
      
      // En un escenario real, aquí no iniciaríamos sesión automáticamente
      // pero podríamos redirigir al login
      
      return true;
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
