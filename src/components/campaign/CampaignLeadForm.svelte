<script lang="ts">
  import { getStoredAttribution } from '../../lib/attribution';

  let {
    landingId,
    variantId,
    thesis,
    title,
    description,
    ctaLabel,
  }: {
    landingId: string;
    variantId: string;
    thesis: string;
    title: string;
    description: string;
    ctaLabel: string;
  } = $props();

  const FORM_ID = import.meta.env.PUBLIC_JOTFORM_B2B_CAMPAIGN_FORM_ID
    || import.meta.env.PUBLIC_JOTFORM_B2B_FORM_ID
    || '261337328053050';

  let nome = $state('');
  let empresa = $state('');
  let cargo = $state('');
  let email = $state('');
  let telefone = $state('');
  let faixaVidas = $state('');
  let website = $state('');
  let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const cargoOptions = [
    'Sócio(a) / Founder',
    'Diretoria / C-level',
    'RH / People',
    'Financeiro / Compras',
    'Benefícios / Operações',
    'Gestão geral / Administrativo',
  ];

  const vidasOptions = ['1–9', '10–29', '30–99', '100–299', '300+'];

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function splitName(value: string) {
    const parts = value.trim().split(/\s+/);
    return { first: parts.shift() || '', last: parts.join(' ') || '-' };
  }

  function addField(form: HTMLFormElement, name: string, value: string) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  function pushConversionEvent() {
    const dataLayer = (window as Window & { dataLayer?: Array<Record<string, string>> }).dataLayer
      || ((window as Window & { dataLayer?: Array<Record<string, string>> }).dataLayer = []);
    dataLayer.push({
      event: 'generate_lead',
      landing_id: landingId,
      variant_id: variantId,
      thesis,
      form_id: FORM_ID,
    });
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (status === 'submitting' || website) return;

    const sourceForm = event.currentTarget as HTMLFormElement;
    if (!sourceForm.reportValidity()) return;

    status = 'submitting';

    try {
      const targetName = `jotform-campaign-${Date.now()}`;
      const iframe = document.createElement('iframe');
      const form = document.createElement('form');
      const attribution = getStoredAttribution();
      const name = splitName(nome);
      let submissionStarted = false;

      iframe.name = targetName;
      iframe.hidden = true;
      iframe.setAttribute('aria-hidden', 'true');

      form.method = 'post';
      form.action = `https://submit.jotform.com/submit/${FORM_ID}`;
      form.target = targetName;
      form.acceptCharset = 'utf-8';
      form.hidden = true;

      addField(form, 'formID', FORM_ID);
      addField(form, 'simple_spc', `${FORM_ID}-${FORM_ID}`);
      addField(form, 'website', website);
      addField(form, 'submitSource', 'site-klout-campaign');
      addField(form, 'q3_nome[first]', name.first);
      addField(form, 'q3_nome[last]', name.last);
      addField(form, 'q4_telefone[full]', telefone);
      addField(form, 'q5_email', email);
      addField(form, 'q6_cargo', cargo);
      addField(form, 'q8_razaoSocial', empresa);
      addField(form, 'q14_numeroDe', faixaVidas);
      addField(form, 'q15_tipo', 'b2b-campaign');
      addField(form, 'q16_origem', window.location.pathname);
      addField(form, 'landing_id', landingId);
      addField(form, 'variant_id', variantId);
      addField(form, 'thesis', thesis);

      if (attribution) {
        addField(form, 'q17_visitor_id', attribution.visitorId);
        addField(form, 'q18_first_landing', attribution.firstLanding);
        addField(form, 'q19_first_referrer', attribution.firstReferrer);
        addField(form, 'q20_utm_source', attribution.utm_source);
        addField(form, 'q21_utm_medium', attribution.utm_medium);
        addField(form, 'q22_utm_campaign', attribution.utm_campaign);
        addField(form, 'q23_utm_content', attribution.utm_content);
        addField(form, 'q24_utm_term', attribution.utm_term);
        addField(form, 'q25_gclid', attribution.gclid);
      }

      const completed = new Promise<void>((resolve) => {
        const timeout = window.setTimeout(resolve, 3500);
        iframe.addEventListener('load', () => {
          if (!submissionStarted) return;
          window.clearTimeout(timeout);
          window.setTimeout(resolve, 250);
        }, { once: true });
      });

      document.body.append(iframe, form);
      submissionStarted = true;
      form.submit();
      await completed;
      form.remove();
      window.setTimeout(() => iframe.remove(), 500);

      pushConversionEvent();
      status = 'success';
    } catch {
      status = 'error';
    }
  }
</script>

