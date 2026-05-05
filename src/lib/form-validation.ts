/**
 * Validation utilities for the lead capture form.
 * All validators return an empty string for valid input, or an error message string.
 */

// ═══════════════════════════════════════════
// STEP 1 — Contact Information Validators
// ═══════════════════════════════════════════

export function validateNome(value: string): string {
  if (!value.trim()) return 'Por favor, informe seu nome completo';
  if (value.trim().length < 3) return 'Nome muito curto (mínimo 3 caracteres)';
  return '';
}

export function validateTelefone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Informe seu telefone ou WhatsApp';
  // Brazilian format: (00) 00000-0000 → 11 digits
  if (digits.length < 10) return 'Telefone incompleto';
  if (digits.length > 11) return 'Telefone muito longo';
  return '';
}

export function validateEmail(value: string): string {
  if (!value.trim()) return 'Informe seu e-mail';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return 'Formato de e-mail inválido';
  return '';
}

// ═══════════════════════════════════════════
// STEP 2 — Qualification Validators
// ═══════════════════════════════════════════

export function validatePlanoSaude(value: string): string {
  if (!value.trim()) return 'Informe o plano de saúde';
  if (value.trim().length < 2) return 'Campo muito curto';
  return '';
}

export function validateBeneficiarios(value: number | string): string {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (!value || isNaN(num)) return 'Informe o número de beneficiários';
  if (num < 1) return 'Deve haver pelo menos 1 beneficiário';
  return '';
}

export function validateIdades(idades: number[]): string {
  if (idades.length === 0) return 'Informe a idade de cada beneficiário';
  for (let i = 0; i < idades.length; i++) {
    if (!idades[i] || idades[i] < 0 || !Number.isInteger(idades[i])) {
      return `Idade inválida na posição ${i + 1}`;
    }
  }
  return '';
}

export function validateInvestimento(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Informe o valor investido mensalmente';
  if (parseInt(digits, 10) < 100) return 'Valor mínimo de R$ 1,00';
  return '';
}

// ═══════════════════════════════════════════
// FORMATTING UTILITIES
// ═══════════════════════════════════════════

export function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Formats CNPJ in real-time as user types.
 * Format: 00.000.000/0001-00 (14 digits)
 */
export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/**
 * Formats currency in Brazilian format (R$) in real-time as user types.
 * Works with centavo-based input: typing "1234" → R$ 12,34
 * Handles incremental input correctly.
 */
export function formatCurrencyBRL(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';

  // Parse as centavos
  const centavos = parseInt(digits, 10);
  if (isNaN(centavos)) return '';

  // Convert to reais
  const reais = centavos / 100;

  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

/**
 * Parse BRL currency string back to centavos (integer).
 * "R$ 1.234,56" → 123456
 */
export function parseCurrencyToCentavos(value: string): number {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
}

/**
 * Parse BRL currency string to float (reais).
 * "R$ 1.234,56" → 1234.56
 */
export function parseCurrencyBRL(value: string): number {
  return parseCurrencyToCentavos(value) / 100;
}

// ═══════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════

export interface ValidationState {
  touched: boolean;
  error: string;
}

export function createValidationState(): ValidationState {
  return { touched: false, error: '' };
}

export function isStepValid(validations: ValidationState[]): boolean {
  return validations.every(v => !v.error);
}
