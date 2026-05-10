<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let startDelay = 2600;
  export let startOnUserIntent = false;

  type ScrollTriggerPlugin = typeof import('gsap/ScrollTrigger').ScrollTrigger;
  type ScrollTriggerSnap = Parameters<ScrollTriggerPlugin['create']>[0]['snap'];
  type ScrollTriggerInstance = ReturnType<ScrollTriggerPlugin['create']>;

  let ScrollTrigger: ScrollTriggerPlugin | null = null;
  const triggers: ScrollTriggerInstance[] = [];
  const pinnedSections = new Set<HTMLElement>();

  // Stacking ativo apenas em telas acima de 768px (smartphones usam scroll natural)
  const STACKING_BREAKPOINT = 768;

  function isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= STACKING_BREAKPOINT;
  }

  function hasFollowingSection(section: HTMLElement): boolean {
    const allSections = Array.from(document.querySelectorAll<HTMLElement>('section'));
    const index = allSections.indexOf(section);
    return index >= 0 && index < allSections.length - 1;
  }

  function getPinEnd(section: HTMLElement): string {
    const customEnd = section.dataset.stackEnd;
    return customEnd ? `+=${customEnd}` : '+=220%';
  }

  function getSnapConfig(section: HTMLElement): ScrollTriggerSnap | undefined {
    type SnapConfig = NonNullable<ScrollTriggerSnap>;
    const snapAttr = section.dataset.stackSnap;
    if (!snapAttr) return undefined;

    const snapTo = Number.parseFloat(snapAttr);
    if (!Number.isFinite(snapTo)) return undefined;

    return {
      snapTo,
      duration: { min: 0.12, max: 0.28 },
      ease: 'power1.out',
      inertia: false,
    } satisfies SnapConfig;
  }

  function createPinTrigger(section: HTMLElement) {
    if (!ScrollTrigger) return;
    if (isMobile()) return;
    if (pinnedSections.has(section)) return;
    if (section.classList.contains('slide-section')) return;

    if (hasFollowingSection(section)) {
      pinnedSections.add(section);

      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: getPinEnd(section),
          scrub: true,
          snap: getSnapConfig(section),
          pin: true,
          pinSpacing: false,
          anticipatePin: 0,
        })
      );
    }
  }

  // Teardown completo dos triggers de stacking
  function killAllTriggers() {
    triggers.forEach(t => t.kill());
    triggers.length = 0;
    pinnedSections.clear();
  }

  // Recreia todos os triggers do zero (para resize desktop→mobile→desktop)
  function rebuildTriggers() {
    killAllTriggers();

    if (isMobile()) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-stack-section]:not(.slide-section)')
    );

    sections.forEach((section) => {
      if (hasFollowingSection(section)) {
        createPinTrigger(section);
      }
    });
  }

  onMount(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let cleanupIntentListeners: (() => void) | undefined;
    let resizeTimer: ReturnType<typeof setTimeout>;
    let idleCallbackId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let startRequested = false;

    const start = async () => {
      if (startRequested) return;
      if (isMobile()) return;

      startRequested = true;
      cleanupIntentListeners?.();
      cleanupIntentListeners = undefined;

      const [{ gsap }, scrollTriggerModule] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (cancelled) return;

      ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      rebuildTriggers();

      // Observer para seções carregadas dinamicamente
      const observer = new MutationObserver(() => {
        const newSections = Array.from(
          document.querySelectorAll<HTMLElement>('[data-stack-section]:not(.slide-section)')
        );

        newSections.forEach(section => {
          if (!pinnedSections.has(section) && !section.classList.contains('slide-section')) {
            createPinTrigger(section);
          }
        });

        const currentIndex = triggers.length;
        const totalSections = newSections.length;

        if (currentIndex < totalSections) {
          const section = newSections[currentIndex];
          if (section && !pinnedSections.has(section) && !section.classList.contains('slide-section')) {
            createPinTrigger(section);
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Debounce para resize — destrói e recria triggers ao cruzar o breakpoint
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          // Só reconstruir se cruzou o breakpoint
          const currentlyMobile = isMobile();
          const hasTriggers = triggers.length > 0;

          if (currentlyMobile && hasTriggers) {
            killAllTriggers();
          } else if (!currentlyMobile && !hasTriggers) {
            rebuildTriggers();
          }
        }, 200);
      };

      window.addEventListener('resize', handleResize);

      cleanup = () => {
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    };

    const resolvedStartDelay = Number.isFinite(startDelay) ? Math.max(0, startDelay) : 2600;

    const scheduleStart = (delay: number) => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        if (window.requestIdleCallback) {
          idleCallbackId = window.requestIdleCallback(() => void start(), { timeout: 500 });
        } else {
          void start();
        }
      }, delay);
    };

    const requestImmediateStart = () => {
      if (startRequested) return;
      if (idleCallbackId !== undefined) window.cancelIdleCallback?.(idleCallbackId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      window.requestAnimationFrame(() => void start());
    };

    if (startOnUserIntent) {
      const handleIntent = () => requestImmediateStart();
      const handleKeyIntent = (event: KeyboardEvent) => {
        if (!['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End'].includes(event.key)) return;
        requestImmediateStart();
      };

      window.addEventListener('wheel', handleIntent, { once: true, passive: true });
      window.addEventListener('touchstart', handleIntent, { once: true, passive: true });
      window.addEventListener('scroll', handleIntent, { once: true, passive: true });
      window.addEventListener('keydown', handleKeyIntent, { passive: true });

      cleanupIntentListeners = () => {
        window.removeEventListener('wheel', handleIntent);
        window.removeEventListener('touchstart', handleIntent);
        window.removeEventListener('scroll', handleIntent);
        window.removeEventListener('keydown', handleKeyIntent);
      };
    }

    scheduleStart(resolvedStartDelay);

    return () => {
      cancelled = true;
      if (window.requestIdleCallback) {
        if (idleCallbackId !== undefined) window.cancelIdleCallback?.(idleCallbackId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      cleanupIntentListeners?.();
      cleanup?.();
    };
  });

  onDestroy(() => {
    killAllTriggers();
  });
</script>
