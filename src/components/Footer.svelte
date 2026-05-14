<script lang="ts">
  import HSBadge from './HSBadge.svelte';
</script>

<footer data-dark-section>
	<div class="footer-main">
		<div class="footer-logo">
			<img
        src="/images/logo_shield_light_3d-180.webp"
        srcset="/images/logo_shield_light_3d-148.webp 148w, /images/logo_shield_light_3d-180.webp 180w, /images/logo_shield_light_3d.png 221w"
        sizes="(max-width: 768px) 148px, 180px"
        alt="Klout Logo"
        width="221"
        height="297"
        loading="lazy"
      />
		</div>

		<div class="footer-positioning">
			<p class="positioning-kicker">Expertise em planos de saúde</p>
			<p class="positioning-title">A influência estratégica para decisões inteligentes em planos de saúde</p>
		</div>

		<div class="footer-contact">
			<a href="/sobre" class="about-link">A Klout</a>
      <p class="contact-line">CNPJ: 00.000.000/0001-00</p>
      <p class="contact-line">Rua Exemplo, 1000 — Sala 1<br />São Paulo — SP, 01000-000</p>
      <p class="contact-line">+55 (11) 0000-0000</p>
      <a href="mailto:contato@klout.com.br" class="contact-line contact-link">contato&#64;klout.com.br</a>
      <div class="social-icons">
        <a href="https://instagram.com/klout" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
            <path d="M10.202,2.098c-1.49,.07-2.507,.308-3.396,.657-.92,.359-1.7,.84-2.477,1.619-.776,.779-1.254,1.56-1.61,2.481-.345,.891-.578,1.909-.644,3.4-.066,1.49-.08,1.97-.073,5.771s.024,4.278,.096,5.772c.071,1.489,.308,2.506,.657,3.396,.359,.92,.84,1.7,1.619,2.477,.779,.776,1.559,1.253,2.483,1.61,.89,.344,1.909,.579,3.399,.644,1.49,.065,1.97,.08,5.771,.073,3.801-.007,4.279-.024,5.773-.095s2.505-.309,3.395-.657c.92-.36,1.701-.84,2.477-1.62s1.254-1.561,1.609-2.483c.345-.89,.579-1.909,.644-3.398,.065-1.494,.081-1.971,.073-5.773s-.024-4.278-.095-5.771-.308-2.507-.657-3.397c-.36-.92-.84-1.7-1.619-2.477s-1.561-1.254-2.483-1.609c-.891-.345-1.909-.58-3.399-.644s-1.97-.081-5.772-.074-4.278,.024-5.771,.096m.164,25.309c-1.365-.059-2.106-.286-2.6-.476-.654-.252-1.12-.557-1.612-1.044s-.795-.955-1.05-1.608c-.192-.494-.423-1.234-.487-2.599-.069-1.475-.084-1.918-.092-5.656s.006-4.18,.071-5.656c.058-1.364,.286-2.106,.476-2.6,.252-.655,.556-1.12,1.044-1.612s.955-.795,1.608-1.05c.493-.193,1.234-.422,2.598-.487,1.476-.07,1.919-.084,5.656-.092,3.737-.008,4.181,.006,5.658,.071,1.364,.059,2.106,.285,2.599,.476,.654,.252,1.12,.555,1.612,1.044s.795,.954,1.051,1.609c.193,.492,.422,1.232,.486,2.597,.07,1.476,.086,1.919,.093,5.656,.007,3.737-.006,4.181-.071,5.656-.06,1.365-.286,2.106-.476,2.601-.252,.654-.556,1.12-1.045,1.612s-.955,.795-1.608,1.05c-.493,.192-1.234,.422-2.597,.487-1.476,.069-1.919,.084-5.657,.092s-4.18-.007-5.656-.071M21.779,8.517c.002,.928,.755,1.679,1.683,1.677s1.679-.755,1.677-1.683c-.002-.928-.755-1.679-1.683-1.677,0,0,0,0,0,0-.928,.002-1.678,.755-1.677,1.683m-12.967,7.496c.008,3.97,3.232,7.182,7.202,7.174s7.183-3.232,7.176-7.202c-.008-3.97-3.233-7.183-7.203-7.175s-7.182,3.233-7.174,7.203m2.522-.005c-.005-2.577,2.08-4.671,4.658-4.676,2.577-.005,4.671,2.08,4.676,4.658,.005,2.577-2.08,4.671-4.658,4.676-2.577,.005-4.671-2.079-4.676-4.656h0"></path>
          </svg>
        </a>
        <a href="https://facebook.com/klout" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z"></path>
          </svg>
        </a>
        <a href="https://linkedin.com/company/klout" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
            <path d="M26.111,3H5.889c-1.595,0-2.889,1.293-2.889,2.889V26.111c0,1.595,1.293,2.889,2.889,2.889H26.111c1.595,0,2.889-1.293,2.889-2.889V5.889c0-1.595-1.293-2.889-2.889-2.889ZM10.861,25.389h-3.877V12.87h3.877v12.519Zm-1.957-14.158c-1.267,0-2.293-1.034-2.293-2.31s1.026-2.31,2.293-2.31,2.292,1.034,2.292,2.31-1.026,2.31-2.292,2.31Zm16.485,14.158h-3.858v-6.571c0-1.802-.685-2.809-2.111-2.809-1.551,0-2.362,1.048-2.362,2.809v6.571h-3.718V12.87h3.718v1.686s1.118-2.069,3.775-2.069,4.556,1.621,4.556,4.975v7.926Z" fill-rule="evenodd"></path>
          </svg>
        </a>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="footer-bottom-left">
      <div class="footer-bottom-links">
        <a href="/privacidade">Privacidade</a>
        <span class="link-separator">&bull;</span>
        <a href="/cookies">Cookies</a>
        <span class="link-separator">&bull;</span>
        <a href="/termos">Termos</a>
        <span class="link-separator">&bull;</span>
        <button type="button" class="footer-preferences-link" data-open-cookie-preferences>
          Preferências
        </button>
      </div>
    </div>
    <div class="footer-bottom-center">
      <span class="copyright">&copy; <span class="copyright-year">{new Date().getFullYear()}</span> Klout. Todos os direitos reservados.</span>
    </div>
    <div class="footer-bottom-right">
      <div class="footer-credit">
        <div class="credit-badge">
          <HSBadge size="compact" />
        </div>
        <a href="https://moura.dev" target="_blank" rel="noopener noreferrer" class="credit-text">MOURA</a>
      </div>
    </div>
  </div>
