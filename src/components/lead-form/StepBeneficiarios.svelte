<script lang="ts">
  import FormStep from './FormStep.svelte';
  import SubmitButton from './SubmitButton.svelte';
  import {
    validateBeneficiarios
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
      numBeneficiarios: number | string;
      idadesBeneficiarios: number[];
    };
    validation: {
      numBeneficiarios: FieldValidation;
      idadesBeneficiarios: FieldValidation;
    };
    isSubmitting?: boolean;
    onUpdate?: (field: string, value: any) => void;
    onclick?: () => void;
    onPrev?: () => void;
  } = $props();

  let informarIdadesDepois = $state(false);

  function setNumBeneficiarios(n: number) {
    if (n < 1 || n > 30) return;
    onUpdate('numBeneficiarios', n);

    // Sync idades array
    const currentIdades = [...formData.idadesBeneficiarios];
    if (n > currentIdades.length) {
      while (currentIdades.length < n) currentIdades.push(0);
    } else {
      currentIdades.length = n;
    }
    onUpdate('idadesBeneficiarios', currentIdades);
  }

  function updateIdade(index: number, value: string) {
    const currentIdades = [...formData.idadesBeneficiarios];
    const numValue = parseInt(value, 10);
    currentIdades[index] = (isNaN(numValue) || numValue < 0) ? 0 : Math.min(numValue, 120);
    onUpdate('idadesBeneficiarios', currentIdades);
  }

  function toggleInformarIdadesDepois() {
    informarIdadesDepois = !informarIdadesDepois;
    onUpdate('validation_idadesBeneficiarios', { touched: true, error: '' });
  }

  function handleNumBlur(e: FocusEvent) {
    onUpdate('validation_numBeneficiarios', { touched: true, error: validateBeneficiarios(formData.numBeneficiarios) });
  }

  function isStepValid(): boolean {
    return !validateBeneficiarios(formData.numBeneficiarios);
  }
</script>

<FormStep
  heading="Beneficiários"
  subtext="Informe quantas pessoas estão cobertas pelo plano e a idade de cada uma."
  fields={stepFields}
