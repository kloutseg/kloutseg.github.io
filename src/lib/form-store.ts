/**
 * Shared state management for the lead capture form.
 * Uses Svelte 5 $state for reactivity across components.
 */

// ═══════════════════════════════════════════
// FORM DATA STATE
// ═══════════════════════════════════════════

export interface LeadFormData {
  // Step 1 — Contact
  nome: string;
  telefone: string;
  email: string;

  // Step 2 — Qualification
  temCnpj: boolean | null; // null = not answered, true = yes, false = no
  cnpjNumeroRegiao: string;
  planoSaude: string;
  numBeneficiarios: number | string;
  idadesBeneficiarios: number[];
  investimentoMensal: string;
}

export function createInitialFormData(): LeadFormData {
  return {
    nome: '',
    telefone: '',
    email: '',
    temCnpj: null,
    cnpjNumeroRegiao: '',
    planoSaude: '',
    numBeneficiarios: '',
    idadesBeneficiarios: [],
    investimentoMensal: '',
  };
}

// ═══════════════════════════════════════════
// VALIDATION STATE
// ═══════════════════════════════════════════

export interface FieldValidation {
  touched: boolean;
  error: string;
}

export interface Step1Validation {
  nome: FieldValidation;
  telefone: FieldValidation;
  email: FieldValidation;
}

export interface Step2Validation {
  planoSaude: FieldValidation;
  numBeneficiarios: FieldValidation;
  idadesBeneficiarios: FieldValidation;
  investimentoMensal: FieldValidation;
}

export function createFieldValidation(): FieldValidation {
  return { touched: false, error: '' };
}

export function createInitialStep1Validation(): Step1Validation {
  return {
    nome: createFieldValidation(),
    telefone: createFieldValidation(),
    email: createFieldValidation(),
  };
}

export function createInitialStep2Validation(): Step2Validation {
  return {
    planoSaude: createFieldValidation(),
    numBeneficiarios: createFieldValidation(),
    idadesBeneficiarios: createFieldValidation(),
    investimentoMensal: createFieldValidation(),
  };
}

// ═══════════════════════════════════════════
// FORM STATUS
// ═══════════════════════════════════════════

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface FormState {
  currentStep: number;
  formData: LeadFormData;
  step1Validation: Step1Validation;
  step2Validation: Step2Validation;
  status: FormStatus;
  submittedAt: Date | null;
}

export function createInitialFormState(): FormState {
  return {
    currentStep: 0,
    formData: createInitialFormData(),
    step1Validation: createInitialStep1Validation(),
    step2Validation: createInitialStep2Validation(),
    status: 'idle',
    submittedAt: null,
  };
}
