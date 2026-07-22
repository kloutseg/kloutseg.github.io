<script lang="ts">
  import { onMount } from 'svelte';
  import { getStoredAttribution } from '../../lib/attribution';

  let {
    landingId = 'b2b-custos-reajuste',
    thesis = 'renovacao-como-decisao-empresarial',
  }: {
    landingId?: string;
    thesis?: string;
  } = $props();

  const FORM_ID = import.meta.env.PUBLIC_JOTFORM_B2B_CAMPAIGN_FORM_ID
    || import.meta.env.PUBLIC_JOTFORM_B2B_FORM_ID
    || '261337328053050';
  const configuredPreferenceField = import.meta.env.PUBLIC_JOTFORM_B2B_CONTACT_PREFERENCE_FIELD_NAME?.trim();
  const CONTACT_PREFERENCE_FIELD_NAME = configuredPreferenceField || 'contact_preference';

  let nome = $state('');
  let empresa = $state('');
  let cargo = $state('');
  let email = $state('');
  let telefone = $state('');
  let preferenciaContato = $state('');
  let website = $state('');
  let variantId = $state('reajuste-tecnica');
  let forcedAccess = $state(false);
  let formStarted = $state(false);
  let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const cargoOptions = [
    'Sócio(a) / Founder',
    'Diretoria / C-level',
    'RH / People',
    'Financeiro / Compras',
    'Benefícios / Operações',
    'Gestão geral / Administrativo',
  ];

  type TrackingPayload = Record<string, string | boolean>;
  type ExperimentWindow = Window & {
    dataLayer?: Array<TrackingPayload>;
    __kloutReajusteTrack?: (eventName: string, details?: TrackingPayload) => void;
  };

  onMount(() => {
    const root = document.documentElement;
    variantId = root.dataset.reajusteVariant === 'sensorial'
      ? 'reajuste-sensorial'
      : 'reajuste-tecnica';
    forcedAccess = root.dataset.reajusteForced === 'true';
  });

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    if (digits.length <= 10) {
      return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
    }
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
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

  function track(eventName: string, details: TrackingPayload = {}) {
    const target = window as ExperimentWindow;
    if (target.__kloutReajusteTrack) {
      target.__kloutReajusteTrack(eventName, details);
      return;
    }

    const dataLayer = target.dataLayer || (target.dataLayer = []);
    dataLayer.push({
      event: eventName,
      landing_id: landingId,
      variant_id: variantId,
      thesis,
      experiment_forced: forcedAccess,
      ...details,
    });
  }

  function markFormStart() {
    if (formStarted) return;
    formStarted = true;
    track('form_start', { form_id: FORM_ID });
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (status === 'submitting' || website) return;

    const sourceForm = event.currentTarget as HTMLFormElement;
    if (!sourceForm.reportValidity()) return;

    status = 'submitting';

    try {
      const targetName = 'jotform-reajuste-' + Date.now();
      const iframe = document.createElement('iframe');
      const form = document.createElement('form');
      const attribution = getStoredAttribution();
      const name = splitName(nome);
      let submissionStarted = false;
      let conversionSent = false;

      iframe.name = targetName;
      iframe.hidden = true;
      iframe.setAttribute('aria-hidden', 'true');

      form.method = 'post';
      form.action = 'https://submit.jotform.com/submit/' + FORM_ID;
      form.target = targetName;
      form.acceptCharset = 'utf-8';
      form.hidden = true;

      addField(form, 'formID', FORM_ID);
      addField(form, 'simple_spc', FORM_ID + '-' + FORM_ID);
      addField(form, 'website', website);
      addField(form, 'submitSource', 'site-klout-reajuste-experiment');
      addField(form, 'q3_nome[first]', name.first);
      addField(form, 'q3_nome[last]', name.last);
      addField(form, 'q4_telefone[full]', telefone);
      addField(form, 'q5_email', email);
      addField(form, 'q6_cargo', cargo);
      addField(form, 'q8_razaoSocial', empresa);
      addField(form, 'q15_tipo', 'b2b-campaign');
      addField(form, 'q16_origem', window.location.pathname);
      addField(form, 'landing_id', landingId);
      addField(form, 'variant_id', variantId);
      addField(form, 'thesis', thesis);
      addField(form, 'experiment_forced', forcedAccess ? 'true' : 'false');

      if (preferenciaContato) {
        addField(form, CONTACT_PREFERENCE_FIELD_NAME, preferenciaContato);
      }

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
        });
      });

      document.body.append(iframe, form);
      submissionStarted = true;
      form.submit();
      await completed;
      form.remove();
      window.setTimeout(() => iframe.remove(), 500);

      if (!conversionSent) {
        conversionSent = true;
        track('generate_lead', {
          form_id: FORM_ID,
          contact_preference: preferenciaContato || 'Não informada',
        });
      }
      status = 'success';
    } catch {
      status = 'error';
    }
  }
</script>

