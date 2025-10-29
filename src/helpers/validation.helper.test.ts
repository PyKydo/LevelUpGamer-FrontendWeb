import { describe, it, expect } from 'vitest';
import {
  validateRun,
  validateEmail,
  validatePassword,
  validateAge,
} from './validation.helper';

describe('Ayudantes de Validación', () => {
  describe('validar RUN', () => {
    it('debería dar verdadero para un RUN válido', () => {
      expect(validateRun('22.222.222-2')).toBe(true);
      expect(validateRun('11.111.112-K')).toBe(true);
    });

    it('debería dar falso para un RUN inválido', () => {
      expect(validateRun('19.815.393')).toBe(false);
      expect(validateRun('')).toBe(false);
    });
  });

  describe('validar Email', () => {
    it('debería ser válido con dominio permitido', () => {
      expect(validateEmail('test@duoc.cl')).toBe(true);
      expect(validateEmail('test@duocuc.cl')).toBe(true);
      expect(validateEmail('test@gmail.com')).toBe(true);
    });

    it('debería ser falso con dominio no permitido o formato inválido', () => {
      expect(validateEmail('test@hotmail.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validar Contraseña', () => {
    it('debería ser válida con requisitos completos en modo estricto', () => {
      
      expect(validatePassword('Password123', { min: 8, strict: true })).toBe(true);
    });

    it('debería ser inválida en modo estricto si faltan requisitos', () => {
      expect(validatePassword('password123', { min: 8, strict: true })).toBe(false);
      expect(validatePassword('Password', { min: 8, strict: true })).toBe(false);
      expect(validatePassword('Pass1', { min: 8, strict: true })).toBe(false);
      expect(validatePassword('', { min: 8 })).toBe(false);
    });
  });

  describe('validar Edad', () => {
    it('debería ser válida si la edad cumple con la mínima requerida', () => {
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - 20);
      expect(validateAge(birthdate.toISOString().split('T')[0], 18)).toBe(true);
    });

    it('debería ser inválida si la edad es menor a la mínima', () => {
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - 17);
      expect(validateAge(birthdate.toISOString().split('T')[0], 18)).toBe(false);
      expect(validateAge('', 18)).toBe(false);
    });
  });
});