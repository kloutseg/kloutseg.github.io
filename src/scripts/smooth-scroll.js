const mobileScrollEnabled = () =>
  document.documentElement.dataset.smoothScrollTouch === 'true';

const usesTouchProfile = () =>
  mobileScrollEnabled() &&
  (
    window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0
  );

const canUseSmoothScroll = () =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  (
    window.matchMedia('(min-width: 769px)').matches ||
    mobileScrollEnabled()
  );

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
    const touchProfile = usesTouchProfile();

    const lenis = new Lenis({
      duration: touchProfile ? 1.1 : 1.65,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: touchProfile ? 1 : 0.86,
      syncTouch: touchProfile,
      syncTouchLerp: touchProfile ? 0.12 : 0.075,
      touchInertiaExponent: touchProfile ? 1.55 : 1.7,
      touchMultiplier: touchProfile ? 1.05 : 1,
      infinite: false,
      anchors: touchProfile,
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
