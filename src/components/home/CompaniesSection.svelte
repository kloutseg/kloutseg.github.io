<script lang="ts">
  import SectionIndicator from './SectionIndicators.svelte';
</script>

<section id="sua-empresa" data-stack-section>
  <SectionIndicator number="02" title="Para sua empresa" />

  <div class="section-content">
    <div class="content-rail">
      <h2 class="section-text">
          Benefício de saúde que ajuda a contratar e reter melhor
      </h2>

      <div class="side-text">
        <p>
            Comparamos rede, custo e regras do contrato para montar um benefício atraente, sem estender o orçamento.
        </p>
      </div>

      <div class="cta-container">
        <a href="/contato" class="companies-cta-button">
          <span class="button-label">Ver solução para empresas</span>
          <svg class="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>

    <div class="image-wrapper">
      <figure class="image-container">
        <img
          src="/images/enterprise_01.webp"
          srcset="/images/enterprise_01-640.webp 640w, /images/enterprise_01-960.webp 960w, /images/enterprise_01.webp 1264w"
          sizes="(max-width: 768px) 88vw, (max-width: 1024px) 960px, 1264px"
          alt="Profissionais trabalhando em ambiente moderno"
          class="capsule-image"
          loading="lazy"
          width="1264"
          height="842"
        />
      </figure>
    </div>
  </div>
</section>

