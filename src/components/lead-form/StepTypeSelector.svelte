<script lang="ts">
  import FormStep from './FormStep.svelte';

  let {
    onSelect = (_type: 'b2c' | 'b2b') => {}
  }: {
    onSelect?: (type: 'b2c' | 'b2b') => void;
  } = $props();
</script>

<FormStep
  heading="Como podemos ajudar você?"
  subtext="Selecione o perfil que melhor representa sua necessidade para seguir por um fluxo mais objetivo."
  showDisclaimer={true}
  disclaimerText="Seus dados estão protegidos conforme nossas Políticas de Proteção de Dados e Privacidade."
  centered={true}
  fields={stepFields}
>
  {#snippet stepFields()}
  <div class="selector-group" role="group" aria-label="Tipo de formulário">
    <button
      type="button"
      class="type-button"
      onclick={() => onSelect('b2c')}
      aria-label="Plano para minha família"
    >
      <span class="button-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </span>
      <span class="button-text">
        <span class="button-title">Plano para minha família</span>
        <span class="button-desc">Quero analisar opções para mim, dependentes ou núcleo familiar</span>
      </span>
      <span class="button-arrow" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </span>
    </button>

    <button
      type="button"
      class="type-button"
      onclick={() => onSelect('b2b')}
      aria-label="Plano para minha equipe"
    >
      <span class="button-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="1"></rect>
          <line x1="8" y1="6" x2="10" y2="6"></line>
          <line x1="14" y1="6" x2="16" y2="6"></line>
          <line x1="8" y1="10" x2="10" y2="10"></line>
          <line x1="14" y1="10" x2="16" y2="10"></line>
          <line x1="8" y1="14" x2="10" y2="14"></line>
          <line x1="14" y1="14" x2="16" y2="14"></line>
          <rect x="9" y="18" width="6" height="4"></rect>
        </svg>
      </span>
      <span class="button-text">
        <span class="button-title">Plano para minha equipe</span>
        <span class="button-desc">Quero analisar opções para colaboradores, sócios ou operação da empresa</span>
      </span>
      <span class="button-arrow" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </span>
    </button>
  </div>
  {/snippet}
</FormStep>

<style>
  .selector-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .type-button {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 1.25rem;
    min-height: 180px;
    padding: 1.5rem 1.5rem 1.4rem;
    border-radius: 22px;
    border: 1.5px solid hsla(214, 15%, 32%, 0.95);
    background:
      linear-gradient(180deg, hsla(214, 23%, 17%, 0.84) 0%, hsla(214, 24%, 12%, 0.92) 100%);
    color: hsl(214, 15%, 65%);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: left;
    overflow: hidden;
    box-shadow:
      0 18px 40px hsla(220, 45%, 2%, 0.16),
      inset 0 1px 0 hsla(214, 30%, 80%, 0.04);
  }

  .type-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top right, hsla(45, 40%, 55%, 0.14), transparent 42%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .type-button:hover {
    border-color: hsl(45, 40%, 55%);
    background:
      linear-gradient(180deg, hsla(214, 23%, 18%, 0.94) 0%, hsla(214, 24%, 13%, 0.98) 100%);
    color: hsl(214, 15%, 80%);
    transform: translateY(-2px);
    box-shadow: 0 18px 40px hsla(0, 0%, 0%, 0.24);
  }

  .type-button:hover::before {
    opacity: 1;
  }

  .type-button:active {
    transform: translateY(0) scale(0.98);
  }

  .type-button:focus-visible {
    outline: none;
    border-color: hsl(45, 40%, 58%);
    box-shadow:
      0 0 0 3px hsla(45, 40%, 55%, 0.16),
      0 18px 40px hsla(220, 45%, 2%, 0.2);
  }

  .button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: hsla(45, 30%, 50%, 0.08);
    color: hsl(45, 30%, 60%);
    flex-shrink: 0;
    transition: all 0.3s ease;
    border: 1px solid hsla(45, 30%, 50%, 0.12);
  }

  .type-button:hover .button-icon {
    background: hsla(45, 30%, 50%, 0.15);
    box-shadow: 0 0 16px hsla(45, 40%, 55%, 0.2);
  }

  .button-text {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .button-title {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 1.08rem;
    font-weight: 600;
    color: hsl(214, 61%, 92%);
    letter-spacing: 0.01em;
    line-height: 1.2;
  }

  .button-desc {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.84rem;
    font-weight: 400;
    color: hsl(214, 15%, 55%);
    line-height: 1.5;
    max-width: 24ch;
  }

  .button-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 1px solid hsla(214, 15%, 30%, 0.9);
    color: hsl(214, 15%, 52%);
    background: hsla(214, 18%, 12%, 0.5);
    transition: all 0.3s ease;
  }

  .type-button:hover .button-arrow {
    color: hsl(45, 35%, 72%);
    border-color: hsla(45, 40%, 55%, 0.4);
    background: hsla(45, 30%, 50%, 0.08);
    transform: translateX(2px);
  }

  /* ═══════════════════════════════════════
     MOBILE — 768px
     ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .selector-group {
      grid-template-columns: 1fr;
      gap: 0.625rem;
    }

    .type-button {
      min-height: unset;
      padding: 1rem;
      gap: 0.875rem;
      border-radius: 14px;
    }

    .button-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .button-icon svg {
      width: 20px;
      height: 20px;
    }

    .button-text {
      gap: 0.125rem;
    }

    .button-title {
      font-size: 0.875rem;
      letter-spacing: 0.005em;
    }

    .button-desc {
      font-size: 0.75rem;
      line-height: 1.35;
      max-width: none;
    }

    .button-arrow {
      width: 34px;
      height: 34px;
    }
  }

  /* ═══════════════════════════════════════
     SMALL MOBILE — 480px
     ═══════════════════════════════════════ */
  @media (max-width: 480px) {
    .selector-group {
      gap: 0.5rem;
    }

    .type-button {
      padding: 0.75rem 0.875rem;
      gap: 0.75rem;
      border-radius: 10px;
    }

    .button-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
    }

    .button-icon svg {
      width: 18px;
      height: 18px;
    }

    .button-title {
      font-size: 0.8125rem;
    }

    .button-desc {
      font-size: 0.6875rem;
    }

    .button-arrow {
      width: 30px;
      height: 30px;
    }
  }
</style>
