<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import SectionIndicator from './SectionIndicators.svelte';
  import { prefersReducedMotion } from '../../lib/reducedMotion';

  type Gsap = typeof import('gsap').gsap;
  type ScrollTriggerPlugin = typeof import('gsap/ScrollTrigger').ScrollTrigger;
  type ScrollTriggerInstance = ReturnType<ScrollTriggerPlugin['create']>;

  let gsap: Gsap | null = null;
  let ScrollTrigger: ScrollTriggerPlugin | null = null;
  const reducedMotion = prefersReducedMotion();

  // Stacking horizontal ativo apenas em telas acima de 768px (smartphones usam scroll natural)
  const STACKING_BREAKPOINT = 768;

  function isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= STACKING_BREAKPOINT;
  }

  let section: HTMLElement;
  let slidesContainer: HTMLElement;
  let slides: HTMLElement[] = [];
  let progressIndicators: HTMLElement[] = [];
  let scrollTriggerInstance: ScrollTriggerInstance | null = null;
  let slideContentEl: HTMLElement | null = $state(null);

  // Mobile swipe state
  let swipeHintEl: HTMLElement | null = $state(null);
  let mobileCurrentSlide = $state(0);

  const slideData = [
    {
      number: '01',
      title: 'Personalização',
      heading: 'Plano alinhado à sua rotina',
      content: 'Rede, cobertura e custo precisam combinar com seu uso real e projeção de vida.',
      gradient: 'linear-gradient(135deg, hsl(214, 61%, 97%) 0%, hsl(214, 61%, 99%) 100%)'
    },
    {
      number: '02',
      title: 'Transparência',
      heading: 'Você entende o que está contratando',
      content: 'Explicamos carências, rede, regras e limites antes da decisão. Recomendamos a troca somente quando compensa para você.',
      gradient: 'linear-gradient(135deg, hsl(214, 61%, 96%) 0%, hsl(214, 61%, 98%) 100%)'
    },
    {
      number: '03',
      title: 'Critério',
      heading: 'Investimento mais coerente e eficiente',
      content: 'Comparamos custo, acesso e risco para decidir entre manter, ajustar ou trocar o plano com atenção às suas prioridades.',
      gradient: 'linear-gradient(135deg, hsl(214, 61%, 97%) 0%, hsl(214, 61%, 99%) 100%)'
    }
  ];

  async function loadScrollAnimationTools() {
    if (gsap && ScrollTrigger) return;

    const [gsapModule, scrollTriggerModule] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);

    gsap = gsapModule.gsap;
    ScrollTrigger = scrollTriggerModule.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
  }

  onMount(() => {
    if (!slidesContainer || !section) return;
    let cancelled = false;
    let tween: ReturnType<Gsap['to']> | null = null;

    // If user prefers reduced motion, render slides vertically without scroll-jacking
    if (reducedMotion) {
      section.style.height = 'auto';
      section.style.minHeight = 'auto';
      section.style.overflow = 'visible';
      slidesContainer.style.transform = 'none';
      slidesContainer.style.width = '100%';
      slides.forEach(slide => {
        slide.style.width = '100%';
        slide.style.minHeight = '100vh';
        slide.style.transform = 'none';
      });
      return;
    }

    // Mobile: use CSS scroll-snap for horizontal swipe navigation
    if (isMobile()) {
      section.style.height = 'auto';
      section.style.minHeight = 'auto';
      section.style.overflow = 'visible';

      slidesContainer.style.display = 'flex';
      slidesContainer.style.width = '100%';
      slidesContainer.style.overflowX = 'auto';
      slidesContainer.style.scrollSnapType = 'x mandatory';
      slidesContainer.style.scrollBehavior = 'smooth';
      slidesContainer.style.webkitOverflowScrolling = 'touch';
      slidesContainer.style.transform = 'none';

      slides.forEach((slide, idx) => {
        slide.style.width = '100vw';
        slide.style.minHeight = '100vh';
        slide.style.flexShrink = '0';
        slide.style.scrollSnapAlign = 'start';
        slide.style.transform = 'none';
      });

      // Update progress indicators on scroll
      let scrollTimeout: ReturnType<typeof setTimeout>;
      slidesContainer.addEventListener('scroll', () => {
        if (!slidesContainer) return;

        const scrollLeft = slidesContainer.scrollLeft;
        const slideWidth = window.innerWidth;
        const currentSlide = Math.round(scrollLeft / slideWidth);
        mobileCurrentSlide = currentSlide;
        updateProgressBars(currentSlide);

        // Debounced check for last slide (after snap settles)
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (!slidesContainer) return;
          const finalScrollLeft = slidesContainer.scrollLeft;
          const finalSlide = Math.round(finalScrollLeft / window.innerWidth);
          mobileCurrentSlide = finalSlide;
          updateProgressBars(finalSlide);
        }, 400);
      });

      // Set initial progress (slide 0)
      mobileCurrentSlide = 0;
      updateProgressBars(0);

      return () => {
        clearTimeout(scrollTimeout);
      };
    }

    void (async () => {
      await loadScrollAnimationTools();
      if (cancelled || !gsap || !ScrollTrigger) return;

      const totalSlides = slideData.length;
      const getScrollDistance = () => (totalSlides - 1) * window.innerHeight * 3.4;

      // Matar qualquer ScrollTrigger existente nesta seção
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === section) {
          t.kill();
        }
      });

      // Criar animação horizontal controlada pelo scroll
      tween = gsap.to(slidesContainer, {
        x: `-${(totalSlides - 1) * 100}vw`,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 1,
          pin: true,
          pinSpacing: true, // Adiciona espaço para o pin
          anticipatePin: 0,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const currentSlide = Math.min(
              Math.floor(progress * totalSlides),
              totalSlides - 1
            );

            // Atualizar indicadores de progresso
            progressIndicators.forEach((indicator, idx) => {
              const fill = indicator.querySelector('.progress-bar-fill') as HTMLElement;
              if (fill) {
                if (idx < currentSlide) {
                  // Slides já passados: fill completo
                  setProgressFill(fill, 1);
                } else if (idx === currentSlide) {
                  // Slide atual: fill animando
                  const slideProgress = (progress * totalSlides) - currentSlide;
                  setProgressFill(fill, Math.min(slideProgress, 1));
                } else {
                  // Slides futuros: fill vazio
                  setProgressFill(fill, 0);
                }
              }
            });
          }
        }
      });

      scrollTriggerInstance = tween.scrollTrigger ?? null;
      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      tween?.kill();
      scrollTriggerInstance?.kill();
    };
  });

  function setProgressFill(fill: HTMLElement, progress: number) {
    fill.style.transform = `scaleX(${progress})`;
  }

  // Update progress bars for a given slide index
  function updateProgressBars(currentSlide: number) {
    progressIndicators.forEach((indicator, idx) => {
      const fill = indicator.querySelector('.progress-bar-fill') as HTMLElement;
      if (fill) {
        if (idx <= currentSlide) {
          setProgressFill(fill, 1);
        } else {
          setProgressFill(fill, 0);
        }
      }
    });
  }

  // Actions para registrar elementos
  function slideAction(node: HTMLElement, index: number) {
    slides[index] = node;
    return {
      destroy() {
        delete slides[index];
      }
    };
  }

  function scrollToMobileSlide(targetIndex: number) {
    if (!slidesContainer || !isMobile()) return;

    const clampedIndex = Math.max(0, Math.min(targetIndex, slideData.length - 1));
    const slideWidth = window.innerWidth;

    mobileCurrentSlide = clampedIndex;
    slidesContainer.scrollTo({
      left: clampedIndex * slideWidth,
      behavior: 'smooth'
    });
    updateProgressBars(clampedIndex);
  }

  function handleMobileSlideNav(direction: 'prev' | 'next') {
    const targetIndex = direction === 'next'
      ? mobileCurrentSlide + 1
      : mobileCurrentSlide - 1;

    scrollToMobileSlide(targetIndex);
  }

  function indicatorAction(node: HTMLElement, index: number) {
    progressIndicators[index] = node;
    return {
      destroy() {
        delete progressIndicators[index];
      }
    };
  }

