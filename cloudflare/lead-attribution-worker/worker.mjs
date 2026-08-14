import {
  DELIVERY_STATUSES,
  prepareGoogleDelivery,
  processGoogleDataManagerDeliveries,
  reconcileMissingGoogleDeliveries,
  requeueGoogleConfigurationBlocked,
} from './google-data-manager.mjs';

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
      gclidCapturedAt: [
        'q23_gclid_captured_at',
        'q23_q23_textbox20',
        'gclid_captured_at',
      ],
      adUserDataConsent: [
        'q22_ad_user_data_consent',
        'q22_q22_textbox19',
        'ad_user_data_consent',
      ],
    },
  },
};

const MAX_FIELD_LENGTH = 500;
const ATTRIBUTION_RETENTION_DAYS = 180;
const GCLID_RETENTION_DAYS = 90;

const CLASSIFICATION_VERSION = 'b2b50_v1';
const ORIGIN_VERSION = 'campaign_origin_v1';
const CAMPAIGN_FORM_ID = '262233413435045';
const CONVERSION_EVENT_NAMES = {
  created: 'lead_created',
  sb2b: 'lead_sb2b',
  b2b50: 'lead_b2b50',
};

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
    adUserDataConsent: null,
    gclidCapturedAt: null,
    isTest: null,
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
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

function normalizeAdUserDataConsent(value) {
  const normalized = truncate(value, 20).toLowerCase();
  return ['granted', 'denied'].includes(normalized) ? normalized : 'unknown';
}

function normalizeGclidCapturedAt(value, now = Date.now()) {
  const raw = truncate(value, 50);
  if (!raw) return null;

  const timestamp = Date.parse(raw);
  if (
    !Number.isFinite(timestamp)
    || timestamp > now + 5 * 60 * 1000
    || timestamp < now - GCLID_RETENTION_DAYS * 24 * 60 * 60 * 1000
  ) return null;
  return new Date(timestamp).toISOString();
}

function detectTestSubmission(submission) {
  const source = truncate(submission.utmSource, 100).toLowerCase();
  const medium = truncate(submission.utmMedium, 100).toLowerCase();
  const campaign = truncate(submission.utmCampaign, 200).toLowerCase();
  const qaTuple = ['qa', 'test'].includes(source)
    && medium === 'internal'
    && (campaign.startsWith('qa_') || campaign.startsWith('test_'));
  if (qaTuple) return 1;

  const hasTestPrefix = (value) => /^(qa|test)[-_:]/i.test(truncate(value, 200));
  return hasTestPrefix(submission.submissionId) || hasTestPrefix(submission.visitorId) ? 1 : 0;
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

  const submission = {
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

  if (config.capturesCampaignContext) {
    submission.adUserDataConsent = normalizeAdUserDataConsent(field('adUserDataConsent'));
    submission.gclidCapturedAt = submission.gclid
      ? normalizeGclidCapturedAt(field('gclidCapturedAt'))
      : null;
    if (!submission.gclidCapturedAt) submission.gclid = '';
    submission.isTest = detectTestSubmission(submission);
  }

  return submission;
}

function bearerToken(request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
}

function parseLimit(url, fallback = 100) {
  const raw = url.searchParams.get('limit');
  if (raw === null || raw === '') return { value: fallback };
  if (!/^\d+$/.test(raw)) return { error: 'limit deve ser um número inteiro entre 1 e 500.' };

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > 500) {
    return { error: 'limit deve ser um número inteiro entre 1 e 500.' };
  }
  return { value };
}

function conversionEventId(submissionId, eventName) {
  return `klout:v1:jotform:${CAMPAIGN_FORM_ID}:${submissionId}:${eventName}`;
}

function stableShortHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