>
  {#snippet stepFields()}
  <div class="counter-group">
    <div class="prompt-row">
      <label for="lead-beneficiarios" class="input-label" id="num-label">
        Quantos beneficiários? <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Incluindo você, se aplicável</span>
    </div>
    <div class="counter-control" role="group" aria-labelledby="num-label">
      <button
        type="button"
        class="counter-btn"
        onclick={() => setNumBeneficiarios((typeof formData.numBeneficiarios === 'number' ? formData.numBeneficiarios : parseInt(formData.numBeneficiarios, 10) || 1) - 1)}
        disabled={typeof formData.numBeneficiarios !== 'number' || formData.numBeneficiarios <= 1}
        aria-label="Diminuir beneficiários"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <input
        type="number"
        id="lead-beneficiarios"
        class="counter-input"
        class:has-error={validation.numBeneficiarios.touched && !!validation.numBeneficiarios.error}
        value={formData.numBeneficiarios}
        oninput={(e) => setNumBeneficiarios(parseInt((e.currentTarget as HTMLInputElement).value, 10) || 1)}
        onblur={handleNumBlur}
        min="1"
        max="30"
        inputmode="numeric"
        aria-invalid={validation.numBeneficiarios.touched && !!validation.numBeneficiarios.error}
        aria-describedby={validation.numBeneficiarios.error ? 'lead-beneficiarios-error' : undefined}
      />
      <button
        type="button"
        class="counter-btn"
        onclick={() => setNumBeneficiarios((typeof formData.numBeneficiarios === 'number' ? formData.numBeneficiarios : parseInt(formData.numBeneficiarios, 10) || 0) + 1)}
        disabled={typeof formData.numBeneficiarios === 'number' && formData.numBeneficiarios >= 30}
        aria-label="Adicionar beneficiário"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
    {#if !validation.numBeneficiarios.error}
      <p class="field-note">Você pode ajustar a quantidade com os botões ou digitando diretamente.</p>
    {/if}
    {#if validation.numBeneficiarios.touched && validation.numBeneficiarios.error}
      <p class="error-message" id="lead-beneficiarios-error" role="alert">
        {validation.numBeneficiarios.error}
      </p>
    {/if}
  </div>

  {#if formData.idadesBeneficiarios.length > 0}
    <div class="idades-section">
      <div class="prompt-row">
        <span class="input-label" id="idades-label">
          Idade de cada beneficiário
        </span>
        <span class="prompt-hint">Opcional</span>
      </div>

      <div class="skip-option">
        <button
          type="button"
          class="skip-button"
          class:active={informarIdadesDepois}
          onclick={toggleInformarIdadesDepois}
          aria-pressed={informarIdadesDepois}
        >
          Prefiro informar depois.
        </button>
      </div>

      {#if !informarIdadesDepois}
        <div class="idades-grid" role="group" aria-labelledby="idades-label">
          {#each formData.idadesBeneficiarios as _, i}
            <div class="idade-cell">
              <label for="idade-{i}" class="idade-cell-label">
                {i + 1}{#if i === 0}º{:else}º{/if}
              </label>
              <input
                type="number"
                id="idade-{i}"
                class="idade-input"
                value={formData.idadesBeneficiarios[i] || ''}
                oninput={(e) => updateIdade(i, (e.currentTarget as HTMLInputElement).value)}
                min="0"
                max="120"
                inputmode="numeric"
                placeholder="—"
                aria-label="Idade do beneficiário {i + 1}"
              />
            </div>
          {/each}
        </div>

        <p class="field-note">Essas idades ajudam a estimar faixa de preço e elegibilidade das opções disponíveis.</p>
      {:else}
        <p class="field-note">Seguimos agora e completamos as idades no atendimento.</p>
      {/if}

      {#if validation.idadesBeneficiarios.touched && validation.idadesBeneficiarios.error}
        <p class="error-message" role="alert">
          {validation.idadesBeneficiarios.error}
        </p>
      {/if}
    </div>
  {/if}

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
      label="Enviar"
      onclick={onclick}
    />
  </div>
  <p class="enter-hint">Pressione Enter para enviar</p>
  {/snippet}
</FormStep>

<style>
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

  .counter-group {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .counter-control {
    display: inline-flex;
    align-items: center;
    gap: 0;
    width: fit-content;
    border-bottom: 1.5px solid hsl(214, 15%, 35%);
    transition: border-color 0.3s ease;
    padding-bottom: 0.2rem;
  }

  .counter-control:focus-within {
    border-bottom-color: hsl(45, 40%, 55%);
  }

  .counter-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    color: hsl(214, 15%, 55%);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .counter-btn:hover:not(:disabled) {
    color: hsl(45, 40%, 60%);
    background: hsla(45, 30%, 50%, 0.08);
  }

  .counter-btn:active:not(:disabled) {
    transform: scale(0.92);
  }

  .counter-btn:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  .counter-input {
    width: 48px;
    padding: 8px 4px;
    border: none;
    background: transparent;
    color: hsl(214, 61%, 95%);
    font-family: 'IBM Plex Serif', serif;
    font-size: 1.35rem;
    font-weight: 400;
    text-align: center;
    outline: none;
    -moz-appearance: textfield;
  }

  .counter-input::-webkit-outer-spin-button,
  .counter-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .counter-input.has-error {
    color: hsl(0, 40%, 65%);
  }

  .field-note {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.82rem;
    color: hsl(214, 15%, 52%);
    margin: 0.15rem 0 0;
    line-height: 1.5;
  }

  .idades-section {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .skip-option {
    display: flex;
  }

  .skip-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0.75rem 1rem;
    border-radius: 14px;
    border: 1.5px solid hsl(214, 15%, 30%);
    background: hsla(214, 20%, 14%, 0.42);
    color: hsl(214, 15%, 65%);
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .skip-button:hover {
    border-color: hsl(214, 15%, 45%);
    color: hsl(214, 15%, 78%);
    background: hsla(214, 20%, 16%, 0.55);
  }

  .skip-button.active {
    border-color: hsl(45, 40%, 55%);
    background: hsla(45, 30%, 50%, 0.1);
    color: hsl(45, 30%, 75%);
    box-shadow: 0 0 12px hsla(45, 40%, 55%, 0.15);
  }

  .idades-grid {
    display: grid;
    grid-template-rows: repeat(4, auto);
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 0.5rem 1.25rem;
  }

  .idade-cell {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .idade-cell-label {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    color: hsl(214, 15%, 45%);
    letter-spacing: 0.04em;
    min-width: 20px;
    flex-shrink: 0;
  }

  .idade-input {
    flex: 1;
    max-width: 72px;
    padding: 6px 0;
    border: none;
    border-bottom: 1px solid hsla(214, 15%, 30%, 0.6);
    background: transparent;
    color: hsl(214, 61%, 95%);
    font-family: 'IBM Plex Serif', serif;
    font-size: 1rem;
    font-weight: 400;
    text-align: center;
    outline: none;
    transition: all 0.3s ease;
    -moz-appearance: textfield;
  }

  .idade-input::-webkit-outer-spin-button,
  .idade-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .idade-input::placeholder {
    color: hsl(214, 15%, 40%);
    opacity: 0.4;
  }

  .idade-input:focus {
    border-bottom-color: hsl(45, 40%, 55%);
    box-shadow: 0 1px 0 hsla(45, 40%, 55%, 0.2);
  }

  /* Error messages */
  .error-message {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    color: hsl(0, 50%, 62%);
    margin: 0.25rem 0 0 0;
    line-height: 1.4;
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

    .counter-group {
      width: 100%;
    }

    .counter-control {
      width: 100%;
      justify-content: center;
      padding: 0.5rem 0;
    }

    .counter-input {
      font-size: 1.25rem;
    }

    .counter-btn {
      width: 44px;
      height: 44px;
    }

    .idades-grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(auto-fill, auto);
      grid-auto-flow: row;
      gap: 0.75rem 0.875rem;
    }

    .skip-option,
    .skip-button {
      width: 100%;
    }

    .idade-input {
      max-width: 100%;
      font-size: 0.9375rem;
      padding: 8px 0;
    }

    .idade-cell-label {
      font-size: 0.6875rem;
      min-width: 16px;
    }

    .input-label {
      font-size: 0.6875rem;
      letter-spacing: 0.06em;
    }

    .prompt-hint {
      font-size: 0.75rem;
      white-space: normal;
    }

    .error-message,
    .field-note,
    .enter-hint {
      font-size: 0.6875rem;
    }

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
    .idades-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.625rem;
    }

    .idade-input {
      padding: 6px 0;
      font-size: 0.875rem;
    }

    .idade-cell-label {
      font-size: 0.625rem;
    }

    .counter-btn {
      width: 40px;
      height: 40px;
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
