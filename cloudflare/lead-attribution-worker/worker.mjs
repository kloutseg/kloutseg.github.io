const FORM_CONFIG = {
  '261337164438055': {
    leadType: 'b2c',
    fields: {
      visitorId: ['q19_visitor_id', 'visitor_id'],
      firstLanding: ['q20_insiraUma20', 'first_landing'],
      firstReferrer: ['q21_insiraUma21', 'first_referrer'],
      utmSource: ['q22_insiraUma22', 'utm_source'],
      utmMedium: ['q23_insiraUma23', 'utm_medium'],
      utmCampaign: ['q24_insiraUma24', 'utm_campaign'],
      utmContent: ['q25_insiraUma25', 'utm_content'],
      utmTerm: ['q26_insiraUma26', 'utm_term'],
      gclid: ['q27_insiraUma27', 'gclid'],
    },
  },
  '261337328053050': {
    leadType: 'b2b',
    fields: {
      visitorId: ['q17_visitor_id', 'visitor_id'],
      firstLanding: ['q18_first_landing', 'first_landing'],
      firstReferrer: ['q19_first_referrer', 'first_referrer'],
      utmSource: ['q20_utm_source', 'utm_source'],
      utmMedium: ['q21_utm_medium', 'utm_medium'],
      utmCampaign: ['q22_utm_campaign', 'utm_campaign'],
      utmContent: ['q23_utm_content', 'utm_content'],
      utmTerm: ['q24_utm_term', 'utm_term'],
      gclid: ['q25_gclid', 'gclid'],
    },
  },
  '262233413435045': {
    leadType: 'b2b',
    capturesCampaignContext: true,
    fields: {
      lifeRange: ['q5_q5_radio3', 'life_range'],
      submissionOrigin: ['q11_q11_textbox9', 'submission_origin'],
      visitorId: ['q12_q12_textbox10', 'visitor_id'],
      firstLanding: ['q13_q13_textbox11', 'first_landing'],
      firstReferrer: ['q14_q14_textbox12', 'first_referrer'],
      utmSource: ['q15_q15_textbox13', 'utm_source'],
      utmMedium: ['q16_q16_textbox14', 'utm_medium'],
      utmCampaign: ['q17_q17_textbox15', 'utm_campaign'],
      utmContent: ['q18_q18_textbox16', 'utm_content'],
      utmTerm: ['q19_q19_textbox17', 'utm_term'],
      gclid: ['q20_q20_textbox18', 'gclid'],
    },
  },
};

const MAX_FIELD_LENGTH = 500;
const ATTRIBUTION_RETENTION_DAYS = 180;
const GCLID_RETENTION_DAYS = 90;

const CLASSIFICATION_VERSION = 'b2b50_v1';
const ORIGIN_VERSION = 'campaign_origin_v1';

const LIFE_RANGE_CLASSIFICATIONS = {
  '1–9': { lifeRange: '1_9', leadSizeSegment: 'sb2b' },
  '10–29': { lifeRange: '10_29', leadSizeSegment: 'sb2b' },
  '30–49': { lifeRange: '30_49', leadSizeSegment: 'sb2b' },
  '50–99': { lifeRange: '50_99', leadSizeSegment: 'b2b50' },
  '100–299': { lifeRange: '100_299', leadSizeSegment: 'b2b50' },
  '300+': { lifeRange: '300_plus', leadSizeSegment: 'b2b50' },
};

const CAMPAIGN_ORIGIN_REGISTRY = {
  '/empresas/custos/reajuste': {
    landingId: 'b2b-custos-reajuste',
    thesis: 'renovacao-como-decisao-empresarial',
    variants: {
      tecnica: 'reajuste-tecnica',
      sensorial: 'reajuste-sensorial',
    },
  },
  '/empresas/custos/previsibilidade': {
    landingId: 'b2b-custos-previsibilidade',
    variantId: 'previsibilidade',
    thesis: 'klout',
  },
  '/empresas/custos/crescimento': {
    landingId: 'b2b-custos-crescimento',
    variantId: 'crescimento',
    thesis: 'klout',
  },
  '/empresas/beneficios/talentos': {
    landingId: 'b2b-beneficios-talentos',
    variantId: 'talentos',
    thesis: 'klout',
  },
  '/empresas/beneficios/equilibrio': {
    landingId: 'b2b-beneficios-equilibrio',
    variantId: 'equilibrio',
    thesis: 'klout',
  },
  '/empresas/beneficios/bradesco-saude': {
    landingId: 'b2b-beneficios-bradesco-saude',
    variantId: 'bradesco-saude',
    thesis: 'bradesco',
  },
  '/empresas/beneficios/alice': {
    landingId: 'b2b-beneficios-alice',
    variantId: 'alice',
    thesis: 'alice',
  },
};

