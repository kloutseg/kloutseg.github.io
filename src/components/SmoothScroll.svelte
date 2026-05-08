<script lang="ts">
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../lib/reducedMotion';

  let lenis: { on: (event: 'scroll', callback: () => void) => void; raf: (time: number) => void; destroy: () => void } | null = null;

  $effect(() => {
    // Skip Lenis smooth scroll if user prefers reduced motion
    // Native scrolling is more comfortable for users with vestibular disorders
    if (prefersReducedMotion()) {
      return;
    }

    let cancelled = false;
    const tick = (time: number) => {
      lenis?.raf(time * 1000);
    };

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;

      // Inicializar Lenis com configurações Ultra Hygge
      lenis = new Lenis({
        duration: 2.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        normalizeWheel: false,
      });

      // Expor instância globalmente
      (window as any).lenisInstance = lenis;

      // Integrar Lenis com GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    });

    // Teardown - limpa quando o componente é desmontado
    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      if (lenis) {
        lenis.destroy();
      }
    };
  });
</script>
