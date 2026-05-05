<script lang="ts">
  import { gsap } from 'gsap';
  import { prefersReducedMotion } from '../../lib/reducedMotion';

  const reducedMotion = prefersReducedMotion();

  let {
    formData
  }: {
    formData: {
      nome: string;
      email: string;
      telefone: string;
      temCnpj: boolean | null;
      cnpjNumero: string;
      cnpjRegiao: string;
      planoSaude: string;
      numBeneficiarios: number | string;
      idadesBeneficiarios: number[];
      investimentoMensal: string;
    }
  } = $props();

  let confirmationContent: HTMLElement | null = null;
  let checkIcon: SVGSVGElement | null = null;
  let headingEl: HTMLElement | null = null;
  let messageEl: HTMLElement | null = null;
  let summaryEl: HTMLElement | null = null;
  let homeButton: HTMLElement | null = null;

  $effect(() => {
    if (!confirmationContent || reducedMotion) {
      if (confirmationContent) {
        gsap.set([checkIcon, headingEl, messageEl, summaryEl, homeButton], {
          opacity: 1,
          y: 0,
          scale: 1,
          clearProps: 'transform'
        });
      }
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Check icon - scale in
    if (checkIcon) {
      tl.fromTo(checkIcon,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' },
        0
      );
    }

    // Heading
    if (headingEl) {
      tl.fromTo(headingEl,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2 },
        0.3
      );
    }

    // Message
    if (messageEl) {
      tl.fromTo(messageEl,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        0.5
      );
    }

    // Summary
    if (summaryEl) {
      tl.fromTo(summaryEl,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        0.7
      );
    }

    // Home button
    if (homeButton) {
      tl.fromTo(homeButton,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.9
      );
    }
  });
</script>