async function retentionTombstoneKey(formId, submissionId) {
  const input = new TextEncoder().encode(formId + ':' + submissionId);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function compactSubmissionId(submissionId) {
  const normalized = truncate(submissionId, 100);
  if (normalized.length <= 44) return normalized;
  return normalized.slice(0, 32) + '-' + stableShortHash(normalized);
}

function conversionTransactionId(submissionId, eventName) {
  const suffix = {
    lead_created: 'c',
    lead_sb2b: 's',
    lead_b2b50: '50',
  }[eventName];
  return 'jf:' + compactSubmissionId(submissionId) + ':' + suffix;
}

function prepareConversionEvent(env, submission, eventName, requiredSegment = null) {
  const eventId = conversionEventId(submission.submissionId, eventName);
  const transactionId = conversionTransactionId(submission.submissionId, eventName);

  return env.DB.prepare(`
    insert into lead_conversion_events (
      event_id, submission_id, form_id, event_name, transaction_id,
      event_time, event_time_source, readiness, blocked_reason,
      classification_version, created_at, updated_at
    )
    select
      ?, submission_id, form_id, ?, ?,
      received_at, 'worker_received_at',
      case
        when is_test = 1 then 'blocked'
        when origin_status <> 'recognized' or origin_status is null then 'blocked'
        when not (
          (landing_id = 'b2b-beneficios-bradesco-saude' and variant_id = 'bradesco-saude')
          or (
            landing_id = 'b2b-custos-reajuste'
            and variant_id in ('reajuste-tecnica', 'reajuste-sensorial')
          )
        ) then 'blocked'
        else 'ready'
      end,
      case
        when is_test = 1 then 'test_submission'
        when origin_status <> 'recognized' or origin_status is null then 'integrity_conflict'
        when not (
          (landing_id = 'b2b-beneficios-bradesco-saude' and variant_id = 'bradesco-saude')
          or (
            landing_id = 'b2b-custos-reajuste'
            and variant_id in ('reajuste-tecnica', 'reajuste-sensorial')
          )
        ) then 'outside_pilot_scope'
        else null
      end,
      coalesce(classification_version, ?),
      received_at,
      ?
    from lead_attributions
    where submission_id = ?
      and form_id = ?
      and (? is null or lead_size_segment = ?)
    on conflict(event_id) do update set
      readiness = excluded.readiness,
      blocked_reason = excluded.blocked_reason,
      classification_version = excluded.classification_version,
      updated_at = excluded.updated_at
  `).bind(
    eventId,
    eventName,
    transactionId,
    CLASSIFICATION_VERSION,
    submission.receivedAt,
    submission.submissionId,
    CAMPAIGN_FORM_ID,
    requiredSegment,
    requiredSegment,
  );
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
  const retentionKey = await retentionTombstoneKey(submission.formId, submission.submissionId);

  const attributionStatement = env.DB.prepare(`
    insert into lead_attributions (
      submission_id, form_id, lead_type,
      life_range_raw, life_range, lead_size_segment, classification_status, classification_version,
      submission_origin, landing_id, variant_id, thesis, origin_status, origin_version,
      experiment_forced, ad_user_data_consent, is_test,
      visitor_id, first_landing, first_referrer,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, gclid_captured_at,
      submitted_at, received_at
    )
    select ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    where not exists (
      select 1
      from lead_retention_tombstones
      where retention_key = ?
    )
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
      ad_user_data_consent = case
        when excluded.ad_user_data_consent <> 'unknown'
        then excluded.ad_user_data_consent else lead_attributions.ad_user_data_consent end,
      is_test = max(lead_attributions.is_test, excluded.is_test),
      visitor_id = coalesce(lead_attributions.visitor_id, excluded.visitor_id),
      first_landing = coalesce(lead_attributions.first_landing, excluded.first_landing),
      first_referrer = coalesce(lead_attributions.first_referrer, excluded.first_referrer),
      utm_source = coalesce(lead_attributions.utm_source, excluded.utm_source),
      utm_medium = coalesce(lead_attributions.utm_medium, excluded.utm_medium),
      utm_campaign = coalesce(lead_attributions.utm_campaign, excluded.utm_campaign),
      utm_content = coalesce(lead_attributions.utm_content, excluded.utm_content),
      utm_term = coalesce(lead_attributions.utm_term, excluded.utm_term),
      gclid = case
        when excluded.gclid is null or excluded.gclid_captured_at is null
        then lead_attributions.gclid
        when lead_attributions.gclid_captured_at is null
          or excluded.gclid_captured_at > lead_attributions.gclid_captured_at
        then excluded.gclid
        else lead_attributions.gclid
      end,
      gclid_captured_at = case
        when excluded.gclid is null or excluded.gclid_captured_at is null
        then lead_attributions.gclid_captured_at
        when lead_attributions.gclid_captured_at is null
          or excluded.gclid_captured_at > lead_attributions.gclid_captured_at
        then excluded.gclid_captured_at
        else lead_attributions.gclid_captured_at
      end,
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
    submission.adUserDataConsent || 'unknown',
    submission.isTest ?? 0,
    submission.visitorId || null,
    submission.firstLanding || null,
    submission.firstReferrer || null,
    submission.utmSource || null,
    submission.utmMedium || null,
    submission.utmCampaign || null,
    submission.utmContent || null,
    submission.utmTerm || null,
    submission.gclid || null,
    submission.gclidCapturedAt,
    submission.submittedAt || null,
    submission.receivedAt,
    retentionKey,
  );

  const statements = [attributionStatement];
  if (submission.formId === CAMPAIGN_FORM_ID) {
    const createdEventId = conversionEventId(
      submission.submissionId,
      CONVERSION_EVENT_NAMES.created,
    );
    const sb2bEventId = conversionEventId(
      submission.submissionId,
      CONVERSION_EVENT_NAMES.sb2b,
    );
    const b2b50EventId = conversionEventId(
      submission.submissionId,
      CONVERSION_EVENT_NAMES.b2b50,
    );
    statements.push(
      prepareConversionEvent(env, submission, CONVERSION_EVENT_NAMES.created),
      prepareGoogleDelivery(env, createdEventId, submission.receivedAt),
      prepareConversionEvent(env, submission, CONVERSION_EVENT_NAMES.sb2b, 'sb2b'),
      prepareGoogleDelivery(env, sb2bEventId, submission.receivedAt),
      prepareConversionEvent(env, submission, CONVERSION_EVENT_NAMES.b2b50, 'b2b50'),
      prepareGoogleDelivery(env, b2b50EventId, submission.receivedAt),
    );
  }

  await env.DB.batch(statements);

  return json({ ok: true });
}

async function listAttributions(request, env) {
  if (!env.ATTRIBUTION_API_TOKEN || bearerToken(request) !== env.ATTRIBUTION_API_TOKEN) {
    return json({ ok: false, error: 'Não autorizado.' }, 401);
  }
  if (!env.DB) return json({ ok: false, error: 'Binding D1 DB ausente.' }, 500);

  const url = new URL(request.url);
  const limitResult = parseLimit(url);
  if (limitResult.error) return json({ ok: false, error: limitResult.error }, 400);
  const limit = limitResult.value;
  const { results } = await env.DB.prepare(`
    select submission_id, form_id, lead_type,
      life_range_raw, life_range, lead_size_segment, classification_status, classification_version,
      submission_origin, landing_id, variant_id, thesis, origin_status, origin_version,
      experiment_forced, ad_user_data_consent, is_test,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      case when gclid is not null and gclid <> '' then 1 else 0 end as has_gclid,
      gclid_captured_at,
      submitted_at, received_at
    from lead_attributions
    order by received_at desc
    limit ?
  `).bind(limit).all();

  return json({ ok: true, attributions: results || [] });
}

async function listConversionEvents(request, env) {
  if (!env.ATTRIBUTION_API_TOKEN || bearerToken(request) !== env.ATTRIBUTION_API_TOKEN) {
    return json({ ok: false, error: 'Não autorizado.' }, 401);
  }
  if (!env.DB) return json({ ok: false, error: 'Binding D1 DB ausente.' }, 500);

  const url = new URL(request.url);
  const limitResult = parseLimit(url);
  if (limitResult.error) return json({ ok: false, error: limitResult.error }, 400);
  const limit = limitResult.value;
  const readinessValues = url.searchParams.getAll('readiness');
  if (
    readinessValues.length > 1
    || (readinessValues.length === 1 && !['ready', 'blocked'].includes(readinessValues[0]))
  ) {
    return json({ ok: false, error: 'readiness deve ser ready ou blocked.' }, 400);
  }
  const readiness = readinessValues[0] || null;
  const hasReadinessFilter = readiness !== null;
  const whereClause = hasReadinessFilter ? 'where events.readiness = ?' : '';
  const statement = env.DB.prepare(`
    select
      events.event_id, events.submission_id, events.form_id, events.event_name,
      events.transaction_id, events.event_time, events.event_time_source,
      events.readiness, events.blocked_reason, events.classification_version,
      events.created_at, events.updated_at,
      attribution.life_range, attribution.lead_size_segment,
      attribution.landing_id, attribution.variant_id, attribution.thesis,
      attribution.origin_status, attribution.experiment_forced,
      attribution.ad_user_data_consent, attribution.is_test
    from lead_conversion_events as events
    join lead_attributions as attribution using (submission_id)
    ${whereClause}
    order by events.event_time desc, events.event_name
    limit ?
  `);
  const { results } = hasReadinessFilter
    ? await statement.bind(readiness, limit).all()
    : await statement.bind(limit).all();

  return json({ ok: true, events: results || [] });
}

async function listEventDeliveries(request, env) {
  if (!env.ATTRIBUTION_API_TOKEN || bearerToken(request) !== env.ATTRIBUTION_API_TOKEN) {
    return json({ ok: false, error: 'Não autorizado.' }, 401);
  }
  if (!env.DB) return json({ ok: false, error: 'Binding D1 DB ausente.' }, 500);

  const url = new URL(request.url);
  const limitResult = parseLimit(url);
  if (limitResult.error) return json({ ok: false, error: limitResult.error }, 400);
  const statusValues = url.searchParams.getAll('status');
  if (
    statusValues.length > 1
    || (statusValues.length === 1 && !DELIVERY_STATUSES.has(statusValues[0]))
  ) {
    return json({ ok: false, error: 'status de entrega inválido.' }, 400);
  }
  const status = statusValues[0] || null;
  const whereClause = status ? 'where deliveries.status = ?' : '';
  const statement = env.DB.prepare(`
    select
      deliveries.delivery_id, deliveries.event_id, deliveries.destination,
      deliveries.status, deliveries.blocked_reason,
      deliveries.attempt_count, deliveries.max_attempts,
      deliveries.poll_count, deliveries.max_polls,
      deliveries.next_attempt_at, deliveries.lease_expires_at,
      deliveries.provider_request_id, deliveries.provider_status,
      deliveries.last_http_status, deliveries.last_error_code,
      deliveries.last_error_detail, deliveries.payload_sha256,
      deliveries.accepted_at, deliveries.delivered_at,
      deliveries.created_at, deliveries.updated_at,
      events.event_name, events.readiness
    from lead_event_deliveries as deliveries
    join lead_conversion_events as events using (event_id)
    ${whereClause}
    order by deliveries.updated_at desc, deliveries.delivery_id
    limit ?
  `);
  const { results } = status
    ? await statement.bind(status, limitResult.value).all()
    : await statement.bind(limitResult.value).all();
  return json({ ok: true, deliveries: results || [] });
}

async function conversionReadiness(env) {
  if (!env.DB) throw new Error('Binding D1 DB ausente.');

  const { results } = await env.DB.prepare(`
    with expected_events(submission_id, event_name) as (
      select submission_id, 'lead_created'
      from lead_attributions
      where form_id = '262233413435045'

      union all

      select
        submission_id,
        case lead_size_segment
          when 'sb2b' then 'lead_sb2b'
          else 'lead_b2b50'
        end
      from lead_attributions
      where form_id = '262233413435045'
        and lead_size_segment in ('sb2b', 'b2b50')
    )
    select
      count(*) as missing_events,
      (select count(gclid_captured_at) from lead_attributions where 0) as click_time_probe,
      (select count(*) from lead_retention_tombstones where 0) as retention_probe,
      (select count(delivery_id) from lead_event_deliveries where 0) as delivery_probe,
      (select count(attempt_id) from lead_event_delivery_attempts where 0) as attempt_probe
    from expected_events as expected
    left join lead_conversion_events as events
      on events.submission_id = expected.submission_id
      and events.event_name = expected.event_name
    where events.event_id is null
  `).all();

  return Number(results?.[0]?.missing_events || 0);
}

async function reconcileMissingConversionEvents(env, maxBatches = 20) {
  if (!env.DB) throw new Error('Binding D1 DB ausente.');

  let reconciledSubmissions = 0;
  for (let batchIndex = 0; batchIndex < maxBatches; batchIndex += 1) {
    const { results } = await env.DB.prepare(`
      select attribution.submission_id, attribution.received_at
      from lead_attributions as attribution
      where attribution.form_id = '262233413435045'
        and (
          not exists (
            select 1 from lead_conversion_events as events
            where events.submission_id = attribution.submission_id
              and events.event_name = 'lead_created'
          )
          or (
            attribution.lead_size_segment = 'sb2b'
            and not exists (
              select 1 from lead_conversion_events as events
              where events.submission_id = attribution.submission_id
                and events.event_name = 'lead_sb2b'
            )
          )
          or (
            attribution.lead_size_segment = 'b2b50'
            and not exists (
              select 1 from lead_conversion_events as events
              where events.submission_id = attribution.submission_id
                and events.event_name = 'lead_b2b50'
            )
          )
        )
      order by attribution.received_at, attribution.submission_id
      limit 25
    `).all();

    if (!results || results.length === 0) break;

    const statements = [];
    for (const row of results) {
      const submission = {
        submissionId: row.submission_id,
        receivedAt: row.received_at,
      };
      statements.push(
        prepareConversionEvent(env, submission, CONVERSION_EVENT_NAMES.created),
        prepareConversionEvent(env, submission, CONVERSION_EVENT_NAMES.sb2b, 'sb2b'),
        prepareConversionEvent(env, submission, CONVERSION_EVENT_NAMES.b2b50, 'b2b50'),
      );
    }

    await env.DB.batch(statements);
    reconciledSubmissions += results.length;
    if (results.length < 25) break;
  }

  await reconcileMissingGoogleDeliveries(env);
  return reconciledSubmissions;
}

async function purgeExpiredAttributions(env) {
  if (!env.DB) throw new Error('Binding D1 DB ausente.');

  const attributionCutoff = new Date(
    Date.now() - ATTRIBUTION_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const gclidCutoff = new Date(Date.now() - GCLID_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const evaluatedAt = new Date().toISOString();

  const scrubResult = await env.DB.prepare(`
      update lead_attributions
      set gclid = null,
        gclid_captured_at = null
      where gclid is not null
        and (
          gclid_captured_at is null
          or gclid_captured_at < ?
        )
    `).bind(gclidCutoff).run();

  while (true) {
    const { results } = await env.DB.prepare(`
      select form_id, submission_id
      from lead_attributions
      where received_at < ?
      order by received_at
      limit 25
    `).bind(attributionCutoff).all();
    if (!results || results.length === 0) break;

    const statements = [];
    for (const row of results) {
      const retentionKey = await retentionTombstoneKey(row.form_id, row.submission_id);
      statements.push(
        env.DB.prepare(`
          insert into lead_retention_tombstones (retention_key, purged_at)
          values (?, ?)
          on conflict(retention_key) do nothing
        `).bind(retentionKey, evaluatedAt),
        env.DB.prepare(`
          delete from lead_attributions
          where form_id = ? and submission_id = ? and received_at < ?
        `).bind(row.form_id, row.submission_id, attributionCutoff),
      );
    }
    await env.DB.batch(statements);
  }

  return scrubResult;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true });
    }

    if (request.method === 'GET' && url.pathname === '/ready') {
      try {
        const missingEvents = await conversionReadiness(env);
        return json(
          { ok: missingEvents === 0, missing_events: missingEvents },
          missingEvents === 0 ? 200 : 503,
        );
      } catch {
        return json({ ok: false, error: 'Banco ainda não está preparado.' }, 503);
      }
    }

    if (request.method === 'POST' && url.pathname.startsWith('/webhooks/jotform/')) {
      const token = decodeURIComponent(url.pathname.slice('/webhooks/jotform/'.length));
      if (!env.JOTFORM_WEBHOOK_TOKEN || token !== env.JOTFORM_WEBHOOK_TOKEN) {
        return json({ ok: false, error: 'Não autorizado.' }, 401);
      }
      return receiveJotformWebhook(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/conversion-events/reconcile') {
      if (!env.ATTRIBUTION_API_TOKEN || bearerToken(request) !== env.ATTRIBUTION_API_TOKEN) {
        return json({ ok: false, error: 'Não autorizado.' }, 401);
      }
      try {
        const reconciledSubmissions = await reconcileMissingConversionEvents(env);
        const missingEvents = await conversionReadiness(env);
        return json(
          {
            ok: missingEvents === 0,
            reconciled_submissions: reconciledSubmissions,
            missing_events: missingEvents,
          },
          missingEvents === 0 ? 200 : 503,
        );
      } catch {
        return json({ ok: false, error: 'Não foi possível reconciliar o ledger.' }, 500);
      }
    }

    if (request.method === 'GET' && url.pathname === '/attributions') {
      return listAttributions(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/conversion-events') {
      return listConversionEvents(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/lead-event-deliveries') {
      return listEventDeliveries(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/lead-event-deliveries/process') {
      if (!env.ATTRIBUTION_API_TOKEN || bearerToken(request) !== env.ATTRIBUTION_API_TOKEN) {
        return json({ ok: false, error: 'Não autorizado.' }, 401);
      }
      try {
        const queued = await reconcileMissingGoogleDeliveries(env);
        const processing = await processGoogleDataManagerDeliveries(env);
        return json({ ok: true, queued, processing });
      } catch {
        return json({ ok: false, error: 'Não foi possível processar as entregas.' }, 500);
      }
    }

    if (
      request.method === 'POST'
      && url.pathname === '/lead-event-deliveries/requeue-configuration'
    ) {
      if (!env.ATTRIBUTION_API_TOKEN || bearerToken(request) !== env.ATTRIBUTION_API_TOKEN) {
        return json({ ok: false, error: 'Não autorizado.' }, 401);
      }
      try {
        const requeued = await requeueGoogleConfigurationBlocked(env);
        return json({ ok: true, requeued });
      } catch {
        return json({ ok: false, error: 'Não foi possível recolocar as entregas na fila.' }, 500);
      }
    }

    return json({ ok: false, error: 'Rota não encontrada.' }, 404);
  },

  async scheduled(controller, env) {
    await reconcileMissingConversionEvents(env);
    await processGoogleDataManagerDeliveries(env);
    if (!controller?.cron || controller.cron === '17 4 * * *') {
      await purgeExpiredAttributions(env);
    }
  },
};

export {
  detectTestSubmission,
  conversionReadiness,
  conversionTransactionId,
  normalizeAdUserDataConsent,
  normalizeGclidCapturedAt,
  normalizeLifeRange,
  normalizeSubmission,
  normalizeSubmissionOrigin,
  parseLimit,
  purgeExpiredAttributions,
  reconcileMissingConversionEvents,
  retentionTombstoneKey,
  readWebhook,
  receiveJotformWebhook,
};
