/**
 * Utility to check if the user prefers reduced motion.
 * GSAP animations should check this before running.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns a reactive $state signal that tracks prefers-reduced-motion changes.
 * Use in Svelte 5 components:
 *   let reduced = reducedMotionSignal();
 *   $effect(() => { if (reduced.current) { ... } })
 */
export function reducedMotionSignal(): { current: boolean } {
  const state = { current: prefersReducedMotion() };

  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', (e) => {
      state.current = e.matches;
    });
  }

  return state;
}