<style>
  section {
    min-height: 100vh;
    width: 100vw;
    max-width: 100%;
    position: relative;
    margin: 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      hsl(214, 61%, 97%) 0%,
      hsl(214, 61%, 99%) 100%
    );
  }

  .section-content {
    width: 100%;
    max-width: 1380px;
    min-height: min(76vh, 760px);
    padding: clamp(3rem, 5vh, 4rem) 4.5rem 3.5rem;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(320px, 470px) minmax(420px, 640px);
    align-items: center;
    justify-content: center;
    gap: clamp(3rem, 6vw, 6.5rem);
  }

  .content-rail {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    max-width: 500px;
    gap: 0.5rem;
  }

  .section-text {
    margin: 0 0 1.3rem;
    font-family: 'IBM Plex Serif', serif;
    font-size: clamp(2.5rem, 3.7vw, 4rem);
    font-weight: 400;
    line-height: 0.98;
    letter-spacing: -0.055em;
    color: hsl(214, 40%, 15%);
    max-width: 13ch;
  }

  .side-text {
    max-width: 440px;
  }

  .side-text p {
    margin: 0;
    font-family: 'Proxima Nova', sans-serif;
    font-size: clamp(0.94rem, 1.04vw, 1.02rem);
    font-weight: 400;
    line-height: 1.85;
    letter-spacing: 0.015em;
    color: hsl(214, 20%, 30%);
  }

  .cta-container {
    display: flex;
    justify-content: flex-start;
    margin-top: 1.9rem;
    position: relative;
    z-index: 2;
  }

  .companies-cta-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 12px 24px;
    border-radius: 16px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    transition:
      transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(
      135deg,
      hsl(214, 61%, 18%) 0%,
      hsl(214, 61%, 14%) 100%
    ) !important;
    color: hsl(0, 0%, 100%) !important;
    cursor: pointer;
    letter-spacing: 0.02em;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    opacity: 1 !important;
    visibility: visible !important;
    z-index: 2;
    box-shadow:
      0 12px 28px hsla(214, 44%, 16%, 0.18),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.12);
  }

  .companies-cta-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      hsla(0, 0%, 100%, 0.15) 50%,
      transparent 100%
    );
    z-index: 0;
    transition: left 0.6s ease;
  }

  .companies-cta-button:hover::before {
    left: 100%;
  }

  .companies-cta-button:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 16px 32px hsla(214, 44%, 16%, 0.22);
  }

  .companies-cta-button:active {
    transform: translateY(0) scale(0.98) !important;
    box-shadow: 0 8px 18px hsla(214, 44%, 16%, 0.18);
  }

  .button-label,
  .arrow-icon {
    display: inline-flex;
    position: relative;
    z-index: 1;
    color: inherit !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .arrow-icon {
    width: 18px;
    height: 18px;
    transition: transform 0.3s ease;
  }

  .companies-cta-button:hover .arrow-icon {
    transform: translateX(4px) !important;
  }

  .image-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .image-container {
    width: 100%;
    max-width: 620px;
    aspect-ratio: 5 / 6;
    border-radius: 34px;
    overflow: hidden;
    background: hsl(214, 20%, 92%);
    transition:
      box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow:
      0 32px 72px hsla(214, 30%, 12%, 0.14),
      0 10px 28px hsla(214, 30%, 12%, 0.08);
    position: relative;
  }

  .image-container::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, hsla(214, 22%, 10%, 0.04) 0%, transparent 38%, hsla(214, 22%, 10%, 0.08) 100%),
      radial-gradient(circle at 78% 18%, hsla(45, 42%, 68%, 0.14) 0%, transparent 24%);
    pointer-events: none;
  }

  .capsule-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center 26%;
    filter: saturate(0.92) sepia(0.02) hue-rotate(2deg) brightness(0.97) contrast(1.03);
    transition:
      transform 1.1s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.55s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .image-container:hover {
      transform: translateY(-4px);
      box-shadow:
        0 38px 84px hsla(214, 30%, 12%, 0.18),
        0 12px 30px hsla(214, 30%, 12%, 0.1);
    }

    .image-container:hover .capsule-image {
      transform: scale(1.035);
      filter: saturate(0.98) sepia(0.015) hue-rotate(2deg) brightness(0.99) contrast(1.04);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .image-container,
    .capsule-image {
      transition: none;
    }

    .image-container:hover {
      transform: none;
    }

    .image-container:hover .capsule-image {
      transform: none;
      filter: saturate(0.92) sepia(0.02) hue-rotate(2deg) brightness(0.97) contrast(1.03);
    }
  }

  @media (max-width: 1024px) {
    .section-content {
      min-height: auto;
      grid-template-columns: 1fr;
      justify-items: center;
      padding: 5rem 2.75rem 4rem;
      gap: 2.75rem;
    }

    .content-rail {
      align-items: center;
      text-align: center;
      max-width: 560px;
      gap: 0.35rem;
    }

    .section-text {
      max-width: 15ch;
      text-align: center;
    }

    .side-text p {
      text-align: center;
    }

    .cta-container {
      justify-content: center;
      margin-top: 1.35rem;
    }

    .image-container {
      max-width: 640px;
      aspect-ratio: 16 / 10;
      border-radius: 26px;
    }
  }

  @media (max-width: 768px) {
    section {
      min-height: 100svh;
      padding: clamp(3.25rem, 6svh, 4rem) 1.5rem clamp(3.75rem, 7svh, 4.75rem);
    }

    .section-content {
      padding: 0;
      max-width: 520px;
      gap: 0;
      min-height: auto;
      align-content: center;
    }

    .image-wrapper {
      order: 1;
      margin-bottom: clamp(1.35rem, 3svh, 1.8rem);
    }

    .content-rail {
      order: 2;
      max-width: 520px;
    }

    .image-container {
      width: 100%;
      max-width: none;
      aspect-ratio: 10 / 12;
      border-radius: 20px;
      box-shadow: 0 16px 38px hsla(214, 30%, 12%, 0.1);
    }

    .capsule-image {
      width: 100%;
      object-position: center 30%;
    }

    .section-text {
      font-size: 1.5rem;
      line-height: 1.25;
      letter-spacing: -0.03em;
      max-width: 100%;
      margin-bottom: clamp(0.82rem, 2svh, 1.05rem);
      text-align: center;
    }

    .side-text {
      max-width: 520px;
    }

    .side-text p {
      font-size: 0.86rem;
      line-height: 1.75;
      text-align: center;
    }

    .cta-container {
      justify-content: center;
      margin-top: 1.25rem;
    }

    .companies-cta-button {
      min-height: 48px;
      padding: 0.85rem 1.4rem;
      border: 1px solid hsla(214, 46%, 18%, 0.16);
      border-radius: 16px;
      box-sizing: border-box;
      font-size: 0.88rem;
      background: linear-gradient(
        135deg,
        hsl(214, 58%, 22%) 0%,
        hsl(214, 58%, 18%) 58%,
        hsl(214, 56%, 15%) 100%
      ) !important;
      box-shadow:
        0 14px 30px hsla(214, 44%, 16%, 0.18),
        0 4px 12px hsla(214, 44%, 16%, 0.1),
        inset 0 1px 0 hsla(0, 0%, 100%, 0.18);
    }
  }

  @media (max-width: 480px) {
    section {
      padding: clamp(2.75rem, 5.8svh, 3.5rem) 1rem clamp(3.35rem, 7svh, 4.25rem);
    }

    .image-container {
      aspect-ratio: 10 / 11.5;
      border-radius: 18px;
    }

    .section-text {
      font-size: clamp(1.28rem, 6vw, 1.48rem);
      line-height: 1.2;
    }

    .side-text p {
      font-size: 0.8rem;
      line-height: 1.62;
    }
  }
</style>
