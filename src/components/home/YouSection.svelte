<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import SectionIndicator from './SectionIndicators.svelte';
  import { prefersReducedMotion } from '../../lib/reducedMotion';

  const reducedMotion = prefersReducedMotion();
  type Gsap = typeof import('gsap').gsap;
  type ScrollTriggerPlugin = typeof import('gsap/ScrollTrigger').ScrollTrigger;

  let gsap: Gsap | null = null;
  let ScrollTrigger: ScrollTriggerPlugin | null = null;

  async function ensureGsap() {
    if (gsap && ScrollTrigger) return { gsap, ScrollTrigger };

    const [gsapModule, scrollTriggerModule] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);

    gsap = gsapModule.gsap;
    ScrollTrigger = scrollTriggerModule.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    return { gsap, ScrollTrigger };
  }

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
  let scrollTriggerInstance: any = null;
  let slideContentEl: HTMLElement | null = $state(null);

  // Mobile swipe state
  let swipeHintEl: HTMLElement | null = $state(null);
  let mobileCurrentSlide = $state(0);

  // Video states
  let isExpanded = $state(false);
  let isHovering = $state(false);
  let videoEl: HTMLVideoElement | null = $state(null);
  let videoContainer: HTMLElement | null = $state(null);
  let expandIcon: HTMLElement | null = $state(null);
  let closeButton: HTMLElement | null = $state(null);
  let ctaButton: HTMLElement | null = $state(null);
  let ctaVisible = $state(false);

  // Show CTA after video plays for a few seconds
  let ctaTimeout: ReturnType<typeof setTimeout> | null = null;

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

  onMount(() => {
    if (!slidesContainer || !section) return;

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

    let killed = false;
    let tween: any = null;

    const setupDesktopScroll = async () => {
      const modules = await ensureGsap();
      if (killed) return;

      const totalSlides = slideData.length;
      const getScrollDistance = () => (totalSlides - 1) * window.innerHeight * 3.4;

      // Matar qualquer ScrollTrigger existente nesta seção
      modules.ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === section) {
          t.kill();
        }
      });

      // Criar animação horizontal controlada pelo scroll
      tween = modules.gsap.to(slidesContainer, {
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

      scrollTriggerInstance = tween.scrollTrigger;
      modules.ScrollTrigger.refresh();
    };

    void setupDesktopScroll();

    // Add keyboard listener for ESC key
    window.addEventListener('keydown', handleKeydown);

    return () => {
      killed = true;
      tween?.kill();
      scrollTriggerInstance?.kill();
      window.removeEventListener('keydown', handleKeydown);
      if (ctaTimeout) {
        clearTimeout(ctaTimeout);
      }
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

  // Video handlers
  async function handleExpand() {
    if (!videoContainer || !slideContentEl) return;
    const { gsap } = await ensureGsap();

    const slide = videoContainer.closest('.slide');
    if (slide) {
      slide.classList.add('expanded');
    }

    isExpanded = true;
    isHovering = true;

    // Pause scroll when expanded
    if (scrollTriggerInstance) {
      scrollTriggerInstance.disable?.();
      scrollTriggerInstance.scrollTrigger?.disable?.();
    }

    // Play video
    if (videoEl) {
      videoEl.play();
    }

    const isMobileDevice = isMobile();

    if (isMobileDevice) {
      // Mobile: hide text, expand video proportionally
      gsap.set(slideContentEl, {
        opacity: 0,
        pointerEvents: 'none',
        display: 'none'
      });

      // Expand video to fill screen with margins
      gsap.set(videoContainer, { position: 'relative' });
      gsap.to(videoContainer, {
        width: '95vw',
        maxWidth: '500px',
        duration: 0.5,
        ease: 'power3.inOut'
      });

      gsap.to(videoContainer.querySelector('.video-capsule'), {
        borderRadius: '18px',
        duration: 0.5,
        ease: 'power3.inOut'
      });

    } else {
      // Desktop: hide text with slide animation
      gsap.to(slideContentEl, {
        opacity: 0,
        x: -100,
        duration: 0.5,
        ease: 'power2.in',
        pointerEvents: 'none'
      });

      // Expand video to fullscreen
      gsap.to(videoContainer, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        duration: 0.6,
        ease: 'power3.inOut'
      });

      gsap.to(videoContainer.querySelector('.video-capsule'), {
        borderRadius: 0,
        duration: 0.6,
        ease: 'power3.inOut'
      });
    }

    // Hide expand icon
    gsap.to(expandIcon, {
      opacity: 0,
      scale: 0,
      duration: 0.3
    });

    // Show close button
    gsap.fromTo(closeButton,
      { opacity: 0, y: isMobileDevice ? 20 : 0, x: isMobileDevice ? 0 : -20 },
      { opacity: 1, y: 0, x: 0, duration: 0.4, delay: 0.5 }
    );

    // Show CTA after 1 second of video
    ctaTimeout = setTimeout(() => {
      ctaVisible = true;
      if (ctaButton && isMobileDevice) {
        gsap.fromTo(ctaButton,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    }, 1000);
  }

  async function handleClose() {
    if (!videoContainer || !slideContentEl) return;
    const { gsap } = await ensureGsap();

    const slide = videoContainer.closest('.slide');
    if (slide) {
      slide.classList.remove('expanded');
    }

    isExpanded = false;
    isHovering = false;
    ctaVisible = false;

    // Clear CTA timeout
    if (ctaTimeout) {
      clearTimeout(ctaTimeout);
      ctaTimeout = null;
    }

    // Pause video
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
      videoEl.load();
    }

    // Re-enable scroll
    if (scrollTriggerInstance) {
      scrollTriggerInstance.enable?.();
      scrollTriggerInstance.scrollTrigger?.enable?.();
    }

    const isMobileDevice = isMobile();

    if (isMobileDevice) {
      // Mobile: restore text, collapse video
      gsap.to(videoContainer, {
        width: '85vw',
        maxWidth: '340px',
        duration: 0.5,
        ease: 'power3.inOut'
      });

      gsap.to(videoContainer.querySelector('.video-capsule'), {
        borderRadius: '18px',
        duration: 0.5,
        ease: 'power3.inOut'
      });

      gsap.to(slideContentEl, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
        pointerEvents: 'auto',
        delay: 0.3,
        onStart: () => {
          (slideContentEl as HTMLElement).style.display = '';
        }
      });
    } else {
      // Desktop: restore text with slide animation
      gsap.to(slideContentEl, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
        pointerEvents: 'auto',
        delay: 0.2
      });

      // Collapse video back to editorial media frame
      gsap.to(videoContainer, {
        position: 'relative',
        top: 0,
        left: 0,
        width: 'min(42vw, 520px)',
        height: 'auto',
        zIndex: 1,
        duration: 0.5,
        ease: 'power3.inOut',
        delay: 0.1
      });

      gsap.to(videoContainer.querySelector('.video-capsule'), {
        borderRadius: '30px',
        duration: 0.5,
        ease: 'power3.inOut',
        delay: 0.1
      });
    }

    // Hide close button
    gsap.to(closeButton, {
      opacity: 0,
      x: -20,
      duration: 0.3
    });

    // Hide CTA button
    gsap.to(ctaButton, {
      opacity: 0,
      y: 20,
      duration: 0.3
    });

    // Show expand icon again
    gsap.to(expandIcon, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      delay: 0.3
    });
  }

  // Keyboard handler for ESC key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isExpanded) {
      handleClose();
    }
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
          <!-- First slide with video -->
          <div class="slide-content slide-1-content" bind:this={slideContentEl}>
            <div class="slide-number">{slide.number}</div>
            <div class="slide-title">{slide.title}</div>
            <h2 class="slide-heading">{slide.heading}</h2>
            <p class="slide-text">{slide.content}</p>
          </div>

          <!-- Video Container -->
          <div
            class="video-wrapper"
            class:video-expanded={isExpanded}
            bind:this={videoContainer}
            onmouseenter={() => { if (!isExpanded) isHovering = true; }}
            onmouseleave={() => { if (!isExpanded) isHovering = false; }}
            onclick={handleExpand}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleExpand(); } }}
            role="button"
            tabindex="0"
            aria-label="Expandir vídeo"
          >
            <div class="video-capsule">
              <video
                bind:this={videoEl}
                src="/videos/test_01.mp4"
                muted
                playsinline
                preload="none"
                poster="/images/video_poster-800.webp"
                width="1920"
                height="1080"
              ></video>
              <div class="video-overlay"></div>
            </div>

            <!-- Expand Icon -->
            <div class="hover-indicator" bind:this={expandIcon}>
              <div class="pulse-ring"></div>
              <svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>

            <!-- Close Button (visible when expanded) - Left arrow in bottom-left -->
            <button class="close-button" bind:this={closeButton} onclick={(e) => { e.stopPropagation(); handleClose(); }} aria-label="Fechar vídeo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span class="close-text">Voltar</span>
            </button>

            <!-- CTA Button (appears during video) -->
            <a href="/contato" class="cta-button-video" bind:this={ctaButton} onclick={(e) => { e.stopPropagation(); }} class:visible={ctaVisible}>
              Solicitar análise
              <svg class="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        {:else if index === 1}
          <!-- Second slide with image capsule (reversed: image left, text right) -->
          <div
            class="image-capsule-wrapper image-left"
          >
            <div class="image-capsule">
              <img
                src="/images/consulting_01.webp"
                srcset="/images/consulting_01-700.webp 700w, /images/consulting_01-1000.webp 1000w, /images/consulting_01.webp 1280w"
                sizes="(max-width: 768px) 82vw, 520px"
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
                srcset="/images/family_01-700.webp 700w, /images/family_01-1000.webp 1000w, /images/family_01.webp 1400w"
                sizes="(max-width: 768px) 82vw, 520px"
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

  .slide:global(.expanded) {
    grid-template-columns: 1fr;
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
     VIDEO WRAPPER - editorial media frame
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
    transition: border-radius 0.5s ease;
  }

  .video-capsule video {
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

  .hover-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 58px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    z-index: 10;
    pointer-events: none;
    border-radius: 18px;
    background: hsla(0, 0%, 100%, 0.18);
    border: 1px solid hsla(0, 0%, 100%, 0.22);
    backdrop-filter: blur(12px);
    box-shadow:
      inset 0 1px 0 hsla(0, 0%, 100%, 0.22),
      0 12px 28px rgba(0, 0, 0, 0.18);
  }

  .pulse-ring {
    display: none;
  }

  .expand-icon {
    width: 24px;
    height: 24px;
    color: white;
    opacity: 0.92;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.22));
  }

  /* Close Button - canto inferior esquerdo */
  .close-button {
    position: fixed;
    bottom: 48px;
    left: 48px;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.95rem 1.55rem 0.95rem 1.15rem;
    background: hsla(0, 0%, 100%, 0.95);
    border: none;
    cursor: pointer;
    border-radius: 18px;
    opacity: 0;
    transform: translateX(-20px);
    transition:
      background 0.3s ease,
      transform 0.3s ease;
    z-index: 1001;
  }

  .close-button:hover {
    background: hsl(0, 0%, 100%);
    transform: translateX(-15px);
  }

  .close-button svg {
    width: 20px;
    height: 20px;
    color: hsl(214, 61%, 18%);
    flex-shrink: 0;
  }

  .close-text {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.925rem;
    font-weight: 600;
    color: hsl(214, 61%, 18%);
    letter-spacing: 0.02em;
  }

  /* CTA Button - durante o vídeo */
  .cta-button-video {
    position: absolute;
    right: clamp(1rem, 3vw, 3rem);
    bottom: clamp(1rem, 3vw, 3rem);
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.95rem 1.7rem;
    background: linear-gradient(
      135deg,
      hsl(45, 50%, 38%) 0%,
      hsl(45, 45%, 30%) 100%
    );
    color: hsl(0, 0%, 100%);
    border-radius: 18px;
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.975rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-decoration: none;
    box-shadow:
      0 4px 20px hsla(45, 50%, 38%, 0.35),
      0 1px 4px hsla(45, 45%, 30%, 0.25);
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
    transition:
      opacity 0.5s ease,
      transform 0.5s ease,
      box-shadow 0.3s ease;
    z-index: 20;
  }

  .cta-button-video.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .cta-button-video:hover {
    transform: translateY(-3px);
    box-shadow:
      0 8px 32px hsla(45, 50%, 38%, 0.45),
      0 2px 8px hsla(45, 45%, 30%, 0.3);
  }

  .cta-button-video .button-arrow {
    width: 18px;
    height: 18px;
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
    justify-content: center;
    gap: 0.5rem;
    margin-top: 3rem;
    padding: 0.15rem 0;
    border: none;
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.94rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    color: hsl(42, 48%, 72%);
    background: transparent;
    box-shadow: none;
    position: relative;
    transition:
      color 0.35s ease,
      transform 0.35s ease;
  }

  .curation-interlude__cta::after {
    content: '';
    position: absolute;
    left: 0;
    right: 1.5rem;
    bottom: -0.2rem;
    height: 1px;
    background: linear-gradient(90deg, hsla(42, 48%, 72%, 0.92) 0%, hsla(42, 48%, 72%, 0.18) 100%);
    transform-origin: left center;
    transition:
      transform 0.35s ease,
      opacity 0.35s ease;
  }

  .curation-interlude__cta:hover {
    color: hsl(42, 56%, 80%);
    transform: translateY(-1px);
  }

  .curation-interlude__cta:hover::after {
    transform: scaleX(1.08);
  }

  .curation-interlude__cta:active {
    transform: translateY(0);
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
      padding: 3.35rem 1.25rem 4rem;
      gap: 1.15rem;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      width: 100vw !important;
      flex-shrink: 0 !important;
    }

    /* Hide horizontal scrollbar */
    .slides-container {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .slides-container::-webkit-scrollbar {
      display: none;
    }

    /* Quando expandido: vídeo cresce, texto some */
    .slide:global(.expanded) {
      justify-content: center;
      align-items: center;
    }

    .slide:global(.expanded) .video-wrapper {
      flex-shrink: 0;
    }

    .slide:global(.expanded) .slide-content {
      display: none;
    }

    /* First slide: video on top, text below */
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
      padding-top: 0.55rem;
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
      margin-bottom: 0.4rem;
      opacity: 0.42;
      line-height: 1;
    }

    .slide-title {
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      margin-bottom: 0.7rem;
      text-transform: uppercase;
    }

    .slide-heading {
      font-size: 1.45rem;
      line-height: 1.06;
      margin-bottom: 0.72rem;
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
      width: 82vw;
      max-width: 308px;
      height: auto;
      justify-self: center;
      align-self: center;
      flex-shrink: 0;
    }

    .video-capsule {
      width: 100%;
      aspect-ratio: 16 / 10;
      height: auto;
      border-radius: 18px;
      overflow: hidden;
      position: relative;
      box-shadow:
        0 4px 20px hsla(214, 61%, 18%, 0.12),
        0 1px 4px hsla(214, 61%, 18%, 0.08);
    }

    /* Video expandido no mobile — ocupa tela com margens proporcionais */
    .video-wrapper.video-expanded {
      position: relative;
      width: 100vw;
      max-width: 100vw;
      padding: 0;
    }

    .video-wrapper.video-expanded .video-capsule {
      aspect-ratio: 16 / 9;
      border-radius: 18px;
      box-shadow:
        0 8px 32px hsla(214, 61%, 18%, 0.2),
        0 2px 8px hsla(214, 61%, 18%, 0.12);
    }

    .hover-indicator {
      width: 46px;
      height: 46px;
      border-radius: 14px;
    }

    .expand-icon {
      width: 20px;
      height: 20px;
    }

    /* Image capsules for slides 2 and 3 */
    .image-capsule-wrapper {
      width: 82vw;
      max-width: 308px;
      height: auto;
      aspect-ratio: 16 / 10;
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

    .close-button {
      position: fixed;
      bottom: 24px;
      left: 16px;
      padding: 0.65rem 1.25rem 0.65rem 0.85rem;
      gap: 0.5rem;
      border-radius: 16px;
      background: hsla(0, 0%, 100%, 0.98);
      box-shadow: 0 4px 16px hsla(214, 61%, 18%, 0.15);
    }

    .close-button svg {
      width: 16px;
      height: 16px;
    }

    .close-text {
      font-size: 0.8rem;
    }

    .cta-button-video {
      right: 16px;
      bottom: 16px;
      min-height: 48px;
      padding: 0.85rem 1.4rem;
      border: 1px solid hsla(42, 30%, 52%, 0.26);
      border-radius: 16px;
      box-sizing: border-box;
      font-size: 0.82rem;
      background: linear-gradient(
        135deg,
        hsl(42, 34%, 42%) 0%,
        hsl(42, 30%, 36%) 52%,
        hsl(40, 28%, 30%) 100%
      );
      box-shadow:
        0 10px 22px hsla(42, 28%, 14%, 0.2),
        inset 0 1px 0 hsla(0, 0%, 100%, 0.12);
    }

    .cta-button-video .button-arrow {
      width: 14px;
      height: 14px;
    }

    .curation-interlude {
      height: auto;
      min-height: 72vh;
      padding: 4.5rem 1.25rem;
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
      padding: 0.15rem 0;
      font-size: 0.8rem;
      letter-spacing: 0.07em;
    }

    .curation-interlude__cta::after {
      right: 1.35rem;
    }
  }
</style>
