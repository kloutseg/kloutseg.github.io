<script lang="ts">
  let menuOpen = $state(false);
  let scrolled = $state(false);
  let activeSection = $state('');
  let isDark = $state(false);

  let menuToggleBtn: HTMLElement | null = null;
  const MOBILE_BREAKPOINT = 768;

  function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  $effect(() => {
    let rafId: number;
    let ticking = false;
    let lastActiveSection = '';

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          scrolled = scrollY > 50;

          if (window.innerWidth <= MOBILE_BREAKPOINT) {
            isDark = false;
            activeSection = '';
            lastActiveSection = '';
            ticking = false;
            return;
          }

          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const el = document.elementFromPoint(centerX, centerY);

          isDark = !!el?.closest('[data-dark-section]');

          if (el) {
            const section = el.closest('section[id]');
            if (section) {
              const sectionId = section.getAttribute('id');
              if (sectionId && sectionId !== lastActiveSection) {
                lastActiveSection = sectionId;
                activeSection = sectionId;
              }
            }
          }

          if (scrollY < 50) {
            activeSection = '';
            lastActiveSection = '';
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let wasMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const syncResponsiveState = () => {
      const isMobileNow = window.innerWidth <= MOBILE_BREAKPOINT;

      if (isMobileNow !== wasMobile) {
        if (menuOpen) {
          menuOpen = false;
        }
        document.body.style.overflow = '';
        wasMobile = isMobileNow;
      }
    };

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncResponsiveState, 120);
    };

    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  function openMenu(): void {
    menuOpen = true;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const overlayMenu = document.querySelector('.overlay-menu') as HTMLElement | null;
      const firstLink = overlayMenu?.querySelector('a');
      if (firstLink) firstLink.focus();
    }, prefersReducedMotion() ? 0 : 360);
  }

  function closeMenu(): void {
    document.body.style.overflow = '';
    menuOpen = false;
    if (menuToggleBtn) menuToggleBtn.focus();
  }

  function navigateWithTransition(href: string): void {
    if (typeof window === 'undefined') return;

    const transitionNavigate = (window as Window & {
      __kloutNavigate?: (targetHref: string, options?: { replace?: boolean }) => void;
    }).__kloutNavigate;

    if (typeof transitionNavigate === 'function') {
      transitionNavigate(href);
      return;
    }

    window.location.href = href;
  }

  function handleAnchorClick(href: string): void {
    // Se estiver na home, apenas volta ao topo.
    if (href === '/') {
      if (window.location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        if (menuOpen) closeMenu();
        return;
      }

      if (menuOpen) closeMenu();
      navigateWithTransition('/');
      return;
    }

    // Permite navegação de página completa para rotas diretas.
    if (href.startsWith('/')) {
      if (menuOpen) closeMenu();
      navigateWithTransition(href);
      return;
    }

    // Extrai o ID do href (remove o # se existir)
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);
    const routeFallbacks: Record<string, string> = {
      parceiros: '/parceiros',
      escritorio: '/a-klout',
      'a-klout': '/a-klout',
    };

    if (target) {
      const navbarHeight = 88;
      const targetPosition = (target as HTMLElement).offsetTop - navbarHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      if (menuOpen) closeMenu();
      return;
    }

    const fallbackRoute = routeFallbacks[targetId];
    if (fallbackRoute) {
      if (menuOpen) closeMenu();
      navigateWithTransition(fallbackRoute);
    }
  }
</script>

<!-- Gradientes para ícones -->
<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true">
  <defs>
    <linearGradient id="phone-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(214, 75%, 35%)"/>
      <stop offset="50%" stop-color="hsl(214, 70%, 28%)"/>
      <stop offset="100%" stop-color="hsl(214, 65%, 20%)"/>
    </linearGradient>
    <linearGradient id="phone-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(0, 0%, 95%)"/>
      <stop offset="50%" stop-color="hsl(0, 0%, 85%)"/>
      <stop offset="100%" stop-color="hsl(0, 0%, 75%)"/>
    </linearGradient>
    <linearGradient id="phone-gradient-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(45, 50%, 55%)"/>
      <stop offset="50%" stop-color="hsl(45, 45%, 48%)"/>
      <stop offset="100%" stop-color="hsl(45, 40%, 40%)"/>
    </linearGradient>
  </defs>
</svg>

