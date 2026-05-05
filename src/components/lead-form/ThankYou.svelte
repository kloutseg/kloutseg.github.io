<script lang="ts">
  import { gsap } from 'gsap';
  import { prefersReducedMotion } from '../../lib/reducedMotion';

  const reducedMotion = prefersReducedMotion();

  interface B2CData {
    type: 'b2c';
    nome: string; email: string; telefone: string;
    temCnpj: boolean | null; cnpjNumero: string; cnpjCidade: string; cnpjUf: string;
    planoSaude: string; numBeneficiarios: number | string;
    idadesBeneficiarios: number[]; investimentoMensal: string;
  }

  interface B2BData {
    type: 'b2b';
    nomeInterlocutor: string; telefone: string; email: string; cargo: string;
    cnpj: string; razaoSocial: string; site: string; cidade: string; uf: string;
    temPlanoSaude: boolean | null; operadoraPlano: string; numVidas: number | string;
  }

  type FormData = B2CData | B2BData | null;

  let formData = $state<FormData>(null);

  $effect(() => {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('lead_form_data');
      if (stored) {
        try { formData = JSON.parse(stored); sessionStorage.removeItem('lead_form_data'); }
        catch (e) { /* ignore */ }
      }
    }
  });

  let wrapper: HTMLElement | null = $state(null);
  let checkIcon: SVGSVGElement | null = $state(null);
  let headingEl: HTMLElement | null = $state(null);
  let messageEl: HTMLElement | null = $state(null);
  let summaryEl: HTMLElement | null = $state(null);
  let homeButton: HTMLElement | null = $state(null);

  $effect(() => {
    if (!wrapper || reducedMotion) {
      if (wrapper) gsap.set([checkIcon, headingEl, messageEl, summaryEl, homeButton], { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (checkIcon) tl.fromTo(checkIcon, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' }, 0);
    if (headingEl) tl.fromTo(headingEl, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2 }, 0.3);
    if (messageEl) tl.fromTo(messageEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 0.5);
    if (summaryEl && formData) tl.fromTo(summaryEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 0.7);
    if (homeButton) tl.fromTo(homeButton, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 }, formData ? 0.9 : 0.7);
  });

  function idadesList(): string {
    if (formData?.type !== 'b2c' || !formData?.idadesBeneficiarios?.length) return '';
    return formData.idadesBeneficiarios.filter((a: number) => a > 0).join(', ');
  }
</script>

<div class="confirmation-wrapper" bind:this={wrapper}>
  <div class="confirmation-content">
    <div class="check-icon-container">
      <svg class="check-icon" bind:this={checkIcon} width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    </div>

    <h2 class="confirmation-heading" bind:this={headingEl}>
      Agradecemos pelas informações!
    </h2>

    <p class="confirmation-message" bind:this={messageEl}>
      Dentro das próximas 24 horas úteis um de nossos consultores entrará em contato com você.
    </p>

    {#if formData}
      <div class="summary-card" bind:this={summaryEl}>
        <div class="type-badge">
          {#if formData.type === 'b2c'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Pessoa Física
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="1"></rect>
              <line x1="8" y1="6" x2="10" y2="6"></line>
              <line x1="14" y1="6" x2="16" y2="6"></line>
              <line x1="8" y1="10" x2="10" y2="10"></line>
              <line x1="14" y1="10" x2="16" y2="10"></line>
              <line x1="8" y1="14" x2="10" y2="14"></line>
              <line x1="14" y1="14" x2="16" y2="14"></line>
              <rect x="9" y="18" width="6" height="4"></rect>
            </svg>
            Empresa
          {/if}
        </div>

        <h3 class="summary-title">Dados enviados</h3>
        <dl class="summary-list">
          {#if formData.type === 'b2c'}
            <!-- B2C fields -->
            <div class="summary-item"><dt>Nome</dt><dd>{formData.nome}</dd></div>
            <div class="summary-item"><dt>E-mail</dt><dd>{formData.email}</dd></div>
            <div class="summary-item"><dt>Telefone</dt><dd>{formData.telefone}</dd></div>
            {#if formData.temCnpj === true}
              <div class="summary-item"><dt>CNPJ</dt><dd>{formData.cnpjNumero}</dd></div>
              {#if formData.cnpjCidade || formData.cnpjUf}
                <div class="summary-item"><dt>Localização</dt><dd>{formData.cnpjCidade}{#if formData.cnpjCidade && formData.cnpjUf} — {/if}{formData.cnpjUf}</dd></div>
              {/if}
            {/if}
            {#if formData.planoSaude}
              <div class="summary-item"><dt>Plano de saúde</dt><dd>{formData.planoSaude}</dd></div>
            {/if}
            {#if formData.numBeneficiarios}
              <div class="summary-item"><dt>Beneficiários</dt><dd>{formData.numBeneficiarios}</dd></div>
            {/if}
            {#if idadesList()}
              <div class="summary-item"><dt>Idades</dt><dd>{idadesList()} anos</dd></div>
            {/if}
            {#if formData.investimentoMensal}
              <div class="summary-item"><dt>Investimento mensal</dt><dd>{formData.investimentoMensal}</dd></div>
            {/if}
          {:else}
            <!-- B2B fields -->
            <div class="summary-item"><dt>Responsável</dt><dd>{formData.nomeInterlocutor}</dd></div>
            <div class="summary-item"><dt>Cargo</dt><dd>{formData.cargo}</dd></div>
            <div class="summary-item"><dt>E-mail</dt><dd>{formData.email}</dd></div>
            <div class="summary-item"><dt>Telefone</dt><dd>{formData.telefone}</dd></div>
            <div class="summary-item"><dt>CNPJ</dt><dd>{formData.cnpj}</dd></div>
            <div class="summary-item"><dt>Razão Social</dt><dd>{formData.razaoSocial}</dd></div>
            {#if formData.site}
              <div class="summary-item"><dt>Site</dt><dd>{formData.site}</dd></div>
            {/if}
            <div class="summary-item"><dt>Localização</dt><dd>{formData.cidade} — {formData.uf}</dd></div>
            {#if formData.temPlanoSaude === true}
              <div class="summary-item"><dt>Operadora</dt><dd>{formData.operadoraPlano}</dd></div>
            {/if}
            <div class="summary-item"><dt>Vidas cobertas</dt><dd>{formData.numVidas}</dd></div>
          {/if}
        </dl>
      </div>
    {/if}

    <a href="/" class="home-button" bind:this={homeButton}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      Voltar à página inicial
    </a>
  </div>
</div>

<style>
  .confirmation-wrapper {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 5rem 2rem; width: 100%;
    box-sizing: border-box;
    background: linear-gradient(180deg, hsl(214, 61%, 6%) 0%, hsl(214, 61%, 8%) 25%, hsl(214, 61%, 10%) 50%, hsl(214, 61%, 12%) 75%, hsl(214, 61%, 14%) 100%);
  }
  .confirmation-content {
    width: min(100%, 760px); display: flex; flex-direction: column;
    align-items: center; gap: 1.625rem; text-align: center;
    padding: 3.5rem 3.5rem 2.875rem;
    border-radius: 28px;
    background:
      linear-gradient(180deg, hsla(214, 28%, 18%, 0.78), hsla(214, 24%, 13%, 0.9));
    border: 1px solid hsla(214, 18%, 30%, 0.85);
    box-shadow:
      0 32px 80px hsla(220, 45%, 2%, 0.42),
      inset 0 1px 0 hsla(214, 30%, 80%, 0.06);
    backdrop-filter: blur(14px);
  }
  .check-icon-container {
    width: 96px; height: 96px; border-radius: 50%;
    background: linear-gradient(135deg, hsla(45, 40%, 58%, 0.14) 0%, hsla(42, 32%, 44%, 0.1) 100%);
    border: 1.5px solid hsla(45, 40%, 55%, 0.28); display: flex; align-items: center; justify-content: center;
  }
  .check-icon { color: hsl(45, 38%, 62%); filter: drop-shadow(0 0 12px hsla(45, 40%, 55%, 0.35)); }
  .confirmation-heading {
    font-family: 'IBM Plex Serif', serif; font-weight: 400; font-size: clamp(2rem, 4vw, 2.75rem);
    line-height: 1.15; letter-spacing: 0.01em; color: hsl(214, 61%, 95%); margin: 0;
    text-shadow: 0 1px 3px hsla(0, 0%, 0%, 0.3);
    max-width: 18ch;
  }
  .confirmation-heading::after {
    content: ''; display: block; width: 60px; height: 1px; margin: 1.25rem auto 0;
    background: linear-gradient(90deg, hsla(45, 30%, 50%, 0.4), transparent);
  }
  .confirmation-message {
    font-family: 'Proxima Nova', sans-serif; font-size: clamp(1.075rem, 1.45vw, 1.16rem);
    font-weight: 400; line-height: 1.75; color: hsl(214, 15%, 72%);
    margin: 0; max-width: 54ch;
  }
  .type-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 6px 14px; border-radius: 50px;
    border: 1px solid hsla(45, 30%, 50%, 0.2);
    background: hsla(45, 30%, 50%, 0.06);
    font-family: 'Proxima Nova', sans-serif; font-size: 0.75rem; font-weight: 600;
    color: hsl(45, 30%, 65%); letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .type-badge svg { color: hsl(45, 30%, 55%); }
  .summary-card {
    width: 100%; background: hsla(214, 24%, 12%, 0.56); border: 1px solid hsla(214, 15%, 30%, 0.6);
    border-radius: 20px; padding: 1.625rem 1.875rem 1.875rem; text-align: left; backdrop-filter: blur(8px);
    box-sizing: border-box;
    box-shadow: inset 0 1px 0 hsla(214, 30%, 80%, 0.04);
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 1rem;
    align-items: center;
  }
  .summary-title {
    grid-column: 1;
    grid-row: 1;
    font-family: 'Proxima Nova', sans-serif; font-size: 0.75rem; font-weight: 600;
    color: hsl(45, 30%, 60%); letter-spacing: 0.1em; text-transform: uppercase;
    margin: 0; padding-bottom: 0.875rem;
    border-bottom: 1px solid hsla(214, 15%, 25%, 0.5);
  }
  .summary-list {
    grid-column: 1 / -1;
    display: flex; flex-direction: column; gap: 0.95rem; margin: 1.35rem 0 0;
  }
  .summary-item { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
  .summary-item dt {
    font-family: 'Proxima Nova', sans-serif; font-weight: 600; color: hsl(214, 15%, 50%);
    flex-shrink: 0; min-width: 120px; letter-spacing: 0.03em; text-transform: uppercase; font-size: 0.72rem;
  }
  .summary-item dd {
    font-family: 'IBM Plex Serif', serif; font-size: 0.95rem; font-weight: 400;
    color: hsl(214, 61%, 92%); margin: 0; text-align: right;
  }
  .home-button {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 13px 26px;
    min-width: 280px;
    border-radius: 50px; border: 1.5px solid hsl(214, 15%, 35%); background: hsla(214, 18%, 12%, 0.82);
    color: hsl(214, 61%, 88%); font-family: 'Proxima Nova', sans-serif;
    font-size: 0.9rem; font-weight: 600; text-decoration: none; letter-spacing: 0.02em;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; margin-top: 0.5rem;
    box-shadow: 0 10px 24px hsla(220, 45%, 2%, 0.2);
  }
  .type-badge {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    margin-bottom: 0;
  }
  .home-button:hover {
    border-color: hsl(45, 40%, 55%); background: hsla(45, 30%, 50%, 0.08);
    color: hsl(45, 30%, 75%); box-shadow: 0 4px 16px hsla(45, 40%, 55%, 0.12); transform: translateY(-2px);
  }
  .home-button:active { transform: translateY(0) scale(0.98); }

  /* ═══════════════════════════════════════
     MOBILE — 768px
     ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .confirmation-wrapper {
      padding: 6rem 0 2rem;
      min-height: 100dvh;
      align-items: flex-start;
      justify-content: flex-start;
      overflow-y: auto;
    }
    .confirmation-content {
      padding: 0 1.25rem 1.5rem;
      gap: 1.5rem;
      max-width: 100%;
      align-items: center;
      text-align: center;
      border-radius: 0;
      background: transparent;
      border: 0;
      box-shadow: none;
      backdrop-filter: none;
    }
    .check-icon-container {
      width: 64px;
      height: 64px;
    }
    .check-icon {
      width: 32px;
      height: 32px;
    }
    .confirmation-heading {
      font-size: 1.375rem;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }
    .confirmation-heading::after {
      width: 32px;
      margin: 0.625rem auto 0;
    }
    .confirmation-message {
      font-size: 0.875rem;
      line-height: 1.55;
      max-width: 100%;
    }
    .type-badge {
      padding: 4px 10px;
      font-size: 0.625rem;
      letter-spacing: 0.06em;
      grid-column: 2;
      grid-row: 1;
      justify-self: end;
      align-self: start;
      margin-bottom: 0;
    }
    .summary-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      column-gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      text-align: left;
      width: 100%;
      box-sizing: border-box;
    }
    .summary-title {
      grid-column: 1;
      grid-row: 1;
      font-size: 0.6875rem;
      margin: 0;
      padding-bottom: 0.375rem;
      text-align: left;
    }
    .summary-list {
      grid-column: 1 / -1;
      margin-top: 1rem;
      gap: 0.75rem;
    }
    .summary-item {
      flex-direction: column;
      gap: 0.2rem;
    }
    .summary-item dd {
      text-align: left;
    }
    .summary-item dt {
      min-width: auto;
      font-size: 0.6875rem;
    }
    .summary-item dd {
      font-size: 0.875rem;
    }
    .home-button {
      position: fixed;
      top: 0.75rem;
      left: 0.75rem;
      z-index: 100;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.5rem 0.875rem;
      border-radius: 50px;
      border: 1px solid hsla(214, 15%, 25%, 0.6);
      background: hsla(214, 20%, 12%, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: hsl(214, 15%, 70%);
      font-size: 0.75rem;
      text-decoration: none;
      box-shadow: 0 4px 16px hsla(0, 0%, 0%, 0.3);
    }
    .home-button svg {
      width: 16px;
      height: 16px;
    }
    .home-button:hover {
      border-color: hsl(45, 40%, 55%);
      background: hsla(45, 30%, 50%, 0.1);
      color: hsl(45, 30%, 75%);
    }
  }

  /* ═══════════════════════════════════════
     SMALL MOBILE — 480px
     ═══════════════════════════════════════ */
  @media (max-width: 480px) {
    .confirmation-wrapper {
      padding-top: 3rem;
    }
    .confirmation-content {
      gap: 1.25rem;
    }
    .check-icon-container {
      width: 56px;
      height: 56px;
    }
    .check-icon {
      width: 28px;
      height: 28px;
    }
    .confirmation-heading {
      font-size: 1.25rem;
    }
    .confirmation-heading::after {
      width: 28px;
      margin-top: 0.5rem;
    }
    .confirmation-message {
      font-size: 0.8125rem;
      line-height: 1.5;
    }
    .summary-card {
      padding: 0.875rem 1rem;
    }
    .summary-title {
      font-size: 0.625rem;
      margin-bottom: 0.875rem;
      padding-bottom: 0.5rem;
    }
    .summary-list {
      gap: 0.625rem;
    }
    .summary-item dt {
      font-size: 0.625rem;
    }
    .summary-item dd {
      font-size: 0.8125rem;
    }
  }
</style>
