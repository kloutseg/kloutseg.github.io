<script lang="ts">
  import FormStep from './FormStep.svelte';
  import SubmitButton from './SubmitButton.svelte';
  import type { FieldValidation } from '../../lib/form-store';

  let {
    formData,
    validation,
    isSubmitting = false,
    onInput = (_value: string) => {},
    onBlur = () => {},
    onclick = () => {},
    onPrev = () => {}
  }: {
    formData: { nome: string };
    validation: { nome: FieldValidation };
    isSubmitting?: boolean;
    onInput?: (value: string) => void;
    onBlur?: () => void;
    onclick?: () => void;
    onPrev?: () => void;
  } = $props();

  function validateNomeCompleto(value: string): string {
    if (!value.trim()) return 'Por favor, informe seu nome completo';
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) return 'Por favor, informe seu nome completo (nome e sobrenome).';
    if (words[0].length < 3) return 'Nome muito curto (mínimo 3 caracteres).';
    if (words[words.length - 1].length < 2) return 'Sobrenome muito curto (mínimo 2 caracteres).';
    return '';
  }

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    onInput(target.value);
  }

  function handleBlur() {
    onBlur();
  }

  function isStepValid(): boolean {
    return !validateNomeCompleto(formData.nome);
  }
</script>

<FormStep
  heading="Qual é o seu nome?"
  subtext="Vamos usar seu nome para personalizar o restante da análise."
  fields={stepFields}
>
  {#snippet stepFields()}
  <div class="form-group">
    <div class="prompt-row">
      <label for="lead-nome" class="input-label">
        Nome completo <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Nome e sobrenome</span>
    </div>
    <input
      type="text"
      id="lead-nome"
      class="form-input"
      class:has-error={validation.nome.touched && !!validation.nome.error}
      class:has-success={validation.nome.touched && !validation.nome.error}
      value={formData.nome}
      oninput={handleInput}
      onblur={handleBlur}
      required
      autocomplete="name"
      placeholder="Digite seu nome completo"
      maxlength="80"
      aria-invalid={validation.nome.touched && !!validation.nome.error}
      aria-describedby={validation.nome.error ? 'lead-nome-error' : undefined}
    />
    {#if !validation.nome.error}
      <p class="field-note">Digite como você gostaria de ser identificado durante o atendimento.</p>
    {/if}
    {#if validation.nome.touched && validation.nome.error}
      <p class="error-message" id="lead-nome-error" role="alert">
        {validation.nome.error}
      </p>
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
    <SubmitButton
      disabled={!isStepValid()}
      isSubmitting={isSubmitting}
      label="Próximo"
      onclick={onclick}
    />
  </div>
  <p class="enter-hint">Pressione Enter para continuar</p>
  {/snippet}
</FormStep>

<style>
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    width: 100%;
  }

  .prompt-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  .input-label {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    color: hsl(214, 20%, 60%);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .required-asterisk {
    color: hsl(0, 50%, 62%);
    margin-left: 2px;
  }

  .prompt-hint {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.8rem;
    color: hsl(214, 15%, 46%);
    line-height: 1.4;
    white-space: nowrap;
  }

  .form-input {
    width: 100%;
    box-sizing: border-box;
    padding: 14px 0 16px;
    border: none;
    border-bottom: 1.5px solid hsl(214, 15%, 35%);
    background: transparent;
    color: hsl(214, 61%, 95%);
    font-family: 'IBM Plex Serif', serif;
    font-size: clamp(1.55rem, 2.6vw, 2.15rem);
    font-weight: 400;
    line-height: 1.15;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    outline: none;
    border-radius: 0;
  }

  .form-input::placeholder {
    color: hsl(214, 15%, 45%);
    opacity: 0.42;
    font-style: normal;
  }

  .form-input:hover:not(:focus) {
    border-bottom-color: hsl(214, 15%, 50%);
  }

  .form-input:focus {
    border-bottom-color: hsl(45, 40%, 55%);
    box-shadow: 0 2px 0 hsla(45, 40%, 55%, 0.3);
  }

  .form-input.has-error {
    border-bottom-color: hsl(0, 40%, 55%);
  }

  .form-input.has-error:focus {
    border-bottom-color: hsl(0, 40%, 60%);
    box-shadow: 0 2px 0 hsla(0, 40%, 55%, 0.3);
  }

  .form-input.has-success {
    border-bottom-color: hsl(145, 30%, 50%);
  }

  .form-input.has-success:focus {
    border-bottom-color: hsl(145, 30%, 55%);
    box-shadow: 0 2px 0 hsla(145, 30%, 50%, 0.3);
  }

  .error-message {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    color: hsl(0, 50%, 62%);
    margin: 0.25rem 0 0 0;
    line-height: 1.4;
  }

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
    gap: 0.75rem;
  }

  .back-step-button {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 14px 20px;
    min-width: 160px;
    min-height: 52px;
    border-radius: 50px; border: 1.5px solid hsl(214, 15%, 35%);
    background: transparent; color: hsl(214, 15%, 65%);
    font-family: 'Proxima Nova', sans-serif; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); white-space: nowrap;
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
    .prompt-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.2rem;
    }

    .form-input {
      font-size: 16px;
      padding: 14px 0;
      line-height: 1.4;
    }

    .form-input::placeholder {
      font-size: 0.875rem;
    }

    .nav-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.625rem;
      margin-top: 0;
      padding-top: 1rem;
    }

    .input-label {
      font-size: 0.6875rem;
      letter-spacing: 0.06em;
    }

    .prompt-hint {
      font-size: 0.75rem;
      white-space: normal;
    }

    .error-message {
      font-size: 0.6875rem;
    }

    .field-note,
    .enter-hint {
      font-size: 0.75rem;
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
    .form-input {
      padding: 12px 0;
    }

    .nav-container {
      gap: 0.5rem;
      padding-top: 0.75rem;
    }

    .back-step-button {
      padding: 12px 14px;
      font-size: 0.75rem;
      min-height: 46px;
    }

    :global(.form-submit-button) {
      padding: 12px 14px;
      font-size: 0.75rem;
      min-height: 46px;
    }
  }
</style>