<nav class="floating-navbar" class:dark={isDark} class:scrolled={scrolled} aria-label="Menu principal">
  <div class="navbar-container">
    <div class="left-content-mobile">
      <a href="/analise" aria-label="Entrar em contato com atendimento" class="mobile-atendimento-link">
        <img
          src={isDark ? '/icons/atendimento_mini_light.png' : '/icons/atendimento_mini.png'}
          alt="Atendimento"
          class="atendimento-icon"
          width="50"
          height="50"
        />
      </a>
    </div>
    <div class="logo">
      <a href="/" aria-label="Página inicial da Klout" onclick={(e) => { e.preventDefault(); handleAnchorClick('/'); }}>
        <img
          src={isDark ? '/images/logo_simple_light.png' : '/images/logo_v3_blue-126.webp'}
          alt="Logotipo da Klout"
          class="logo-desktop"
          width="126"
          height="36"
          style="height: 18px; width: auto;"
        />
        <img
          src={isDark ? '/images/navbar-logo-3d.png' : '/images/navbar-logo-blue-3d.png'}
          alt="Logotipo da Klout"
          class="logo-mobile"
          width="30"
          height="40"
          style="height: 32px; width: auto;"
        />
      </a>
    </div>
    <div class="center-content">
      <ul class="nav-links" role="menubar">
        <li role="none">
          <a
            role="menuitem"
            aria-label="Para você"
            class:active={activeSection === 'voce'}
            href="/para-voce"
            tabindex="0"
          >
            Você
          </a>
        </li>
        <li role="none">
          <a
            role="menuitem"
            aria-label="Para sua empresa"
            class:active={activeSection === 'sua-empresa' || activeSection === 'empresas'}
            href="/para-empresas"
            tabindex="0"
          >
            Empresas
          </a>
        </li>
        <li role="none">
          <a
            role="menuitem"
            aria-label="Parceiros"
            class:active={activeSection === 'parceiros'}
            href="/parceiros"
            tabindex="0"
          >
            Parceiros
          </a>
        </li>
        <li role="none">
          <a
            role="menuitem"
            aria-label="Escritório"
            class:active={activeSection === 'a-klout'}
            href="/a-klout"
            tabindex="0"
          >
            Escritório
          </a>
        </li>
      </ul>
    </div>
    <div class="right-content">
      <div
        class="consultant-button"
        aria-hidden="true"
      >
        <button
          aria-label="Entrar em contato com um consultor"
          onclick={() => navigateWithTransition('/analise')}
        >
          <svg class="phone-icon" width="16" height="16" viewBox="0 0 24 24" stroke="none">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span class="button-text">Falar com consultor</span>
        </button>
      </div>

      <button
        class="menu-toggle-mobile"
        aria-label="Abrir menu de navegação"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onclick={openMenu}
        onkeydown={(e) => e.key === 'Enter' && openMenu()}
      >
        <svg class="dots-svg" width="24" height="32" viewBox="0 0 24 32" focusable="false" aria-hidden="true">
          <circle cx="12" cy="8" r="2" />
          <circle cx="12" cy="16" r="2" />
          <circle cx="12" cy="24" r="2" />
        </svg>
      </button>
    </div>
  </div>
</nav>

<!-- Mobile Overlay Menu -->
<div
  class="overlay-menu"
  class:active={menuOpen}
  id="mobile-menu"
  role="dialog"
  aria-modal="true"
  aria-label="Menu de navegação móvel"
  tabindex="-1"
  onclick={(e) => e.target === e.currentTarget && closeMenu()}
  onkeydown={(e) => { if (e.target === e.currentTarget && e.key === 'Escape') closeMenu(); }}
