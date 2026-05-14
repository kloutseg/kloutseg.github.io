<script lang="ts">
  import FormStep from './FormStep.svelte';
  import SubmitButton from './SubmitButton.svelte';
  import { formatCNPJ } from '../../lib/form-validation';
  import type { FieldValidation } from '../../lib/form-store';

  const UFS = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ];

  let {
    formData,
    validation,
    isSubmitting = false,
    onUpdate = (_field: string, _value: any) => {},
    onclick = () => {},
    onPrev = () => {}
  }: {
    formData: {
      temCnpj: boolean | 'later' | null;
      cnpjNumero: string;
      cnpjCidade: string;
      cnpjUf: string;
    };
    validation: {
      cnpjNumero: FieldValidation;
      cnpjCidade: FieldValidation;
      cnpjUf: FieldValidation;
    };
    isSubmitting?: boolean;
    onUpdate?: (field: string, value: any) => void;
    onclick?: () => void;
    onPrev?: () => void;
  } = $props();

  function handleCnpjInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    onUpdate('cnpjNumero', formatCNPJ(target.value));
  }

  function handleCidadeInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    onUpdate('cnpjCidade', target.value);
  }

  function handleUfChange(e: Event) {
    const target = e.currentTarget as HTMLSelectElement;
    onUpdate('cnpjUf', target.value);
  }

  function handleCnpjBlur() {
    if (formData.temCnpj === true) {
      const error = formData.cnpjNumero.trim() && formData.cnpjNumero.replace(/\D/g, '').length !== 14 ? 'CNPJ incompleto' : '';
      onUpdate('validation_cnpjNumero', { touched: true, error });
    }
  }

  function handleCidadeBlur() {
    if (formData.temCnpj === true) {
      onUpdate('validation_cnpjCidade', { touched: true, error: '' });
    }
  }

  function handleUfBlur() {
    if (formData.temCnpj === true) {
      onUpdate('validation_cnpjUf', { touched: true, error: '' });
    }
  }

  function isStepValid(): boolean {
    if (formData.temCnpj !== true || !formData.cnpjNumero.trim()) return true;
    return formData.cnpjNumero.replace(/\D/g, '').length === 14;
  }
</script>

<FormStep
  heading="Você tem CNPJ?"
  subtext="Isso nos ajuda a entender se a análise precisa considerar vínculo empresarial ou apenas contratação individual."
  fields={stepFields}
