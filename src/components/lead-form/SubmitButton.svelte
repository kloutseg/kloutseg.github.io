<script lang="ts">
  import { gsap } from 'gsap';
  import { prefersReducedMotion } from '../../lib/reducedMotion';

  const reducedMotion = prefersReducedMotion();

  let {
    disabled = false,
    isSubmitting = false,
    label = 'Próximo',
    onclick = () => {}
  }: {
    disabled?: boolean;
    isSubmitting?: boolean;
    label?: string;
    onclick?: () => void;
  } = $props();

  let button: HTMLButtonElement | null = null;
  let hoverTl: gsap.core.Timeline | null = null;

  function handleMouseEnter() {
    if (reducedMotion || disabled || !button) return;

    if (hoverTl) hoverTl.kill();
    hoverTl = gsap.timeline();
    hoverTl.to(button, {
      y: -2,
      boxShadow: '0 8px 24px hsla(45, 40%, 55%, 0.3), 0 2px 6px hsla(45, 40%, 55%, 0.15)',
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  function handleMouseLeave() {
    if (reducedMotion || !button) return;

    if (hoverTl) hoverTl.kill();
    hoverTl = gsap.timeline();
    hoverTl.to(button, {
      y: 0,
      boxShadow: disabled
        ? '0 2px 8px hsla(214, 15%, 45%, 0.1)'
        : '0 4px 16px hsla(45, 40%, 55%, 0.2), 0 1px 4px hsla(45, 40%, 55%, 0.1)',
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  $effect(() => {
    if (!button || reducedMotion) return;

    gsap.set(button, {
      y: 0,
      opacity: 1,
    });
  });
</script>

<button
  type="button"
  bind:this={button}
  class="form-submit-button"
  class:disabled-state={disabled}
  class:enabled-state={!disabled}
  class:submitting={isSubmitting}
  {disabled}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onclick={onclick}
  aria-disabled={disabled}
>
  {#if isSubmitting}
    <span class="button-loading">
      <svg class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
        </path>
      </svg>
      <span>Enviando</span>
    </span>
  {:else}
    <span class="button-text">
      {label}
      <svg class="button-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </span>
  {/if}
</button>

<style>
  .form-submit-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 14px 32px;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'Proxima Nova', sans-serif;
    letter-spacing: 0.02em;
    border: none;
    cursor: pointer;
    transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
    position: relative;
    overflow: hidden;
    min-width: 160px;
  }

  .enabled-state {
    background: linear-gradient(
      135deg,
      hsl(45, 40%, 55%) 0%,
      hsl(42, 45%, 52%) 50%,
      hsl(40, 50%, 60%) 100%
    );
    color: hsl(214, 61%, 6%);
    box-shadow:
      0 4px 16px hsla(45, 40%, 55%, 0.2),
      0 1px 4px hsla(45, 40%, 55%, 0.1);
  }

  .enabled-state:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      hsl(45, 45%, 60%) 0%,
      hsl(42, 50%, 57%) 50%,
      hsl(40, 55%, 65%) 100%
    );
  }

  .enabled-state:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .disabled-state {
    background: hsl(214, 15%, 45%);
    color: hsl(214, 10%, 70%);
    box-shadow: 0 2px 8px hsla(214, 15%, 45%, 0.1);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .submitting {
    opacity: 0.85;
    cursor: wait;
  }

  .button-text {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .button-arrow {
    transition: transform 0.3s ease;
  }

  .enabled-state:hover .button-arrow {
    transform: translateX(4px);
  }

  .button-loading {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .form-submit-button {
      padding: 16px 24px;
      min-height: 52px;
      font-size: 1rem;
    }
  }
  @media (max-width: 480px) {
    .form-submit-button {
      padding: 18px 20px;
      min-height: 56px;
    }
  }
</style>
