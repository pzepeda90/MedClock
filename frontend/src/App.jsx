import { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProcedimientosPanel from "./pages/ProcedimientosPanel";
import ProcedimientosMedico from "./pages/ProcedimientosMedico";
import Calendario from "./pages/CalendarioWrapper";
import { UserContext } from "./providers/UserProvider";

import HomePage from "./pages/Home";
import RegisterPage from "./pages/Register";
import Pacientes from "./pages/Pacientes";
import Medicos from "./pages/Medicos";
import Citas from "./pages/Citas";
import Perfil from "./pages/Perfil";
import Usuarios from "./pages/Usuarios";
import CodigosProcedimiento from "./pages/CodigosProcedimiento";
import PagosMedico from "./pages/PagosMedico";
import GestionPagos from "./pages/GestionPagos";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route 
        path="/dashboard" 
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } 
      />
      
      <Route 
        path="/calendario" 
        element={
          <RequireAuth>
            <Calendario />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/procedimientos" 
        element={
          <RequireAuth requireAdmin={true}>
            <ProcedimientosPanel />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/mis-procedimientos" 
        element={
          <RequireAuth requireMedico={true}>
            <ProcedimientosMedico />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/codigos-procedimientos" 
        element={
          <RequireAuth requireAdmin={true}>
            <CodigosProcedimiento />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/mis-pagos" 
        element={
          <RequireAuth requireMedico={true}>
            <PagosMedico />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/pagos" 
        element={
          <RequireAuth requireAdmin={true}>
            <GestionPagos />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/pacientes"
        element={
          <RequireAuth>
            <Pacientes />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/medicos"
        element={
          <RequireAuth>
            <Medicos />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/citas"
        element={
          <RequireAuth>
            <Citas />
          </RequireAuth>
        } 
      />
      
      <Route
        path="/perfil"
        element={
          <RequireAuth>
            <Perfil />
          </RequireAuth>
        } 
      />
      
      <Route 
        path="/usuarios" 
        element={
          <RequireAuth requireAdmin={true}>
            <Usuarios />
          </RequireAuth>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Componente para proteger rutas
function RequireAuth({ children, requireAdmin = false, requireMedico = false }) {
  const { user, loading } = useContext(UserContext);
  
  // Mientras se carga el usuario, mostramos un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Si se requiere rol de admin, verificar
  if (requireAdmin && user.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si se requiere rol de médico, verificar
  if (requireMedico && user.rol !== 'medico' && user.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default App;