>
  <div class="overlay-content">
    <a href="/" class="overlay-home-btn" aria-label="Voltar à página inicial" onclick={(e) => { e.preventDefault(); closeMenu(); handleAnchorClick('/'); }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9.5l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </a>
    <button class="close-btn" aria-label="Fechar menu" onclick={closeMenu} onkeydown={(e) => e.key === 'Enter' && closeMenu()}>
      &times;
    </button>
    <img
      src="/images/logo_shield_light_3d.png"
      alt="Klout"
      class="overlay-logo"
      width="48"
      height="48"
    />
    <ul class="overlay-nav" role="navigation" aria-label="Menu de navegação">
      <li>
        <a
          aria-label="Para você"
          href="/para-voce"
          onclick={() => closeMenu()}
        >
          Você
          <span>Planos sob medida</span>
        </a>
      </li>
      <li>
        <a
          aria-label="Para sua empresa"
          href="/para-empresas"
        >
          Empresas
          <span>Gestão estratégica</span>
        </a>
      </li>
      <li>
        <a
          aria-label="Parceiros"
          href="/parceiros"
        >
          Parceiros
          <span>Rede de parceiros</span>
        </a>
      </li>
      <li>
        <a
          aria-label="Escritório"
          href="/a-klout"
          onclick={() => closeMenu()}
        >
          Escritório
          <span>Onde nos encontrar</span>
        </a>
      </li>
    </ul>
    <div class="overlay-social">
      <a href="https://instagram.com/klout" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
          <path d="M10.202,2.098c-1.49,.07-2.507,.308-3.396,.657-.92,.359-1.7,.84-2.477,1.619-.776,.779-1.254,1.56-1.61,2.481-.345,.891-.578,1.909-.644,3.4-.066,1.49-.08,1.97-.073,5.771s.024,4.278,.096,5.772c.071,1.489,.308,2.506,.657,3.396,.359,.92,.84,1.7,1.619,2.477,.779,.776,1.559,1.253,2.483,1.61,.89,.344,1.909,.579,3.399,.644,1.49,.065,1.97,.08,5.771,.073,3.801-.007,4.279-.024,5.773-.095s2.505-.309,3.395-.657c.92-.36,1.701-.84,2.477-1.62s1.254-1.561,1.609-2.483c.345-.89,.579-1.909,.644-3.398,.065-1.494,.081-1.971,.073-5.773s-.024-4.278-.095-5.771-.308-2.507-.657-3.397c-.36-.92-.84-1.7-1.619-2.477s-1.561-1.254-2.483-1.609c-.891-.345-1.909-.58-3.399-.644s-1.97-.081-5.772-.074-4.278,.024-5.771,.096m.164,25.309c-1.365-.059-2.106-.286-2.6-.476-.654-.252-1.12-.557-1.612-1.044s-.795-.955-1.05-1.608c-.192-.494-.423-1.234-.487-2.599-.069-1.475-.084-1.918-.092-5.656s.006-4.18,.071-5.656c.058-1.364,.286-2.106,.476-2.6,.252-.655,.556-1.12,1.044-1.612s.955-.795,1.608-1.05c.493-.193,1.234-.422,2.598-.487,1.476-.07,1.919-.084,5.656-.092,3.737-.008,4.181,.006,5.658,.071,1.364,.059,2.106,.285,2.599,.476,.654,.252,1.12,.555,1.612,1.044s.795,.954,1.051,1.609c.193,.492,.422,1.232,.486,2.597,.07,1.476,.086,1.919,.093,5.656,.007,3.737-.006,4.181-.071,5.656-.06,1.365-.286,2.106-.476,2.601-.252,.654-.556,1.12-1.045,1.612s-.955,.795-1.608,1.05c-.493,.192-1.234,.422-2.597,.487-1.476,.069-1.919,.084-5.657,.092s-4.18-.007-5.656-.071M21.779,8.517c.002,.928,.755,1.679,1.683,1.677s1.679-.755,1.677-1.683c-.002-.928-.755-1.679-1.683-1.677,0,0,0,0,0,0-.928,.002-1.678,.755-1.677,1.683m-12.967,7.496c.008,3.97,3.232,7.182,7.202,7.174s7.183-3.232,7.176-7.202c-.008-3.97-3.233-7.183-7.203-7.175s-7.182,3.233-7.174,7.203m2.522-.005c-.005-2.577,2.08-4.671,4.658-4.676,2.577-.005,4.671,2.08,4.676,4.658,.005,2.577-2.08,4.671-4.658,4.676-2.577,.005-4.671-2.079-4.676-4.656h0"></path>
        </svg>
      </a>
      <a href="https://facebook.com/klout" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
          <path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z"></path>
        </svg>
      </a>
      <a href="https://linkedin.com/company/klout" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
          <path d="M26.111,3H5.889c-1.595,0-2.889,1.293-2.889,2.889V26.111c0,1.595,1.293,2.889,2.889,2.889H26.111c1.595,0,2.889-1.293,2.889-2.889V5.889c0-1.595-1.293-2.889-2.889-2.889ZM10.861,25.389h-3.877V12.87h3.877v12.519Zm-1.957-14.158c-1.267,0-2.293-1.034-2.293-2.31s1.026-2.31,2.293-2.31,2.292,1.034,2.292,2.31-1.026,2.31-2.292,2.31Zm16.485,14.158h-3.858v-6.571c0-1.802-.685-2.809-2.111-2.809-1.551,0-2.362,1.048-2.362,2.809v6.571h-3.718V12.87h3.718v1.686s1.118-2.069,3.775-2.069,4.556,1.621,4.556,4.975v7.926Z" fill-rule="evenodd"></path>
        </svg>
      </a>
    </div>
  </div>
</div>

<style>
  :global(.floating-navbar) {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: min(90%, 1140px);
    max-width: 1140px;
    z-index: 1000;
    background: linear-gradient(
      145deg,
      hsla(42, 30%, 98.8%, 0.84) 0%,
      hsla(214, 26%, 97.8%, 0.72) 58%,
      hsla(214, 32%, 96.2%, 0.7) 100%
    );
    box-shadow:
      0 24px 60px hsla(214, 28%, 12%, 0.08),
      0 8px 20px hsla(214, 20%, 12%, 0.045),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.72);
    border-radius: 24px;
    padding: 5px 30px;
    max-height: 88px;
    backdrop-filter: blur(20px) saturate(1.02);
    border: 1px solid hsla(214, 22%, 22%, 0.08);
    animation: navbar-enter 900ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
    transition: background 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1), color 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes navbar-enter {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-50px) scale(0.95);
    }

    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  :global(.floating-navbar::before) {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      180deg,
      hsla(0, 0%, 100%, 0.34) 0%,
      hsla(0, 0%, 100%, 0.1) 18%,
      transparent 45%
    );
    pointer-events: none;
  }

  :global(.floating-navbar.dark::before) {
    background: linear-gradient(
      180deg,
      hsla(210, 50%, 92%, 0.085) 0%,
      hsla(210, 42%, 90%, 0.028) 16%,
      transparent 42%
    );
  }

  :global(.floating-navbar.scrolled) {
    background: linear-gradient(
      145deg,
      hsla(42, 30%, 99.1%, 0.94) 0%,
      hsla(214, 28%, 98.4%, 0.88) 58%,
      hsla(214, 30%, 96.8%, 0.86) 100%
    );
    backdrop-filter: blur(24px) saturate(1.04);
    box-shadow:
      0 28px 66px hsla(214, 28%, 12%, 0.1),
      0 10px 24px hsla(214, 20%, 12%, 0.05),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.74);
    border-color: hsla(214, 22%, 22%, 0.1);
  }

  :global(.navbar-container) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 72px;
    position: relative;
  }

  :global(.center-content) {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    gap: 2rem;
  }

  :global(.nav-links) {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0 0 0 132px;
    gap: 1.1rem;
    align-items: center;
  }

  :global(.nav-links a) {
    color: hsl(214, 28%, 22%);
    text-decoration: none;
    font-size: 0.98rem;
    font-weight: 400;
    font-family: 'Proxima Nova', sans-serif;
    line-height: 1;
    text-transform: none;
    letter-spacing: 0.012em;
    padding: 11px 14px;
    border-radius: 12px;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    border: none;
    text-shadow: none;
    cursor: pointer;
    transition: color 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    margin: 0;
    outline: none;
    height: 39px;
    box-sizing: border-box;
    position: relative;
  }

  /* Ponto indicador na base */
  :global(.nav-links a::after) {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%) scale(0);
    width: 4px;
    height: 4px;
    background: hsl(42, 28%, 40%);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 0 10px hsla(42, 28%, 40%, 0.24);
  }

  :global(.nav-links a:hover) {
    color: hsl(42, 26%, 34%);
    background: hsla(42, 22%, 52%, 0.07);
    transform: translateY(-1px);
    text-shadow: none;
  }

  :global(.nav-links a:active) {
    transform: translateY(0) scale(0.98);
  }

  :global(.nav-links a.active) {
    color: hsl(42, 26%, 34%);
    font-weight: 400;
    background: hsla(42, 22%, 52%, 0.09);
  }

  :global(.nav-links a.active::after) {
    opacity: 1;
  }

  :global(.right-content) {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-left: auto;
    padding-right: 18px;
    position: relative;
  }

  :global(.consultant-button) {
    display: flex;
    align-items: center;
    opacity: 1;
    transform: translateY(0);
    width: 200px;
    justify-content: flex-end;
    position: relative;
    pointer-events: auto;
    cursor: pointer;
    animation: navbar-item-enter 760ms cubic-bezier(0.22, 1, 0.36, 1) 360ms backwards;
  }

  :global(.consultant-button button) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 18px;
    background: linear-gradient(
      180deg,
      hsla(0, 0%, 100%, 0.38) 0%,
      hsla(0, 0%, 100%, 0.18) 100%
    );
    border: 1px solid hsla(214, 24%, 20%, 0.08);
    cursor: pointer;
    margin: 0;
    outline: none;
    overflow: hidden;
    flex-shrink: 0;
    z-index: 2;
    position: relative;
    transform: translateX(20px);
    transition:
      width 1s ease,
      background 1s ease,
      border-color 1s ease,
      box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow:
      inset 0 1px 0 hsla(0, 0%, 100%, 0.5),
      0 8px 18px hsla(214, 26%, 14%, 0.06);
  }

  :global(.consultant-button:hover button) {
    width: 200px;
    background: hsla(45, 40%, 55%, 0.04);
    border-color: hsla(45, 40%, 55%, 0.2);
  }

  :global(.consultant-button .phone-icon) {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    fill: url(#phone-gradient-light);
    filter: drop-shadow(0 1px 1px hsla(214, 61%, 14%, 0.3));
    transition: transform 1s ease, filter 0.6s ease;
  }

  :global(.consultant-button:hover .phone-icon) {
    transform: translateX(-76px);
  }

  :global(.consultant-button .button-text) {
    position: absolute;
    left: 44px;
    white-space: nowrap;
    opacity: 0;
    color: hsl(214, 30%, 22%);
    font-size: 0.88rem;
    font-weight: 400;
    font-family: 'Proxima Nova', sans-serif;
    letter-spacing: 0.015em;
    overflow: visible;
    pointer-events: none;
    transition: opacity 1s ease 180ms;
  }

  :global(.consultant-button:hover .button-text) {
    opacity: 1;
  }

  :global(.floating-navbar.dark .consultant-button .button-text) {
    color: hsl(215, 30%, 85%);
  }

  :global(.consultant-button button:focus-visible) {
    box-shadow: 0 0 0 3px hsla(214, 85%, 55%, 0.2);
    outline: none;
  }

  :global(.floating-navbar.dark .consultant-button button:focus-visible) {
    box-shadow: 0 0 0 3px hsla(215, 30%, 50%, 0.35);
    outline: none;
  }

  :global(.floating-navbar.dark .consultant-button .phone-icon) {
    fill: url(#phone-gradient-dark);
    filter: drop-shadow(0 1px 1px hsla(0, 0%, 0%, 0.4));
  }

  :global(.floating-navbar.dark .consultant-button:hover .phone-icon) {
    fill: url(#phone-gradient-dark);
    filter: drop-shadow(0 2px 4px hsla(0, 0%, 0%, 0.6));
  }

  :global(.floating-navbar.dark .consultant-button:active .phone-icon) {
    fill: url(#phone-gradient-dark);
    filter: drop-shadow(0 1px 2px hsla(0, 0%, 0%, 0.5));
  }

  :global(.logo) {
    opacity: 1;
    transform: translateY(0);
    animation: navbar-item-enter 760ms cubic-bezier(0.22, 1, 0.36, 1) 160ms backwards;
  }

  :global(.logo a) {
    font-family: 'Proxima Nova', sans-serif;
    font-weight: 600;
    display: block;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  :global(.logo a:hover) {
    opacity: 0.7;
    transform: scale(1.02);
  }

  :global(.logo-mobile) {
    display: none;
  }

  :global(.nav-links li) {
    opacity: 1;
    transform: translateY(0);
    animation: navbar-item-enter 760ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }

  :global(.nav-links li:nth-child(1)) {
    animation-delay: 220ms;
  }

  :global(.nav-links li:nth-child(2)) {
    animation-delay: 300ms;
  }

  :global(.nav-links li:nth-child(3)) {
    animation-delay: 380ms;
  }

  :global(.nav-links li:nth-child(4)) {
    animation-delay: 460ms;
  }

  @keyframes navbar-item-enter {
    from {
      opacity: 0;
      transform: translateY(15px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  :global(.left-content-mobile) {
    display: none;
  }

  :global(.menu-toggle-mobile) {
    display: none;
    flex-direction: row;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    background: linear-gradient(
      180deg,
      hsla(0, 0%, 100%, 0.34) 0%,
      hsla(0, 0%, 100%, 0.16) 100%
    );
    border: 1px solid hsla(214, 24%, 20%, 0.08);
    border-radius: 18px;
    box-shadow:
      inset 0 1px 0 hsla(0, 0%, 100%, 0.44),
      0 8px 18px hsla(214, 26%, 14%, 0.05);
  }

  :global(.menu-toggle-mobile:hover) {
    transform: translateY(-1px);
  }

  :global(.menu-toggle-mobile:focus-visible) {
    outline: 2px solid hsl(214, 61%, 14%);
    outline-offset: 2px;
    border-radius: 4px;
  }

  :global(.menu-toggle-mobile:active) {
    transform: scale(0.95);
  }

  :global(.dots-svg) {
    fill: hsl(214, 42%, 18%);
    transition: transform 0.2s ease, fill 0.35s ease;
    display: block;
  }

  :global(.dots-svg circle) {
    fill: hsl(214, 42%, 18%);
  }

  /* ============================================
     DARK MODE — ativado quando [data-dark-section]
     está na frente da tela
     ============================================ */

  :global(.floating-navbar.dark) {
    background: linear-gradient(
      145deg,
      hsla(214, 26%, 18%, 0.92) 0%,
      hsla(219, 22%, 13%, 0.86) 46%,
      hsla(223, 24%, 9%, 0.9) 100%
    );
    border: 1px solid transparent;
    border-top-color: hsla(212, 24%, 76%, 0.065);
    border-left-color: hsla(212, 18%, 72%, 0.024);
    border-right-color: hsla(212, 18%, 72%, 0.024);
    border-bottom-color: transparent;
    box-shadow:
      0 28px 70px hsla(225, 26%, 5%, 0.34),
      0 10px 26px hsla(220, 18%, 7%, 0.18),
      inset 0 1px 0 hsla(212, 24%, 92%, 0.07);
    backdrop-filter: blur(22px) saturate(0.94);
  }

  :global(.floating-navbar.dark.scrolled) {
    background: linear-gradient(
      145deg,
      hsla(214, 28%, 19%, 0.95) 0%,
      hsla(219, 24%, 14%, 0.92) 46%,
      hsla(223, 26%, 9%, 0.95) 100%
    );
    backdrop-filter: blur(26px) saturate(0.98);
    box-shadow:
      0 30px 72px hsla(225, 26%, 5%, 0.38),
      0 12px 26px hsla(220, 18%, 7%, 0.2),
      inset 0 1px 0 hsla(212, 24%, 92%, 0.085);
    border-top-color: hsla(212, 24%, 76%, 0.075);
    border-left-color: hsla(212, 18%, 72%, 0.026);
    border-right-color: hsla(212, 18%, 72%, 0.026);
    border-bottom-color: transparent;
  }

  :global(.floating-navbar.dark .nav-links a) {
    color: hsl(214, 18%, 81%);
    transition: color 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    font-weight: 500;
    border: none;
    text-shadow: none;
  }

  :global(.floating-navbar.dark .nav-links a:hover) {
    color: hsl(210, 30%, 93%);
    background: linear-gradient(
      180deg,
      hsla(210, 22%, 72%, 0.1) 0%,
      hsla(210, 18%, 70%, 0.045) 100%
    );
    box-shadow: inset 0 -1px 0 hsla(206, 34%, 58%, 0.22);
    transform: translateY(-1px);
    text-shadow: none;
  }

  :global(.floating-navbar.dark .nav-links a:active) {
    transform: translateY(0) scale(0.98);
  }

  :global(.floating-navbar.dark .nav-links a.active) {
    color: hsl(42, 30%, 82%);
    font-weight: 400;
    background: linear-gradient(
      180deg,
      hsla(42, 18%, 70%, 0.085) 0%,
      hsla(42, 16%, 62%, 0.035) 100%
    );
    box-shadow: inset 0 -1px 0 hsla(42, 30%, 60%, 0.28);
  }

  :global(.floating-navbar.dark .nav-links a.active::after) {
    opacity: 1;
    background: linear-gradient(
      90deg,
      hsla(42, 26%, 46%, 0) 0%,
      hsla(42, 30%, 60%, 0.68) 50%,
      hsla(42, 26%, 46%, 0) 100%
    );
    box-shadow: 0 0 10px hsla(42, 30%, 60%, 0.1);
  }

  :global(.floating-navbar.dark .consultant-button button) {
    color: hsl(214, 18%, 84%);
    background: linear-gradient(
      180deg,
      hsla(212, 18%, 92%, 0.06) 0%,
      hsla(214, 18%, 94%, 0.018) 100%
    );
    box-shadow:
      inset 0 1px 0 hsla(212, 18%, 92%, 0.07),
      0 8px 18px hsla(225, 24%, 6%, 0.16);
    backdrop-filter: none;
    border: 1px solid hsla(214, 18%, 72%, 0.08);
    text-shadow: none;
    transition: color 0.6s cubic-bezier(0.16, 1, 0.3, 1),
               box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1),
               width 1s ease,
               background 1s ease,
               border-color 1s ease;
  }

  :global(.floating-navbar.dark .consultant-button button:hover) {
    color: hsl(210, 26%, 92%);
    text-shadow: none;
  }

  :global(.floating-navbar.dark .consultant-button:hover button) {
    background: hsla(210, 24%, 68%, 0.08);
    border-color: hsla(210, 20%, 62%, 0.18);
  }

  :global(.floating-navbar.dark .consultant-button button:active) {
  }

  :global(.floating-navbar.dark .consultant-button button:focus-visible) {
    box-shadow: 0 0 0 3px hsla(206, 34%, 58%, 0.2);
    outline: none;
  }

  :global(.floating-navbar.dark .menu-toggle-mobile) {
    background: linear-gradient(
      180deg,
      hsla(212, 18%, 92%, 0.06) 0%,
      hsla(214, 18%, 94%, 0.018) 100%
    );
    border-color: hsla(214, 18%, 72%, 0.08);
    box-shadow:
      inset 0 1px 0 hsla(212, 18%, 92%, 0.07),
      0 8px 18px hsla(225, 24%, 6%, 0.16);
  }

  :global(.floating-navbar.dark .dots-svg) {
    fill: hsl(212, 20%, 84%);
  }

  :global(.floating-navbar.dark .dots-svg circle) {
    fill: hsl(212, 20%, 84%);
  }

  :global(.overlay-menu) {
    position: fixed;
    inset: 0;
    background: linear-gradient(
      175deg,
      hsl(214, 55%, 6%) 0%,
      hsl(214, 50%, 4%) 40%,
      hsl(214, 45%, 2.5%) 100%
    );
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    overflow: hidden;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.34s ease, visibility 0s linear 0.34s;
  }

  :global(.overlay-menu.active) {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition: opacity 0.34s ease, visibility 0s;
  }

  /* Gradiente dourado sutil no topo */
  :global(.overlay-menu::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      hsla(45, 40%, 55%, 0.4) 30%,
      hsla(45, 45%, 65%, 0.6) 50%,
      hsla(45, 40%, 55%, 0.4) 70%,
      transparent 100%
    );
  }

  /* Linhas geométricas decorativas */
  :global(.overlay-menu::after) {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(180deg, hsla(214, 15%, 30%, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, hsla(214, 15%, 30%, 0.04) 1px, transparent 1px);
    background-size: 80px 80px;
    pointer-events: none;
  }

  :global(.overlay-content) {
    position: relative;
    width: 100%;
    max-width: 440px;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transform: translateY(50px);
    transition:
      opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.overlay-menu.active .overlay-content) {
    opacity: 1;
    transform: translateY(0);
  }

  /* Divisor decorativo entre o botão fechar e o menu */
  :global(.overlay-content::before) {
    content: '';
    display: block;
    width: 40px;
    height: 1px;
    margin-bottom: 2.5rem;
    background: linear-gradient(
      90deg,
      transparent 0%,
      hsla(45, 40%, 55%, 0.5) 50%,
      transparent 100%
    );
  }

  /* Home button — top-left corner */
  :global(.overlay-home-btn) {
    position: absolute;
    top: 2.5rem;
    left: 1.75rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid hsla(214, 15%, 30%, 0.3);
    border-radius: 50%;
    color: hsl(214, 15%, 60%);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.overlay-home-btn:hover) {
    color: hsl(45, 40%, 65%);
    border-color: hsla(45, 40%, 55%, 0.4);
    background: hsla(45, 40%, 55%, 0.05);
    transform: scale(1.05);
  }

  :global(.overlay-home-btn svg) {
    width: 18px;
    height: 18px;
  }

  :global(.overlay-logo) {
    width: 48px;
    height: 48px;
    object-fit: contain;
    display: block;
    margin-bottom: 2.5rem;
    opacity: 0;
    animation: overlay-logo-in 0.8s 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes overlay-logo-in {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 0.8; transform: scale(1); }
  }

  :global(.close-btn) {
    position: absolute;
    top: 2.5rem;
    right: 1.75rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    line-height: 1;
    background: transparent;
    border: 1px solid hsla(214, 15%, 30%, 0.3);
    border-radius: 50%;
    color: hsl(214, 15%, 60%);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    letter-spacing: 0;
    padding: 0;
  }

  :global(.close-btn:hover) {
    color: hsl(45, 40%, 65%);
    border-color: hsla(45, 40%, 55%, 0.4);
    background: hsla(45, 40%, 55%, 0.05);
    transform: scale(1.05);
  }

  :global(.overlay-nav) {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
  }

  :global(.overlay-nav li) {
    opacity: 0;
    transform: translateX(-50px);
    transition:
      opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.overlay-menu.active .overlay-nav li) {
    opacity: 1;
    transform: translateX(0);
  }

  :global(.overlay-menu.active .overlay-nav li:nth-child(1)) {
    transition-delay: 80ms;
  }

  :global(.overlay-menu.active .overlay-nav li:nth-child(2)) {
    transition-delay: 150ms;
  }

  :global(.overlay-menu.active .overlay-nav li:nth-child(3)) {
    transition-delay: 220ms;
  }

  :global(.overlay-menu.active .overlay-nav li:nth-child(4)) {
    transition-delay: 290ms;
  }

  :global(.overlay-nav a) {
    display: flex;
    flex-direction: column;
    color: hsl(214, 61%, 92%);
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: 400;
    font-family: 'IBM Plex Serif', serif;
    letter-spacing: 0.04em;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 1.25rem 0;
    cursor: pointer;
    position: relative;
    line-height: 1.3;
  }

  /* Linha sutil entre itens */
  :global(.overlay-nav a::before) {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      hsla(214, 15%, 25%, 0.3) 20%,
      hsla(214, 15%, 25%, 0.3) 80%,
      transparent 100%
    );
    transition: background 0.4s ease;
  }

  :global(.overlay-nav a span) {
    font-size: 0.72rem;
    font-weight: 400;
    font-family: 'Proxima Nova', sans-serif;
    color: hsl(214, 15%, 42%);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 0.4rem;
    transition: color 0.4s ease;
  }

  :global(.overlay-nav a:hover) {
    color: hsl(45, 40%, 68%);
    padding-left: 0.5rem;
  }

  :global(.overlay-nav a:hover::before) {
    background: linear-gradient(
      90deg,
      transparent 0%,
      hsla(45, 40%, 55%, 0.3) 20%,
      hsla(45, 40%, 55%, 0.3) 80%,
      transparent 100%
    );
  }

  :global(.overlay-nav a:hover span) {
    color: hsl(45, 35%, 55%);
  }

  /* Social icons at bottom */
  :global(.overlay-social) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    margin-top: 2.5rem;
    padding-top: 2rem;
    position: relative;
  }

  :global(.overlay-social::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      hsla(214, 15%, 25%, 0.3) 50%,
      transparent 100%
    );
  }

  :global(.overlay-social a) {
    display: flex;
    align-items: center;
    justify-content: center;
    color: hsl(214, 15%, 35%);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 8px;
    border-radius: 50%;
  }

  :global(.overlay-social a:hover) {
    color: hsl(45, 40%, 60%);
    background: hsla(45, 40%, 55%, 0.06);
    transform: translateY(-2px);
  }

  :global(.overlay-social a svg) {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    :global(.floating-navbar) {
      top: 0;
      left: 0;
      right: 0;
      transform: none;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      border-radius: 0 0 28px 28px;
      overflow: hidden;
      padding: 10px 8px 12px 8px;
      max-height: none;
      animation-name: mobile-navbar-enter;
    }

    @keyframes mobile-navbar-enter {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :global(.navbar-container) {
      height: 60px;
      position: relative;
    }

    :global(.left-content-mobile) {
      position: absolute;
      left: 24px;
      display: flex;
      align-items: center;
    }

    :global(.mobile-atendimento-link) {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      background: linear-gradient(
        180deg,
        hsla(0, 0%, 100%, 0.34) 0%,
        hsla(0, 0%, 100%, 0.16) 100%
      );
      border: 1px solid hsla(214, 24%, 20%, 0.08);
      box-shadow:
        inset 0 1px 0 hsla(0, 0%, 100%, 0.44),
        0 8px 18px hsla(214, 26%, 14%, 0.05);
    }

    :global(.atendimento-icon) {
      width: 26px;
      height: 26px;
      object-fit: contain;
      display: block;
    }

    :global(.logo) {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) !important;
      opacity: 1 !important;
    }

    :global(.logo-desktop) {
      display: none;
    }

    :global(.logo-mobile) {
      display: block;
    }

    :global(.center-content) {
      display: none;
    }

    :global(.consultant-button) {
      display: none;
    }

    :global(.right-content) {
      position: absolute;
      right: 24px;
      padding-right: 0;
      gap: 0;
    }

    :global(.menu-toggle-mobile) {
      display: flex;
      opacity: 1 !important;
      transform: none !important;
    }

    :global(.left-content-mobile) {
      opacity: 1 !important;
      transform: none !important;
    }

    :global(.floating-navbar.dark .mobile-atendimento-link) {
      background: linear-gradient(
        180deg,
        hsla(42, 18%, 92%, 0.07) 0%,
        hsla(220, 18%, 94%, 0.02) 100%
      );
      border-color: hsla(42, 18%, 78%, 0.08);
      box-shadow:
        inset 0 1px 0 hsla(42, 18%, 92%, 0.08),
        0 8px 18px hsla(228, 24%, 6%, 0.16);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.floating-navbar),
    :global(.logo),
    :global(.nav-links li),
    :global(.consultant-button),
    :global(.overlay-logo) {
      animation: none;
    }

    :global(.overlay-menu),
    :global(.overlay-content),
    :global(.overlay-nav li),
    :global(.consultant-button button),
    :global(.consultant-button .phone-icon),
    :global(.consultant-button .button-text) {
      transition: none;
    }
  }
</style>
