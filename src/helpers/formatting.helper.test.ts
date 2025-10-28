import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './formatting.helper';

describe('Ayudantes de Formato', () => {
  describe('formatear Moneda', () => {
    it('debería formatear números a moneda chilena', () => {
      const formatted = formatCurrency(10000);
      expect(formatted).toContain('$');
      expect(formatted).toMatch(/10\.000|10,000/);

      const formattedZero = formatCurrency(0);
      expect(formattedZero).toContain('$');
      expect(formattedZero).toMatch(/0/);

      const formattedLarge = formatCurrency(123456789);
      expect(formattedLarge).toContain('$');
      expect(formattedLarge).toMatch(/123\.456\.789|123,456,789/);
    });
  });

  describe('formatear Fecha', () => {
    it('debería formatear fechas a formato largo en español', () => {
      const dateString1 = '2024-07-31T10:00:00Z';
      const formatted1 = formatDate(dateString1);
      expect(formatted1).toBe('31 de julio de 2024');

      const dateString2 = '2025-01-01T00:00:00Z';
      const formatted2 = formatDate(dateString2);
      expect(formatted2).toBe('1 de enero de 2025');
    });
  });
});