<script lang="ts">
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import HeroBadges3D from './HeroBadges3D.svelte';
  import { prefersReducedMotion } from '../../lib/reducedMotion';

  gsap.registerPlugin(ScrollTrigger);
  const reducedMotion = prefersReducedMotion();

  let headlineLine: HTMLElement | null = null;
  let subtitle: HTMLElement | null = null;
  let subtitleLine: HTMLElement | null = null;
  let dividerLine: HTMLElement | null = null;
  let description: HTMLElement | null = null;
  let ctaButton: HTMLElement | null = null;
  let whoWeAreButton: HTMLElement | null = null;
  let section: HTMLElement | null = null;
  let geoBackground: HTMLElement | null = null;
  let timeline: gsap.core.Timeline | null = null;

  $effect(() => {
    if (reducedMotion) {
      // Set elements to final state immediately
      gsap.set([headlineLine, subtitle, subtitleLine, dividerLine, description, ctaButton, whoWeAreButton], {
        opacity: 1, y: 0, scaleX: 1, clearProps: 'transform'
      });
      return;
    }

    // Timeline de entrada
    timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    timeline
      .to(headlineLine, {
        opacity: 1,
        y: 0,
        duration: 1.5
      }, 0)
      .to(subtitleLine, {
        scaleX: 1,
        width: '6rem',
        duration: 3.2,
        ease: "none"
      }, 1.2)
      .fromTo(subtitle,
        {
          autoAlpha: 0,
          y: 16
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 2.8,
          ease: "power1.out"
        }, 2.4)
      .to(dividerLine, {
        scaleX: 1,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }, 2)
      .to(description, {
        opacity: 1,
        y: 0,
        duration: 1
      }, 2.8)
      .to(ctaButton, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, 3.2)
      .to(whoWeAreButton, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, 3.2);

    // Parallax no scroll - geo background
    if (geoBackground && !reducedMotion) {
      gsap.to(geoBackground, {
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // Parallax no conteúdo
    if (section && !reducedMotion) {
      gsap.to(section.querySelector('.content-wrapper'), {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // Teardown
    return () => {
      if (timeline) timeline.kill();
    };
  });
</script>

<section id="consulting" class="hero-section" data-stack-section bind:this={section}>
  <div class="geo-background" bind:this={geoBackground} aria-hidden="true">
    <div class="geo-line geo-line-v-1"></div>
    <div class="geo-line geo-line-v-2"></div>
    <div class="geo-line geo-line-v-3"></div>
    <div class="geo-line geo-line-h-1"></div>
    <div class="geo-line geo-line-h-2"></div>
    <div class="geo-line geo-line-h-3"></div>
  </div>
  <div class="content-wrapper">
    <div class="hero-headline-wrapper">
      <h1 class="hero-headline">
        <span class="main-word" bind:this={headlineLine} data-text="Inteligência">
          Inteligência
        </span>
        <span class="subtitle" bind:this={subtitle}>
          <span class="subtitle-line subtitle-line-left" bind:this={subtitleLine}></span>
          <span class="subtitle-text">
            <span class="subtitle-part-1">em planos</span>
            <span class="subtitle-part-2">de saúde.</span>
          </span>
          <span class="subtitle-line subtitle-line-right"></span>
        </span>
      </h1>
    </div>

    <div class="hero-content">
      <div class="divider-line" bind:this={dividerLine}></div>
      <p class="hero-description" bind:this={description}>
          Analisamos custo, cobertura e acesso real a hospitais, laboratórios e clínicas relevantes para você e sua empresa.
      </p>
      <div class="cta-group">
        <a href="/analise" class="cta-button" bind:this={ctaButton}>
          Iniciar análise
          <svg class="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
        <a href="/sobre" class="cta-button cta-secondary" bind:this={whoWeAreButton}>
            Conhecer a Klout
        </a>
      </div>
    </div>
  </div>

  <HeroBadges3D />
</section>

<style>
  :global(.hero-section) {
    min-height: 100vh;
    width: 100vw !important;
    max-width: 100% !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 !important;
    position: relative;
    background: linear-gradient(
      135deg,
      hsl(214, 61%, 97%) 0%,
      hsl(214, 61%, 99%) 100%
    );
    left: 0 !important;
    margin: 0 !important;
    overflow: hidden;
  }

  :global(.geo-background) {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
  }

  :global(.geo-line) {
    position: absolute;
    background: linear-gradient(
      180deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 60%, 0.2) 50%,
      hsla(214, 15%, 60%, 0) 100%
    );
    opacity: 0.38;
  }

  :global(.geo-line-v-1) {
    width: 1px;
    height: 60%;
    top: 20%;
    left: 15%;
    background: linear-gradient(
      180deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 60%, 0.25) 50%,
      hsla(214, 15%, 60%, 0) 100%
    );
  }

  :global(.geo-line-v-2) {
    width: 1px;
    height: 70%;
    top: 15%;
    right: 20%;
    background: linear-gradient(
      180deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 60%, 0.2) 50%,
      hsla(214, 15%, 60%, 0) 100%
    );
  }

  :global(.geo-line-h-1) {
    height: 1px;
    width: 50%;
    top: 35%;
    left: 0;
    background: linear-gradient(
      90deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 60%, 0.15) 50%,
      hsla(214, 15%, 60%, 0) 100%
    );
  }

  :global(.geo-line-h-2) {
    height: 1px;
    width: 40%;
    bottom: 25%;
    right: 0;
    background: linear-gradient(
      90deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 60%, 0.18) 50%,
      hsla(214, 15%, 60%, 0) 100%
    );
  }

  :global(.geo-line-v-3) {
    width: 1px;
    height: 50%;
    top: 25%;
    left: 60%;
    background: linear-gradient(
      180deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 60%, 0.15) 50%,
      hsla(214, 15%, 60%, 0) 100%
    );
  }

  :global(.geo-line-h-3) {
    height: 1px;
    width: 35%;
    top: 55%;
    left: 10%;
    background: linear-gradient(
      90deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 60%, 0.12) 50%,
      hsla(214, 15%, 60%, 0) 100%
    );
  }

  :global(.hero-section.pinned) {
    z-index: 10;
  }

  :global(.content-wrapper) {
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 4.5rem 8rem 2.5rem 6.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    height: 85vh;
  }

  :global(.hero-content) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    width: 100%;
    max-width: 390px;
    margin-left: auto;
    margin-right: 10rem;
    margin-top: -0.75rem;
    position: relative;
  }

  :global(.divider-line) {
    position: absolute;
    left: -3rem;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(
      180deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 56%, 0.32) 20%,
      hsla(214, 15%, 56%, 0.32) 80%,
      hsla(214, 15%, 60%, 0) 100%
    );
    transform: scaleX(0);
    transform-origin: top center;
    opacity: 0;
    transition: background 0.3s ease;
  }

  :global(.hero-headline-wrapper) {
    max-width: 980px;
    overflow: visible;
    margin: 6.5rem 0 0 0;
  }

  :global(.hero-headline) {
    font-family: 'IBM Plex Serif', serif !important;
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: hsl(214, 61%, 18%);
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  :global(.hero-headline .main-word) {
    display: block;
    font-size: clamp(5.4rem, 12vw, 10.4rem);
    font-weight: 400;
    line-height: 0.96;
    letter-spacing: -0.04em;
    opacity: 0;
    transform: translateY(40px);
    position: relative;
    color: hsl(214, 58%, 14%);
  }

  :global(.hero-headline .main-word)::before {
    content: none;
  }

  :global(.hero-headline .subtitle) {
    display: block;
    font-size: 1.72rem;
    font-weight: 400;
    font-family: 'Proxima Nova', sans-serif !important;
    margin-top: 1.85rem;
    margin-left: 8px;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 1rem;

    /* Estado inicial para animação Hygge — visibility garante que não apareça antes */
    visibility: hidden;
    opacity: 0;
    transform: translateY(16px);

    color: hsl(42, 28%, 38%);
  }

  :global(.hero-headline .subtitle .subtitle-line) {
    display: block;
    width: 6rem;
    height: 1px;
    flex-shrink: 0;
    align-self: center;
    transform-origin: left center;
    transform: scaleX(0);

    background: linear-gradient(
      90deg,
      hsl(42, 22%, 42%) 0%,
      hsl(42, 28%, 52%) 50%,
      hsl(42, 22%, 42%) 100%
    );
    box-shadow: none;
  }

  :global(.hero-description) {
    font-size: clamp(1rem, 1.35vw, 1.08rem);
    line-height: 1.78;
    color: hsl(214, 20%, 26%);
    font-weight: 400;
    margin: 0 0 1.8rem 0;
    font-family: 'Proxima Nova', sans-serif;
    opacity: 0;
    transform: translateY(20px);
  }

  :global(.cta-button) {
    opacity: 0;
    transform: translateY(20px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 50px;
    padding: 0.9rem 1.5rem;
    border: 1px solid hsla(214, 46%, 18%, 0.16);
    border-radius: 18px;
    box-sizing: border-box;
    font-size: 0.92rem;
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
      hsl(214, 58%, 22%) 0%,
      hsl(214, 58%, 18%) 58%,
      hsl(214, 56%, 15%) 100%
    );
    color: hsl(0, 0%, 100%);
    cursor: pointer;
    letter-spacing: 0.02em;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 14px 30px hsla(214, 44%, 16%, 0.18),
      0 4px 12px hsla(214, 44%, 16%, 0.1),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.18);
  }

  :global(.cta-button.cta-secondary) {
    background: hsla(0, 0%, 100%, 0.56);
    color: hsl(214, 48%, 16%);
    border: 1px solid hsla(0, 0%, 100%, 0.88);
    box-shadow:
      inset 0 1px 0 hsla(0, 0%, 100%, 0.6),
      0 10px 24px hsla(214, 24%, 16%, 0.08);
  }

  :global(.cta-button.cta-secondary:hover) {
    background: hsla(0, 0%, 100%, 0.72);
    color: hsl(214, 56%, 15%);
    border-color: hsla(0, 0%, 100%, 0.96);
    transform: translateY(-3px);
    box-shadow:
      inset 0 1px 0 hsla(0, 0%, 100%, 0.72),
      0 16px 30px hsla(214, 24%, 16%, 0.1);
  }

  :global(.cta-group) {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  :global(.cta-button:hover) {
    transform: translateY(-3px);
    box-shadow:
      0 18px 34px hsla(214, 44%, 16%, 0.22),
      0 6px 14px hsla(214, 44%, 16%, 0.12),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.18);
  }

  :global(.cta-button:active) {
    transform: translateY(0) scale(0.98);
    box-shadow:
      0 8px 18px hsla(214, 44%, 16%, 0.18),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.14);
  }

  :global(.cta-button:focus-visible) {
    outline: 2px solid hsla(214, 58%, 18%, 0.88);
    outline-offset: 3px;
  }

  :global(.cta-button .arrow-icon) {
    width: 18px;
    height: 18px;
    transition: transform 0.3s ease;
  }

  :global(.cta-button:hover .arrow-icon) {
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    :global(.hero-section) {
      min-height: 100vh !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    :global(.content-wrapper) {
      padding: 1.5rem;
      gap: 1.25rem;
      max-width: 420px;
      margin: 0 auto;
      left: 0 !important;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      transform: translateY(2rem) !important;
    }

    :global(.hero-headline-wrapper) {
      width: 100%;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
    }

    :global(.hero-headline) {
      font-size: clamp(2.5rem, 8vw, 4rem);
      text-align: center;
      margin: 0;
      padding: 0;
      align-items: center;
    }

    :global(.hero-headline .main-word) {
      font-size: clamp(3rem, 10vw, 5rem);
    }

    :global(.hero-headline .subtitle) {
      font-size: clamp(0.84rem, 3vw, 1.1rem);
      text-align: center;
      letter-spacing: 0.08em;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    :global(.hero-headline .subtitle .subtitle-line-left),
    :global(.hero-headline .subtitle .subtitle-line-right) {
      display: block;
      width: 3rem !important;
      height: 1px;
      flex-shrink: 0;
      transform: scaleX(1);
      transform-origin: center center;

      background: linear-gradient(
        90deg,
        hsl(42, 22%, 42%) 0%,
        hsl(42, 28%, 52%) 50%,
        hsl(42, 22%, 42%) 100%
      );
      box-shadow: none;
    }

    :global(.hero-headline .subtitle .subtitle-text) {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.25rem;
    }

    :global(.hero-headline .subtitle .subtitle-part-1),
    :global(.hero-headline .subtitle .subtitle-part-2) {
      display: block;

      background: linear-gradient(
        110deg,
        hsl(42, 24%, 36%) 0%,
        hsl(42, 28%, 44%) 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    :global(.hero-description) {
      font-size: 0.98rem;
      max-width: 100%;
      text-align: center;
      margin: 0 auto 1.2rem auto;
      padding: 0;
    }

    :global(.hero-content) {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      justify-content: center;
      margin: 0;
      padding: 0;
    }

    :global(.cta-group) {
      justify-content: center;
      flex-direction: column;
      gap: 0.75rem;
    }

    :global(.cta-button) {
      width: min(100%, 284px);
      min-height: 48px;
      padding: 0.85rem 1.35rem;
      font-size: 0.88rem;
    }
  }
</style>
