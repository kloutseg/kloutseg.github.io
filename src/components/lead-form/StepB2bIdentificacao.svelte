<script lang="ts">
  import FormStep from './FormStep.svelte';
  import SubmitButton from './SubmitButton.svelte';
  import {
    validateNome,
    validateTelefone,
    validateEmail,
    formatTelefone
  } from '../../lib/form-validation';
  import type { FieldValidation } from '../../lib/form-store';

  let {
    formData,
    validation,
    isSubmitting = false,
    onInput = (_field: string, _value: string) => {},
    onBlur = (_field: string) => {},
    onclick = () => {},
    onPrev = () => {}
  }: {
    formData: {
      nomeInterlocutor: string;
      telefone: string;
      email: string;
      cargo: string;
    };
    validation: {
      nomeInterlocutor: FieldValidation;
      telefone: FieldValidation;
      email: FieldValidation;
      cargo: FieldValidation;
    };
    isSubmitting?: boolean;
    onInput?: (field: string, value: string) => void;
    onBlur?: (field: string) => void;
    onclick?: () => void;
    onPrev?: () => void;
  } = $props();

  const CARGO_OPTIONS = [
    'Sócio(a) / Founder',
    'Diretoria / C-level',
    'RH / People',
    'Financeiro / Compras',
    'Benefícios / Operações',
    'Gestão geral / Administrativo'
  ];

  function validateCargo(value: string): string {
    if (!value.trim()) return 'Informe seu cargo';
    if (value.trim().length < 3) return 'Cargo muito curto (mínimo 3 caracteres)';
    return '';
  }

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const field = target.dataset.field as string;
    let value = target.value;
    if (field === 'telefone') value = formatTelefone(value);
    onInput(field, value);

    if (validation[field as keyof typeof validation]?.touched) {
      if (field === 'nomeInterlocutor') validation[field].error = validateNome(value);
      else if (field === 'telefone') validation[field].error = validateTelefone(value);
      else if (field === 'email') validation[field].error = validateEmail(value);
    }
  }

  function handleBlur(e: FocusEvent) {
    const target = e.currentTarget as HTMLInputElement;
    const field = target.dataset.field as string;
    validation[field as keyof typeof validation].touched = true;
    if (field === 'nomeInterlocutor') validation[field].error = validateNome(formData.nomeInterlocutor);
    else if (field === 'telefone') validation[field].error = validateTelefone(formData.telefone);
    else if (field === 'email') validation[field].error = validateEmail(formData.email);
  }

  function handleCargoSelect(value: string) {
    onInput('cargo', value);
    onBlur('cargo');
  }

  function isStepValid(): boolean {
    return !validateNome(formData.nomeInterlocutor)
      && !validateTelefone(formData.telefone)
      && !validateEmail(formData.email)
      && !validateCargo(formData.cargo);
  }
</script>

<FormStep
  heading="Identificação e contato"
  subtext="Precisamos dos dados do responsável para conduzir a análise e retornar com uma proposta adequada."
  fields={stepFields}
