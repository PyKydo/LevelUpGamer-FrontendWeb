import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from './storage.helper';

global.Storage.prototype.getItem = vi.fn();
global.Storage.prototype.setItem = vi.fn();
global.Storage.prototype.removeItem = vi.fn();

describe('Ayudantes de Almacenamiento', () => {
  const KEY = 'test-key';
  const VALUE = { data: 'test-value' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('guardar en localStorage', () => {
    it('debería guardar un valor en el localStorage', () => {
      setLocalStorageItem(KEY, VALUE);
      expect(localStorage.setItem).toHaveBeenCalledWith(KEY, JSON.stringify(VALUE));
    });
  });

  describe('obtener de localStorage', () => {
    it('debería obtener un valor del localStorage', () => {
      (localStorage.getItem as vi.Mock).mockReturnValue(JSON.stringify(VALUE));
      const result = getLocalStorageItem(KEY);
      expect(localStorage.getItem).toHaveBeenCalledWith(KEY);
      expect(result).toEqual(VALUE);
    });

    it('debería devolver valores por defecto si no hay nada o hay error', () => {
      (localStorage.getItem as vi.Mock).mockReturnValue(null);
      const resultDefault = getLocalStorageItem(KEY, 'default');
      expect(resultDefault).toBe('default');

      const resultNull = getLocalStorageItem(KEY);
      expect(resultNull).toBeNull();

      (localStorage.getItem as vi.Mock).mockReturnValue('invalid-json');
      const resultError = getLocalStorageItem(KEY, 'default-on-error');
      expect(resultError).toBe('default-on-error');
    });
  });

  describe('eliminar de localStorage', () => {
    it('debería eliminar un valor del localStorage', () => {
      removeLocalStorageItem(KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(KEY);
    });
  });
});