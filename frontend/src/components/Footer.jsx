export default function Footer({ className }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-gray-100 border-t border-gray-200 py-4 px-6 text-gray-600 text-sm ${className}`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            &copy; {currentYear} Agenda Médica. Todos los derechos reservados.
          </div>
          <div className="mt-2 md:mt-0">
            <nav className="flex gap-4">
              <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contacto</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
} 