<div class="reajuste-form-shell" id="diagnostico">
  {#if status === 'success'}
    <div class="reajuste-form-success" role="status" aria-live="polite">
      <p class="form-kicker">Solicitação recebida</p>
      <h2>
        <span class="copy-tecnica">A revisão começa pela leitura do contexto.</span>
        <span class="copy-sensorial">A conversa já pode começar com mais tranquilidade.</span>
      </h2>
      <p>Um consultor da Klout entrará em contato em até um dia útil para entender o cenário da empresa.</p>
      <a
        href="https://wa.me/5511925506721?text=Ol%C3%A1%2C%20acabei%20de%20solicitar%20um%20diagn%C3%B3stico%20sobre%20o%20reajuste%20do%20plano%20da%20empresa."
        target="_blank"
        rel="noopener noreferrer"
        data-reajuste-cta
        data-cta-location="form-success"
      >
        Falar pelo WhatsApp
      </a>
    </div>
  {:else}
    <header class="reajuste-form-header">
      <p class="form-kicker">Diagnóstico inicial gratuito</p>
      <h2>
        <span class="copy-tecnica">Comece pela apólice vigente.</span>
        <span class="copy-sensorial">A primeira conversa pode ser simples.</span>
      </h2>
      <p>
        <span class="copy-tecnica">Deixe os dados essenciais. Um consultor retorna para organizar a leitura do contrato, sem compromisso de troca ou contratação.</span>
        <span class="copy-sensorial">Conte quem deve participar da conversa. A Klout combina o próximo passo com a rotina da sua empresa, sem compromisso.</span>
      </p>
    </header>

    <form onsubmit={submit} onfocusin={markFormStart} novalidate>
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
          <span>E-mail corporativo</span>
          <input bind:value={email} name="email" type="email" autocomplete="email" required placeholder="voce@empresa.com.br" />
        </label>

        <label>
          <span>Telefone ou celular</span>
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

        <fieldset>
          <legend>Preferência de contato <small>(opcional)</small></legend>
          <div class="preference-options">
            {#each ['WhatsApp', 'E-mail', 'Ligação'] as option}
              <label class="preference-option">
                <input type="radio" bind:group={preferenciaContato} name="preferenciaContato" value={option} />
                <span>{option}</span>
              </label>
            {/each}
          </div>
        </fieldset>
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
        <button
          type="submit"
          disabled={status === 'submitting'}
          data-reajuste-cta
          data-cta-location="form-submit"
        >
          <span class="copy-tecnica">{status === 'submitting' ? 'Enviando…' : 'Revisar meu contrato'}</span>
          <span class="copy-sensorial">{status === 'submitting' ? 'Enviando…' : 'Conversar com a Klout'}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 14 0m-6-6 6 6-6 6" /></svg>
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .copy-sensorial { display: none; }
  :global(html[data-reajuste-variant="sensorial"]) .copy-tecnica { display: none; }
  :global(html[data-reajuste-variant="sensorial"]) .copy-sensorial { display: inline; }

  .reajuste-form-shell {
    width: min(100%, 1120px);
    margin: 0 auto;
    padding: clamp(2rem, 5vw, 4.5rem);
    box-sizing: border-box;
    border: 1px solid hsla(210, 24%, 24%, .14);
    border-radius: 8px;
    background: hsl(0, 0%, 100%);
    color: hsl(212, 43%, 13%);
    box-shadow: 0 24px 70px hsla(214, 34%, 10%, .09);
  }

  :global(html[data-reajuste-variant="sensorial"]) .reajuste-form-shell {
    border-color: hsla(29, 22%, 40%, .15);
    border-radius: 28px;
    background:
      linear-gradient(145deg, hsla(0, 0%, 100%, .98), hsla(38, 34%, 96%, .98));
    box-shadow:
      0 28px 80px hsla(27, 30%, 22%, .12),
      inset 0 1px 0 hsla(0, 0%, 100%, .9);
  }

  .reajuste-form-header {
    display: grid;
    grid-template-columns: minmax(0, .9fr) minmax(20rem, 1.1fr);
    gap: 1rem 4rem;
    align-items: end;
    margin-bottom: 2.6rem;
  }

  .reajuste-form-header h2,
  .reajuste-form-success h2 {
    margin: 0;
    max-width: 13ch;
    font: 400 clamp(2.1rem, 4vw, 3.45rem)/1 'IBM Plex Serif', serif;
    letter-spacing: -.035em;
  }

  .reajuste-form-header > p:last-child,
  .reajuste-form-success > p {
    margin: 0;
    max-width: 35rem;
    color: hsl(212, 16%, 37%);
    font: 400 1rem/1.65 'Proxima Nova', sans-serif;
  }

  .form-kicker {
    grid-column: 1 / -1;
    margin: 0;
    color: hsl(211, 56%, 29%);
    font: 600 .67rem/1.2 'IBM Plex Mono', monospace;
    letter-spacing: .15em;
    text-transform: uppercase;
  }

  :global(html[data-reajuste-variant="sensorial"]) .form-kicker {
    color: hsl(27, 39%, 38%);
  }

  form {
    display: grid;
    gap: 1.8rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.35rem 2rem;
  }

  label {
    display: grid;
    gap: .55rem;
    min-width: 0;
  }

  label > span,
  legend {
    color: hsl(212, 24%, 27%);
    font: 600 .7rem/1.3 'Proxima Nova', sans-serif;
    letter-spacing: .07em;
    text-transform: uppercase;
  }

  legend small {
    font: inherit;
    letter-spacing: .025em;
    opacity: .68;
    text-transform: none;
  }

  input,
  select {
    width: 100%;
    min-height: 3.5rem;
    box-sizing: border-box;
    border: 1px solid hsl(211, 16%, 76%);
    border-radius: 4px;
    padding: .75rem .9rem;
    background: hsla(0, 0%, 100%, .72);
    color: hsl(212, 43%, 13%);
    font: 400 1rem/1.2 'Proxima Nova', sans-serif;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }

  input:focus,
  select:focus {
    border-color: hsl(211, 58%, 32%);
    box-shadow: 0 0 0 3px hsla(211, 58%, 38%, .14);
  }

  :global(html[data-reajuste-variant="sensorial"]) input:focus,
  :global(html[data-reajuste-variant="sensorial"]) select:focus {
    border-color: hsl(27, 42%, 42%);
    box-shadow: 0 0 0 3px hsla(27, 42%, 42%, .14);
  }

  input::placeholder { color: hsl(212, 11%, 52%); }
  select { cursor: pointer; }

  fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin-bottom: .7rem;
  }

  .preference-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: .55rem;
  }

  .preference-option {
    min-height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    border: 1px solid hsl(211, 16%, 76%);
    border-radius: 4px;
    padding: .55rem;
    background: hsla(0, 0%, 100%, .68);
    cursor: pointer;
  }

  :global(html[data-reajuste-variant="sensorial"]) .preference-option {
    border-radius: 999px;
  }

  .preference-option input {
    width: 1rem;
    min-height: 1rem;
    margin: 0;
    padding: 0;
    accent-color: hsl(211, 58%, 28%);
    box-shadow: none;
  }

  .preference-option span {
    font: 500 .84rem/1 'Proxima Nova', sans-serif;
    letter-spacing: 0;
    text-transform: none;
  }


  .honeypot {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .form-submit-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    padding-top: .25rem;
  }

  .form-submit-row p {
    max-width: 38rem;
    margin: 0;
    color: hsl(212, 11%, 46%);
    font: 400 .78rem/1.55 'Proxima Nova', sans-serif;
  }

  .form-submit-row a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    color: inherit;
  }

  button,
  .reajuste-form-success > a {
    min-height: 3.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .8rem;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: .9rem 1.25rem;
    background: hsl(212, 57%, 17%);
    color: white;
    font: 600 .78rem/1 'Proxima Nova', sans-serif;
    letter-spacing: .035em;
    text-decoration: none;
    cursor: pointer;
  }

  :global(html[data-reajuste-variant="sensorial"]) button,
  :global(html[data-reajuste-variant="sensorial"]) .reajuste-form-success > a {
    border-radius: 999px;
    background: hsl(27, 37%, 36%);
    box-shadow: 0 12px 28px hsla(27, 37%, 26%, .18);
  }

  button:focus-visible,
  .reajuste-form-success > a:focus-visible {
    outline: 3px solid hsl(42, 60%, 62%);
    outline-offset: 3px;
  }

  button svg {
    width: 1.1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  button:disabled {
    opacity: .55;
    cursor: wait;
  }

  .form-error {
    margin: 0;
    color: hsl(4, 58%, 38%);
    font: 500 .86rem/1.5 'Proxima Nova', sans-serif;
  }

  .reajuste-form-success {
    min-height: 25rem;
    display: grid;
    align-content: center;
    justify-items: start;
    gap: 1.25rem;
  }

  @media (max-width: 760px) {
    .reajuste-form-shell {
      padding: 2.2rem 1.1rem;
      border-radius: 0;
    }

    :global(html[data-reajuste-variant="sensorial"]) .reajuste-form-shell {
      border-radius: 22px;
    }

    .reajuste-form-header {
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .reajuste-form-header h2,
    .reajuste-form-success h2 {
      font-size: clamp(2rem, 9vw, 2.8rem);
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 1.1rem;
    }

    .preference-options {
      grid-template-columns: 1fr;
    }

    .preference-option {
      min-height: 3.25rem;
      justify-content: flex-start;
      padding-inline: 1rem;
    }

    .form-submit-row {
      align-items: stretch;
      flex-direction: column;
      gap: 1.2rem;
    }

    button {
      width: 100%;
      min-height: 3.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    input,
    select {
      transition: none;
    }
  }
</style>

