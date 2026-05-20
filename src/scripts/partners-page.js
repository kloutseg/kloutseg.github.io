const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let gsapLoadPromise;
let stackingLoadPromise;

const getGsap = () => {
  if (!gsapLoadPromise) {
    gsapLoadPromise = import('gsap').then((module) => module.gsap);
  }

  return gsapLoadPromise;
};

const getStackingModules = () => {
  if (!stackingLoadPromise) {
    stackingLoadPromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([gsapModule, scrollTriggerModule]) => ({
      gsap: gsapModule.gsap,
      ScrollTrigger: scrollTriggerModule.ScrollTrigger,
    }));
  }

  return stackingLoadPromise;
};

const wait = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const animateTo = async (target, vars) => {
  const gsap = await getGsap();

  return new Promise((resolve) => {
    gsap.to(target, {
      ...vars,
      onComplete: resolve
    });
  });
};

const typeValue = async (valueEl, cursorEl, text) => {
  valueEl.textContent = '';
  cursorEl.classList.add('is-active');

  let index = 0;
  const chunkSize = 2;

  while (index < text.length) {
    index = Math.min(index + chunkSize, text.length);
    valueEl.textContent = text.slice(0, index);
    await wait(26);
  }

  await wait(120);
  cursorEl.classList.remove('is-active');
};

const reserveMetaTextLayout = (rows) => {
  rows.forEach((row) => {
    const valueEl = row.querySelector('.partner-hero-meta-value');
    const text = valueEl?.getAttribute('data-value') ?? '';

    if (!valueEl || !text) return;

    const previousText = valueEl.textContent;
    valueEl.textContent = text;

    const rowHeight = Math.ceil(row.getBoundingClientRect().height);
    const valueHeight = Math.ceil(valueEl.getBoundingClientRect().height);

    if (rowHeight > 0) row.style.minHeight = `${rowHeight}px`;
    if (valueHeight > 0) valueEl.style.minHeight = `${valueHeight}px`;

    valueEl.textContent = previousText;
  });
};

