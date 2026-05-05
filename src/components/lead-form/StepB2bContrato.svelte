<script lang="ts">
  import FormStep from './FormStep.svelte';
  import SubmitButton from './SubmitButton.svelte';
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
      temPlanoSaude: boolean | null;
      operadoraPlano: string;
      numVidas: number | string;
    };
    validation: {
      operadoraPlano: FieldValidation;
      numVidas: FieldValidation;
    };
    isSubmitting?: boolean;
    onUpdate?: (field: string, value: any) => void;
    onclick?: () => void;
    onPrev?: () => void;
  } = $props();

  function validateOperadora(value: string): string {
    if (formData.temPlanoSaude === true && !value.trim()) return 'Informe a operadora';
    return '';
  }

  function validateNumVidas(value: number | string): string {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!value || isNaN(num as number)) return 'Informe o número de vidas';
    if ((num as number) < 1) return 'Deve haver pelo menos 1 vida';
    return '';
  }

  function handleOperadoraInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    onUpdate('operadoraPlano', target.value);
    if (validation.operadoraPlano.touched) {
      onUpdate('validation_operadoraPlano', { touched: true, error: validateOperadora(target.value) });
    }
  }

  function handleOperadoraBlur() {
    onUpdate('validation_operadoraPlano', { touched: true, error: validateOperadora(formData.operadoraPlano) });
  }

  function handleNumVidasInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const numValue = parseInt(target.value, 10);
    onUpdate('numVidas', isNaN(numValue) ? '' : numValue);
    if (validation.numVidas.touched) {
      onUpdate('validation_numVidas', { touched: true, error: validateNumVidas(isNaN(numValue) ? '' : numValue) });
    }
  }

  function handleNumVidasBlur() {
    onUpdate('validation_numVidas', { touched: true, error: validateNumVidas(formData.numVidas) });
  }

  function isStepValid(): boolean {
    if (formData.temPlanoSaude === true && validateOperadora(formData.operadoraPlano)) return false;
    if (validateNumVidas(formData.numVidas)) return false;
    return true;
  }
</script>

<FormStep
  heading="Contrato"
  subtext="Com isso, conseguimos entender o cenário atual da empresa e o volume de vidas que precisa ser atendido."
  fields={stepFields}
