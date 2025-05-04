import React from 'react';

const Avatar = ({ user, size = 'md', className = '' }) => {
  // Obtener las iniciales del nombre del usuario
  const getInitials = () => {
    if (!user?.nombre) return '?';
    
    const nombre = user.nombre.trim();
    const apellido = user.apellido?.trim() || '';
    
    if (nombre && apellido) {
      return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    }
    
    return nombre.charAt(0).toUpperCase();
  };
  
  // Definir colores según el rol
  const getBgColor = () => {
    switch (user?.rol) {
      case 'admin':
        return 'bg-purple-600';
      case 'medico':
        return 'bg-blue-600';
      case 'recepcionista':
        return 'bg-green-600';
      case 'paciente':
        return 'bg-amber-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  // Definir tamaños
  const getSize = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6 text-xs';
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'md':
        return 'w-10 h-10 text-base';
      case 'lg':
        return 'w-14 h-14 text-lg';
      case 'xl':
        return 'w-20 h-20 text-xl';
      default:
        return 'w-10 h-10 text-base';
    }
  };
  
  // Si el usuario tiene una foto, mostrarla
  if (user?.foto) {
    return (
      <div 
        className={`${getSize()} rounded-full overflow-hidden ${className}`}
        title={`${user?.nombre || ''} ${user?.apellido || ''}`}
      >
        <img 
          src={user.foto} 
          alt={`${user?.nombre || ''} ${user?.apellido || ''}`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  // Si no tiene foto, mostrar iniciales con color de fondo según rol
  return (
    <div 
      className={`${getSize()} ${getBgColor()} rounded-full flex items-center justify-center text-white font-medium ${className}`}
      title={`${user?.nombre || ''} ${user?.apellido || ''}`}
    >
      {getInitials()}
    </div>
  );
};

export default Avatar; 