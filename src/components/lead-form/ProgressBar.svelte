<script lang="ts">
  let {
    currentStep,
    formType = null as 'b2c' | 'b2b' | null
  }: {
    currentStep: number;
    formType?: 'b2c' | 'b2b' | null;
  } = $props();

	const b2cLabels = [
		'Nome',
		'Contato',
		'CNPJ',
		'Apólice',
		'Beneficiários'
	];

	const b2bLabels = [
		'Identificação',
		'Informações',
		'Contrato'
	];

	const totalSteps = $derived(formType === 'b2c' ? 5 : formType === 'b2b' ? 3 : 0);
	const labels = $derived(formType === 'b2c' ? b2cLabels : formType === 'b2b' ? b2bLabels : []);

  // currentStep in LeadForm is 0-based relative to the flow start
  // (Step 0 = type selector, Step 1 = first flow step)
  // We display the label based on (currentStep - 1) since step 0 is the selector
	const displayIndex = $derived(Math.max(0, currentStep - 1));
	const stepsArray = $derived(Array.from({ length: totalSteps }, (_, i) => i));
	const stepNumber = $derived(String(displayIndex + 1).padStart(2, '0'));
	const totalNumber = $derived(String(totalSteps).padStart(2, '0'));
</script>

<div class="progress-bar-container" role="progressbar"
  aria-valuenow={displayIndex + 1} aria-valuemin={1} aria-valuemax={totalSteps}
  aria-label="Progresso do formulário">
  <div class="progress-topline">
    <div class="progress-meta">
      <span class="progress-kicker">Etapa</span>
      <span class="progress-count">{stepNumber}/{totalNumber}</span>
    </div>
    <div class="progress-label">
      <span class="step-label">{labels[displayIndex] ?? ''}</span>
    </div>
  </div>
  <div class="progress-track-shell">
    <div class="progress-track">
    {#each stepsArray as i}
      <div class="progress-dot"
        class:completed={i < displayIndex}
        class:active={i === displayIndex}
        class:upcoming={i > displayIndex}
      >
        <div class="dot" class:filled={i <= displayIndex}></div>
      </div>
      {#if i < totalSteps - 1}
        <div class="progress-line"
          class:completed={i < displayIndex}
          class:active={i === displayIndex}
        ></div>
      {/if}
    {/each}
    </div>
  </div>
</div>

<style>
  .progress-bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
    min-width: 260px;
  }
  .progress-topline {
    width: 100%;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }
  .progress-meta {
    display: inline-flex;
    align-items: baseline;
    gap: 0.45rem;
    padding: 0.35rem 0.6rem;
    border-radius: 999px;
    border: 1px solid hsla(214, 18%, 32%, 0.8);
    background: hsla(214, 18%, 12%, 0.55);
    box-shadow: inset 0 1px 0 hsla(214, 25%, 80%, 0.04);
  }
  .progress-kicker {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.66rem;
    font-weight: 600;
    color: hsl(214, 15%, 56%);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .progress-count {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    font-weight: 500;
    color: hsl(45, 30%, 72%);
    letter-spacing: 0.04em;
  }
  .progress-track-shell {
    width: 100%;
    padding: 0.55rem 0.8rem;
    border-radius: 999px;
    border: 1px solid hsla(214, 18%, 28%, 0.75);
    background: linear-gradient(180deg, hsla(214, 20%, 14%, 0.72), hsla(214, 20%, 11%, 0.78));
    box-shadow:
      0 10px 24px hsla(220, 45%, 2%, 0.16),
      inset 0 1px 0 hsla(214, 30%, 80%, 0.05);
    box-sizing: border-box;
  }
  .progress-track { display: flex; align-items: center; gap: 0; width: 100%; justify-content: center; }
  .progress-dot { display: flex; align-items: center; justify-content: center; }
  .dot {
    width: 12px; height: 12px; border-radius: 50%;
    border: 1.5px solid hsla(214, 18%, 44%, 0.95); background: hsla(214, 20%, 10%, 0.72);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dot.filled {
    background: linear-gradient(135deg, hsl(45, 40%, 55%) 0%, hsl(42, 45%, 52%) 100%);
    border-color: hsl(45, 40%, 55%);
    box-shadow:
      0 0 0 3px hsla(45, 40%, 55%, 0.08),
      0 0 12px hsla(45, 40%, 55%, 0.32);
  }
  .progress-line {
    width: 48px; height: 2px; background: hsl(214, 15%, 40%); opacity: 0.22;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .progress-line.completed {
    background: linear-gradient(90deg, hsl(45, 40%, 55%) 0%, hsl(42, 45%, 52%) 100%); opacity: 1;
  }
  .progress-line.active {
    background: linear-gradient(90deg, hsl(45, 40%, 55%) 0%, hsl(214, 15%, 40%) 100%); opacity: 0.6;
  }
  .progress-label {
    min-width: 0;
    display: flex;
    justify-content: flex-end;
  }
  .step-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.84rem;
    font-weight: 500;
    color: hsl(45, 30%, 72%);
    letter-spacing: 0.03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ═══════════════════════════════════════
     MOBILE — 768px
     ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .progress-bar-container {
      gap: 0.35rem;
      min-width: auto;
    }
    .progress-topline {
      gap: 0.5rem;
      align-items: center;
    }
    .progress-meta {
      padding: 0.22rem 0.45rem;
      gap: 0.3rem;
    }
    .progress-kicker {
      font-size: 0.54rem;
      letter-spacing: 0.06em;
    }
    .progress-count {
      font-size: 0.58rem;
    }
    .progress-track-shell {
      padding: 0.35rem 0.5rem;
    }
    .progress-line {
      width: 16px;
      height: 1.5px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-width: 1.5px;
    }
    .dot.filled {
      box-shadow: 0 0 6px hsla(45, 40%, 55%, 0.3);
    }
    .step-label {
      font-size: 0.62rem;
      letter-spacing: 0.03em;
      line-height: 1.1;
    }
    .progress-dot, .progress-line {
      flex-shrink: 0;
    }
  }

  /* ═══════════════════════════════════════
     SMALL MOBILE — 480px
     ═══════════════════════════════════════ */
  @media (max-width: 480px) {
    .progress-bar-container {
      gap: 0.2rem;
    }
    .progress-line {
      width: 12px;
    }
    .dot {
      width: 7px;
      height: 7px;
    }
    .step-label {
      font-size: 0.56rem;
    }
  }

  @media (max-width: 400px) {
    .progress-meta {
      padding: 0.18rem 0.38rem;
    }
    .step-label {
      font-size: 0.5rem;
    }
    .progress-line {
      width: 10px;
    }
  }
</style>
