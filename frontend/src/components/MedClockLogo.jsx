import React from 'react';

const MedClockLogo = ({ size = "default", vertical = false }) => {
  // Configuraciones de tamaño
  const sizes = {
    small: { height: 30, fontSize: "text-sm", iconSize: 20 },
    default: { height: 36, fontSize: "text-lg", iconSize: 24 },
    large: { height: 48, fontSize: "text-2xl", iconSize: 32 }
  };
  
  const { height, fontSize, iconSize } = sizes[size] || sizes.default;
  
  // Colores
  const primaryColor = "#3b82f6"; // Azul
  const secondaryColor = "#10b981"; // Verde médico
  
  return (
    <div className={`flex ${vertical ? 'flex-col items-center space-y-1' : 'items-center space-x-2'}`}>
      <div className="relative" style={{ height: `${height}px`, width: `${height}px` }}>
        {/* Círculo del reloj */}
        <svg 
          width={height} 
          height={height} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Círculo exterior */}
          <circle cx="50" cy="50" r="48" stroke={primaryColor} strokeWidth="4" fill="white" />
          
          {/* Cruz médica */}
          <rect x="46" y="15" width="8" height="30" rx="2" fill={secondaryColor} />
          <rect x="46" y="55" width="8" height="30" rx="2" fill={secondaryColor} />
          <rect x="15" y="46" width="30" height="8" rx="2" fill={secondaryColor} />
          <rect x="55" y="46" width="30" height="8" rx="2" fill={secondaryColor} />
          
          {/* Manecillas del reloj */}
          <rect x="48" y="30" width="4" height="26" rx="2" fill={primaryColor} />
          <rect x="48" y="48" width="4" height="22" rx="2" transform="rotate(-45 48 48)" fill={primaryColor} />
          
          {/* Punto central */}
          <circle cx="50" cy="50" r="4" fill={primaryColor} />
        </svg>
      </div>
      
      <div className={`font-bold ${fontSize} tracking-tight`}>
        <span className="text-blue-600">Med</span>
        <span className="text-green-600">Clock</span>
      </div>
    </div>
  );
};

export default MedClockLogo; 