>
  {#snippet stepFields()}
  <div class="form-group">
    <div class="prompt-row">
      <span class="input-label" id="cnpj-label">CNPJ ativo</span>
      <span class="prompt-hint">Opcional para seguir</span>
    </div>
    <div class="toggle-group" role="group" aria-labelledby="cnpj-label">
      <button
        type="button"
        class="toggle-button"
        class:active={formData.temCnpj === true}
        onclick={() => onUpdate('temCnpj', formData.temCnpj === true ? null : true)}
        aria-pressed={formData.temCnpj === true}
        aria-label="Sim, tem CNPJ"
      >
        <span class="toggle-copy">
          <span class="toggle-title">Sim</span>
          <span class="toggle-desc">Quero considerar meu vínculo com empresa</span>
        </span>
      </button>
      <button
        type="button"
        class="toggle-button"
        class:active={formData.temCnpj === false}
        onclick={() => onUpdate('temCnpj', formData.temCnpj === false ? null : false)}
        aria-pressed={formData.temCnpj === false}
        aria-label="Não tem CNPJ"
      >
        <span class="toggle-copy">
          <span class="toggle-title">Não</span>
          <span class="toggle-desc">Quero seguir como contratação individual</span>
        </span>
      </button>
      <button
        type="button"
        class="toggle-button"
        class:active={formData.temCnpj === 'later'}
        onclick={() => onUpdate('temCnpj', formData.temCnpj === 'later' ? null : 'later')}
        aria-pressed={formData.temCnpj === 'later'}
        aria-label="Prefiro informar depois"
      >
        <span class="toggle-copy">
          <span class="toggle-title">Prefiro informar depois.</span>
          <span class="toggle-desc">Seguimos agora e completamos esse dado no atendimento</span>
        </span>
      </button>
    </div>
  </div>

  {#if formData.temCnpj === true}
    <div class="form-group">
      <div class="prompt-row">
        <label for="lead-cnpj-numero" class="input-label">
          Número do CNPJ
        </label>
        <span class="prompt-hint">Opcional</span>
      </div>
      <input
        type="text"
        id="lead-cnpj-numero"
        class="form-input"
        class:has-error={validation.cnpjNumero.touched && !!validation.cnpjNumero.error}
        value={formData.cnpjNumero}
        oninput={handleCnpjInput}
        onblur={handleCnpjBlur}
        placeholder="00.000.000/0001-00"
        maxlength="18"
        aria-invalid={validation.cnpjNumero.touched && !!validation.cnpjNumero.error}
        aria-describedby={validation.cnpjNumero.error ? 'lead-cnpj-numero-error' : undefined}
      />
      {#if !validation.cnpjNumero.error}
        <p class="field-note">Usamos esse dado para direcionar melhor a análise comercial.</p>
      {/if}
      {#if validation.cnpjNumero.touched && validation.cnpjNumero.error}
        <p class="error-message" id="lead-cnpj-numero-error" role="alert">
          {validation.cnpjNumero.error}
        </p>
      {/if}

      <div class="cidade-uf-row">
        <div class="cidade-field">
          <label for="lead-cnpj-cidade" class="input-label">
            Cidade
          </label>
          <input
            type="text"
            id="lead-cnpj-cidade"
            class="form-input"
            class:has-error={validation.cnpjCidade.touched && !!validation.cnpjCidade.error}
            value={formData.cnpjCidade}
            oninput={handleCidadeInput}
            onblur={handleCidadeBlur}
            placeholder="Ex: São Paulo"
            aria-invalid={validation.cnpjCidade.touched && !!validation.cnpjCidade.error}
            aria-describedby={validation.cnpjCidade.error ? 'lead-cnpj-cidade-error' : undefined}
          />
          {#if validation.cnpjCidade.touched && validation.cnpjCidade.error}
            <p class="error-message" id="lead-cnpj-cidade-error" role="alert">
              {validation.cnpjCidade.error}
            </p>
          {/if}
        </div>

        <div class="uf-field">
          <label for="lead-cnpj-uf" class="input-label">
            UF
          </label>
          <select
            id="lead-cnpj-uf"
            class="form-select"
            class:has-error={validation.cnpjUf.touched && !!validation.cnpjUf.error}
            value={formData.cnpjUf}
            onchange={handleUfChange}
            onblur={handleUfBlur}
            aria-invalid={validation.cnpjUf.touched && !!validation.cnpjUf.error}
            aria-describedby={validation.cnpjUf.error ? 'lead-cnpj-uf-error' : undefined}
          >
            <option value="" selected>Prefiro informar depois.</option>
            {#each UFS as uf}
              <option value={uf}>{uf}</option>
            {/each}
          </select>
          {#if validation.cnpjUf.touched && validation.cnpjUf.error}
            <p class="error-message" id="lead-cnpj-uf-error" role="alert">
              {validation.cnpjUf.error}
            </p>
          {/if}
        </div>
      </div>
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

  .toggle-group {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.25rem;
  }

  .toggle-button {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    min-height: 116px;
    padding: 1rem 1.1rem;
    border-radius: 18px;
    border: 1.5px solid hsl(214, 15%, 30%);
    background: hsla(214, 20%, 14%, 0.42);
    color: hsl(214, 15%, 55%);
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: left;
  }

  .toggle-button:hover {
    border-color: hsl(214, 15%, 45%);
    color: hsl(214, 15%, 70%);
    background: hsla(214, 20%, 16%, 0.55);
  }

  .toggle-button.active {
    border-color: hsl(45, 40%, 55%);
    background: hsla(45, 30%, 50%, 0.1);
    color: hsl(45, 30%, 75%);
    box-shadow: 0 0 12px hsla(45, 40%, 55%, 0.15);
  }

  .toggle-copy {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .toggle-title {
    font-size: 1rem;
    color: hsl(214, 61%, 92%);
    line-height: 1.2;
  }

  .toggle-desc {
    font-size: 0.8rem;
    color: hsl(214, 15%, 52%);
    font-weight: 400;
    line-height: 1.45;
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

  .form-select {
    width: 100%;
    padding: 14px 24px 16px 0;
    border: none;
    border-bottom: 1.5px solid hsl(214, 15%, 35%);
    background: transparent;
    color: hsl(214, 61%, 95%);
    font-family: 'IBM Plex Serif', serif;
    font-size: clamp(1.1rem, 2vw, 1.45rem);
    font-weight: 400;
    line-height: 1.2;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    outline: none;
    border-radius: 0;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a9bb5' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0 center;
    background-size: 16px;
  }

  .form-select option {
    background: hsl(214, 20%, 14%);
    color: hsl(214, 61%, 95%);
  }

  .form-select:focus {
    border-bottom-color: hsl(45, 40%, 55%);
    box-shadow: 0 2px 0 hsla(45, 40%, 55%, 0.3);
  }

  .form-select.has-error {
    border-bottom-color: hsl(0, 40%, 55%);
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

  .cidade-uf-row {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .cidade-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .uf-field {
    width: 100px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.6rem;
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
    .form-input, .form-select {
      font-size: 16px;
      line-height: 1.4;
    }
    .form-input {
      padding: 14px 0;
    }
    .form-select {
      padding: 14px 24px 14px 0;
    }
    .form-input::placeholder { font-size: 0.875rem; }
    .input-label { font-size: 0.6875rem; letter-spacing: 0.06em; }
    .prompt-hint { font-size: 0.75rem; white-space: normal; }
    .field-note,
    .enter-hint,
    .error-message { font-size: 0.75rem; }
    .cidade-uf-row {
      flex-direction: column;
      gap: 1rem;
    }
    .uf-field {
      width: 100%;
      padding-top: 0;
    }
    .toggle-group {
      grid-template-columns: 1fr;
      gap: 0.625rem;
    }
    .toggle-button {
      min-height: unset;
      padding: 0.9rem 1rem;
      border-radius: 14px;
    }
    .toggle-title {
      font-size: 0.9rem;
    }
    .toggle-desc {
      font-size: 0.75rem;
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
    .form-input { padding: 12px 0; }
    .form-select { padding: 12px 24px 12px 0; }
    .toggle-group { gap: 0.5rem; }
    .toggle-button { padding: 0.8rem 0.875rem; border-radius: 12px; }
    .nav-container { gap: 0.5rem; padding-top: 0.75rem; }
    .back-step-button { padding: 12px 14px; font-size: 0.75rem; min-height: 46px; }
    :global(.form-submit-button) { padding: 12px 14px; font-size: 0.75rem; min-height: 46px; }
  }
</style>
