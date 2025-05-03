import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { UserContext } from "./providers/UserProvider";

import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CalendarioWrapper from "./pages/CalendarioWrapper";
import Pacientes from "./pages/Pacientes";
import Medicos from "./pages/Medicos";
import Citas from "./pages/Citas";

const App = () => {
  const { token } = useContext(UserContext);

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" /> : <RegisterPage />}
      />
      
      {/* Rutas protegidas */}
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/calendario"
        element={token ? <CalendarioWrapper /> : <Navigate to="/login" />}
      />
      <Route
        path="/pacientes"
        element={token ? <Pacientes /> : <Navigate to="/login" />}
      />
      <Route
        path="/medicos"
        element={token ? <Medicos /> : <Navigate to="/login" />}
      />
      <Route
        path="/citas"
        element={token ? <Citas /> : <Navigate to="/login" />}
      />
      
      {/* Ruta de fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