const ALLOWED_ORIGIN_HOSTS = new Set(['kloutseguros.com.br', 'www.kloutseguros.com.br']);

function emptyCampaignContext() {
  return {
    lifeRangeRaw: null,
    lifeRange: null,
    leadSizeSegment: null,
    classificationStatus: null,
    classificationVersion: null,
    submissionOrigin: null,
    landingId: null,
    variantId: null,
    thesis: null,
    originStatus: null,
    originVersion: null,
    experimentForced: null,
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function truncate(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function normalizeLifeRange(value) {
  const lifeRangeRaw = truncate(value);
  const normalized = lifeRangeRaw
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .replace(/\s+vidas?$/i, '')
    .replace(/\s*[-‐‑‒–—]\s*/g, '–')
    .replace(/\s*\+\s*/g, '+')
    .trim();

  if (!lifeRangeRaw) {
    return {
      lifeRangeRaw: null,
      lifeRange: 'unknown',
      leadSizeSegment: 'unclassified',
      classificationStatus: 'missing',
      classificationVersion: CLASSIFICATION_VERSION,
    };
  }

  const classification = LIFE_RANGE_CLASSIFICATIONS[normalized];
  if (classification) {
    return {
      lifeRangeRaw,
      ...classification,
      classificationStatus: 'classified',
      classificationVersion: CLASSIFICATION_VERSION,
    };
  }

  if (normalized === '30–99') {
    return {
      lifeRangeRaw,
      lifeRange: 'legacy_30_99',
      leadSizeSegment: 'unclassified',
      classificationStatus: 'ambiguous_legacy',
      classificationVersion: CLASSIFICATION_VERSION,
    };
  }

  return {
    lifeRangeRaw,
    lifeRange: 'unknown',
    leadSizeSegment: 'unclassified',
    classificationStatus: 'invalid',
    classificationVersion: CLASSIFICATION_VERSION,
  };
}

function normalizeSubmissionOrigin(value) {
  const submissionOrigin = truncate(value);
  const baseResult = {
    submissionOrigin: submissionOrigin || null,
    landingId: null,
    variantId: null,
    thesis: null,
    originStatus: submissionOrigin ? 'invalid' : 'missing',
    originVersion: ORIGIN_VERSION,
    experimentForced: null,
  };
  if (!submissionOrigin) return baseResult;

  let parsed;
  try {
    parsed = new URL(submissionOrigin, 'https://kloutseguros.com.br');
  } catch {
    return baseResult;
  }

  if (!ALLOWED_ORIGIN_HOSTS.has(parsed.hostname.toLowerCase())) return baseResult;

  const pathname = parsed.pathname.length > 1
    ? parsed.pathname.replace(/\/+$/, '')
    : parsed.pathname;
  const originConfig = CAMPAIGN_ORIGIN_REGISTRY[pathname];
  if (!originConfig) return baseResult;

  const recognized = {
    ...baseResult,
    landingId: originConfig.landingId,
    thesis: originConfig.thesis,
  };

  if (!originConfig.variants) {
    if (parsed.search || parsed.hash) return recognized;
    return {
      ...recognized,
      variantId: originConfig.variantId,
      originStatus: 'recognized',
    };
  }

  if (parsed.hash) return recognized;
  const allowedKeys = new Set(['variant', 'experiment_forced']);
  if (Array.from(parsed.searchParams.keys()).some((key) => !allowedKeys.has(key))) return recognized;

  const variants = parsed.searchParams.getAll('variant');
  if (variants.length === 0) {
    return { ...recognized, originStatus: 'legacy_missing_variant' };
  }
  if (variants.length !== 1 || !originConfig.variants[variants[0]]) return recognized;

  const forcedValues = parsed.searchParams.getAll('experiment_forced');
  if (forcedValues.length === 0) {
    return {
      ...recognized,
      variantId: originConfig.variants[variants[0]],
      originStatus: 'legacy_missing_forced_flag',
    };
  }
  if (forcedValues.length !== 1 || !['true', 'false'].includes(forcedValues[0])) return recognized;

  return {
    ...recognized,
    variantId: originConfig.variants[variants[0]],
    originStatus: 'recognized',
    experimentForced: forcedValues[0] === 'true' ? 1 : 0,
  };
}

function parseJson(value) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string' || !value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function readWebhook(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const envelope = await request.json();
    const raw = parseJson(envelope.rawRequest);
    return {
      envelope,
      raw: Object.keys(raw).length > 0 ? raw : envelope,
    };
  }

  const formData = await request.formData();
  const envelope = Object.fromEntries(
    Array.from(formData.entries(), ([key, value]) => [key, typeof value === 'string' ? value : '']),
  );

  return { envelope, raw: parseJson(envelope.rawRequest) };
}

function firstValue(payload, keys, maxLength = MAX_FIELD_LENGTH) {
  for (const key of keys) {
    const rawValue = payload.raw[key];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      return truncate(rawValue, maxLength);
    }

    const envelopeValue = payload.envelope[key];
    if (envelopeValue !== undefined && envelopeValue !== null && envelopeValue !== '') {
      return truncate(envelopeValue, maxLength);
    }
  }

  return '';
}

