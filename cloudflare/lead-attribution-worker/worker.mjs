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
};

const MAX_FIELD_LENGTH = 500;
const ATTRIBUTION_RETENTION_DAYS = 180;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function truncate(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value ?? '').trim().slice(0, maxLength);
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

  const field = (name) => firstValue(payload, config.fields[name]);

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
      submission_id, form_id, lead_type, visitor_id, first_landing, first_referrer,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid,
      submitted_at, received_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    on conflict(submission_id) do nothing
  `).bind(
    submission.submissionId,
    submission.formId,
    submission.leadType,
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
    select submission_id, form_id, lead_type, visitor_id, first_landing, first_referrer,
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

  const cutoff = new Date(Date.now() - ATTRIBUTION_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return env.DB.prepare(`
    delete from lead_attributions
    where received_at < ?
  `).bind(cutoff).run();
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

export { normalizeSubmission, purgeExpiredAttributions, readWebhook };
