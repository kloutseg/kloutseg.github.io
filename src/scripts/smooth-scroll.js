const canUseSmoothScroll = () =>
  window.matchMedia('(min-width: 769px)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let smoothScrollStarted = false;

async function startSmoothScroll() {
  if (smoothScrollStarted || window.lenisInstance || !canUseSmoothScroll()) return;

  smoothScrollStarted = true;

  try {
    const [{ default: Lenis }, gsapModule, scrollTriggerModule] = await Promise.all([
      import('lenis'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);

    const gsap = gsapModule.gsap;
    const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

    const lenis = new Lenis({
      duration: 1.65,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.86,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      normalizeWheel: true,
    });

    window.lenisInstance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } catch {
    smoothScrollStarted = false;
  }
}

void startSmoothScroll();
