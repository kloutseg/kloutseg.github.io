<script lang="ts">
  let { number, title }: { number: string; title: string } = $props();
  let indicator: HTMLElement | null = null;
  let isDark = $state(false);

  $effect(() => {
    if (!indicator) return;

    // Detectar se a seção pai é dark
    const parent = indicator.closest('[data-dark-section]');
    isDark = !!parent;
  });
</script>

<div class="section-indicator" class:dark={isDark} bind:this={indicator} aria-hidden="true">
  <span class="indicator-number">
    {#each number.split('') as digit, i}
      <span class="digit" key={i}>{digit}</span>
    {/each}
  </span>
  <span class="indicator-title">{title}</span>
</div>

<style>
  .section-indicator {
    position: absolute;
    left: 32px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    font-family: 'IBM Plex Mono', monospace;
    pointer-events: none;
    z-index: 100;
  }

  .indicator-number {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .digit {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 4px;
    color: hsl(45, 48%, 42%);
    line-height: 1;
  }

  .indicator-title {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 3px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    text-transform: uppercase;
    flex-shrink: 0;
    color: hsl(45, 48%, 42%);
  }

  /* Dark mode */
  .section-indicator.dark .digit {
    color: hsla(0, 0%, 100%, 0.72);
  }

  .section-indicator.dark .indicator-title {
    color: hsla(0, 0%, 100%, 0.72);
  }

  @media (max-width: 1024px) {
    .section-indicator {
      left: 24px;
      gap: 12px;
    }

    .digit {
      font-size: 11px;
      letter-spacing: 3px;
    }

    .indicator-title {
      font-size: 11px;
      letter-spacing: 2px;
    }
  }

  @media (max-width: 768px) {
    .section-indicator {
      display: none;
    }
  }
</style>
