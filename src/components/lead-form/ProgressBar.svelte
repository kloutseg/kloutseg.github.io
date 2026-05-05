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
	const progressPercent = $derived(totalSteps > 1 ? (displayIndex / (totalSteps - 1)) * 100 : 0);
</script>

<div class="progress-bar-container" role="progressbar"
  aria-valuenow={displayIndex + 1} aria-valuemin={1} aria-valuemax={totalSteps}
  aria-label="Progresso do formulário"
  style={`--progress: ${progressPercent}%; --step-count: ${totalSteps};`}
>
  <div class="progress-shell">
    <div class="progress-summary">
      <span class="progress-count">{stepNumber}/{totalNumber}</span>
      <span class="progress-separator"></span>
      <span class="progress-current">{labels[displayIndex] ?? ''}</span>
    </div>

    <div class="progress-map" aria-hidden="true">
      <ol class="progress-steps">
      {#each stepsArray as i}
        <li
          class="progress-step"
          class:completed={i < displayIndex}
          class:active={i === displayIndex}
          class:upcoming={i > displayIndex}
        >
          <span class="step-marker">
            <span class="step-marker-value"></span>
          </span>
          {#if i < totalSteps - 1}
            <span
              class="step-segment"
              class:completed={i < displayIndex - 1}
              class:active={i === displayIndex - 1}
            ></span>
          {/if}
        </li>
      {/each}
      </ol>
    </div>
  </div>
</div>

<style>
  .progress-bar-container {
    --marker-size: 0.34rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: clamp(12.5rem, 26vw, 18rem);
    max-width: 100%;
  }

  .progress-shell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.58rem;
    width: 100%;
    padding: 0;
  }

  .progress-shell::before {
    content: none;
  }

  .progress-summary {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.38rem;
    padding-left: min(12rem, 66%);
    padding-right: 0;
  }

  .progress-count {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.6rem;
    font-weight: 600;
    color: hsl(45, 28%, 67%);
    letter-spacing: 0.02em;
    line-height: 1;
  }

  .progress-separator {
    width: 0.18rem;
    height: 0.18rem;
    border-radius: 999px;
    background: hsla(45, 32%, 62%, 0.62);
    box-shadow: 0 0 8px hsla(45, 38%, 58%, 0.18);
  }

  .progress-current {
    min-width: 0;
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.6rem;
    font-weight: 600;
    color: hsl(214, 14%, 72%);
    letter-spacing: 0.06em;
    line-height: 1;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .progress-map {
    position: relative;
    width: 100%;
    min-height: var(--marker-size);
    padding-inline: 0;
    box-sizing: border-box;
  }

  .progress-steps {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(var(--step-count), minmax(0, 1fr));
    align-items: start;
    gap: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    pointer-events: none;
  }

  .progress-step {
    position: relative;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .step-segment {
    position: absolute;
    top: calc(var(--marker-size) / 2 - 0.5px);
    left: calc(50% + var(--marker-size) / 2);
    width: calc(100% - var(--marker-size));
    height: 1px;
    border-radius: 999px;
    overflow: hidden;
    background: hsla(214, 12%, 62%, 0.22);
    transition:
      background 0.36s ease,
      box-shadow 0.36s ease;
  }

  .step-segment::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, hsla(43, 24%, 38%, 0.82), hsl(47, 38%, 64%));
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.78s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .step-segment.completed::after,
  .step-segment.active::after {
    transform: scaleX(1);
  }

  .step-marker {
    width: var(--marker-size);
    height: var(--marker-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid hsla(214, 12%, 58%, 0.28);
    background: hsl(214, 34%, 8%);
    box-shadow: 0 0 0 2px hsla(214, 61%, 6%, 0.95);
    transition:
      transform 0.36s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.36s ease,
      background 0.36s ease,
      color 0.36s ease,
      box-shadow 0.36s ease;
  }

  .step-marker-value {
    line-height: 1;
  }

  .progress-step.completed .step-marker {
    border-color: hsl(43, 22%, 46%);
    background: hsl(43, 21%, 39%);
    box-shadow:
      0 0 0 2px hsla(214, 61%, 6%, 0.95),
      inset 0 1px 0 hsla(45, 34%, 72%, 0.16);
  }

  .progress-step.active .step-marker {
    transform: scale(1.32);
    border-color: hsl(45, 34%, 66%);
    background: hsl(45, 31%, 58%);
    box-shadow: 0 0 0 2px hsla(214, 61%, 6%, 0.96);
  }

  .progress-step.upcoming .step-marker {
    opacity: 0.56;
  }

  /* ═══════════════════════════════════════
     MOBILE — 768px
     ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .progress-bar-container {
      --marker-size: 0.3rem;
      width: min(52vw, 10.8rem);
    }

    .progress-shell {
      gap: 0.42rem;
    }

    .progress-shell::before {
      content: none;
    }

    .progress-count {
      font-size: 0.48rem;
    }

    .progress-summary {
      padding-left: min(6rem, 42%);
    }

    .progress-current {
      max-width: 5.4rem;
      font-size: 0.45rem;
    }

    .progress-rail {
      height: 1px;
    }
  }

  /* ═══════════════════════════════════════
     SMALL MOBILE — 480px
     ═══════════════════════════════════════ */
  @media (max-width: 480px) {
    .progress-bar-container {
      width: min(54vw, 9.3rem);
    }

    .progress-current {
      display: none;
    }

    .progress-summary {
      padding-left: 0;
    }

    .progress-separator {
      display: none;
    }
  }

  @media (max-width: 400px) {
    .progress-bar-container {
      width: min(56vw, 9rem);
    }

    .progress-current {
      display: none;
    }

    .progress-separator {
      display: none;
    }
  }
</style>
