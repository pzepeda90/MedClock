import { jest } from '@jest/globals';

describe('Pruebas básicas', () => {
  test('2 + 2 = 4', () => {
    expect(2 + 2).toBe(4);
  });

  test('true debe ser truthy', () => {
    expect(true).toBeTruthy();
  });

  test('false debe ser falsy', () => {
    expect(false).toBeFalsy();
  });

  test('null debe ser null', () => {
    expect(null).toBeNull();
  });
}); 