<script lang="ts">
  import '../../styles/ibm-plex-mono.css';
</script>

<div class="hero-badges">
  <!-- Badge 1: Clientes -->
  <div class="badge badge-primary">
    <div class="badge-emblem">
      <img src="/images/badges/customers_emblem.png" alt="Clientes" class="badge-image" width="250" height="250" />
    </div>
    <div class="badge-content">
      <span class="badge-number">+250</span>
      <span class="badge-label">Clientes ativos</span>
    </div>
  </div>

  <!-- Badge 2: Parceiras -->
  <div class="badge badge-secondary">
    <div class="badge-emblem">
      <img src="/images/badges/partnership_emblem.png" alt="Seguradoras" class="badge-image" width="250" height="250" />
    </div>
    <div class="badge-content">
      <span class="badge-number">Top 1%</span>
      <span class="badge-label">Seguradoras selecionadas</span>
    </div>
  </div>

  <!-- Badge 3: Performance -->
  <div class="badge badge-tertiary">
    <div class="badge-emblem">
      <img src="/images/badges/performance_emblem.png" alt="Performance" class="badge-image" width="250" height="250" />
    </div>
    <div class="badge-content">
      <span class="badge-number">+R$ 20 Milhões</span>
      <span class="badge-label">Em redução de custos</span>
    </div>
  </div>
</div>

<style>
  .hero-badges {
    display: flex;
    gap: 72px;
    position: absolute;
    left: 6rem;
    bottom: 4rem;
    z-index: 10;
  }

  .badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 4px;
    cursor: pointer;
    opacity: 1;
    transform: translateY(0) scale(1);
    animation: badge-enter 960ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }

  .badge-primary {
    animation-delay: 800ms;
  }

  .badge-secondary {
    animation-delay: 950ms;
  }

  .badge-tertiary {
    animation-delay: 1100ms;
  }

  .badge-emblem {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .badge-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(43, 74, 107, 0.15));
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Hover effect */
  .badge:hover .badge-emblem {
    transform: translateY(-6px);
  }

  .badge:hover .badge-image {
    filter: drop-shadow(0 4px 8px rgba(43, 74, 107, 0.2));
  }

  .badge-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .badge-number {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 15px;
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1;
    transition: all 0.4s ease;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);

    /* Gradiente dourado sutil e refinado */
    background: linear-gradient(
      110deg,
      hsl(45, 30%, 40%) 0%,
      hsl(42, 40%, 50%) 10%,
      hsl(40, 45%, 58%) 20%,
      hsl(38, 50%, 65%) 30%,
      hsl(36, 45%, 60%) 40%,
      hsl(38, 40%, 52%) 50%,
      hsl(40, 35%, 45%) 60%,
      hsl(42, 40%, 50%) 70%,
      hsl(40, 45%, 58%) 80%,
      hsl(38, 50%, 65%) 90%,
      hsl(36, 45%, 60%) 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gold-shimmer 20s ease-in-out infinite;
  }

  .badge:hover .badge-number {
    letter-spacing: 0.005em;
    background: linear-gradient(
      110deg,
      hsl(45, 35%, 48%) 0%,
      hsl(42, 45%, 58%) 10%,
      hsl(40, 50%, 66%) 20%,
      hsl(38, 55%, 72%) 30%,
      hsl(36, 50%, 68%) 40%,
      hsl(38, 45%, 60%) 50%,
      hsl(40, 40%, 52%) 60%,
      hsl(42, 45%, 58%) 70%,
      hsl(40, 50%, 66%) 80%,
      hsl(38, 55%, 72%) 90%,
      hsl(36, 50%, 68%) 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .badge-label {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 9px;
    font-weight: 600;
    color: hsl(214, 20%, 35%); /* Azul-acinzentado com contraste melhorado */
    text-align: center;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    transition: all 0.4s ease;
  }

  .badge:hover .badge-label {
    color: hsl(214, 20%, 40%);
    letter-spacing: 0.14em;
  }

  @media (max-width: 1024px) {
    .hero-badges {
      left: 3rem;
      bottom: 3rem;
      gap: 56px;
    }

    .badge-emblem {
      width: 32px;
      height: 32px;
    }

    .badge-number {
      font-size: 14px;
    }

    .badge-label {
      font-size: 8px;
    }
  }

  @media (max-width: 768px) {
    .hero-badges {
      display: none;
    }
  }

  @keyframes gold-shimmer {
    0%, 100% {
      background-position: 100% 0;
    }
    15% {
      background-position: 85% 0;
    }
    30% {
      background-position: 60% 0;
    }
    45% {
      background-position: 40% 0;
    }
    55% {
      background-position: 35% 0;
    }
    70% {
      background-position: 20% 0;
    }
    85% {
      background-position: 10% 0;
    }
  }

  @keyframes badge-enter {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .badge,
    .badge-number {
      animation: none;
    }
  }
</style>
