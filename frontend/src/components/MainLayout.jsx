import { useContext, useState } from "react";
import { UserContext } from "../providers/UserProvider";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  const { user } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] grid-cols-1 lg:grid-cols-[220px_1fr]">
      <Navbar 
        className="row-start-1 row-end-2 col-span-full z-10" 
        toggleSidebar={toggleSidebar}
      />
      
      {/* Sidebar para móvil (drawer) */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />
      <Sidebar 
        className={`row-start-2 row-end-3 col-start-1 col-end-2 fixed top-[64px] left-0 h-[calc(100vh-64px)] w-[220px] z-30 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-auto lg:z-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`} 
        closeSidebar={() => setSidebarOpen(false)}
      />
      
      <main className="row-start-2 row-end-3 col-span-full lg:col-start-2 lg:col-end-3 p-6 overflow-auto">
        {children}
      </main>
      
      <Footer className="row-start-3 row-end-4 col-span-full" />
    </div>
  );
} 