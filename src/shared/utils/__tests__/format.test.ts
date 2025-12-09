import { describe, it, expect } from 'vitest';
import { formatCurrencyCOP, formatDate } from '../format';

describe('formatCurrencyCOP', () => {
  it('devuelve "-" para valores nulos', () => {
    expect(formatCurrencyCOP(null)).toBe('-');
    expect(formatCurrencyCOP(undefined)).toBe('-');
  });

  it('formatea números como pesos COP', () => {
    const formatted = formatCurrencyCOP(33520000);
    expect(formatted).toMatch(/33\.?520\.?000/);
  });
});

describe('formatDate', () => {
  it('convierte YYYY-MM-DD a DD/MM/YYYY', () => {
    expect(formatDate('2024-01-31')).toBe('31/01/2024');
  });

  it('devuelve "-" para valores nulos', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
  });
});

