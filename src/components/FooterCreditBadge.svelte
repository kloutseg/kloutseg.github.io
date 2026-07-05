<script lang="ts">
  import HSBadge from './HSBadge.svelte';

  export let href = 'https://paulomoura.pro/m-high-standards-klout/';
  export let label = 'Presença digital por Paulo Moura';
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
    <span class="credit-primary">Presença digital por Paulo Moura</span>
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
    justify-content: center;
  }

  .credit-primary {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.62rem;
    font-weight: 300;
    line-height: 1.25;
    letter-spacing: 0.035em;
    color: hsl(214, 14%, 70%);
    transition: color 0.3s ease;
  }

  .footer-credit:hover .credit-primary {
    color: hsl(214, 18%, 84%);
  }

</style>
