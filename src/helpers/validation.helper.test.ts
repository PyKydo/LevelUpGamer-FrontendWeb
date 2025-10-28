import { describe, it, expect } from 'vitest';
import {
  validateRun,
  validateEmail,
  validatePassword,
  validateAge,
} from './validation.helper';

describe('Ayudantes de Validación', () => {
  describe('validar RUN', () => {
    it('debería dar verdadero para un RUN bueno', () => {
      expect(validateRun('22.222.222-2')).toBe(true);
    });

    it('debería dar verdadero para un RUN con K', () => {
      expect(validateRun('11.111.112-K')).toBe(true);
    });

    it('debería dar falso para un RUN malo', () => {
      expect(validateRun('19.815.393-8')).toBe(false);
    });

    it('debería dar falso si el RUN está mal escrito', () => {
      expect(validateRun('19.815.393')).toBe(false);
    });

    it('debería dar falso si no hay nada', () => {
      expect(validateRun('')).toBe(false);
    });
  });

  describe('validar Email', () => {
    it('debería ser válido con un correo de duoc.cl', () => {
      expect(validateEmail('test@duoc.cl')).toBe(true);
    });

    it('debería ser válido con un correo de gmail.com', () => {
      expect(validateEmail('test@gmail.com')).toBe(true);
    });

    it('debería ser falso si el dominio no es válido', () => {
      expect(validateEmail('test@hotmail.com')).toBe(false);
    });

    it('debería ser falso si el correo está mal formado', () => {
      expect(validateEmail('test@.com')).toBe(false);
    });

    it('debería ser falso si el campo está vacío', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validar Contraseña', () => {
    it('debería ser verdadero si la contraseña está en el rango correcto', () => {
      expect(validatePassword('password', { min: 6, max: 10 })).toBe(true);
    });

    it('debería ser falso si la contraseña es más corta que el mínimo', () => {
      expect(validatePassword('pass', { min: 6, max: 10 })).toBe(false);
    });

    it('debería ser falso si la contraseña es más larga que el máximo', () => {
      expect(validatePassword('longpassword', { min: 6, max: 10 })).toBe(false);
    });

    it('debería ser falso si el campo está vacío', () => {
      expect(validatePassword('', { min: 6, max: 10 })).toBe(false);
    });
  });

  describe('validar Edad', () => {
    it('debería ser verdadero si la edad es mayor o igual a la mínima', () => {
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - 20);
      expect(validateAge(birthdate.toISOString().split('T')[0], 18)).toBe(true);
    });

    it('debería ser falso si la edad es menor a la mínima', () => {
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - 17);
      expect(validateAge(birthdate.toISOString().split('T')[0], 18)).toBe(false);
    });

    it('debería ser falso si el campo está vacío', () => {
      expect(validateAge('', 18)).toBe(false);
    });
  });
});