</script>

<section id="voce" bind:this={section} class="slide-section">
  <div class="geo-background">
    <div class="geo-line geo-line-v-1"></div>
    <div class="geo-line geo-line-v-2"></div>
    <div class="geo-line geo-line-v-3"></div>
    <div class="geo-line geo-line-h-1"></div>
    <div class="geo-line geo-line-h-2"></div>
    <div class="geo-line geo-line-h-3"></div>
  </div>

  <SectionIndicator number="01" title="Para você" />

  <!-- Progress Indicators -->
  <div class="progress-container">
    {#each slideData as _, index}
      <div
        class="progress-bar-bg"
        use:indicatorAction={index}
      >
        <div class="progress-bar-fill"></div>
      </div>
    {/each}
  </div>

  <!-- Mobile Swipe Hint (arrow) -->
  <div class="mobile-swipe-hint" bind:this={swipeHintEl}>
    <button
      type="button"
      class="swipe-nav-button swipe-nav-button--prev control-button control-button--compact"
      class:is-hidden={mobileCurrentSlide === 0}
      onclick={() => handleMobileSlideNav('prev')}
      aria-label="Ir para o slide anterior"
      disabled={mobileCurrentSlide === 0}
    >
      <span class="swipe-arrow control-button__arrow control-button__arrow--left" aria-hidden="true"></span>
    </button>
    <button
      type="button"
      class="swipe-nav-button swipe-nav-button--next control-button control-button--compact"
      class:is-hidden={mobileCurrentSlide >= slideData.length - 1}
      onclick={() => handleMobileSlideNav('next')}
      aria-label="Ir para o próximo slide"
      disabled={mobileCurrentSlide >= slideData.length - 1}
    >
      <span class="swipe-arrow control-button__arrow control-button__arrow--right" aria-hidden="true"></span>
    </button>
  </div>

  <!-- Slides Container -->
  <div class="slides-container" bind:this={slidesContainer}>
    {#each slideData as slide, index}
      <div
        class="slide"
        style="background: {slide.gradient}"
        use:slideAction={index}
      >
        {#if index === 0}
          <!-- First slide with poster image -->
          <div class="slide-content slide-1-content" bind:this={slideContentEl}>
            <div class="slide-number">{slide.number}</div>
            <div class="slide-title">{slide.title}</div>
            <h2 class="slide-heading">{slide.heading}</h2>
            <p class="slide-text">{slide.content}</p>
          </div>

          <!-- Poster Image Container -->
          <div class="video-wrapper" aria-label="Atendimento personalizado Klout">
            <div class="video-capsule">
              <img
                src="/images/video_poster-800.webp"
                srcset="/images/video_poster-480.webp 480w, /images/video_poster-800.webp 800w"
                sizes="(max-width: 768px) 72vw, 520px"
                alt="Atendimento personalizado Klout"
                class="video-poster"
                loading="lazy"
                width="800"
                height="501"
              />
              <div class="video-overlay"></div>
            </div>
          </div>
        {:else if index === 1}
          <!-- Second slide with image capsule (reversed: image left, text right) -->
          <div
            class="image-capsule-wrapper image-left"
          >
            <div class="image-capsule">
              <img
                src="/images/consulting_01.webp"
                srcset="/images/consulting_01-480.webp 480w, /images/consulting_01-700.webp 700w, /images/consulting_01-1000.webp 1000w, /images/consulting_01.webp 1280w"
                sizes="(max-width: 768px) 50vw, 520px"
                alt="Consultoria personalizada"
                loading="lazy"
                width="1280"
                height="1920"
              />
              <div class="image-overlay"></div>
            </div>
          </div>

          <div class="slide-content slide-2-content" bind:this={slideContentEl}>
            <div class="slide-number">{slide.number}</div>
            <div class="slide-title">{slide.title}</div>
            <h2 class="slide-heading">{slide.heading}</h2>
            <p class="slide-text">{slide.content}</p>
          </div>
        {:else}
          <!-- Third slide with family image capsule -->
          <div
            class="image-capsule-wrapper image-left slide-3-image"
          >
            <div class="image-capsule">
              <img
                src="/images/family_01.webp"
                srcset="/images/family_01-480.webp 480w, /images/family_01-700.webp 700w, /images/family_01-1000.webp 1000w, /images/family_01.webp 1400w"
                sizes="(max-width: 768px) 50vw, 520px"
                alt="Família e proteção"
                loading="lazy"
                width="1400"
                height="2100"
              />
              <div class="image-overlay"></div>
            </div>
          </div>

          <div class="slide-content slide-3-content" bind:this={slideContentEl}>
            <div class="slide-number">{slide.number}</div>
            <div class="slide-title">{slide.title}</div>
            <h2 class="slide-heading">{slide.heading}</h2>
            <p class="slide-text">{slide.content}</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>

<section class="curation-interlude" data-stack-section data-dark-section>
  <div class="curation-interlude__inner">
    <p class="curation-interlude__text">
      Executamos uma curadoria dedicada visando projetar a solução mais vantajosa para você.
    </p>
    <a href="/analise" class="curation-interlude__cta">
      Iniciar análise
      <svg class="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </a>
  </div>
</section>

<style>
  .slide-section {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .geo-background {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .geo-line {
    position: absolute;
    background: linear-gradient(
      180deg,
      hsla(214, 15%, 60%, 0) 0%,
      hsla(214, 15%, 60%, 0.2) 50%,
      hsla(214, 15%, 60%, 0) 100%
    );
    opacity: 0.42;
  }

  .geo-line-v-1 {
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

  .geo-line-v-2 {
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

  .geo-line-h-1 {
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

  .geo-line-h-2 {
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

  .geo-line-v-3 {
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

  .geo-line-h-3 {
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

  /* Progress Indicators */
  .progress-container {
    position: absolute;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 14px;
    z-index: 100;
  }

  .progress-bar-bg {
    width: 72px;
    height: 2px;
    background: hsla(214, 20%, 34%, 0.12);
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    transform: scaleX(0);
    transform-origin: left center;
    background: linear-gradient(
      90deg,
      hsl(42, 24%, 34%) 0%,
      hsl(42, 28%, 42%) 100%
    );
    border-radius: 999px;
    transition: transform 0.3s ease;
    will-change: transform;
  }

  /* Slides Container */
  .slides-container {
    display: flex;
    width: 300vw; /* 3 slides = 3 * 100vw */
    height: 100%;
    position: relative;
    z-index: 1;
  }

  .slide {
    width: 100vw;
    height: 100vh;
    flex-shrink: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 clamp(4.5rem, 8vw, 11rem);
    box-sizing: border-box;
    gap: clamp(3rem, 5vw, 5.5rem);
  }

  .slide-content {
    max-width: 620px;
    position: relative;
    z-index: 10;
    justify-self: start;
    margin-left: 3rem;
  }

  /* Slide 2: texto à direita com mesma largura do slide 1 */
  .slide-2-content {
    max-width: 620px;
    justify-self: end;
    margin-left: 0;
    margin-right: 3rem;
  }

  /* Slide 3: texto à direita com mesma largura do slide 1 */
  .slide-3-content {
    max-width: 620px;
    justify-self: end;
    margin-left: 0;
    margin-right: 3rem;
  }

  .slide-number {
    font-family: 'IBM Plex Mono', monospace;
    font-size: clamp(2.3rem, 3.2vw, 3.75rem);
    font-weight: 400;
    letter-spacing: 0.015em;
    color: hsl(214, 16%, 34%);
    margin-bottom: 1.25rem;
    opacity: 0.62;
  }

  .slide-title {
    font-family: 'Proxima Nova', sans-serif;
    font-size: clamp(0.9rem, 1vw, 1rem);
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: hsl(42, 28%, 38%);
    margin-bottom: 1.15rem;
  }

  .slide-heading {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-size: clamp(2.6rem, 3.6vw, 4rem);
    font-weight: 400;
    line-height: 1.02;
    color: hsl(214, 48%, 16%);
    margin-bottom: 1.65rem;
    letter-spacing: -0.03em;
    max-width: 15ch;
    text-wrap: balance;
  }

  .slide-text {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.72;
    color: hsl(214, 16%, 30%);
    max-width: 54ch;
  }

  /* ═══════════════════════════════════════════
     POSTER IMAGE WRAPPER - editorial media frame
     ═══════════════════════════════════════════ */
  .video-wrapper {
    position: relative;
    width: min(42vw, 520px);
    aspect-ratio: 10 / 12;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
  }

  .video-capsule {
    width: 100%;
    height: 100%;
    border-radius: 30px;
    overflow: hidden;
    position: relative;
    box-shadow:
      0 26px 46px hsla(214, 30%, 14%, 0.12),
      0 8px 18px hsla(214, 26%, 14%, 0.06);
  }

  .video-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 12% center;
    display: block;
    filter: saturate(0.92) sepia(0.035) hue-rotate(3deg) brightness(0.97) contrast(1.03);
  }

  .video-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      hsla(214, 48%, 16%, 0.02) 0%,
      hsla(214, 48%, 16%, 0.18) 100%
    );
    pointer-events: none;
  }

  /* ═══════════════════════════════════════════
     IMAGE FRAME - Slide 2
     ═══════════════════════════════════════════ */
  .image-capsule-wrapper {
    position: relative;
    width: min(42vw, 520px);
    aspect-ratio: 10 / 12;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
  }

  /* Slide 2: imagem à esquerda */
  .image-capsule-wrapper.image-left {
    justify-self: center;
  }

  /* Slide 3: cápsula com rotação sutil orgânica */
  .image-capsule-wrapper.image-left.slide-3-image {
    transform: rotate(-0.65deg);
    transition: transform 0.4s ease;
  }

  .image-capsule {
    width: 100%;
    height: 100%;
    border-radius: 30px;
    overflow: hidden;
    position: relative;
    box-shadow:
      0 26px 46px hsla(214, 30%, 14%, 0.12),
      0 8px 18px hsla(214, 26%, 14%, 0.06);
    transition: border-radius 0.5s ease;
  }

  .image-capsule img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: saturate(0.92) sepia(0.035) hue-rotate(3deg) brightness(0.97) contrast(1.03);
  }

  .slide-3-image .image-capsule img {
    object-position: center 0%;
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      hsla(214, 48%, 16%, 0.02) 0%,
      hsla(214, 48%, 16%, 0.18) 100%
    );
    pointer-events: none;
  }

  /* Hide mobile-only elements on desktop */
  .mobile-swipe-hint {
    display: none;
  }

  .curation-interlude {
    position: relative;
    height: calc(100vh + 1rem);
    min-height: calc(100vh + 1rem);
    width: 100vw;
    max-width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(3rem, 8vh, 6rem) 1.5rem;
    box-sizing: border-box;
    background:
      radial-gradient(circle at 50% 50%, hsla(210, 48%, 30%, 0.22) 0%, hsla(210, 48%, 18%, 0.13) 26%, transparent 60%),
      linear-gradient(145deg, hsl(214, 42%, 7%) 0%, hsl(214, 44%, 5%) 52%, hsl(210, 40%, 4%) 100%);
    isolation: isolate;
  }

  .curation-interlude::before {
    content: '';
    position: absolute;
    inset: 18px;
    border: 1px solid hsla(0, 0%, 100%, 0.06);
    border-radius: 34px;
    pointer-events: none;
    z-index: 0;
  }

  .curation-interlude__inner {
    position: relative;
    z-index: 1;
    width: min(100%, 920px);
    text-align: center;
    padding: clamp(2rem, 4vw, 3rem);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .curation-interlude__text {
    margin: 0;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-size: clamp(2.4rem, 4.4vw, 4.9rem);
    font-weight: 400;
    line-height: 1.02;
    letter-spacing: -0.05em;
    color: hsl(42, 44%, 66%);
    text-wrap: balance;
    text-shadow: 0 10px 34px hsla(214, 30%, 4%, 0.28);
  }

  .curation-interlude__cta {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    margin-top: 3rem;
    padding: 0 0 0.38rem;
    border: 0;
    border-bottom: 1px solid hsla(42, 48%, 72%, 0.48);
    border-radius: 0;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.78rem;
    font-weight: 400;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    color: hsl(42, 48%, 72%);
    background: transparent;
    box-shadow: none;
    position: relative;
    transition:
      border-color 0.35s ease,
      color 0.35s ease,
      transform 0.35s ease;
  }

  .curation-interlude__cta::after {
    content: none;
  }

  .curation-interlude__cta:hover {
    color: hsl(42, 56%, 80%);
    border-color: hsla(42, 56%, 80%, 0.72);
    transform: translateX(2px);
  }

  .curation-interlude__cta:hover::after {
    transform: none;
  }

  .curation-interlude__cta:active {
    transform: translateX(0);
  }

  .curation-interlude__cta:focus-visible {
    outline: 2px solid hsla(42, 48%, 72%, 0.88);
    outline-offset: 3px;
    border-radius: 6px;
  }

  .curation-interlude__cta .arrow-icon {
    width: 16px;
    height: 16px;
    margin-top: 1px;
    transition: transform 0.3s ease;
  }

  .curation-interlude__cta:hover .arrow-icon {
    transform: translateX(3px);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .slide-section {
      height: auto;
      min-height: 100svh;
      overflow: visible;
    }

    .slides-container {
      display: flex;
      width: 100%;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      transform: none;
    }

    .mobile-swipe-hint {
      display: block;
    }

    .progress-container {
      bottom: 24px;
      gap: 8px;
    }

    .progress-bar-bg {
      width: 40px;
    }

    /* Mobile Swipe Hint - hidden on desktop by default */
    .mobile-swipe-hint {
      position: absolute;
      inset: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      pointer-events: none;
    }

    .swipe-nav-button {
      position: absolute;
      top: 50%;
      --control-size: 3.35rem;
      --control-arrow-width: 1.3rem;
      --control-arrow-height: 0.72rem;
      --control-base-y: -50%;
      --control-hover-scale: 1.01;
      transition:
        opacity 0.25s ease,
        transform 0.25s ease;
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
    }

    .swipe-nav-button--prev {
      left: 12px;
      --control-hover-x: -4px;
    }

    .swipe-nav-button--next {
      right: 12px;
      --control-hover-x: 4px;
    }

    .swipe-nav-button:active:not(:disabled) {
      transform: translateY(-50%) scale(0.97);
    }

    .swipe-nav-button.is-hidden {
      opacity: 0;
      transform: translateY(-50%) scale(0.92);
      pointer-events: none;
    }

    .swipe-arrow {
    }

    .slide {
      grid-template-columns: 1fr;
      padding: clamp(2.7rem, 6svh, 3.35rem) 1.25rem clamp(3.25rem, 7svh, 4rem);
      gap: clamp(0.9rem, 2.4svh, 1.15rem);
      min-height: 100svh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      width: 100vw !important;
      flex-shrink: 0 !important;
      scroll-snap-align: start;
      transform: none;
    }

    /* Hide horizontal scrollbar */
    .slides-container {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .slides-container::-webkit-scrollbar {
      display: none;
    }

    /* First slide: poster image on top, text below */
    .slide:first-child {
      flex-direction: column;
    }

    .slide-content {
      max-width: 100%;
      justify-self: center;
      text-align: center;
      margin-left: 0;
      margin-right: 0;
      padding-top: 0.2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .slide-1-content {
      order: 2;
      padding-top: 0.2rem;
    }

    .slide-2-content {
      order: 2;
      margin-right: 0;
      text-align: center;
    }

    .slide-3-content {
      order: 2;
      margin-right: 0;
      text-align: center;
    }

    .slide-number {
      font-size: 1.95rem;
      font-weight: 400;
      margin-bottom: clamp(0.2rem, 0.9svh, 0.4rem);
      opacity: 0.42;
      line-height: 1;
    }

    .slide-title {
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      margin-bottom: clamp(0.45rem, 1.3svh, 0.7rem);
      text-transform: uppercase;
    }

    .slide-heading {
      font-size: 1.45rem;
      line-height: 1.06;
      margin-bottom: clamp(0.52rem, 1.4svh, 0.72rem);
      font-weight: 400;
      max-width: 19ch;
    }

    .slide-text {
      font-size: 0.84rem;
      line-height: 1.56;
      max-width: 36ch;
      color: hsl(214, 20%, 30%);
    }

    /* Slide 1: video horizontal — retângulo compacto com cantos arredondados */
    .video-wrapper {
      order: 1;
      width: 84vw;
      max-width: min(332px, 84vw);
      aspect-ratio: 5 / 4;
      height: auto;
      justify-self: center;
      align-self: center;
      flex-shrink: 0;
      pointer-events: none;
    }

    .video-capsule {
      width: 100%;
      aspect-ratio: 5 / 4;
      height: auto;
      border-radius: 18px;
      overflow: hidden;
      position: relative;
      box-shadow:
        0 4px 20px hsla(214, 61%, 18%, 0.12),
        0 1px 4px hsla(214, 61%, 18%, 0.08);
    }

    .video-poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 12% center;
      filter: saturate(0.92) sepia(0.035) hue-rotate(3deg) brightness(0.97) contrast(1.03);
    }

    /* Image capsules for slides 2 and 3 */
    .image-capsule-wrapper {
      width: 84vw;
      max-width: min(332px, 84vw);
      height: auto;
      aspect-ratio: 5 / 4;
      justify-self: center;
      align-self: center;
      flex-shrink: 0;
    }

    .image-capsule {
      width: 100%;
      height: 100%;
      border-radius: 18px;
    }

    .image-capsule img {
      object-position: center 20%;
    }

    .slide-3-image .image-capsule img {
      object-position: center 4%;
    }

    .image-capsule-wrapper.image-left.slide-3-image {
      transform: rotate(0deg);
    }

    .curation-interlude {
      height: auto;
      min-height: 100svh;
      padding: clamp(4rem, 11svh, 5.25rem) 1.25rem;
    }

    .curation-interlude::before {
      inset: 12px;
      border-radius: 24px;
    }

    .curation-interlude__inner {
      width: min(100%, 24rem);
      padding: 0.5rem;
    }

    .curation-interlude__text {
      font-size: clamp(1.7rem, 8vw, 2.5rem);
      line-height: 1.08;
      letter-spacing: -0.045em;
    }

    .curation-interlude__cta {
      margin-top: 2.1rem;
      padding: 0 0 0.34rem;
      font-size: 0.8rem;
      letter-spacing: 0.1em;
    }

  }

  @media (max-width: 480px) {
    .slide {
      padding: clamp(2.35rem, 5.5svh, 3rem) 1rem clamp(3.1rem, 7svh, 3.75rem);
      gap: clamp(0.75rem, 2svh, 1rem);
    }

    .slide-number {
      font-size: 1.65rem;
    }

    .slide-heading {
      font-size: clamp(1.26rem, 6.1vw, 1.42rem);
      max-width: 20ch;
    }

    .slide-text {
      font-size: 0.8rem;
      line-height: 1.52;
      max-width: 34ch;
    }

    .video-wrapper,
    .image-capsule-wrapper {
      width: min(84vw, 316px);
    }

    .curation-interlude {
      padding: clamp(3.75rem, 10svh, 4.75rem) 1rem;
    }
  }
</style>