<div class="campaign-form-shell" id="diagnostico">
  {#if status === 'success'}
    <div class="campaign-form-success" role="status" aria-live="polite">
      <p class="form-kicker">Solicitação recebida</p>
      <h2>Agora a leitura começa com a Klout.</h2>
      <p>Nosso time entrará em contato em até um dia útil para entender o contexto da empresa.</p>
      <a href="https://wa.me/5511925506721?text=Olá%2C%20acabei%20de%20solicitar%20um%20diagnóstico%20pelo%20site%20da%20Klout." target="_blank" rel="noopener noreferrer">
        Falar pelo WhatsApp
      </a>
    </div>
  {:else}
    <header class="campaign-form-header">
      <p class="form-kicker">Diagnóstico inicial</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>

    <form onsubmit={submit} novalidate>
      <div class="form-grid">
        <label>
          <span>Nome completo</span>
          <input bind:value={nome} name="nome" autocomplete="name" required placeholder="Como podemos chamar você?" />
        </label>
        <label>
          <span>Empresa</span>
          <input bind:value={empresa} name="empresa" autocomplete="organization" required placeholder="Nome da empresa" />
        </label>
        <label>
          <span>Cargo / função</span>
          <select bind:value={cargo} name="cargo" required>
            <option value="" disabled>Selecione seu contexto</option>
            {#each cargoOptions as option}<option value={option}>{option}</option>{/each}
          </select>
        </label>
        <label>
          <span>Faixa de vidas</span>
          <select bind:value={faixaVidas} name="faixaVidas" required>
            <option value="" disabled>Titulares + dependentes</option>
            {#each vidasOptions as option}<option value={option}>{option} vidas</option>{/each}
          </select>
        </label>
        <label>
          <span>E-mail corporativo</span>
          <input bind:value={email} name="email" type="email" autocomplete="email" required placeholder="voce@empresa.com.br" />
        </label>
        <label>
          <span>WhatsApp</span>
          <input
            value={telefone}
            oninput={(event) => telefone = formatPhone((event.currentTarget as HTMLInputElement).value)}
            name="telefone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            minlength="14"
            maxlength="15"
            required
            placeholder="(11) 00000-0000"
          />
        </label>
      </div>

      <label class="honeypot" aria-hidden="true">
        Não preencha este campo
        <input bind:value={website} name="website" tabindex="-1" autocomplete="off" />
      </label>

      {#if status === 'error'}
        <p class="form-error" role="alert">Não foi possível concluir o envio. Tente novamente ou fale com a Klout pelo WhatsApp.</p>
      {/if}

      <div class="form-submit-row">
        <p>Ao enviar, você concorda com o uso dos dados para retorno comercial conforme a <a href="/privacidade">Política de Privacidade</a>.</p>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Enviando…' : ctaLabel}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 14 0m-6-6 6 6-6 6" /></svg>
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .campaign-form-shell { width: min(100%, 1180px); margin: 0 auto; padding: clamp(2.25rem, 5vw, 4.5rem); box-sizing: border-box; background: hsl(0, 0%, 100%); color: hsl(214, 34%, 12%); }
  .campaign-form-header { display: grid; grid-template-columns: minmax(0, .85fr) minmax(18rem, 1.15fr); gap: 1rem 4rem; align-items: end; margin-bottom: 2.4rem; }
  .campaign-form-header h2, .campaign-form-success h2 { margin: 0; max-width: 13ch; font: 400 clamp(2rem, 4vw, 3.4rem)/.98 'IBM Plex Serif', serif; letter-spacing: 0; }
  .campaign-form-header > p:last-child { margin: 0; max-width: 32rem; color: hsl(214, 18%, 38%); font: 400 1rem/1.65 'Proxima Nova', sans-serif; }
  .form-kicker { grid-column: 1 / -1; margin: 0; color: hsl(214, 54%, 27%); font: 600 .64rem/1 'IBM Plex Mono', monospace; letter-spacing: .15em; text-transform: uppercase; }
  form { display: grid; gap: 1.6rem; }
  .form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.15rem 1.5rem; }
  label { display: grid; gap: .55rem; min-width: 0; }
  label > span { color: hsl(214, 22%, 28%); font: 600 .68rem/1.2 'Proxima Nova', sans-serif; letter-spacing: .08em; text-transform: uppercase; }
  input, select { width: 100%; min-height: 3.25rem; box-sizing: border-box; border: 0; border-bottom: 1px solid hsl(214, 16%, 76%); border-radius: 0; background: transparent; color: hsl(214, 34%, 13%); font: 400 1rem/1.2 'Proxima Nova', sans-serif; outline: none; transition: border-color .2s ease; }
  input:focus, select:focus { border-bottom-color: hsl(214, 62%, 28%); }
  input::placeholder { color: hsl(214, 12%, 53%); }
  select { cursor: pointer; }
  .honeypot { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .form-submit-row { display: flex; justify-content: space-between; align-items: center; gap: 2rem; padding-top: .5rem; }
  .form-submit-row p { max-width: 36rem; margin: 0; color: hsl(214, 12%, 48%); font: 400 .76rem/1.55 'Proxima Nova', sans-serif; }
  .form-submit-row a { color: inherit; }
  button, .campaign-form-success a { min-height: 3.2rem; display: inline-flex; align-items: center; justify-content: center; gap: .8rem; border: 0; border-radius: 4px; padding: .85rem 1.2rem; background: hsl(214, 61%, 18%); color: white; font: 600 .76rem/1 'Proxima Nova', sans-serif; letter-spacing: .05em; text-decoration: none; cursor: pointer; }
  button svg { width: 1.1rem; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  button:disabled { opacity: .55; cursor: wait; }
  .form-error { margin: 0; color: hsl(0, 56%, 42%); font: 500 .84rem/1.5 'Proxima Nova', sans-serif; }
  .campaign-form-success { min-height: 22rem; display: grid; align-content: center; justify-items: start; gap: 1.2rem; }
  .campaign-form-success p { max-width: 36rem; margin: 0; color: hsl(214, 18%, 38%); font: 400 1rem/1.65 'Proxima Nova', sans-serif; }
  @media (max-width: 900px) { .campaign-form-header { grid-template-columns: 1fr; gap: 1rem; } .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 620px) { .campaign-form-shell { padding: 2.5rem 1.25rem; } .form-grid { grid-template-columns: 1fr; } .form-submit-row { align-items: stretch; flex-direction: column; } button { width: 100%; } }
</style>
