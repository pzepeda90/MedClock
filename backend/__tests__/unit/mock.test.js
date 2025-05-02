import { jest, describe, it, expect } from '@jest/globals';

describe('Prueba básica', () => {
  it('debe sumar dos números correctamente', () => {
    // Arrange
    const a = 2;
    const b = 3;
    
    // Act
    const resultado = a + b;
    
    // Assert
    expect(resultado).toBe(5);
  });
  
  it('debe comprobar que true es true', () => {
    expect(true).toBe(true);
  });
}); 