const initPartnersPage = () => {
    const hero = document.querySelector('.partners-page-hero');
    const heroNotesTrack = document.querySelector('.partners-page-hero-notes');
    const heroNotes = Array.from(document.querySelectorAll('.partners-page-hero-note'));
    const arrivedViaPageTransition =
      document.documentElement.classList.contains('page-transition-enter');
    const heroRevealDelayMs =
      (window.__kloutPageTransition?.revealMs ?? 1020) + 80;

    const isTypingField = (target) =>
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

    const canUseStacking = () =>
      window.matchMedia('(min-width: 769px)').matches && !prefersReducedMotion;

    const scheduleStacking = () => {
      if (!canUseStacking()) return;

      let started = false;
      let fallbackTimer;
      let interactionTimer;
      let resizeTimer;
      const triggers = [];
      const pinnedSections = new Set();
      const interactionEvents = ['wheel', 'touchstart', 'pointerdown', 'scroll'];
      let stackingObserver;

      const hasFollowingSection = (section) => {
        const sections = Array.from(document.querySelectorAll('section'));
        const index = sections.indexOf(section);
        return index >= 0 && index < sections.length - 1;
      };

      const getPinEnd = (section) => {
        const customEnd = section.dataset.stackEnd;
        return customEnd ? `+=${customEnd}` : '+=220%';
      };

      const removeInteractionListeners = () => {
        interactionEvents.forEach((eventName) => {
          window.removeEventListener(eventName, handleInteraction, true);
        });
        window.removeEventListener('keydown', handleKeyInteraction, true);
        stackingObserver?.disconnect();
      };

      const isStackingStartReached = () => {
        const stackingStartStage = document.querySelector('#parceiro-porto');
        if (!(stackingStartStage instanceof HTMLElement)) return true;

        return stackingStartStage.getBoundingClientRect().top <= window.innerHeight * 1.5;
      };

      const rebuildTriggers = (ScrollTrigger) => {
        triggers.forEach((trigger) => trigger.kill());
        triggers.length = 0;
        pinnedSections.clear();

        if (!canUseStacking()) return;

        document.querySelectorAll('[data-stack-section]:not(.slide-section)').forEach((section) => {
          if (!(section instanceof HTMLElement)) return;
          if (!hasFollowingSection(section) || pinnedSections.has(section)) return;

          pinnedSections.add(section);
          triggers.push(ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: getPinEnd(section),
            scrub: true,
            pin: true,
            pinSpacing: false,
            anticipatePin: 0,
          }));
        });
      };

      const startStacking = async (delay = 0) => {
        if (started) return;
        started = true;
        removeInteractionListeners();
        window.clearTimeout(fallbackTimer);

        window.setTimeout(async () => {
          if (!canUseStacking()) return;

          const { gsap, ScrollTrigger } = await getStackingModules();
          gsap.registerPlugin(ScrollTrigger);
          rebuildTriggers(ScrollTrigger);

          window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => rebuildTriggers(ScrollTrigger), 200);
          }, { passive: true });
        }, delay);
      };

      function handleInteraction() {
        if (!isStackingStartReached()) return;

        window.clearTimeout(interactionTimer);
        interactionTimer = window.setTimeout(() => void startStacking(), 120);
      }

      function handleKeyInteraction(event) {
        if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
        handleInteraction();
      }

      interactionEvents.forEach((eventName) => {
        window.addEventListener(eventName, handleInteraction, {
          capture: true,
          passive: true,
        });
      });
      window.addEventListener('keydown', handleKeyInteraction, true);

      const stackingStartStage = document.querySelector('#parceiro-porto');
      if ('IntersectionObserver' in window && stackingStartStage instanceof HTMLElement) {
        stackingObserver = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          void startStacking();
        }, { rootMargin: '50% 0px', threshold: 0 });

        stackingObserver.observe(stackingStartStage);
      } else {
        fallbackTimer = window.setTimeout(() => void startStacking(), 8000);
      }
    };

    scheduleStacking();

    if (hero instanceof HTMLElement) {
      const revealHero = () => {
        hero.classList.add('is-ready');
      };

      const revealHeroAfterDelay = () => {
        window.setTimeout(() => {
          window.requestAnimationFrame(revealHero);
        }, heroRevealDelayMs);
      };

      if (prefersReducedMotion) {
        revealHero();
      } else if (arrivedViaPageTransition) {
        if (document.documentElement.classList.contains('page-transition-revealing')) {
          revealHeroAfterDelay();
        } else {
          const root = document.documentElement;
          const observer = new MutationObserver(() => {
            if (root.classList.contains('page-transition-revealing')) {
              observer.disconnect();
              revealHeroAfterDelay();
            }
          });

          observer.observe(root, { attributes: true, attributeFilter: ['class'] });

          window.setTimeout(() => {
            observer.disconnect();
            revealHeroAfterDelay();
          }, 1400);
        }
      } else {
        window.setTimeout(() => {
          window.requestAnimationFrame(revealHero);
        }, 360);
      }
    }

    if (heroNotes.length) {
      heroNotes.forEach((note, index) => {
        note.classList.toggle('is-visible', index === 0);
        note.classList.remove('is-leaving');
      });

      if (!prefersReducedMotion && heroNotes.length > 1) {
        if (heroNotesTrack instanceof HTMLElement) {
          heroNotesTrack.classList.add('is-running');
        }

        let activeNoteIndex = 0;
        window.setInterval(() => {
          const currentNote = heroNotes[activeNoteIndex];
          activeNoteIndex = (activeNoteIndex + 1) % heroNotes.length;
          const nextNote = heroNotes[activeNoteIndex];

          currentNote.classList.add('is-leaving');
          currentNote.classList.remove('is-visible');
          nextNote.classList.remove('is-leaving');
          nextNote.classList.add('is-visible');

          window.setTimeout(() => {
            currentNote.classList.remove('is-leaving');
          }, 420);

          if (heroNotesTrack instanceof HTMLElement) {
            heroNotesTrack.classList.remove('is-running');
            void heroNotesTrack.offsetWidth;
            heroNotesTrack.classList.add('is-running');
          }
        }, 4160);
      }
    }

    const setupPartnerStages = () => {
    const stageControllers = Array.from(document.querySelectorAll('.partner-stage-section')).map((stageSection) => {
      const heroSlideTrigger = stageSection.querySelector('.partner-hero-slide-trigger');
      const stageTrack = stageSection.querySelector('.partner-stage-track');
      const heroShell = stageSection.querySelector('.partner-hero-shell');
      const heroPanel = stageSection.querySelector('.partner-hero-panel');
      const stageBackButton = stageSection.querySelector('.partner-detail-stage-back');
      const detailPhotoFrame = stageSection.querySelector('.partner-detail-photo-frame');
      const detailPhoto = stageSection.querySelector('.partner-detail-photo');
      const detailCopy = stageSection.querySelector('.partner-detail-copy');
      const detailFooter = stageSection.querySelector('.partner-detail-footer');
      const metaBlock = stageSection.querySelector('.partner-hero-meta-block');
      const rows = Array.from(stageSection.querySelectorAll('.partner-hero-meta-row'));
      const detailStageElements = [detailPhotoFrame, detailCopy, detailFooter].filter(Boolean);

      let isStageOpen = false;
      let isStageAnimating = false;
      let swipeStartX = 0;
      let swipeStartY = 0;
      let wheelDeltaX = 0;
      let wheelResetTimer = null;

      const setStagePosition = async (openStage) => {
        if (!(stageTrack instanceof HTMLElement)) return;
        if (isStageAnimating) return;

        isStageAnimating = true;
        isStageOpen = openStage;

        if (openStage && detailPhoto instanceof HTMLImageElement && !detailPhoto.currentSrc) {
          detailPhoto.closest('picture')?.querySelectorAll('source[data-srcset]').forEach((source) => {
            const deferredSrcset = source.dataset.srcset;
            if (deferredSrcset) source.srcset = deferredSrcset;
          });

          const deferredSrc = detailPhoto.dataset.src;
          if (deferredSrc) detailPhoto.src = deferredSrc;
        }

        if (heroSlideTrigger instanceof HTMLButtonElement) {
          heroSlideTrigger.disabled = openStage;
          heroSlideTrigger.setAttribute('aria-expanded', openStage ? 'true' : 'false');
        }

        if (prefersReducedMotion) {
          stageTrack.style.transform = openStage ? 'translate3d(-50%, 0, 0)' : 'translate3d(0, 0, 0)';
          if (detailPhotoFrame instanceof HTMLElement) {
            detailPhotoFrame.style.opacity = openStage ? '1' : '0';
            detailPhotoFrame.style.transform = openStage ? 'translate3d(0, 0, 0)' : 'translate3d(1rem, 0, 0)';
          }
          if (detailPhoto instanceof HTMLElement) {
            detailPhoto.style.transform = openStage
              ? 'translate3d(0, 0, 0) scale(1.02) rotate(0.001deg)'
              : 'translate3d(0, 0, 0) scale(1.02) rotate(0.001deg)';
          }
          detailStageElements.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;
            if (element === detailPhotoFrame) return;
            element.style.opacity = openStage ? '1' : '0';
            element.style.transform = openStage ? 'translate3d(0, 0, 0)' : 'translate3d(1rem, 0, 0)';
          });
          isStageAnimating = false;
          return;
        }

        const gsap = await getGsap();

        const timeline = gsap.timeline({
          defaults: {
            duration: 0.68,
            ease: 'power2.out'
          },
          onComplete: () => {
            isStageAnimating = false;
          }
        });

        if (openStage) {
          timeline
            .set(detailStageElements, {
              autoAlpha: 0,
              x: 18,
              clearProps: 'filter'
            }, 0)
            .set(detailPhotoFrame, {
              x: 20,
              autoAlpha: 0,
              clearProps: 'clipPath,filter'
            }, 0)
            .set(detailPhoto, {
              scale: 1.02,
              yPercent: 0,
              rotate: 0.001
            }, 0)
            .to(stageTrack, {
              xPercent: -50,
              duration: 0.72,
              ease: 'power2.inOut'
            }, 0)
            .to(heroShell, {
              autoAlpha: 0.82,
              scale: 0.995,
              duration: 0.44,
              ease: 'power2.out'
            }, 0)
            .to(heroPanel, {
              scale: 0.996,
              duration: 0.44,
              ease: 'power2.out'
            }, 0)
            .to(detailPhotoFrame, {
              x: 0,
              autoAlpha: 1,
              duration: 0.52,
              ease: 'power2.out'
            }, 0.16)
            .to(detailPhoto, {
              scale: 1,
              duration: 0.62,
              ease: 'power2.out'
            }, 0.16)
            .to([detailCopy, detailFooter], {
              x: 0,
              autoAlpha: 1,
              duration: 0.48,
              stagger: 0.04,
              ease: 'power2.out'
            }, 0.22);

          return;
        }

        timeline
          .to([detailCopy, detailFooter], {
            x: 16,
            autoAlpha: 0,
            duration: 0.28,
            stagger: 0.03,
            ease: 'power2.in'
          }, 0)
          .to(detailPhotoFrame, {
            x: 20,
            autoAlpha: 0,
            duration: 0.3,
            ease: 'power2.in'
          }, 0)
          .to(detailPhoto, {
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.in'
          }, 0)
          .to(stageTrack, {
            xPercent: 0,
            duration: 0.72,
            ease: 'power2.inOut'
          }, 0.06)
          .to(heroShell, {
            x: 0,
            scale: 1,
            autoAlpha: 1,
            clearProps: 'filter',
            duration: 0.46,
            ease: 'power2.out'
          }, 0.22)
          .to(heroPanel, {
            yPercent: 0,
            scale: 1,
            clearProps: 'filter',
            duration: 0.46,
            ease: 'power2.out'
          }, 0.22);
      };

      heroSlideTrigger?.addEventListener('click', () => {
        if (isStageOpen) return;
        void setStagePosition(true);
      });

      stageBackButton?.addEventListener('click', () => {
        if (!isStageOpen) return;
        void setStagePosition(false);
      });

      stageSection.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        swipeStartX = touch.clientX;
        swipeStartY = touch.clientY;
      }, { passive: true });

      stageSection.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        if (!touch) return;

        const deltaX = touch.clientX - swipeStartX;
        const deltaY = touch.clientY - swipeStartY;

        if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0 && !isStageOpen) {
          void setStagePosition(true);
        }

        if (deltaX > 0 && isStageOpen) {
          void setStagePosition(false);
        }
      }, { passive: true });

      stageSection.addEventListener('wheel', (event) => {
        const dominantHorizontalDelta =
          Math.abs(event.deltaX) >= Math.abs(event.deltaY)
            ? event.deltaX
            : event.shiftKey
              ? event.deltaY
              : 0;

        if (Math.abs(dominantHorizontalDelta) < 4) return;

        event.preventDefault();

        wheelDeltaX += dominantHorizontalDelta;

        if (wheelResetTimer) {
          window.clearTimeout(wheelResetTimer);
        }

        wheelResetTimer = window.setTimeout(() => {
          wheelDeltaX = 0;
        }, 140);

        if (isStageAnimating || Math.abs(wheelDeltaX) < 72) return;

        if (wheelDeltaX > 0 && !isStageOpen) {
          wheelDeltaX = 0;
          void setStagePosition(true);
          return;
        }

        if (wheelDeltaX < 0 && isStageOpen) {
          wheelDeltaX = 0;
          void setStagePosition(false);
        }
      }, { passive: false });

      if (metaBlock && rows.length) {
        reserveMetaTextLayout(rows);

        if (prefersReducedMotion) {
          rows.forEach((row) => {
            const valueEl = row.querySelector('.partner-hero-meta-value');
            const text = valueEl?.getAttribute('data-value') ?? '';
            if (valueEl) valueEl.textContent = text;
          });
        } else {
          const metaObserver = new IntersectionObserver(async (entries, observer) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;

            observer.disconnect();

            const gsap = await getGsap();

            gsap.set(metaBlock, { autoAlpha: 1 });
            gsap.set(rows, { autoAlpha: 0, y: 12 });

            await animateTo(metaBlock, {
              autoAlpha: 1,
              duration: 0.4,
              ease: 'sine.out'
            });

            for (const row of rows) {
              const valueEl = row.querySelector('.partner-hero-meta-value');
              const cursorEl = row.querySelector('.partner-hero-meta-cursor');
              const text = valueEl?.getAttribute('data-value') ?? '';

              if (!valueEl || !cursorEl) continue;

              await animateTo(row, {
                autoAlpha: 1,
                y: 0,
                duration: 0.42,
                ease: 'sine.out'
              });

              await typeValue(valueEl, cursorEl, text);
              await wait(90);
            }
          }, { threshold: 0.55 });

          metaObserver.observe(stageSection);
        }
      }

      return {
        stageSection,
        isStageOpen: () => isStageOpen,
        setStagePosition
      };
    });

    const getActiveStageController = () => {
      const viewportMidpoint = window.innerHeight * 0.5;

      return stageControllers.find(({ stageSection }) => {
        const rect = stageSection.getBoundingClientRect();
        return rect.top <= viewportMidpoint && rect.bottom >= viewportMidpoint;
      });
    };

    window.addEventListener('keydown', (event) => {
      if (isTypingField(event.target)) return;

      const activeStageController = getActiveStageController();
      if (!activeStageController) return;

      if (event.key === 'ArrowRight' && !activeStageController.isStageOpen()) {
        event.preventDefault();
        void activeStageController.setStagePosition(true);
      }

      if (event.key === 'ArrowLeft' && activeStageController.isStageOpen()) {
        event.preventDefault();
        void activeStageController.setStagePosition(false);
      }
    });
    };

    let didSetupPartnerStages = false;
    let stageSetupObserver;

    const runPartnerStageSetup = () => {
      if (didSetupPartnerStages) return;
      didSetupPartnerStages = true;
      stageSetupObserver?.disconnect();
      window.removeEventListener('scroll', runPartnerStageSetup, true);
      window.removeEventListener('keydown', runPartnerStageSetup, true);
      window.removeEventListener('pointerdown', runPartnerStageSetup, true);
      setupPartnerStages();
    };

    const stageSections = Array.from(document.querySelectorAll('.partner-stage-section'));

    if ('IntersectionObserver' in window && stageSections.length) {
      stageSetupObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        runPartnerStageSetup();
      }, { rootMargin: '0px', threshold: 0.01 });

      stageSections.forEach((section) => stageSetupObserver.observe(section));
    } else {
      window.addEventListener('scroll', runPartnerStageSetup, { capture: true, passive: true, once: true });
      window.addEventListener('keydown', runPartnerStageSetup, { capture: true, once: true });
      window.addEventListener('pointerdown', runPartnerStageSetup, { capture: true, passive: true, once: true });
    }
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initPartnersPage, { once: true });
  } else {
    initPartnersPage();
  }
}
