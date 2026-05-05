<script lang="ts">
  import { gsap } from 'gsap';

  let visible = $state(false);
  let button: HTMLButtonElement | null = null;

  $effect(() => {
    const handleScroll = () => {
      visible = window.scrollY > 500;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $effect(() => {
    if (!button) return;

    gsap.to(button, {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : 10,
      duration: 0.6,
      ease: 'power2.out',
      pointerEvents: visible ? 'auto' : 'none'
    });
  });
</script>

<button
  class="back-to-top"
  bind:this={button}
  aria-label="Voltar ao topo"
  onclick={scrollToTop}
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 15l-6-6-6 6"/>
  </svg>
</button>

<style>
  .back-to-top {
    position: fixed;
    bottom: 40px;
    right: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: hsla(214, 61%, 98%, 0.8);
    border: 0.5px solid hsla(214, 61%, 14%, 0.08);
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    transform: translateY(10px);
    pointer-events: none;
    transition: background 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(8px);
    z-index: 999;
  }

  .back-to-top:hover {
    background: hsla(214, 61%, 98%, 0.95);
    border-color: hsla(214, 61%, 14%, 0.12);
    transform: translateY(-2px);
  }

  .back-to-top:active {
    transform: translateY(0) scale(0.97);
  }

  .back-to-top:hover svg {
    transform: translateY(-1px);
  }

  .back-to-top svg {
    width: 20px;
    height: 20px;
    stroke: hsl(214, 61%, 14%);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .back-to-top:focus-visible {
    box-shadow: 0 0 0 3px hsla(214, 85%, 55%, 0.2);
    outline: none;
  }

  @media (max-width: 768px) {
    .back-to-top {
      bottom: 30px;
      right: 30px;
      width: 40px;
      height: 40px;
    }

    .back-to-top svg {
      width: 18px;
      height: 18px;
    }
  }
</style>
