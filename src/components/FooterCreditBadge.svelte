<script lang="ts">
  import HSBadge from './HSBadge.svelte';

  export let href = 'https://paulomoura.pro/m-high-standards-klout/';
  export let label = 'Presença digital Moura — Brand-Driven — Direção de Paulo Moura';
  export let badgeSize: 'small' | 'medium' | 'large' | 'compact' = 'compact';
  export let scale = 1;
</script>

<a
  href={href}
  target="_blank"
  rel="noopener noreferrer"
  class="footer-credit"
  aria-label={label}
>
  <div class="credit-badge">
    <HSBadge size={badgeSize} scale={scale} />
  </div>
  <span class="credit-copy">
    <span class="credit-primary">
      Presença digital <span class="credit-brand">Moura</span> — <span class="credit-method">Brand-Driven</span>
    </span>
    <span class="credit-direction">Direção de Paulo Moura</span>
  </span>
</a>

<style>
  .footer-credit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: hsl(214, 40%, 60%);
    text-decoration: none;
    text-align: center;
  }

  .credit-badge {
    margin-bottom: 0;
  }

  .credit-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .credit-primary {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.68rem;
    font-weight: 300;
    line-height: 1.35;
    letter-spacing: 0.055em;
    color: hsl(214, 14%, 72%);
    white-space: nowrap;
    transition: color 0.3s ease;
  }

  .credit-brand,
  .credit-method {
    color: hsl(214, 14%, 78%);
    font-weight: 500;
  }

  .credit-direction {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.58rem;
    font-weight: 300;
    line-height: 1.2;
    letter-spacing: 0.045em;
    color: hsl(214, 10%, 56%);
    transition: color 0.3s ease;
  }

  .footer-credit:hover .credit-primary {
    color: hsl(214, 18%, 82%);
  }

  .footer-credit:hover .credit-direction {
    color: hsl(214, 14%, 68%);
  }

  @media (max-width: 980px) and (min-width: 769px) {
    .credit-primary {
      max-width: 12rem;
      white-space: normal;
      text-wrap: balance;
    }
  }

  @media (max-width: 420px) {
    .credit-primary {
      max-width: 17rem;
      white-space: normal;
      text-wrap: balance;
    }
  }
</style>
