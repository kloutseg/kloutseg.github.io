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
      cnpj: string;
      razaoSocial: string;
      site: string;
      cidade: string;
      uf: string;
    };
    validation: {
      cnpj: FieldValidation;
      razaoSocial: FieldValidation;
      site: FieldValidation;
      cidade: FieldValidation;
      uf: FieldValidation;
    };
    isSubmitting?: boolean;
    onUpdate?: (field: string, value: any) => void;
    onclick?: () => void;
    onPrev?: () => void;
  } = $props();

  function handleCnpjInput(e: Event) {
    onUpdate('cnpj', formatCNPJ((e.currentTarget as HTMLInputElement).value));
  }

  function handleInputChange(e: Event) {
    const target = e.currentTarget as HTMLInputElement | HTMLSelectElement;
    onUpdate(target.dataset.field as string, target.value);
  }

  function handleBlur(e: FocusEvent) {
    const target = e.currentTarget as HTMLInputElement | HTMLSelectElement;
    const field = target.dataset.field as string;
    const value = (target as HTMLInputElement).value || '';
    let error = '';

    if (field === 'cnpj') error = value.replace(/\D/g, '').length === 14 ? '' : 'CNPJ incompleto';
    else if (field === 'razaoSocial') error = value.trim() ? '' : 'Informe a razão social';
    else if (field === 'site' && value.trim()) {
      try { new URL(value.trim().startsWith('http') ? value.trim() : `https://${value.trim()}`); }
      catch { error = 'Formato de URL inválido'; }
    }
    else if (field === 'cidade') error = value.trim() ? '' : 'Informe a cidade';
    else if (field === 'uf') error = value ? '' : 'Selecione a UF';

    onUpdate(`validation_${field}`, { touched: true, error });
  }

  function isStepValid(): boolean {
    if (formData.cnpj.replace(/\D/g, '').length !== 14) return false;
    if (!formData.razaoSocial.trim()) return false;
    if (!formData.cidade.trim()) return false;
    if (!formData.uf) return false;
    if (formData.site.trim()) {
      try { new URL(formData.site.trim().startsWith('http') ? formData.site.trim() : `https://${formData.site.trim()}`); }
      catch { return false; }
    }
    return true;
  }
</script>

<FormStep
  heading="Informações gerais"
  subtext="Agora precisamos dos dados principais da empresa para enquadrar a análise e validar elegibilidade."
  fields={stepFields}
