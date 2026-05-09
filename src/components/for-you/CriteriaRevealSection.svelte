<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { prefersReducedMotion } from '../../lib/reducedMotion';

  let section: HTMLElement;

  onMount(() => {
    if (!section || prefersReducedMotion()) return;

    const imageStage = section.querySelector('.criteria-visual-stage');
    const serviceCard = section.querySelector('.criteria-service-card');
    const editorialItems = section.querySelectorAll('.criteria-item');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' }
    });

    tl.fromTo(
      imageStage,
      { autoAlpha: 0, scale: 1.03 },
      { autoAlpha: 1, scale: 1, duration: 1.1 }
    )
      .fromTo(
        serviceCard,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.85 },
        '-=0.65'
      )
      .fromTo(
        editorialItems,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 },
        '-=0.45'
      );

    return () => {
      tl.kill();
    };
  });
</script>

<section class="criteria-reveal-section" bind:this={section}>
  <p class="eyebrow criteria-kicker section-side-kicker">O que analisamos</p>
  <div class="criteria-reveal-shell">
    <div class="criteria-viewport">
      <div class="criteria-visual-stage">
        <img
          src="/images/consulting_b2c_02-1160.webp"
          srcset="/images/consulting_b2c_02-960.webp 960w, /images/consulting_b2c_02-1160.webp 1160w, /images/consulting_b2c_02.webp 1280w"
          sizes="(max-width: 768px) 100vw, (max-width: 1400px) calc(100vw - 14rem), 1160px"
          alt="Consultora conversando com um casal e analisando documentos para recomendar o plano mais adequado"
          class="criteria-image"
          loading="lazy"
          width="1160"
          height="773"
        />
        <div class="criteria-image-shade"></div>

        <div class="criteria-overlay">
          <h2 class="criteria-title">Três pontos definem se o plano vale a pena</h2>
        </div>
      </div>

      <div class="criteria-editorial-stage">
        <div class="criteria-editorial-grid">
          <div class="criteria-list">
            <div class="criteria-item">
              <span class="criteria-item-index">01</span>
              <h3>Rede útil</h3>
              <p>Hospitais, especialistas, laboratórios de ponta e conveniência.</p>
            </div>

            <div class="criteria-item">
              <span class="criteria-item-index">02</span>
              <h3>Cobertura e risco</h3>
              <p>Limitações, regras contratuais, carências e o tipo de atendimento do qual possa precisar.</p>
            </div>

            <div class="criteria-item">
              <span class="criteria-item-index">03</span>
              <h3>Custo com perspectiva</h3>
              <p>Quanto você paga hoje, como esse valor pode subir e o que recebe em troca.</p>
            </div>
          </div>

          <div class="criteria-service-card">
            <p class="criteria-service-kicker">Leitura consultiva</p>
            <p class="criteria-lead">
                Atendimento remoto ou presencial. Primeiro entendemos seu caso. Depois mostramos as opções que valem a comparação.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .criteria-reveal-section {
    min-height: auto;
    width: 100vw;
    max-width: 100%;
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow: visible;
    background:
      radial-gradient(circle at 18% 30%, hsla(45, 55%, 76%, 0.12) 0%, transparent 24%),
      linear-gradient(180deg, hsl(45, 34%, 98%) 0%, hsl(45, 30%, 96%) 100%);
  }

  .criteria-reveal-shell {
    width: 100%;
    max-width: 1400px;
    padding: 4rem 4rem 12rem clamp(7rem, 8vw, 8.5rem);
    box-sizing: border-box;
  }

  .eyebrow {
    margin: 0 0 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.76rem;
    font-weight: 400;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: hsl(45, 52%, 46%);
  }

  .section-side-kicker {
    position: absolute;
    left: 32px;
    top: 50%;
    margin: 0;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 4px;
    text-transform: uppercase;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: translateY(-50%) rotate(180deg);
    z-index: 2;
  }

  .criteria-kicker {
    letter-spacing: 0.18em;
    color: hsl(45, 52%, 46%);
  }

  .criteria-viewport {
    position: relative;
    min-height: auto;
    overflow: visible;
  }

  .criteria-visual-stage {
    position: relative;
    overflow: hidden;
    background: hsl(214, 18%, 12%);
    min-height: 44rem;
    border-radius: 34px;
    box-shadow:
      0 34px 72px hsla(214, 24%, 18%, 0.14),
      0 10px 24px hsla(214, 24%, 18%, 0.08);
    transform-origin: center center;
  }

  .criteria-image,
  .criteria-image-shade {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .criteria-image {
    object-fit: cover;
    object-position: center 24%;
    filter: saturate(0.94) contrast(1.01) brightness(0.92);
  }

  .criteria-image-shade {
    background:
      linear-gradient(180deg, hsla(214, 32%, 10%, 0.08) 0%, hsla(214, 32%, 10%, 0.04) 34%, transparent 54%),
      radial-gradient(circle at 26% 28%, hsla(214, 34%, 8%, 0.42) 0%, hsla(214, 34%, 8%, 0.18) 28%, transparent 54%);
    pointer-events: none;
  }

  .criteria-overlay {
    position: absolute;
    left: 2.4rem;
    bottom: 3.5rem;
    width: min(500px, calc(100% - 4.8rem));
    padding: 3rem;
    z-index: 1;
    background: linear-gradient(180deg, hsla(214, 28%, 10%, 0.2) 0%, hsla(214, 28%, 10%, 0.08) 100%);
  }

  .criteria-title {
    margin: 0;
    max-width: 8ch;
    font-family: 'IBM Plex Serif', serif;
    font-size: clamp(3.4rem, 5.6vw, 5.8rem);
    font-weight: 400;
    line-height: 0.94;
    letter-spacing: -0.06em;
    color: hsl(0, 0%, 98%);
    text-shadow:
      0 16px 40px hsla(214, 42%, 4%, 0.46),
      0 4px 12px hsla(214, 42%, 4%, 0.28);
  }

  .criteria-editorial-stage {
    position: relative;
    padding-top: 0;
    margin-top: 0;
    z-index: 2;
  }

  .criteria-service-card {
    width: min(300px, calc(100% - 3.5rem));
    margin: -12rem 2.75rem 0 auto;
    padding: 2.2rem 1.65rem 2.35rem;
    border-radius: 24px;
    background:
      linear-gradient(180deg, hsl(42, 30%, 98%) 0%, hsl(38, 24%, 95%) 100%);
    border: 1px solid hsla(34, 18%, 34%, 0.16);
    box-shadow:
      0 22px 48px hsla(214, 24%, 18%, 0.09),
      0 8px 18px hsla(214, 24%, 18%, 0.04),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.72);
    position: relative;
    overflow: hidden;
  }

  .criteria-service-card::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 96px;
    background:
      linear-gradient(180deg, hsla(42, 34%, 88%, 0.22) 0%, transparent 100%);
    pointer-events: none;
  }

  .criteria-service-card::after {
    content: '';
    position: absolute;
    top: 1.2rem;
    left: 1.65rem;
    width: 46px;
    height: 1px;
    background: linear-gradient(90deg, hsl(40, 34%, 44%) 0%, hsla(40, 34%, 44%, 0) 100%);
    opacity: 0.9;
  }

  .criteria-service-kicker {
    margin: 0 0 1.1rem;
    padding-top: 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: hsl(38, 28%, 36%);
    position: relative;
    z-index: 1;
  }

  .criteria-editorial-grid {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0.5rem 1.2rem 2.2rem 0.4rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    column-gap: 3.5rem;
    row-gap: 0;
    align-items: start;
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .criteria-lead {
    margin: 0;
    font-family: 'IBM Plex Serif', serif;
    font-size: clamp(1.12rem, 1.34vw, 1.28rem);
    font-weight: 400;
    line-height: 1.68;
    letter-spacing: -0.012em;
    color: hsl(214, 18%, 18%);
    max-width: 19ch;
    position: relative;
    z-index: 1;
    text-wrap: balance;
  }

  .criteria-list {
    display: grid;
    gap: 4.5rem;
    min-width: 0;
    max-width: 820px;
    margin-right: 0;
    grid-column: 1;
    padding-top: 7rem;
  }

  .criteria-item {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    column-gap: 1.8rem;
    align-items: start;
    padding: 0 0 0.75rem;
    position: relative;
  }

  .criteria-item:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 64px;
    right: 0;
    bottom: calc(-1 * (4.5rem / 2));
    height: 1px;
    background: linear-gradient(
      90deg,
      hsla(214, 24%, 32%, 0.2) 0%,
      hsla(214, 24%, 32%, 0.12) 65%,
      hsla(214, 24%, 32%, 0) 100%
    );
  }

  .criteria-item-index {
    display: inline-flex;
    padding-top: 0.7rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: hsl(40, 24%, 38%);
  }

  .criteria-item h3 {
    grid-column: 2;
    margin: 0 0 1.1rem;
    font-family: 'IBM Plex Serif', serif;
    font-size: clamp(2.9rem, 3.9vw, 4.15rem);
    font-weight: 400;
    line-height: 0.92;
    letter-spacing: -0.058em;
    color: hsl(214, 34%, 16%);
    max-width: 16ch;
  }

  .criteria-item p {
    grid-column: 2;
    margin: 0;
    width: min(90%, 54ch);
    font-family: 'Proxima Nova', sans-serif;
    font-size: 1.08rem;
    line-height: 1.82;
    letter-spacing: 0.015em;
    color: hsl(214, 18%, 30%);
  }

  @media (max-width: 1024px) {
    .criteria-reveal-shell {
      padding: 4rem 2.5rem 4.5rem 5.5rem;
    }

    .criteria-editorial-grid {
      grid-template-columns: minmax(0, 1fr) 312px;
      column-gap: 1.5rem;
      padding: 0 0 0;
    }

    .criteria-item {
      grid-template-columns: 64px minmax(0, 1fr);
      column-gap: 1.25rem;
    }

    .criteria-list {
      max-width: 100%;
      padding-top: 6rem;
    }

    .criteria-lead {
      max-width: 24ch;
    }
  }

  @media (max-width: 768px) {
    .criteria-reveal-section {
      display: block;
      overflow: visible;
    }

    .section-side-kicker {
      display: none;
    }

    .criteria-reveal-shell {
      width: min(100%, 34rem);
      margin-inline: auto;
      padding: 0;
    }

    .criteria-viewport {
      min-height: auto;
      overflow: visible;
    }

    .criteria-visual-stage {
      min-height: 100svh;
      border-radius: 0 0 22px 22px;
      box-shadow:
        0 18px 40px hsla(214, 24%, 18%, 0.12),
        0 6px 18px hsla(214, 24%, 18%, 0.06);
    }

    .criteria-overlay {
      left: 1rem;
      bottom: -1.5rem;
      width: min(320px, calc(100% - 2rem));
      padding: 3rem;
    }

    .criteria-title {
      font-size: clamp(2.5rem, 10vw, 3.9rem);
    }

    .criteria-editorial-grid {
      margin: 0;
      padding: 2.5rem 1.5rem 4rem;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      justify-items: center;
    }

    .criteria-service-card {
      width: min(22rem, calc(100% - 3rem));
      margin: 0;
      padding: 1.8rem 1.3rem 1.85rem;
      border-radius: 22px;
      grid-column: 1;
      order: -1;
      justify-self: center;
      text-align: center;
    }

    .criteria-service-card::after {
      display: none;
    }

    .criteria-service-kicker {
      margin-bottom: 0.95rem;
      font-size: 0.58rem;
      text-align: center;
    }

    .criteria-lead {
      max-width: 100%;
      font-size: 1.02rem;
      line-height: 1.6;
      text-align: center;
    }

    .criteria-list {
      width: min(100%, 22rem);
      margin: 0 auto;
      gap: 1.75rem;
    }

    .criteria-item {
      grid-template-columns: 1fr;
      column-gap: 0;
      width: 100%;
      padding: 0.9rem 0 0.95rem;
      text-align: center;
      justify-items: center;
    }

    .criteria-item:not(:last-child)::after {
      left: 10%;
      right: 10%;
      bottom: calc(-1 * (1.75rem / 2));
    }

    .criteria-item-index {
      transform: none;
      margin-bottom: 0.4rem;
      font-size: 0.6rem;
      letter-spacing: 0.16em;
      text-align: center;
    }

    .criteria-item h3 {
      grid-column: auto;
      transform: none;
      margin-bottom: 0.6rem;
      font-size: 1.24rem;
      line-height: 1.02;
      max-width: 100%;
      text-align: center;
    }

    .criteria-item p {
      grid-column: auto;
      transform: none;
      width: 100%;
      max-width: 32ch;
      font-size: 0.8rem;
      line-height: 1.64;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .criteria-editorial-grid {
      padding: 2.1rem 1rem 3.2rem;
      gap: 1.15rem;
    }

    .criteria-list {
      gap: 1.5rem;
    }

    .criteria-item {
      padding: 0.8rem 0 0.9rem;
    }

    .criteria-item:not(:last-child)::after {
      left: 12%;
      right: 12%;
      bottom: calc(-1 * (1.5rem / 2));
    }

    .criteria-item-index {
      margin-bottom: 0.35rem;
      font-size: 0.58rem;
      text-align: center;
    }

    .criteria-item h3 {
      margin-bottom: 0.55rem;
      font-size: 1.18rem;
      line-height: 1.04;
      text-align: center;
    }

    .criteria-item p {
      max-width: 30ch;
      font-size: 0.78rem;
      line-height: 1.62;
      text-align: center;
    }
  }
</style>