>
  {#snippet stepFields()}
  <div class="form-group">
    <div class="prompt-row">
      <label for="lead-nome-interlocutor" class="input-label">
        Nome do responsável <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Pessoa de contato principal</span>
    </div>
    <input type="text" id="lead-nome-interlocutor" data-field="nomeInterlocutor" class="form-input"
      class:has-error={validation.nomeInterlocutor.touched && !!validation.nomeInterlocutor.error}
      class:has-success={validation.nomeInterlocutor.touched && !validation.nomeInterlocutor.error}
      value={formData.nomeInterlocutor} oninput={handleInput} onblur={handleBlur} required
      placeholder="Seu nome completo"
      aria-invalid={validation.nomeInterlocutor.touched && !!validation.nomeInterlocutor.error}
      aria-describedby={validation.nomeInterlocutor.error ? 'lead-nome-interlocutor-error' : undefined} />
    {#if !validation.nomeInterlocutor.error}
      <p class="field-note">Vamos usar esse nome nas próximas interações e na condução do atendimento.</p>
    {/if}
    {#if validation.nomeInterlocutor.touched && validation.nomeInterlocutor.error}
      <p class="error-message" id="lead-nome-interlocutor-error" role="alert">{validation.nomeInterlocutor.error}</p>
    {/if}
  </div>

  <div class="form-group">
    <div class="prompt-row">
      <span class="input-label" id="lead-cargo-label">
        Cargo / Função <span class="required-asterisk">*</span>
      </span>
      <span class="prompt-hint">Contexto decisório</span>
    </div>
    <div
      class="cargo-grid"
      role="group"
      aria-labelledby="lead-cargo-label"
      aria-describedby={validation.cargo.error ? 'lead-cargo-error' : undefined}
    >
      {#each CARGO_OPTIONS as option}
        <button
          type="button"
          class="cargo-option"
          class:active={formData.cargo === option}
          onclick={() => handleCargoSelect(option)}
          aria-pressed={formData.cargo === option}
        >
          {option}
        </button>
      {/each}
    </div>
    {#if !validation.cargo.error}
      <p class="field-note">Selecione o nível que mais se aproxima do papel desse contato na decisão.</p>
    {/if}
    {#if validation.cargo.touched && validation.cargo.error}
      <p class="error-message" id="lead-cargo-error" role="alert">{validation.cargo.error}</p>
    {/if}
  </div>

  <div class="form-group">
    <div class="prompt-row">
      <label for="lead-telefone-b2b" class="input-label">
        Telefone / WhatsApp <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Contato mais rápido</span>
    </div>
    <input type="tel" id="lead-telefone-b2b" data-field="telefone" class="form-input"
      class:has-error={validation.telefone.touched && !!validation.telefone.error}
      class:has-success={validation.telefone.touched && !validation.telefone.error}
      value={formData.telefone} oninput={handleInput} onblur={handleBlur} required
      inputmode="tel" placeholder="(00) 00000-0000" maxlength="15"
      aria-invalid={validation.telefone.touched && !!validation.telefone.error}
      aria-describedby={validation.telefone.error ? 'lead-telefone-b2b-error' : undefined} />
    {#if !validation.telefone.error}
      <p class="field-note">Preferencialmente um número com WhatsApp para agilizar o retorno.</p>
    {/if}
    {#if validation.telefone.touched && validation.telefone.error}
      <p class="error-message" id="lead-telefone-b2b-error" role="alert">{validation.telefone.error}</p>
    {/if}
  </div>

  <div class="form-group">
    <div class="prompt-row">
      <label for="lead-email-b2b" class="input-label">
        E-mail corporativo <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Canal formal</span>
    </div>
    <input type="email" id="lead-email-b2b" data-field="email" class="form-input"
      class:has-error={validation.email.touched && !!validation.email.error}
      class:has-success={validation.email.touched && !validation.email.error}
      value={formData.email} oninput={handleInput} onblur={handleBlur} required
      placeholder="seu@empresa.com.br"
      aria-invalid={validation.email.touched && !!validation.email.error}
      aria-describedby={validation.email.error ? 'lead-email-b2b-error' : undefined} />
    {#if !validation.email.error}
      <p class="field-note">Por aqui enviamos o resumo da análise e eventuais propostas comerciais.</p>
    {/if}
    {#if validation.email.touched && validation.email.error}
      <p class="error-message" id="lead-email-b2b-error" role="alert">{validation.email.error}</p>
    {/if}
  </div>

  <div class="nav-container">
    <button type="button" class="back-step-button" onclick={onPrev}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Anterior
    </button>
    <SubmitButton disabled={!isStepValid()} isSubmitting={isSubmitting} label="Próximo" onclick={onclick} />
  </div>
  <p class="enter-hint">Pressione Enter para continuar</p>
  {/snippet}
</FormStep>

<style>
  .form-group { display: flex; flex-direction: column; gap: 0.65rem; }
  .prompt-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }
  .input-label {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.8rem; font-weight: 600; color: hsl(214, 20%, 60%);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .required-asterisk { color: hsl(0, 50%, 62%); margin-left: 2px; }
  .prompt-hint {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.8rem;
    color: hsl(214, 15%, 46%);
    line-height: 1.4;
    white-space: nowrap;
  }
  .form-input {
    width: 100%; box-sizing: border-box; padding: 14px 0 16px; border: none;
    border-bottom: 1.5px solid hsl(214, 15%, 35%);
    background: transparent; color: hsl(214, 61%, 95%);
    font-family: 'IBM Plex Serif', serif; font-size: clamp(1.28rem, 2.2vw, 1.75rem); font-weight: 400;
    line-height: 1.2;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); outline: none; border-radius: 0;
  }
  .form-input::placeholder { color: hsl(214, 15%, 45%); opacity: 0.42; font-style: normal; }
  .form-input:hover:not(:focus) { border-bottom-color: hsl(214, 15%, 50%); }
  .form-input:focus { border-bottom-color: hsl(45, 40%, 55%); box-shadow: 0 2px 0 hsla(45, 40%, 55%, 0.3); }
  .form-input.has-error { border-bottom-color: hsl(0, 40%, 55%); }
  .form-input.has-error:focus { border-bottom-color: hsl(0, 40%, 60%); box-shadow: 0 2px 0 hsla(0, 40%, 55%, 0.3); }
  .cargo-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.625rem;
  }
  .cargo-option {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 54px;
    padding: 0.9rem 1rem;
    border-radius: 14px;
    border: 1.5px solid hsl(214, 15%, 30%);
    background: hsla(214, 20%, 14%, 0.42);
    color: hsl(214, 15%, 60%);
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.3;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cargo-option:hover {
    border-color: hsl(214, 15%, 45%);
    color: hsl(214, 15%, 74%);
    background: hsla(214, 20%, 16%, 0.55);
  }
  .cargo-option.active {
    border-color: hsl(45, 40%, 55%);
    background: hsla(45, 30%, 50%, 0.1);
    color: hsl(45, 30%, 75%);
    box-shadow: 0 0 12px hsla(45, 40%, 55%, 0.15);
  }
  .error-message { font-family: 'Proxima Nova', sans-serif; font-size: 0.78rem; font-weight: 500; color: hsl(0, 50%, 62%); margin: 0.25rem 0 0; line-height: 1.4; }
  .field-note {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.82rem;
    color: hsl(214, 15%, 52%);
    margin: 0.15rem 0 0;
    line-height: 1.5;
  }
  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2.25rem;
    gap: 1rem;
  }
  .back-step-button {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 14px 20px;
    min-width: 160px;
    min-height: 52px;
    border-radius: 50px; border: 1.5px solid hsl(214, 15%, 35%);
    background: transparent; color: hsl(214, 15%, 65%);
    font-family: 'Proxima Nova', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .back-step-button:hover { border-color: hsl(214, 15%, 50%); color: hsl(214, 61%, 90%); background: hsla(214, 15%, 20%, 0.3); }
  .back-step-button:active { transform: scale(0.98); }
  .enter-hint {
    margin: 0.85rem 0 0;
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.78rem;
    color: hsl(214, 15%, 46%);
    line-height: 1.4;
  }
  /* ═══════════════════════════════════════
     MOBILE — 768px
     ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .prompt-row { align-items: flex-start; flex-direction: column; gap: 0.2rem; }
    .form-input { font-size: 16px; padding: 14px 0; line-height: 1.4; }
    .form-input::placeholder { font-size: 0.875rem; }
    .input-label { font-size: 0.6875rem; letter-spacing: 0.06em; }
    .prompt-hint { font-size: 0.75rem; white-space: normal; }
    .cargo-grid { grid-template-columns: 1fr; gap: 0.5rem; }
    .cargo-option { min-height: 48px; padding: 0.85rem 0.9rem; font-size: 0.8125rem; }
    .error-message, .field-note, .enter-hint { font-size: 0.6875rem; }
    .nav-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.625rem;
      margin-top: 0;
      padding-top: 1rem;
    }
    .back-step-button {
      padding: 14px 16px;
      font-size: 0.8125rem;
      min-height: 48px;
      min-width: 0;
      width: 100%;
      justify-content: center;
    }
    :global(.form-submit-button) {
      padding: 14px 16px;
      font-size: 0.8125rem;
      min-height: 48px;
      width: 100%;
    }
  }

  /* ═══════════════════════════════════════
     SMALL MOBILE — 480px
     ═══════════════════════════════════════ */
  @media (max-width: 480px) {
    .form-input { padding: 12px 0; }
    .cargo-option { min-height: 46px; padding: 0.75rem 0.875rem; font-size: 0.75rem; }
    .nav-container { gap: 0.5rem; padding-top: 0.75rem; }
    .back-step-button { padding: 12px 14px; font-size: 0.75rem; min-height: 46px; }
    :global(.form-submit-button) { padding: 12px 14px; font-size: 0.75rem; min-height: 46px; }
  }
</style>
