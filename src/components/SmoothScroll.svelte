<script lang="ts">
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import Lenis from 'lenis';
  import { prefersReducedMotion } from '../lib/reducedMotion';

  let lenis!: Lenis;

  $effect(() => {
    // Skip Lenis smooth scroll if user prefers reduced motion
    // Native scrolling is more comfortable for users with vestibular disorders
    if (prefersReducedMotion()) {
      return;
    }

    // Inicializar Lenis com configurações Ultra Hygge
    lenis = new Lenis({
      duration: 2.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Teardown - limpa quando o componente é desmontado
    return () => {
      if (lenis) {
        lenis.destroy();
      }
    };
  });
</script>