</footer>

<style>
  footer {
    width: 100vw;
    max-width: 100%;
    position: relative;
    background: hsl(214, 61%, 4%);
    --footer-muted: hsl(214, 18%, 68%);
    --footer-subtle: hsl(214, 15%, 60%);
    --footer-rule: hsl(214, 22%, 34%);
    margin: 0;
    box-sizing: border-box;
    z-index: 10;
  }

	.footer-main {
		display: grid;
		grid-template-columns: auto minmax(320px, 500px) auto;
		align-items: center;
		justify-content: space-between;
		padding: 3rem 4rem;
		gap: 4rem;
	}

	.footer-positioning {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.75rem;
		max-width: 32rem;
		margin: 0 auto;
	}

	.positioning-kicker {
		margin: 0;
		font-family: 'Proxima Nova', sans-serif;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: hsl(45, 30%, 58%);
	}

	.positioning-title {
		margin: 0;
		font-family: 'IBM Plex Serif', serif;
		font-size: 1.2rem;
		font-weight: 400;
		line-height: 1.4;
		letter-spacing: 0.01em;
		color: hsl(214, 61%, 90%);
		max-width: 31ch;
		text-wrap: balance;
	}

  .footer-bottom {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 1.5rem;
    padding: 2rem 4rem;
    border-top: none;
    position: relative;
  }

  /* Gradiente que fade nas laterais (melhoria 5) */
  .footer-bottom::before {
    content: '';
    position: absolute;
    top: 0;
    left: 5%;
    right: 5%;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--footer-rule), transparent);
  }

  .footer-bottom-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
  }

  .footer-bottom-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .footer-credit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.45rem;
  }

  .credit-badge {
    margin-bottom: 0;
  }

  .credit-text {
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    color: hsl(0, 0%, 88%);
    background: linear-gradient(
      180deg,
      hsl(0, 0%, 96%) 0%,
      hsl(0, 0%, 82%) 48%,
      hsl(214, 10%, 68%) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.28em;
    line-height: 1;
    text-transform: uppercase;
    text-decoration: none;
    text-shadow:
      0 0 14px hsla(0, 0%, 100%, 0.08),
      0 0 28px hsla(214, 18%, 82%, 0.08);
  }

  .footer-credit a {
    color: hsl(214, 40%, 60%);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-credit .credit-text {
    color: hsl(0, 0%, 88%);
  }

  .footer-credit a:hover {
    color: hsl(42, 34%, 62%);
  }

  .footer-logo {
    flex-shrink: 0;
  }

  .footer-logo img {
    width: 180px;
    height: auto;
    object-fit: contain;
  }

  .social-icons {
    display: flex;
    gap: 1.2rem;
    margin-top: 0.3rem;
  }

  .social-icons a {
    color: var(--footer-subtle);
    transition: color 0.3s ease, transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .social-icons a svg {
    width: 22px;
    height: 22px;
  }

  .social-icons a:hover {
    color: hsl(214, 60%, 75%);
    transform: translateY(-1px);
  }

  .footer-contact {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    text-align: right;
    align-items: flex-end;
  }

  .about-link {
    font-size: 1.1rem;
    font-weight: 500;
    color: hsl(42, 44%, 62%);
    text-decoration: none;
    letter-spacing: 0.03em;
    transition: color 0.3s ease;
    margin-bottom: 0.5rem;
  }

  .about-link:hover {
    color: hsl(42, 52%, 72%);
  }

  .contact-line {
    font-size: 0.85rem;
    font-weight: 300;
    color: var(--footer-muted);
    letter-spacing: 0.02em;
    line-height: 1.7;
    margin: 0;
  }

  .contact-link {
    color: hsl(214, 40%, 65%);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .contact-link:hover {
    color: hsl(214, 60%, 75%);
  }

  .copyright {
    font-size: 0.8rem;
    font-weight: 300;
    color: var(--footer-muted);
    letter-spacing: 0.02em;
  }

  .copyright-year {
    white-space: nowrap; /* Melhoria 8 */
  }

  .footer-bottom-links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-width: 0;
  }

  /* Underline no hover (melhoria 4) + micro-interação (melhoria 6) */
  .footer-bottom-links a,
  .footer-preferences-link {
    font-size: 0.75rem;
    font-weight: 300;
    color: var(--footer-muted);
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: color 0.3s ease, opacity 0.3s ease;
    position: relative;
  }

  .footer-preferences-link {
    padding: 0;
    border: 0;
    background: transparent;
    font-family: inherit;
    cursor: pointer;
  }

  .footer-bottom-links a::after,
  .footer-preferences-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: hsl(214, 60%, 75%);
    transition: width 0.3s ease;
  }

  .footer-bottom-links a:hover,
  .footer-preferences-link:hover {
    color: hsl(214, 60%, 75%);
    opacity: 0.9;
  }

  .footer-bottom-links a:hover::after,
  .footer-preferences-link:hover::after {
    width: 100%;
  }

  .link-separator {
    font-size: 0.75rem;
    color: var(--footer-subtle);
  }

  .footer-bottom-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  /* Responsividade (melhoria 1) */
	@media (max-width: 768px) {
    footer {
      overflow: hidden;
    }

		.footer-main {
			grid-template-columns: 1fr;
			padding: 2.5rem 1.5rem 2rem;
			gap: 1.75rem;
      justify-items: center;
		}

    .footer-logo {
      order: 1;
      display: flex;
      justify-content: center;
    }

    .footer-logo img {
      width: 148px;
    }

		.footer-positioning {
      order: 2;
			max-width: 100%;
			margin: 0 auto;
      gap: 0.65rem;
      text-align: center;
		}

		.positioning-kicker {
      display: none;
		}

		.positioning-title {
			font-size: 1.05rem;
      line-height: 1.3;
			max-width: 24ch;
		}

		.footer-contact {
      order: 3;
			text-align: center;
      align-items: center;
      gap: 0.8rem;
      width: 100%;
      max-width: 22rem;
    }

    .about-link {
      margin-bottom: 0.15rem;
      font-size: 1rem;
    }

    .contact-line {
      font-size: 0.82rem;
      line-height: 1.6;
    }

    .social-icons {
      margin-top: 0.5rem;
      gap: 1rem;
      justify-content: center;
    }

    .social-icons a svg {
      width: 20px;
      height: 20px;
    }

    .footer-bottom {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 1.5rem 1.5rem 2rem;
      text-align: center;
    }

    .footer-bottom-left {
      order: 2;
      justify-content: center;
    }

    .footer-bottom-center {
      order: 1;
      justify-content: center;
    }

    .footer-bottom-right {
      order: 3;
      justify-content: center;
    }

    .footer-bottom-links {
      flex-wrap: wrap;
      justify-content: center;
    }

    .copyright {
      font-size: 0.76rem;
      line-height: 1.6;
    }

    .footer-credit {
      gap: 0.55rem;
    }

    .credit-text {
      font-size: 0.72rem;
      text-align: center;
    }

    .footer-bottom::before {
      left: 15%;
      right: 15%;
    }
  }
</style>
