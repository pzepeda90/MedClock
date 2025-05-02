import { jest, describe, it, expect } from '@jest/globals';

// Función simple para sumar dos números
const suma = (a, b) => a + b;

// Función simple para formatear fechas
const formatearFecha = (fecha) => {
  const f = new Date(fecha);
  return `${f.getUTCFullYear()}-${f.getUTCMonth() + 1}-${f.getUTCDate()}`;
};

// Función asíncrona simple
const obtenerDatoAsincrono = async () => {
  return 'datos';
};

// Función con callback
const procesarConCallback = (valor, callback) => {
  setTimeout(() => {
    callback(valor * 2);
  }, 1);
};

describe('Pruebas de Funciones Simples', () => {
  describe('suma', () => {
    it('debe sumar dos números correctamente', () => {
      expect(suma(2, 3)).toBe(5);
      expect(suma(-1, 5)).toBe(4);
      expect(suma(0, 0)).toBe(0);
    });
  });

  describe('formatearFecha', () => {
    it('debe formatear fechas correctamente', () => {
      expect(formatearFecha('2023-01-15T12:00:00Z')).toBe('2023-1-15');
      expect(formatearFecha('2022-12-31T12:00:00Z')).toBe('2022-12-31');
    });
  });

  describe('obtenerDatoAsincrono', () => {
    it('debe resolver con datos', async () => {
      const resultado = await obtenerDatoAsincrono();
      expect(resultado).toBe('datos');
    });
  });

  describe('procesarConCallback', () => {
    it('debe procesar con callback correctamente', (done) => {
      procesarConCallback(5, (resultado) => {
        expect(resultado).toBe(10);
        done();
      });
    });
  });

  describe('mock de función', () => {
    it('debe poder mockear funciones', () => {
      // Crear una función mock
      const mockFn = jest.fn();
      
      // Configurar el valor de retorno
      mockFn.mockReturnValue('valor mockeado');
      
      // Llamar a la función
      const resultado = mockFn();
      
      // Verificaciones
      expect(mockFn).toHaveBeenCalled();
      expect(resultado).toBe('valor mockeado');
    });
  });
}); 