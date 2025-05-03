import { useState } from "react";

export default function TablaGeneral({
  columnas = [],
  datos = [],
  acciones = null,
  paginacion = true,
  busqueda = true,
  itemsPorPagina = 10,
  titulo = "",
  cargando = false
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("");
  const [ordenDireccion, setOrdenDireccion] = useState("asc");
  
  // Filtrado de datos
  const datosFiltrados = datos.filter((item) => {
    if (!terminoBusqueda) return true;
    
    return Object.values(item).some((valor) => {
      if (valor === null || valor === undefined) return false;
      return valor.toString().toLowerCase().includes(terminoBusqueda.toLowerCase());
    });
  });
  
  // Ordenación de datos
  const datosOrdenados = [...datosFiltrados].sort((a, b) => {
    if (!ordenarPor) return 0;
    
    const valorA = a[ordenarPor];
    const valorB = b[ordenarPor];
    
    if (valorA === valorB) return 0;
    
    if (valorA === null || valorA === undefined) return ordenDireccion === "asc" ? -1 : 1;
    if (valorB === null || valorB === undefined) return ordenDireccion === "asc" ? 1 : -1;
    
    if (ordenDireccion === "asc") {
      return valorA < valorB ? -1 : 1;
    } else {
      return valorA > valorB ? -1 : 1;
    }
  });
  
  // Paginación
  const totalPaginas = Math.ceil(datosOrdenados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const datosPaginados = datosOrdenados.slice(
    indiceInicio,
    indiceInicio + itemsPorPagina
  );
  
  const handleCambiarPagina = (pagina) => {
    setPaginaActual(Math.max(1, Math.min(pagina, totalPaginas)));
  };
  
  const handleCambiarOrden = (columna) => {
    if (ordenarPor === columna) {
      setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc");
    } else {
      setOrdenarPor(columna);
      setOrdenDireccion("asc");
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cabecera de la tabla con título y búsqueda */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          {titulo && (
            <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
              {titulo}
            </h3>
          )}
          
          {busqueda && (
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute left-3 top-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columnas.map((columna, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleCambiarOrden(columna.campo)}
                >
                  <div className="flex items-center">
                    {columna.titulo}
                    {ordenarPor === columna.campo && (
                      <span className="ml-1">
                        {ordenDireccion === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {acciones && (
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {cargando ? (
              <tr>
                <td
                  colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    Cargando...
                  </div>
                </td>
              </tr>
            ) : datosPaginados.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No se encontraron datos
                </td>
              </tr>
            ) : (
              datosPaginados.map((fila, indexFila) => (
                <tr key={indexFila} className="hover:bg-gray-50">
                  {columnas.map((columna, indexColumna) => (
                    <td
                      key={indexColumna}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                    >
                      {columna.renderizado
                        ? columna.renderizado(fila[columna.campo], fila)
                        : fila[columna.campo]}
                    </td>
                  ))}
                  {acciones && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {acciones(fila)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      {paginacion && totalPaginas > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleCambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  paginaActual === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => handleCambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  paginaActual === totalPaginas
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Siguiente
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-medium">{(paginaActual - 1) * itemsPorPagina + 1}</span>{" "}
                  a{" "}
                  <span className="font-medium">
                    {Math.min(paginaActual * itemsPorPagina, datosOrdenados.length)}
                  </span>{" "}
                  de <span className="font-medium">{datosOrdenados.length}</span> resultados
                </p>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handleCambiarPagina(1)}
                    disabled={paginaActual === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      paginaActual === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Primera</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleCambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      paginaActual === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  
                  {/* Botones de página */}
                  {[...Array(totalPaginas)].map((_, i) => {
                    const pagina = i + 1;
                    
                    // Mostrar solo un rango de páginas alrededor de la página actual
                    if (
                      pagina === 1 ||
                      pagina === totalPaginas ||
                      (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)
                    ) {
                      return (
                        <button
                          key={pagina}
                          onClick={() => handleCambiarPagina(pagina)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagina === paginaActual
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pagina}
                        </button>
                      );
                    }
                    
                    // Mostrar puntos suspensivos
                    if (
                      (pagina === 2 && paginaActual > 3) ||
                      (pagina === totalPaginas - 1 && paginaActual < totalPaginas - 2)
                    ) {
                      return (
                        <span
                          key={pagina}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => handleCambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      paginaActual === totalPaginas
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleCambiarPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      paginaActual === totalPaginas
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Última</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 