function normalizeSubmission(payload) {
  const formId = firstValue(payload, ['formID', 'formId'], 40);
  const config = FORM_CONFIG[formId];
  if (!config) return { error: 'Formulário não autorizado.' };

  const submissionId = firstValue(payload, ['submissionID', 'submissionId'], 100);
  if (!submissionId) return { error: 'submissionID ausente.' };

  const field = (name) => firstValue(payload, config.fields[name] || []);
  const campaignContext = config.capturesCampaignContext
    ? {
        ...normalizeLifeRange(field('lifeRange')),
        ...normalizeSubmissionOrigin(field('submissionOrigin')),
      }
    : emptyCampaignContext();

  return {
    submissionId,
    formId,
    leadType: config.leadType,
    visitorId: field('visitorId'),
    firstLanding: field('firstLanding'),
    firstReferrer: field('firstReferrer'),
    utmSource: field('utmSource'),
    utmMedium: field('utmMedium'),
    utmCampaign: field('utmCampaign'),
    utmContent: field('utmContent'),
    utmTerm: field('utmTerm'),
    gclid: field('gclid'),
    ...campaignContext,
    submittedAt: firstValue(payload, ['created_at', 'createdAt']),
    receivedAt: new Date().toISOString(),
  };
}

function bearerToken(request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
}

async function receiveJotformWebhook(request, env) {
  if (!env.DB) return json({ ok: false, error: 'Binding D1 DB ausente.' }, 500);

  let payload;
  try {
    payload = await readWebhook(request);
  } catch {
    return json({ ok: false, error: 'Payload inválido.' }, 400);
  }

  const submission = normalizeSubmission(payload);
  if (submission.error) return json({ ok: false, error: submission.error }, 400);

  await env.DB.prepare(`
    insert into lead_attributions (
      submission_id, form_id, lead_type,
      life_range_raw, life_range, lead_size_segment, classification_status, classification_version,
      submission_origin, landing_id, variant_id, thesis, origin_status, origin_version,
      experiment_forced,
      visitor_id, first_landing, first_referrer,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid,
      submitted_at, received_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    on conflict(submission_id) do update set
      life_range_raw = coalesce(lead_attributions.life_range_raw, excluded.life_range_raw),
      life_range = case
        when lead_attributions.life_range_raw is null and excluded.life_range_raw is not null
        then excluded.life_range else lead_attributions.life_range end,
      lead_size_segment = case
        when lead_attributions.life_range_raw is null and excluded.life_range_raw is not null
        then excluded.lead_size_segment else lead_attributions.lead_size_segment end,
      classification_status = case
        when lead_attributions.life_range_raw is null and excluded.life_range_raw is not null
        then excluded.classification_status else lead_attributions.classification_status end,
      classification_version = case
        when lead_attributions.life_range_raw is null and excluded.life_range_raw is not null
        then excluded.classification_version else lead_attributions.classification_version end,
      submission_origin = coalesce(lead_attributions.submission_origin, excluded.submission_origin),
      landing_id = case
        when lead_attributions.submission_origin is null and excluded.submission_origin is not null
        then excluded.landing_id else lead_attributions.landing_id end,
      variant_id = case
        when lead_attributions.submission_origin is null and excluded.submission_origin is not null
        then excluded.variant_id else lead_attributions.variant_id end,
      thesis = case
        when lead_attributions.submission_origin is null and excluded.submission_origin is not null
        then excluded.thesis else lead_attributions.thesis end,
      origin_status = case
        when lead_attributions.submission_origin is null and excluded.submission_origin is not null
        then excluded.origin_status else lead_attributions.origin_status end,
      origin_version = case
        when lead_attributions.submission_origin is null and excluded.submission_origin is not null
        then excluded.origin_version else lead_attributions.origin_version end,
      experiment_forced = case
        when lead_attributions.submission_origin is null and excluded.submission_origin is not null
        then excluded.experiment_forced else lead_attributions.experiment_forced end,
      visitor_id = coalesce(lead_attributions.visitor_id, excluded.visitor_id),
      first_landing = coalesce(lead_attributions.first_landing, excluded.first_landing),
      first_referrer = coalesce(lead_attributions.first_referrer, excluded.first_referrer),
      utm_source = coalesce(lead_attributions.utm_source, excluded.utm_source),
      utm_medium = coalesce(lead_attributions.utm_medium, excluded.utm_medium),
      utm_campaign = coalesce(lead_attributions.utm_campaign, excluded.utm_campaign),
      utm_content = coalesce(lead_attributions.utm_content, excluded.utm_content),
      utm_term = coalesce(lead_attributions.utm_term, excluded.utm_term),
      gclid = coalesce(lead_attributions.gclid, excluded.gclid),
      submitted_at = coalesce(lead_attributions.submitted_at, excluded.submitted_at)
    where lead_attributions.form_id = excluded.form_id
  `).bind(
    submission.submissionId,
    submission.formId,
    submission.leadType,
    submission.lifeRangeRaw,
    submission.lifeRange,
    submission.leadSizeSegment,
    submission.classificationStatus,
    submission.classificationVersion,
    submission.submissionOrigin,
    submission.landingId,
    submission.variantId,
    submission.thesis,
    submission.originStatus,
    submission.originVersion,
    submission.experimentForced,
    submission.visitorId || null,
    submission.firstLanding || null,
    submission.firstReferrer || null,
    submission.utmSource || null,
    submission.utmMedium || null,
    submission.utmCampaign || null,
    submission.utmContent || null,
    submission.utmTerm || null,
    submission.gclid || null,
    submission.submittedAt || null,
    submission.receivedAt,
  ).run();

  return json({ ok: true });
}