>
  {#snippet stepFields()}
  <div class="form-row">
    <div class="form-group">
      <div class="prompt-row">
        <label for="lead-cnpj-b2b" class="input-label">
          CNPJ <span class="required-asterisk">*</span>
        </label>
      </div>
      <input type="text" id="lead-cnpj-b2b" data-field="cnpj" class="form-input"
        class:has-error={validation.cnpj.touched && !!validation.cnpj.error}
        value={formData.cnpj} oninput={handleCnpjInput} onblur={handleBlur}
        placeholder="00.000.000/0001-00" maxlength="18" required
        aria-invalid={validation.cnpj.touched && !!validation.cnpj.error}
        aria-describedby={validation.cnpj.error ? 'lead-cnpj-b2b-error' : undefined} />
      {#if !validation.cnpj.error}
        <p class="field-note">Usamos o CNPJ para validar enquadramento e preparar opções aderentes ao porte da empresa.</p>
      {/if}
      {#if validation.cnpj.touched && validation.cnpj.error}
        <p class="error-message" id="lead-cnpj-b2b-error" role="alert">{validation.cnpj.error}</p>
      {/if}
    </div>

    <div class="form-group">
      <div class="prompt-row">
        <label for="lead-razao" class="input-label">
          Razão Social <span class="required-asterisk">*</span>
        </label>
      </div>
      <input type="text" id="lead-razao" data-field="razaoSocial" class="form-input"
        class:has-error={validation.razaoSocial.touched && !!validation.razaoSocial.error}
        value={formData.razaoSocial} oninput={handleInputChange} onblur={handleBlur} required
        placeholder="Razão social da empresa"
        aria-invalid={validation.razaoSocial.touched && !!validation.razaoSocial.error}
        aria-describedby={validation.razaoSocial.error ? 'lead-razao-error' : undefined} />
      {#if !validation.razaoSocial.error}
        <p class="field-note">Informe o nome jurídico da empresa, exatamente como consta no cadastro oficial.</p>
      {/if}
      {#if validation.razaoSocial.touched && validation.razaoSocial.error}
        <p class="error-message" id="lead-razao-error" role="alert">{validation.razaoSocial.error}</p>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <div class="prompt-row">
      <label for="lead-site" class="input-label">
        Site da empresa <span class="optional-tag">(opcional)</span>
      </label>
      <span class="prompt-hint">Se houver</span>
    </div>
    <input type="text" id="lead-site" data-field="site" class="form-input"
      class:has-error={validation.site.touched && !!validation.site.error}
      value={formData.site} oninput={handleInputChange} onblur={handleBlur}
      placeholder="https://www.empresa.com.br"
      aria-invalid={validation.site.touched && !!validation.site.error}
      aria-describedby={validation.site.error ? 'lead-site-error' : undefined} />
    {#if !validation.site.error}
      <p class="field-note">Esse dado é opcional, mas pode ajudar a contextualizar segmento e operação.</p>
    {/if}
    {#if validation.site.touched && validation.site.error}
      <p class="error-message" id="lead-site-error" role="alert">{validation.site.error}</p>
    {/if}
  </div>

  <div class="form-group cidade-uf-group">
    <div class="prompt-row">
      <label for="lead-cidade-b2b" class="input-label">
        Cidade e UF <span class="required-asterisk">*</span>
      </label>
      <span class="prompt-hint">Base da operação</span>
    </div>
    <div class="cidade-uf-row">
      <div class="cidade-field">
        <input type="text" id="lead-cidade-b2b" data-field="cidade" class="form-input"
          class:has-error={validation.cidade.touched && !!validation.cidade.error}
          value={formData.cidade} oninput={handleInputChange} onblur={handleBlur} required
          placeholder="Ex: São Paulo"
          aria-invalid={validation.cidade.touched && !!validation.cidade.error}
          aria-describedby={validation.cidade.error ? 'lead-cidade-b2b-error' : undefined} />
        {#if validation.cidade.touched && validation.cidade.error}
          <p class="error-message" id="lead-cidade-b2b-error" role="alert">{validation.cidade.error}</p>
        {/if}
      </div>

      <div class="uf-field">
        <select id="lead-uf-b2b" data-field="uf" class="form-select"
          class:has-error={validation.uf.touched && !!validation.uf.error}
          value={formData.uf} onchange={handleInputChange} onblur={handleBlur} required
          aria-invalid={validation.uf.touched && !!validation.uf.error}
          aria-describedby={validation.uf.error ? 'lead-uf-b2b-error' : undefined}>
          <option value="" disabled>UF</option>
          {#each UFS as uf}<option value={uf}>{uf}</option>{/each}
        </select>
        {#if validation.uf.touched && validation.uf.error}
          <p class="error-message" id="lead-uf-b2b-error" role="alert">{validation.uf.error}</p>
        {/if}
      </div>
    </div>
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
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .prompt-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  .cidade-uf-group { display: flex; flex-direction: column; gap: 0.65rem; }
  .cidade-uf-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
  }
  .cidade-field { flex: 1; min-width: 0; }
  .uf-field {
    width: 80px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .input-label {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.8rem; font-weight: 600; color: hsl(214, 20%, 60%);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .required-asterisk { color: hsl(0, 50%, 62%); margin-left: 2px; }
  .optional-tag { color: hsl(214, 15%, 45%); font-weight: 400; text-transform: none; letter-spacing: 0; }
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
    font-family: 'IBM Plex Serif', serif; font-size: clamp(1.2rem, 2vw, 1.55rem); font-weight: 400;
    line-height: 1.2;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); outline: none; border-radius: 0;
  }
  .form-input::placeholder { color: hsl(214, 15%, 45%); opacity: 0.42; font-style: normal; }
  .form-input:hover:not(:focus) { border-bottom-color: hsl(214, 15%, 50%); }
  .form-input:focus { border-bottom-color: hsl(45, 40%, 55%); box-shadow: 0 2px 0 hsla(45, 40%, 55%, 0.3); }
  .form-input.has-error { border-bottom-color: hsl(0, 40%, 55%); }
  .form-input.has-error:focus { border-bottom-color: hsl(0, 40%, 60%); box-shadow: 0 2px 0 hsla(0, 40%, 55%, 0.3); }
  .form-select {
    width: 100%; padding: 14px 24px 16px 0; border: none;
    border-bottom: 1.5px solid hsl(214, 15%, 35%);
    background: transparent; color: hsl(214, 61%, 95%);
    font-family: 'IBM Plex Serif', serif; font-size: clamp(1.05rem, 1.8vw, 1.35rem); font-weight: 400;
    line-height: 1.2;
    outline: none; border-radius: 0; cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a9bb5' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 0 center; background-size: 16px; padding-right: 24px;
  }
  .form-select option { background: hsl(214, 20%, 14%); color: hsl(214, 61%, 95%); }
  .form-select:focus { border-bottom-color: hsl(45, 40%, 55%); box-shadow: 0 2px 0 hsla(45, 40%, 55%, 0.3); }
  .form-select.has-error { border-bottom-color: hsl(0, 40%, 55%); }
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
    .form-input, .form-select {
      font-size: 16px;
      line-height: 1.4;
    }
    .form-input { padding: 14px 0; }
    .form-select { padding: 14px 24px 14px 0; }
    .form-input::placeholder { font-size: 0.875rem; }
    .input-label { font-size: 0.6875rem; letter-spacing: 0.06em; }
    .prompt-row { align-items: flex-start; flex-direction: column; gap: 0.2rem; }
    .prompt-hint { font-size: 0.75rem; white-space: normal; }
    .form-row { grid-template-columns: 1fr; gap: 1rem; }
    .cidade-uf-row {
      flex-direction: column;
      gap: 0.75rem;
    }
    .uf-field {
      width: 100%;
    }
    .optional-tag { font-size: 0.6875rem; }
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
    .form-select { padding: 12px 24px 12px 0; }
    .cidade-uf-row { gap: 0.625rem; }
    .uf-field { width: 100%; }
    .nav-container { gap: 0.5rem; padding-top: 0.75rem; }
    .back-step-button { padding: 12px 14px; font-size: 0.75rem; min-height: 46px; }
    :global(.form-submit-button) { padding: 12px 14px; font-size: 0.75rem; min-height: 46px; }
    .input-label {
      padding-left: max(0.25rem, env(safe-area-inset-left));
      padding-right: max(0.25rem, env(safe-area-inset-right));
    }
  }
</style>
