<script lang="ts">
  import FormStep from './FormStep.svelte';
  import SubmitButton from './SubmitButton.svelte';
  import {
    validatePlanoSaude,
    validateInvestimento,
    formatCurrencyBRL
  } from '../../lib/form-validation';
  import type { FieldValidation } from '../../lib/form-store';

  let {
    formData,
    validation,
    isSubmitting = false,
    onUpdate = (_field: string, _value: any) => {},
    onclick = () => {},
    onPrev = () => {}
  }: {
    formData: {
      planoSaude: string;
      investimentoMensal: string;
    };
    validation: {
      planoSaude: FieldValidation;
      investimentoMensal: FieldValidation;
    };
    isSubmitting?: boolean;
    onUpdate?: (field: string, value: any) => void;
    onclick?: () => void;
    onPrev?: () => void;
  } = $props();

  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const field = target.dataset.field as string;
    let value = target.value;

    if (field === 'investimentoMensal') {
      value = formatCurrencyBRL(value);
    }

    onUpdate(field, value);
  }

  function handleBlur(e: FocusEvent) {
    const target = e.currentTarget as HTMLInputElement;
    const field = target.dataset.field as string;

    if (field === 'planoSaude') {
      onUpdate('validation_planoSaude', { touched: true, error: validatePlanoSaude(formData.planoSaude) });
    } else if (field === 'investimentoMensal') {
      onUpdate('validation_investimentoMensal', { touched: true, error: validateInvestimento(formData.investimentoMensal) });
    }
  }

  function isStepValid(): boolean {
    return !validatePlanoSaude(formData.planoSaude)
      && !validateInvestimento(formData.investimentoMensal);
  }
</script>

<FormStep
  heading="Que plano de saúde você usa?"
  subtext="Queremos entender seu cenário atual e quanto você investe hoje para comparar alternativas melhores."
  fields={stepFields}
>
  {#snippet stepFields()}
  <div class="form-group">
    <div class="prompt-row">
      <label for="lead-plano" class="input-label">
        Nome do plano <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Operadora atual</span>
    </div>
    <input
      type="text"
      id="lead-plano"
      data-field="planoSaude"
      class="form-input"
      class:has-error={validation.planoSaude.touched && !!validation.planoSaude.error}
      class:has-success={validation.planoSaude.touched && !validation.planoSaude.error}
      value={formData.planoSaude}
      oninput={handleInput}
      onblur={handleBlur}
      required
      placeholder="Ex: Amil, Bradesco Saúde, Unimed..."
      aria-invalid={validation.planoSaude.touched && !!validation.planoSaude.error}
      aria-describedby={validation.planoSaude.error ? 'lead-plano-error' : undefined}
    />
    {#if !validation.planoSaude.error}
      <p class="field-note">Se preferir, informe apenas a operadora principal do plano que você usa hoje.</p>
    {/if}
    {#if validation.planoSaude.touched && validation.planoSaude.error}
      <p class="error-message" id="lead-plano-error" role="alert">
        {validation.planoSaude.error}
      </p>
    {/if}
  </div>

  <div class="form-group">
    <div class="prompt-row">
      <label for="lead-investimento" class="input-label">
        Investimento mensal <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Valor aproximado</span>
    </div>
    <input
      type="text"
      id="lead-investimento"
      data-field="investimentoMensal"
      class="form-input"
      class:has-error={validation.investimentoMensal.touched && !!validation.investimentoMensal.error}
      class:has-success={validation.investimentoMensal.touched && !validation.investimentoMensal.error}
      value={formData.investimentoMensal}
      oninput={handleInput}
      onblur={handleBlur}
      required
      placeholder="R$ 0,00"
      aria-invalid={validation.investimentoMensal.touched && !!validation.investimentoMensal.error}
      aria-describedby={validation.investimentoMensal.error ? 'lead-investimento-error' : undefined}
    />
    {#if !validation.investimentoMensal.error}
      <p class="field-note">Esse valor nos ajuda a comparar faixa de preço, cobertura e economia possível.</p>
    {/if}
    {#if validation.investimentoMensal.touched && validation.investimentoMensal.error}
      <p class="error-message" id="lead-investimento-error" role="alert">
        {validation.investimentoMensal.error}
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
    font-size: clamp(1.28rem, 2.2vw, 1.75rem);
    font-weight: 400;
    line-height: 1.2;
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
    gap: 1rem;
  }

  .back-step-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 14px 20px;
    min-width: 160px;
    min-height: 52px;
    border-radius: 50px;
    border: 1.5px solid hsl(214, 15%, 35%);
    background: transparent;
    color: hsl(214, 15%, 65%);
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .back-step-button:hover {
    border-color: hsl(214, 15%, 50%);
    color: hsl(214, 61%, 90%);
    background: hsla(214, 15%, 20%, 0.3);
  }

  .back-step-button:active {
    transform: scale(0.98);
  }

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
