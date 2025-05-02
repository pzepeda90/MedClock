import { jest } from '@jest/globals';

describe('Prueba simple', () => {
  it('debería sumar correctamente dos números', () => {
    expect(1 + 2).toBe(3);
  });
  
  it('debería poder crear mocks básicos', () => {
    const mockFn = jest.fn().mockReturnValue('test');
    expect(mockFn()).toBe('test');
    expect(mockFn).toHaveBeenCalled();
  });
}); 