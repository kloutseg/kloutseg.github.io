<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  const triggers: ScrollTrigger[] = [];
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

  function getSnapConfig(section: HTMLElement): ScrollTrigger.Vars['snap'] | undefined {
    const snapAttr = section.dataset.stackSnap;
    if (!snapAttr) return undefined;

    const snapTo = Number.parseFloat(snapAttr);
    if (!Number.isFinite(snapTo)) return undefined;

    return {
      snapTo,
      duration: { min: 0.12, max: 0.28 },
      ease: 'power1.out',
      inertia: false,
    };
  }

  function createPinTrigger(section: HTMLElement) {
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
    // Aguarda hidratação completa dos componentes
    setTimeout(() => {
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
      let resizeTimer: ReturnType<typeof setTimeout>;
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

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    }, 500);
  });

  onDestroy(() => {
    killAllTriggers();
  });
</script>
