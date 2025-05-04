import { useState, useEffect, useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Componente para mostrar el historial de cambios en pagos
const AuditoriaPagos = ({ idPago, onClose }) => {
  const { token } = useContext(UserContext);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerHistorial = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/pagos/${idPago}/auditoria`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setHistorial(res.data.historial || []);
      } catch (err) {
        console.error("Error al obtener historial de pago:", err);
        setError("No se pudo cargar el historial de auditoría");
      } finally {
        setLoading(false);
      }
    };

    if (idPago) {
      obtenerHistorial();
    }
  }, [idPago, token]);

  // Formatear fecha completa con hora
  const formatearFechaHora = (fechaStr) => {
    if (!fechaStr) return "Fecha no disponible";
    try {
      const fecha = new Date(fechaStr);
      return format(fecha, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm:ss", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Determinar el tipo de cambio para mostrar un icono adecuado
  const getIconoCambio = (tipoCambio) => {
    switch (tipoCambio) {
      case "creacion":
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "actualizacion":
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
        );
      case "pago":
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "anulacion":
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "asignacion_codigo":
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Generar descripción de cambios
  const getDescripcionCambio = (cambio) => {
    switch (cambio.tipo_cambio) {
      case "creacion":
        return "Se creó el registro de pago";
      case "actualizacion":
        return `Se actualizó el pago (${cambio.detalles || 'sin detalles'})`;
      case "pago":
        return `Se registró el pago por $${parseFloat(cambio.monto).toLocaleString('es-CL')} con método ${cambio.metodo_pago || 'no especificado'}`;
      case "anulacion":
        return `Se anuló el pago (${cambio.motivo || 'sin motivo especificado'})`;
      case "asignacion_codigo":
        return `Se asignó el código ${cambio.codigo_procedimiento || 'N/A'} (${cambio.nombre_codigo || 'sin nombre'})`;
      default:
        return cambio.descripcion || "Se realizó un cambio en el pago";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Historial de Auditoría</h3>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay registros de auditoría disponibles para este pago.
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {historial.map((cambio, idx) => (
                <li key={idx}>
                  <div className="relative pb-8">
                    {idx !== historial.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>{getIconoCambio(cambio.tipo_cambio)}</div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-800">{getDescripcionCambio(cambio)}</p>
                          {cambio.usuario && (
                            <p className="mt-1 text-xs text-gray-500">Por: {cambio.usuario}</p>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                          <time dateTime={cambio.fecha}>{formatearFechaHora(cambio.fecha)}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditoriaPagos; 