async function listAttributions(request, env) {
  if (!env.ATTRIBUTION_API_TOKEN || bearerToken(request) !== env.ATTRIBUTION_API_TOKEN) {
    return json({ ok: false, error: 'Não autorizado.' }, 401);
  }
  if (!env.DB) return json({ ok: false, error: 'Binding D1 DB ausente.' }, 500);

  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit') || 100)));
  const { results } = await env.DB.prepare(`
    select submission_id, form_id, lead_type,
      life_range_raw, life_range, lead_size_segment, classification_status, classification_version,
      submission_origin, landing_id, variant_id, thesis, origin_status, origin_version,
      experiment_forced, visitor_id, first_landing, first_referrer,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid,
      submitted_at, received_at
    from lead_attributions
    order by received_at desc
    limit ?
  `).bind(limit).all();

  return json({ ok: true, attributions: results || [] });
}

async function purgeExpiredAttributions(env) {
  if (!env.DB) throw new Error('Binding D1 DB ausente.');

  const attributionCutoff = new Date(
    Date.now() - ATTRIBUTION_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const gclidCutoff = new Date(Date.now() - GCLID_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  return env.DB.batch([
    env.DB.prepare(`
      update lead_attributions
      set gclid = null
      where gclid is not null and received_at < ?
    `).bind(gclidCutoff),
    env.DB.prepare(`
      delete from lead_attributions
      where received_at < ?
    `).bind(attributionCutoff),
  ]);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true });
    }

    if (request.method === 'POST' && url.pathname.startsWith('/webhooks/jotform/')) {
      const token = decodeURIComponent(url.pathname.slice('/webhooks/jotform/'.length));
      if (!env.JOTFORM_WEBHOOK_TOKEN || token !== env.JOTFORM_WEBHOOK_TOKEN) {
        return json({ ok: false, error: 'Não autorizado.' }, 401);
      }
      return receiveJotformWebhook(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/attributions') {
      return listAttributions(request, env);
    }

    return json({ ok: false, error: 'Rota não encontrada.' }, 404);
  },

  async scheduled(_controller, env) {
    await purgeExpiredAttributions(env);
  },
};

export {
  normalizeLifeRange,
  normalizeSubmission,
  normalizeSubmissionOrigin,
  purgeExpiredAttributions,
  readWebhook,
  receiveJotformWebhook,
};
