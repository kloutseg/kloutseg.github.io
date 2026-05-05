<script lang="ts">
  import { gsap } from 'gsap';
  import { prefersReducedMotion } from '../../lib/reducedMotion';

  const reducedMotion = prefersReducedMotion();

  let {
    heading,
    subtext = '',
    showDisclaimer = false,
    disclaimerText = '',
    centered = false,
    fields
  }: {
    heading: string;
    subtext?: string;
    showDisclaimer?: boolean;
    disclaimerText?: string;
    centered?: boolean;
    fields: import('svelte').Snippet;
  } = $props();

  let stepContent: HTMLElement | null = $state(null);
  let headingEl: HTMLElement | null = $state(null);
  let subtextEl: HTMLElement | null = $state(null);
  let disclaimerEl: HTMLElement | null = $state(null);

  $effect(() => {
    if (!stepContent || reducedMotion) {
      if (stepContent) {
        gsap.set([headingEl, subtextEl, disclaimerEl], {
          opacity: 1,
          y: 0,
          clearProps: 'transform'
        });
      }
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (headingEl) {
      tl.fromTo(headingEl,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2 },
        0
      );
    }

    if (subtextEl) {
      tl.fromTo(subtextEl,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        0.3
      );
    }

    if (disclaimerEl) {
      tl.fromTo(disclaimerEl,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.5
      );
    }
  });
</script>

<div class="form-step-wrapper" class:is-centered={centered} bind:this={stepContent}>
  <div class="step-content">
    <h2 class="step-heading" bind:this={headingEl}>{heading}</h2>

    {#if subtext}
      <p class="step-subtext" bind:this={subtextEl}>{subtext}</p>
    {/if}

    <div class="step-fields">
      {@render fields()}
    </div>

    {#if showDisclaimer && disclaimerText}
      <div class="step-disclaimer" bind:this={disclaimerEl}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>{disclaimerText}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .form-step-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 7rem 2rem 3rem;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .form-step-wrapper.is-centered {
    align-items: center;
    padding-top: 5rem;
    padding-bottom: 5rem;
  }

  .step-content {
    width: 100%;
    max-width: 560px;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .step-heading {
    flex-shrink: 0;
    font-family: 'IBM Plex Serif', serif;
    font-weight: 400;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.15;
    letter-spacing: 0.01em;
    color: hsl(214, 61%, 95%);
    margin: 0;
    text-shadow: 0 1px 3px hsla(0, 0%, 0%, 0.3);
    opacity: 0;
    transform: translateY(30px);
  }

  .step-subtext {
    flex-shrink: 0;
    font-family: 'Proxima Nova', sans-serif;
    font-size: clamp(1rem, 1.5vw, 1.1rem);
    font-weight: 400;
    line-height: 1.7;
    color: hsl(214, 15%, 70%);
    margin: 0;
    opacity: 0;
    transform: translateY(20px);
  }

  .form-step-wrapper.is-centered .step-content {
    max-width: 760px;
    gap: 2rem;
    align-items: center;
  }

  .form-step-wrapper.is-centered .step-heading {
    max-width: 13ch;
    text-align: center;
  }

  .form-step-wrapper.is-centered .step-subtext {
    max-width: 56ch;
    text-align: center;
  }

  .form-step-wrapper.is-centered .step-fields {
    width: 100%;
  }

  .step-fields {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .step-disclaimer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    background: hsla(45, 20%, 50%, 0.06);
    border: 1px solid hsla(45, 20%, 50%, 0.12);
    border-radius: 16px;
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.85rem;
    line-height: 1.6;
    color: hsl(45, 25%, 65%);
    text-align: center;
    opacity: 0;
    transform: translateY(15px);
  }

  .step-disclaimer svg {
    flex-shrink: 0;
    color: hsl(45, 30%, 55%);
    align-self: center;
  }

  /* ═══════════════════════════════════════
     MOBILE — 768px
     ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .form-step-wrapper {
      padding: 0;
      min-height: 100dvh;
      align-items: stretch;
    }

    .form-step-wrapper.is-centered {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-step-wrapper.is-centered .step-content {
      padding-top: 0;
      padding-bottom: 0;
    }

    .step-content {
      gap: 1.5rem;
      max-width: 100%;
      padding: 5.5rem 1.25rem 6.5rem;
    }

    .step-heading {
      font-size: 1.5rem;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }

    .step-subtext {
      font-size: 0.875rem;
      line-height: 1.55;
      color: hsl(214, 15%, 60%);
      margin-top: -0.5rem;
    }

    .step-fields {
      gap: 1.5rem;
    }

    .step-disclaimer {
      padding: 0.875rem 1rem;
      font-size: 0.75rem;
      gap: 0.5rem;
      border-radius: 10px;
      line-height: 1.5;
    }

    .step-disclaimer svg {
      width: 14px;
      height: 14px;
      margin-top: 1px;
    }
  }

  /* ═══════════════════════════════════════
     SMALL MOBILE — 480px
     ═══════════════════════════════════════ */
  @media (max-width: 480px) {
    .step-content {
      padding: 5rem 1rem 7rem;
      gap: 1.25rem;
    }

    .step-heading {
      font-size: 1.375rem;
      letter-spacing: -0.015em;
    }

    .step-heading::after {
      width: 28px;
      margin-top: 0.625rem;
    }

    .step-subtext {
      font-size: 0.8125rem;
      line-height: 1.5;
    }

    .step-fields {
      gap: 1.25rem;
    }

    .step-disclaimer {
      padding: 0.75rem 0.875rem;
      font-size: 0.6875rem;
      border-radius: 8px;
    }
  }
</style>