>
  {#snippet stepFields()}
  <div class="form-group">
    <div class="prompt-row">
      <span class="input-label" id="plano-label">A empresa já possui plano de saúde?</span>
      <span class="prompt-hint">Cenário atual</span>
    </div>
    <div class="toggle-group" role="group" aria-labelledby="plano-label">
      <button type="button" class="toggle-button" class:active={formData.temPlanoSaude === true}
        onclick={() => onUpdate('temPlanoSaude', formData.temPlanoSaude === true ? null : true)}
        aria-pressed={formData.temPlanoSaude === true} aria-label="Sim, possui plano">
        <span class="toggle-copy">
          <span class="toggle-title">Sim</span>
          <span class="toggle-desc">Queremos revisar ou comparar o contrato atual</span>
        </span>
      </button>
      <button type="button" class="toggle-button" class:active={formData.temPlanoSaude === false}
        onclick={() => onUpdate('temPlanoSaude', formData.temPlanoSaude === false ? null : false)}
        aria-pressed={formData.temPlanoSaude === false} aria-label="Não possui plano">
        <span class="toggle-copy">
          <span class="toggle-title">Não</span>
          <span class="toggle-desc">Queremos estruturar uma contratação nova</span>
        </span>
      </button>
    </div>
  </div>

  {#if formData.temPlanoSaude === true}
    <div class="form-group">
      <div class="prompt-row">
        <label for="lead-operadora" class="input-label">
          Qual operadora? <span class="required-asterisk">*</span>
        </label>
        <span class="prompt-hint">Plano atual</span>
      </div>
      <input type="text" id="lead-operadora" class="form-input"
        class:has-error={validation.operadoraPlano.touched && !!validation.operadoraPlano.error}
        value={formData.operadoraPlano} oninput={handleOperadoraInput} onblur={handleOperadoraBlur}
        placeholder="Ex: Amil, Bradesco Saúde, Unimed..." required
        aria-invalid={validation.operadoraPlano.touched && !!validation.operadoraPlano.error}
        aria-describedby={validation.operadoraPlano.error ? 'lead-operadora-error' : undefined} />
      {#if !validation.operadoraPlano.error}
        <p class="field-note">Se já houver contrato ativo, indique a operadora principal para compararmos o cenário atual.</p>
      {/if}
      {#if validation.operadoraPlano.touched && validation.operadoraPlano.error}
        <p class="error-message" id="lead-operadora-error" role="alert">{validation.operadoraPlano.error}</p>
      {/if}
    </div>
  {/if}

  <div class="form-group">
    <div class="prompt-row">
      <label for="lead-num-vidas" class="input-label">
        Quantas vidas (titulares + dependentes)? <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Volume total</span>
    </div>
    <input type="number" id="lead-num-vidas" class="form-input form-input--compact"
      class:has-error={validation.numVidas.touched && !!validation.numVidas.error}
      class:has-success={validation.numVidas.touched && !validation.numVidas.error}
      value={formData.numVidas} oninput={handleNumVidasInput} onblur={handleNumVidasBlur}
      required min="1" inputmode="numeric" placeholder="0"
      aria-invalid={validation.numVidas.touched && !!validation.numVidas.error}
      aria-describedby={validation.numVidas.error ? 'lead-num-vidas-error' : undefined} />
    {#if !validation.numVidas.error}
      <p class="field-note">Inclua titulares e dependentes para refletir o tamanho real da contratação.</p>
    {/if}
    {#if validation.numVidas.touched && validation.numVidas.error}
      <p class="error-message" id="lead-num-vidas-error" role="alert">{validation.numVidas.error}</p>
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
    <SubmitButton disabled={!isStepValid()} isSubmitting={isSubmitting} label="Enviar" onclick={onclick} />
  </div>
  <p class="enter-hint">Pressione Enter para enviar</p>
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
  .toggle-group { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin-top: 0.25rem; }
  .toggle-button {
    display: flex; align-items: flex-start; justify-content: flex-start;
    min-height: 116px;
    padding: 1rem 1.1rem; border-radius: 18px;
    border: 1.5px solid hsl(214, 15%, 30%); background: hsla(214, 20%, 14%, 0.42);
    color: hsl(214, 15%, 55%); font-family: 'Proxima Nova', sans-serif;
    font-size: 0.9rem; font-weight: 600; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); text-align: left;
  }
  .toggle-button:hover { border-color: hsl(214, 15%, 45%); color: hsl(214, 15%, 70%); background: hsla(214, 20%, 16%, 0.55); }
  .toggle-button.active {
    border-color: hsl(45, 40%, 55%); background: hsla(45, 30%, 50%, 0.1);
    color: hsl(45, 30%, 75%); box-shadow: 0 0 12px hsla(45, 40%, 55%, 0.15);
  }
  .toggle-copy { display: flex; flex-direction: column; gap: 0.35rem; }
  .toggle-title { font-size: 1rem; color: hsl(214, 61%, 92%); line-height: 1.2; }
  .toggle-desc { font-size: 0.8rem; color: hsl(214, 15%, 52%); font-weight: 400; line-height: 1.45; }
  .form-input {
    width: 100%; box-sizing: border-box; padding: 14px 0 16px; border: none;
    border-bottom: 1.5px solid hsl(214, 15%, 35%);
    background: transparent; color: hsl(214, 61%, 95%);
    font-family: 'IBM Plex Serif', serif; font-size: clamp(1.2rem, 2vw, 1.55rem); font-weight: 400;
    line-height: 1.2;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); outline: none; border-radius: 0;
  }
  .form-input--compact { max-width: 180px; font-size: clamp(1.15rem, 1.8vw, 1.35rem); }
  .form-input::placeholder { color: hsl(214, 15%, 45%); opacity: 0.42; font-style: normal; }
  .form-input:hover:not(:focus) { border-bottom-color: hsl(214, 15%, 50%); }
  .form-input:focus { border-bottom-color: hsl(45, 40%, 55%); box-shadow: 0 2px 0 hsla(45, 40%, 55%, 0.3); }
  .form-input.has-error { border-bottom-color: hsl(0, 40%, 55%); }
  .form-input.has-error:focus { border-bottom-color: hsl(0, 40%, 60%); box-shadow: 0 2px 0 hsla(0, 40%, 55%, 0.3); }
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
    .form-input--compact { max-width: 100%; }
    .prompt-hint { font-size: 0.75rem; white-space: normal; }
    .toggle-group {
      grid-template-columns: 1fr;
      gap: 0.625rem;
    }
    .toggle-button {
      padding: 0.9rem 1rem;
      min-height: unset;
      border-radius: 14px;
    }
    .toggle-title { font-size: 0.9rem; }
    .toggle-desc { font-size: 0.75rem; }
    .input-label { font-size: 0.6875rem; letter-spacing: 0.06em; }
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
    .toggle-group { gap: 0.5rem; }
    .toggle-button { padding: 0.8rem 0.875rem; font-size: 0.75rem; min-height: 46px; }
    .nav-container { gap: 0.5rem; padding-top: 0.75rem; }
    .back-step-button { padding: 12px 14px; font-size: 0.75rem; min-height: 46px; }
    :global(.form-submit-button) { padding: 12px 14px; font-size: 0.75rem; min-height: 46px; }
  }
</style>
