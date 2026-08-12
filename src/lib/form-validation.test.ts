import { describe, expect, it } from 'vitest';
import { formatTelefone } from './form-validation';

describe('formatTelefone', () => {
  it('formata telefone fixo com dez dígitos', () => {
    expect(formatTelefone('1198765432')).toBe('(11) 9876-5432');
  });

  it('formata celular com onze dígitos', () => {
    expect(formatTelefone('11987654321')).toBe('(11) 98765-4321');
  });

  it('remove caracteres não numéricos e limita a onze dígitos', () => {
    expect(formatTelefone('abc119876543210000xyz')).toBe('(11) 98765-4321');
  });
});