<div class="confirmation-wrapper" bind:this={confirmationContent}>
  <div class="confirmation-content">
    <!-- Success Check Icon -->
    <div class="check-icon-container">
      <svg class="check-icon" bind:this={checkIcon} width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    </div>

    <!-- Heading -->
    <h2 class="confirmation-heading" bind:this={headingEl}>
      Agradecemos pelas informações!
    </h2>

    <!-- Message -->
    <p class="confirmation-message" bind:this={messageEl}>
      Dentro das próximas 24 horas úteis um de nossos consultores entrará em contato com você.
    </p>

    <!-- Summary -->
    <div class="summary-card" bind:this={summaryEl}>
      <h3 class="summary-title">Resumo dos dados enviados</h3>
      <dl class="summary-list">
        <div class="summary-item">
          <dt>Nome</dt>
          <dd>{formData.nome}</dd>
        </div>
        <div class="summary-item">
          <dt>E-mail</dt>
          <dd>{formData.email}</dd>
        </div>
        <div class="summary-item">
          <dt>Telefone</dt>
          <dd>{formData.telefone}</dd>
        </div>
        {#if formData.temCnpj === true}
          <div class="summary-item">
            <dt>CNPJ</dt>
            <dd>{formData.cnpjNumero}</dd>
          </div>
          {#if formData.cnpjRegiao}
            <div class="summary-item">
              <dt>Região do CNPJ</dt>
              <dd>{formData.cnpjRegiao}</dd>
            </div>
          {/if}
        {/if}
        {#if formData.planoSaude}
          <div class="summary-item">
            <dt>Plano de saúde</dt>
            <dd>{formData.planoSaude}</dd>
          </div>
        {/if}
        {#if formData.numBeneficiarios}
          <div class="summary-item">
            <dt>Beneficiários</dt>
            <dd>{formData.numBeneficiarios}</dd>
          </div>
        {/if}
        {#if formData.investimentoMensal}
          <div class="summary-item">
            <dt>Investimento mensal</dt>
            <dd>{formData.investimentoMensal}</dd>
          </div>
        {/if}
      </dl>
    </div>

    <!-- Back to Home Button -->
    <a href="/" class="home-button" bind:this={homeButton}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      Voltar à página inicial
    </a>
  </div>
</div>

<style>
  .confirmation-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6rem 2rem;
    width: 100%;
  }

  .confirmation-content {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  /* Check Icon */
  .check-icon-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      hsla(145, 40%, 50%, 0.15) 0%,
      hsla(145, 30%, 45%, 0.1) 100%
    );
    border: 2px solid hsla(145, 40%, 50%, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.5);
  }

  .check-icon {
    color: hsl(145, 40%, 60%);
    filter: drop-shadow(0 0 12px hsla(145, 40%, 50%, 0.4));
  }

  /* Heading & Message */
  .confirmation-heading {
    font-family: 'IBM Plex Serif', serif;
    font-weight: 400;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: hsl(214, 61%, 95%);
    margin: 0;
    opacity: 0;
    transform: translateY(30px);
  }

  .confirmation-message {
    font-family: 'Proxima Nova', sans-serif;
    font-size: clamp(1.05rem, 1.5vw, 1.15rem);
    font-weight: 400;
    line-height: 1.7;
    color: hsl(214, 15%, 70%);
    margin: 0;
    max-width: 500px;
    opacity: 0;
    transform: translateY(20px);
  }

  /* Summary Card */
  .summary-card {
    width: 100%;
    background: hsla(214, 20%, 15%, 0.5);
    border: 1px solid hsl(214, 15%, 30%);
    border-radius: 20px;
    padding: 2rem 2.5rem;
    text-align: left;
    backdrop-filter: blur(8px);
    opacity: 0;
    transform: translateY(20px);
  }

  .summary-title {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    color: hsl(45, 30%, 65%);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid hsl(214, 15%, 30%);
  }

  .summary-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
  }

  .summary-item dt {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: hsl(214, 15%, 55%);
    flex-shrink: 0;
    min-width: 140px;
  }

  .summary-item dd {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.95rem;
    font-weight: 400;
    color: hsl(214, 61%, 90%);
    margin: 0;
    text-align: right;
  }

  /* Home Button */
  .home-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 14px 32px;
    border-radius: 50px;
    border: 1.5px solid hsl(214, 15%, 40%);
    background: hsla(214, 20%, 15%, 0.4);
    color: hsl(214, 61%, 90%);
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0;
    transform: translateY(15px);
    cursor: pointer;
  }

  .home-button:hover {
    border-color: hsl(45, 40%, 55%);
    background: hsla(45, 30%, 50%, 0.1);
    color: hsl(45, 30%, 75%);
    box-shadow: 0 4px 16px hsla(45, 40%, 55%, 0.15);
    transform: translateY(-2px);
  }

  .home-button:active {
    transform: translateY(0) scale(0.98);
  }

  @media (max-width: 768px) {
    .confirmation-wrapper {
      padding: 5rem 1.5rem;
      padding-left: max(1.5rem, env(safe-area-inset-left));
      padding-right: max(1.5rem, env(safe-area-inset-right));
    }

    .confirmation-content {
      gap: 1.5rem;
    }

    .check-icon-container {
      width: 80px;
      height: 80px;
    }

    .check-icon {
      width: 60px;
      height: 60px;
    }

    .confirmation-heading {
      font-size: 1.75rem;
    }

    .confirmation-message {
      font-size: 1rem;
    }

    .summary-card {
      padding: 1.25rem;
      border-radius: 16px;
    }

    .summary-title {
      font-size: 0.85rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
    }

    .summary-list {
      gap: 0.75rem;
    }

    .summary-item {
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-item dd {
      text-align: left;
    }

    .summary-item dt {
      min-width: auto;
    }

    .home-button {
      width: 100%;
      justify-content: center;
      padding: 14px 24px;
    }
  }
  @media (max-width: 480px) {
    .confirmation-wrapper {
      padding: 4rem 1rem;
    }
    .confirmation-heading {
      font-size: 1.5rem;
    }
    .summary-card {
      padding: 1rem;
    }
  }
</style>
