const GOOGLE_DESTINATION = 'google_data_manager';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INGEST_URL = 'https://datamanager.googleapis.com/v1/events:ingest';
const STATUS_URL = 'https://datamanager.googleapis.com/v1/requestStatus:retrieve';
const OAUTH_SCOPE = 'https://www.googleapis.com/auth/datamanager';
const DELIVERY_LIMIT = 25;
const MAX_ATTEMPTS = 5;
const MAX_POLLS = 9;
const LEASE_MS = 5 * 60 * 1000;
const FIRST_STATUS_DELAY_MS = 30 * 60 * 1000;
const GCLID_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;
const EVENT_NAMES = new Set(['lead_created', 'lead_sb2b', 'lead_b2b50']);
const DELIVERY_STATUSES = new Set([
  'pending', 'processing', 'retry', 'accepted', 'delivered', 'failed', 'blocked',
]);

let tokenCache = null;

class GoogleTransportError extends Error {
  constructor(code, status = 0, retryable = false) {
    super(code);
    this.name = 'GoogleTransportError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

function nowIso(now) {
  return new Date(now).toISOString();
}

function addMs(now, delay) {
  return new Date(now + delay).toISOString();
}

function base64url(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function pemToArrayBuffer(pem) {
  const compact = String(pem)
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  if (!compact) throw new GoogleTransportError('oauth_private_key_invalid');
  try {
    const binary = atob(compact);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
  } catch {
    throw new GoogleTransportError('oauth_private_key_invalid');
  }
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('');
}

function retryableHttpStatus(status) {
  return status === 0 || status === 408 || status === 429 || status >= 500;
}

function retryAfterMs(response, now) {
  const raw = response?.headers?.get?.('retry-after');
  if (!raw) return null;
  if (/^\d+$/.test(raw.trim())) return Math.min(Number(raw.trim()) * 1000, 6 * 60 * 60 * 1000);
  const timestamp = Date.parse(raw);
  if (!Number.isFinite(timestamp) || timestamp <= now) return null;
  return Math.min(timestamp - now, 6 * 60 * 60 * 1000);
}

function deterministicJitter(deliveryId, attemptCount) {
  const value = String(deliveryId) + ':' + String(attemptCount);
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

function nextRetryAt(row, attemptCount, now, retryAfter = null) {
  const base = Math.min(6 * 60 * 60 * 1000, 60_000 * (2 ** Math.min(attemptCount - 1, 8)));
  const delay = retryAfter ?? Math.round(base * (1 + deterministicJitter(row.delivery_id, attemptCount) * 0.25));
  return addMs(now, delay);
}

function nextStatusAt(pollCount, now, retryAfter = null) {
  const base = Math.min(
    6 * 60 * 60 * 1000,
    FIRST_STATUS_DELAY_MS * (2 ** Math.min(Math.max(0, pollCount - 1), 3)),
  );
  return addMs(now, retryAfter ?? base);
}

function productAccount(value, requiredType = null) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const accountType = String(value.accountType || '').trim();
  const accountId = String(value.accountId || '').replace(/-/g, '').trim();
  if (!['GOOGLE_ADS', 'DATA_PARTNER'].includes(accountType)) return null;
  if (requiredType && accountType !== requiredType) return null;
  if (!/^\d{1,30}$/.test(accountId)) return null;
  return { accountType, accountId };
}

function normalizeDestination(eventName, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const operatingAccount = productAccount(value.operatingAccount, 'GOOGLE_ADS');
  const productDestinationId = String(value.productDestinationId || '').trim();
  if (!operatingAccount || !/^\d{1,30}$/.test(productDestinationId)) return null;

  const reference = String(value.reference || eventName).trim();
  if (reference !== eventName) return null;

  const destination = { reference, operatingAccount, productDestinationId };
  if (value.loginAccount !== undefined) {
    const loginAccount = productAccount(value.loginAccount);
    if (!loginAccount) return null;
    destination.loginAccount = loginAccount;
  }
  if (value.linkedAccount !== undefined) {
    const linkedAccount = productAccount(value.linkedAccount);
    if (!linkedAccount) return null;
    destination.linkedAccount = linkedAccount;
  }
  return destination;
}

function parseGoogleDestinations(env) {
  let raw;
  try {
    raw = JSON.parse(env.GOOGLE_DATA_MANAGER_DESTINATIONS_JSON || '{}');
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const destinations = Object.create(null);
  for (const eventName of EVENT_NAMES) {
    if (raw[eventName] === undefined) continue;
    const destination = normalizeDestination(eventName, raw[eventName]);
    if (!destination) return null;
    destinations[eventName] = destination;
  }
  return destinations;
}

function destinationForEvent(env, eventName) {
  return parseGoogleDestinations(env)?.[eventName] || null;
}

function googleDeliveryId(eventId) {
  return String(eventId) + ':' + GOOGLE_DESTINATION;
}

function prepareGoogleDelivery(env, eventId, evaluatedAt) {
  return env.DB.prepare(`
    insert into lead_event_deliveries (
      delivery_id, event_id, destination, status,
      attempt_count, max_attempts, poll_count, max_polls,
      next_attempt_at, created_at, updated_at
    )
    select ?, event_id, ?, 'pending', 0, ?, 0, ?, ?, ?, ?
    from lead_conversion_events
    where event_id = ? and readiness = 'ready'
    on conflict(event_id, destination) do nothing
  `).bind(
    googleDeliveryId(eventId),
    GOOGLE_DESTINATION,
    MAX_ATTEMPTS,
    MAX_POLLS,
    evaluatedAt,
    evaluatedAt,
    evaluatedAt,
    eventId,
  );
}

async function reconcileMissingGoogleDeliveries(env, now = Date.now()) {
  const evaluatedAt = nowIso(now);
  const result = await env.DB.prepare(`
    insert into lead_event_deliveries (
      delivery_id, event_id, destination, status,
      attempt_count, max_attempts, poll_count, max_polls,
      next_attempt_at, created_at, updated_at
    )
    select
      events.event_id || ':google_data_manager',
      events.event_id,
      'google_data_manager',
      'pending',
      0,
      5,
      0,
      ?,
      ?,
      events.created_at,
      ?
    from lead_conversion_events as events
    where events.readiness = 'ready'
    on conflict(event_id, destination) do nothing
  `).bind(MAX_POLLS, evaluatedAt, evaluatedAt).run();
  return Number(result?.meta?.changes || 0);
}

async function requeueDynamicGoogleDeliveries(env, now = Date.now()) {
  const evaluatedAt = nowIso(now);
  const oldestGclid = nowIso(now - GCLID_MAX_AGE_MS);
  const newestGclid = nowIso(now + FUTURE_TOLERANCE_MS);
  const result = await env.DB.prepare(`
    update lead_event_deliveries
    set status = 'pending',
      blocked_reason = null,
      next_attempt_at = ?,
      last_error_code = null,
      last_error_detail = null,
      updated_at = ?
    where status = 'blocked'
      and blocked_reason in (
        'event_not_ready', 'consent_unknown', 'missing_match_key', 'expired_match_key'
      )
      and provider_request_id is null
      and exists (
        select 1
        from lead_conversion_events as events
        join lead_attributions as attribution using (submission_id)
        where events.event_id = lead_event_deliveries.event_id
          and events.readiness = 'ready'
          and attribution.ad_user_data_consent = 'granted'
          and attribution.gclid is not null
          and attribution.gclid <> ''
          and attribution.gclid_captured_at between ? and ?
      )
  `).bind(evaluatedAt, evaluatedAt, oldestGclid, newestGclid).run();
  return Number(result?.meta?.changes || 0);
}

async function requeueGoogleConfigurationBlocked(env, now = Date.now()) {
  const evaluatedAt = nowIso(now);
  const result = await env.DB.prepare(`
    update lead_event_deliveries
    set status = 'pending',
      blocked_reason = null,
      next_attempt_at = ?,
      last_error_code = null,
      last_error_detail = null,
      updated_at = ?
    where status = 'blocked'
      and blocked_reason = 'configuration_missing'
      and provider_request_id is null
  `).bind(evaluatedAt, evaluatedAt).run();
  return Number(result?.meta?.changes || 0);
}

function evaluateGoogleDelivery(row, now = Date.now()) {
  if (row.readiness !== 'ready') return { eligible: false, reason: 'event_not_ready' };
  if (row.ad_user_data_consent === 'denied') {
    return { eligible: false, reason: 'consent_denied' };
  }
  if (row.ad_user_data_consent !== 'granted') {
    return { eligible: false, reason: 'consent_unknown' };
  }
  if (!row.gclid || !row.gclid_captured_at) {
    return { eligible: false, reason: 'missing_match_key' };
  }

  const capturedAt = Date.parse(row.gclid_captured_at);
  if (
    !Number.isFinite(capturedAt)
    || capturedAt < now - GCLID_MAX_AGE_MS
    || capturedAt > now + FUTURE_TOLERANCE_MS
  ) {
    return { eligible: false, reason: 'expired_match_key' };
  }
  return { eligible: true };
}

function buildGoogleDataManagerPayload(row, destination) {
  return {
    destinations: [destination],
    events: [{
      destinationReferences: [destination.reference],
      transactionId: row.transaction_id,
      eventTimestamp: row.event_time,
      consent: { adUserData: 'CONSENT_GRANTED' },
      adIdentifiers: { gclid: row.gclid },
      eventSource: 'WEB',
    }],
  };
}

async function createServiceAccountAssertion(env, now = Date.now()) {
  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    throw new GoogleTransportError('oauth_credentials_missing');
  }

  const issuedAt = Math.floor(now / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(JSON.stringify({
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: OAUTH_SCOPE,
    aud: TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + 3600,
  }));
  const unsigned = header + '.' + claims;

  let key;
  try {
    key = await crypto.subtle.importKey(
      'pkcs8',
      pemToArrayBuffer(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign'],
    );
  } catch (error) {
    if (error instanceof GoogleTransportError) throw error;
    throw new GoogleTransportError('oauth_private_key_invalid');
  }

  let signature;
  try {
    signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      new TextEncoder().encode(unsigned),
    );
  } catch {
    throw new GoogleTransportError('oauth_signing_failed');
  }
  return unsigned + '.' + base64url(new Uint8Array(signature));
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function getGoogleAccessToken(env, fetchImpl, now = Date.now()) {
  if (typeof env.GOOGLE_DATA_MANAGER_TOKEN_PROVIDER === 'function') {
    const provided = await env.GOOGLE_DATA_MANAGER_TOKEN_PROVIDER(env, now);
    const token = typeof provided === 'string' ? provided : provided?.access_token;
    if (!token) throw new GoogleTransportError('oauth_token_provider_failed');
    return token;
  }

  const keyMarker = String(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').slice(-48);
  if (
    tokenCache
    && tokenCache.email === env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    && tokenCache.keyMarker === keyMarker
    && tokenCache.expiresAt > now + 60_000
  ) {
    return tokenCache.token;
  }

  const assertion = await createServiceAccountAssertion(env, now);
  let response;
  try {
    response = await fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });
  } catch {
    throw new GoogleTransportError('oauth_network_error', 0, true);
  }

  const payload = await safeJson(response);
  if (!response.ok || typeof payload.access_token !== 'string') {
    throw new GoogleTransportError(
      'oauth_http_' + String(response.status || 0),
      response.status || 0,
      retryableHttpStatus(response.status || 0),
    );
  }

  const expiresIn = Math.max(60, Number(payload.expires_in) || 300);
  tokenCache = {
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    keyMarker,
    token: payload.access_token,
    expiresAt: now + expiresIn * 1000,
  };
  return tokenCache.token;
}

function providerErrorCode(payload, status) {
  const candidates = [
    payload?.error?.status,
    payload?.error?.details?.[0]?.reason,
    payload?.errorInfo?.errorCounts?.[0]?.reason,
  ];
  for (const candidate of candidates) {
    const normalized = String(candidate || '').toUpperCase();
    if (/^[A-Z][A-Z0-9_]{1,79}$/.test(normalized)) return normalized;
  }
  return 'http_' + String(status || 0);
}

function attemptStatement(env, row, {
  phase,
  outcome,
  attemptedAt,
  httpStatus = null,
  providerStatus = null,
  errorCode = null,
  errorDetail = null,
}) {
  return env.DB.prepare(`
    insert into lead_event_delivery_attempts (
      delivery_id, attempted_at, phase, outcome, http_status,
      provider_request_id, provider_status, error_code, error_detail
    )
    select delivery_id, ?, ?, ?, ?, provider_request_id, ?, ?, ?
    from lead_event_deliveries
    where delivery_id = ? and lease_token = ?
  `).bind(
    attemptedAt,
    phase,
    outcome,
    httpStatus,
    providerStatus,
    errorCode,
    errorDetail,
    row.delivery_id,
    row.lease_token,
  );
}

async function applyOutcome(env, row, attempt, sql, values) {
  const update = env.DB.prepare(sql).bind(...values, row.delivery_id, row.lease_token);
  await env.DB.batch([attemptStatement(env, row, attempt), update]);
}

async function markBlocked(env, row, reason, now) {
  const evaluatedAt = nowIso(now);
  await applyOutcome(
    env,
    row,
    {
      phase: 'ingest',
      outcome: 'blocked',
      attemptedAt: evaluatedAt,
      errorCode: reason,
      errorDetail: 'Entrega bloqueada antes de qualquer chamada externa.',
    },
    `
      update lead_event_deliveries
      set status = 'blocked',
        blocked_reason = ?,
        next_attempt_at = null,
        lease_token = null,
        lease_expires_at = null,
        last_error_code = ?,
        last_error_detail = ?,
        updated_at = ?
      where delivery_id = ? and lease_token = ?
    `,
    [reason, reason, 'Entrega bloqueada antes de qualquer chamada externa.', evaluatedAt],
  );
}

async function markAccepted(env, row, requestId, httpStatus, payloadHash, now) {
  const evaluatedAt = nowIso(now);
  await applyOutcome(
    env,
    row,
    {
      phase: 'ingest',
      outcome: 'accepted',
      attemptedAt: evaluatedAt,
      httpStatus,
      providerStatus: 'PROCESSING',
    },
    `
      update lead_event_deliveries
      set status = 'accepted',
        blocked_reason = null,
        attempt_count = attempt_count + 1,
        next_attempt_at = ?,
        lease_token = null,
        lease_expires_at = null,
        provider_request_id = ?,
        provider_status = 'PROCESSING',
        last_http_status = ?,
        last_error_code = null,
        last_error_detail = null,
        payload_sha256 = ?,
        accepted_at = coalesce(accepted_at, ?),
        updated_at = ?
      where delivery_id = ? and lease_token = ?
    `,
    [
      addMs(now, FIRST_STATUS_DELAY_MS),
      requestId,
      httpStatus,
      payloadHash,
      evaluatedAt,
      evaluatedAt,
    ],
  );
}

async function markIngestFailure(env, row, {
  status = 0,
  code,
  retryable,
  retryAfter = null,
  payloadHash = null,
}, now) {
  const evaluatedAt = nowIso(now);
  const nextAttemptCount = Number(row.attempt_count || 0) + 1;
  const exhausted = nextAttemptCount >= Number(row.max_attempts || MAX_ATTEMPTS);
  const shouldRetry = retryable && !exhausted;
  const state = shouldRetry ? 'retry' : 'failed';
  const storedCode = exhausted && retryable ? 'max_attempts_exhausted' : code;

  await applyOutcome(
    env,
    row,
    {
      phase: 'ingest',
      outcome: shouldRetry ? 'transient_failure' : 'permanent_failure',
      attemptedAt: evaluatedAt,
      httpStatus: status || null,
      errorCode: storedCode,
      errorDetail: shouldRetry
        ? 'Falha transitória; nova tentativa agendada.'
        : 'Falha permanente ou limite de tentativas atingido.',
    },
    `
      update lead_event_deliveries
      set status = ?,
        blocked_reason = null,
        attempt_count = attempt_count + 1,
        next_attempt_at = ?,
        lease_token = null,
        lease_expires_at = null,
        last_http_status = ?,
        last_error_code = ?,
        last_error_detail = ?,
        payload_sha256 = coalesce(?, payload_sha256),
        updated_at = ?
      where delivery_id = ? and lease_token = ?
    `,
    [
      state,
      shouldRetry ? nextRetryAt(row, nextAttemptCount, now, retryAfter) : null,
      status || null,
      storedCode,
      shouldRetry
        ? 'Falha transitória; nova tentativa agendada.'
        : 'Falha permanente ou limite de tentativas atingido.',
      payloadHash,
      evaluatedAt,
    ],
  );
}

async function markPollResult(env, row, {
  providerStatus,
  outcome,
  httpStatus = 200,
  errorCode = null,
  errorDetail = null,
  retryAfter = null,
}, now) {
  const evaluatedAt = nowIso(now);
  const nextPollCount = Number(row.poll_count || 0) + 1;
  const timedOut = nextPollCount >= Number(row.max_polls || MAX_POLLS);
  const terminalFailure = ['FAILED', 'PARTIAL_SUCCESS'].includes(providerStatus) || timedOut;
  const delivered = providerStatus === 'SUCCESS';
  const status = delivered ? 'delivered' : (terminalFailure ? 'failed' : 'accepted');
  const storedCode = timedOut ? 'status_timeout' : errorCode;
  const storedDetail = timedOut
    ? 'O status assíncrono não concluiu após o limite de consultas.'
    : errorDetail;

  await applyOutcome(
    env,
    row,
    {
      phase: 'status',
      outcome: delivered
        ? 'delivered'
        : (terminalFailure ? 'permanent_failure' : (outcome || 'processing')),
      attemptedAt: evaluatedAt,
      httpStatus,
      providerStatus,
      errorCode: storedCode,
      errorDetail: storedDetail,
    },
    `
      update lead_event_deliveries
      set status = ?,
        blocked_reason = null,
        poll_count = poll_count + 1,
        next_attempt_at = ?,
        lease_token = null,
        lease_expires_at = null,
        provider_status = ?,
        last_http_status = ?,
        last_error_code = ?,
        last_error_detail = ?,
        delivered_at = case when ? = 'delivered' then ? else delivered_at end,
        updated_at = ?
      where delivery_id = ? and lease_token = ?
    `,
    [
      status,
      status === 'accepted' ? nextStatusAt(nextPollCount, now, retryAfter) : null,
      providerStatus,
      httpStatus,
      storedCode,
      storedDetail,
      status,
      evaluatedAt,
      evaluatedAt,
    ],
  );
  return status;
}

async function deferAcceptedPolling(env, row, {
  httpStatus = null,
  errorCode,
  errorDetail,
  retryAfter = null,
}, now) {
  const evaluatedAt = nowIso(now);
  const providerStatus = row.provider_status || 'PROCESSING';
  await applyOutcome(
    env,
    row,
    {
      phase: 'status',
      outcome: 'transient_failure',
      attemptedAt: evaluatedAt,
      httpStatus,
      providerStatus,
      errorCode,
      errorDetail,
    },
    `
      update lead_event_deliveries
      set status = 'accepted',
        blocked_reason = null,
        next_attempt_at = ?,
        lease_token = null,
        lease_expires_at = null,
        provider_status = coalesce(provider_status, 'PROCESSING'),
        last_http_status = ?,
        last_error_code = ?,
        last_error_detail = ?,
        updated_at = ?
      where delivery_id = ? and lease_token = ?
    `,
    [
      nextStatusAt(Math.max(1, Number(row.poll_count || 0) + 1), now, retryAfter),
      httpStatus,
      errorCode,
      errorDetail,
      evaluatedAt,
    ],
  );
  return 'accepted';
}

async function recoverExpiredLeases(env, now) {
  const evaluatedAt = nowIso(now);
  const result = await env.DB.prepare(`
    update lead_event_deliveries
    set status = case
        when provider_request_id is null then 'retry'
        else 'accepted'
      end,
      next_attempt_at = ?,
      lease_token = null,
      lease_expires_at = null,
      last_error_code = 'lease_expired',
      last_error_detail = 'Lease expirado e recuperado automaticamente.',
      updated_at = ?
    where status = 'processing'
      and lease_expires_at is not null
      and lease_expires_at <= ?
  `).bind(evaluatedAt, evaluatedAt, evaluatedAt).run();
  return Number(result?.meta?.changes || 0);
}

async function dueDeliveries(env, now, limit) {
  const { results = [] } = await env.DB.prepare(`
    select
      deliveries.delivery_id,
      deliveries.event_id,
      deliveries.status,
      deliveries.attempt_count,
      deliveries.max_attempts,
      deliveries.poll_count,
      deliveries.max_polls,
      deliveries.provider_request_id,
      deliveries.provider_status,
      deliveries.accepted_at,
      events.event_name,
      events.event_time,
      events.transaction_id,
      events.readiness,
      attribution.ad_user_data_consent,
      attribution.gclid,
      attribution.gclid_captured_at
    from lead_event_deliveries as deliveries
    join lead_conversion_events as events using (event_id)
    join lead_attributions as attribution using (submission_id)
    where deliveries.destination = 'google_data_manager'
      and deliveries.status in ('pending', 'retry', 'accepted')
      and (deliveries.next_attempt_at is null or deliveries.next_attempt_at <= ?)
    order by
      case deliveries.status when 'accepted' then 0 else 1 end,
      deliveries.next_attempt_at,
      deliveries.created_at,
      deliveries.delivery_id
    limit ?
  `).bind(nowIso(now), limit).all();
  return results;
}

async function claimDelivery(env, row, now) {
  const leaseToken = crypto.randomUUID();
  const result = await env.DB.prepare(`
    update lead_event_deliveries
    set status = 'processing',
      lease_token = ?,
      lease_expires_at = ?,
      updated_at = ?
    where delivery_id = ?
      and status = ?
      and (next_attempt_at is null or next_attempt_at <= ?)
  `).bind(
    leaseToken,
    addMs(now, LEASE_MS),
    nowIso(now),
    row.delivery_id,
    row.status,
    nowIso(now),
  ).run();
  if (Number(result?.meta?.changes || 0) !== 1) return null;
  return { ...row, lease_token: leaseToken };
}

function fetchImplementation(env) {
  return typeof env.GOOGLE_DATA_MANAGER_FETCH === 'function'
    ? env.GOOGLE_DATA_MANAGER_FETCH
    : fetch;
}

async function processIngest(env, row, now) {
  const eligibility = evaluateGoogleDelivery(row, now);
  if (!eligibility.eligible) {
    await markBlocked(env, row, eligibility.reason, now);
    return 'blocked';
  }

  const destination = destinationForEvent(env, row.event_name);
  const credentialsAvailable = (
    typeof env.GOOGLE_DATA_MANAGER_TOKEN_PROVIDER === 'function'
    || (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
  );
  if (!destination || !credentialsAvailable) {
    await markBlocked(env, row, 'configuration_missing', now);
    return 'blocked';
  }

  if (Number(row.attempt_count || 0) >= Number(row.max_attempts || MAX_ATTEMPTS)) {
    await markIngestFailure(env, row, {
      code: 'max_attempts_exhausted',
      retryable: false,
    }, now);
    return 'failed';
  }

  const payload = buildGoogleDataManagerPayload(row, destination);
  const serialized = JSON.stringify(payload);
  const payloadHash = await sha256Hex(serialized);
  const fetchImpl = fetchImplementation(env);

  let token;
  try {
    token = await getGoogleAccessToken(env, fetchImpl, now);
  } catch (error) {
    const transport = error instanceof GoogleTransportError
      ? error
      : new GoogleTransportError('oauth_unavailable');
    if (!transport.retryable) {
      await markBlocked(env, row, 'configuration_missing', now);
      return 'blocked';
    }
    await markIngestFailure(env, row, {
      status: transport.status,
      code: transport.code,
      retryable: true,
      payloadHash,
    }, now);
    return 'retry';
  }

  let response;
  try {
    response = await fetchImpl(INGEST_URL, {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + token,
        'content-type': 'application/json',
      },
      body: serialized,
    });
  } catch {
    await markIngestFailure(env, row, {
      code: 'ingest_network_error',
      retryable: true,
      payloadHash,
    }, now);
    return 'retry';
  }

  const responsePayload = await safeJson(response);
  if (response.ok && typeof responsePayload.requestId === 'string' && responsePayload.requestId) {
    await markAccepted(
      env,
      row,
      responsePayload.requestId,
      response.status,
      payloadHash,
      now,
    );
    return 'accepted';
  }

  if (response.status === 401 || response.status === 403) {
    await markBlocked(env, row, 'configuration_missing', now);
    return 'blocked';
  }

  const retryable = retryableHttpStatus(response.status);
  await markIngestFailure(env, row, {
    status: response.status,
    code: response.ok
      ? 'missing_request_id'
      : providerErrorCode(responsePayload, response.status),
    retryable,
    retryAfter: retryAfterMs(response, now),
    payloadHash,
  }, now);
  return retryable ? 'retry' : 'failed';
}

async function processStatus(env, row, now) {
  if (!row.provider_request_id) {
    await markIngestFailure(env, row, {
      code: 'missing_provider_request_id',
      retryable: false,
    }, now);
    return 'failed';
  }

  const fetchImpl = fetchImplementation(env);
  let token;
  try {
    token = await getGoogleAccessToken(env, fetchImpl, now);
  } catch (error) {
    const transport = error instanceof GoogleTransportError
      ? error
      : new GoogleTransportError('oauth_unavailable');
    return deferAcceptedPolling(env, row, {
      httpStatus: transport.status || null,
      errorCode: transport.code,
      errorDetail: 'Não foi possível autenticar a consulta de status.',
    }, now);
  }

  let response;
  try {
    response = await fetchImpl(
      STATUS_URL + '?requestId=' + encodeURIComponent(row.provider_request_id),
      { headers: { authorization: 'Bearer ' + token } },
    );
  } catch {
    return markPollResult(env, row, {
      providerStatus: row.provider_status || 'PROCESSING',
      outcome: 'transient_failure',
      httpStatus: null,
      errorCode: 'status_network_error',
      errorDetail: 'Falha de rede ao consultar o status assíncrono.',
    }, now);
  }

  const payload = await safeJson(response);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return deferAcceptedPolling(env, row, {
        httpStatus: response.status,
        errorCode: providerErrorCode(payload, response.status),
        errorDetail: 'A autenticação do polling precisa ser corrigida.',
        retryAfter: retryAfterMs(response, now),
      }, now);
    }

    return markPollResult(env, row, {
      providerStatus: row.provider_status || 'PROCESSING',
      outcome: 'transient_failure',
      httpStatus: response.status,
      errorCode: providerErrorCode(payload, response.status),
      errorDetail: 'O status assíncrono ainda não pôde ser confirmado.',
      retryAfter: retryAfterMs(response, now),
    }, now);
  }

  const providerStatus = String(
    payload?.requestStatusPerDestination?.[0]?.requestStatus || 'REQUEST_STATUS_UNKNOWN',
  );
  if (!['SUCCESS', 'PROCESSING', 'FAILED', 'PARTIAL_SUCCESS'].includes(providerStatus)) {
    return markPollResult(env, row, {
      providerStatus: 'PROCESSING',
      outcome: 'processing',
      httpStatus: response.status,
      errorCode: 'request_status_unknown',
      errorDetail: 'O provedor ainda não retornou um estado final conhecido.',
    }, now);
  }

  const errorCode = ['FAILED', 'PARTIAL_SUCCESS'].includes(providerStatus)
    ? providerErrorCode(payload?.requestStatusPerDestination?.[0], response.status)
    : null;
  return markPollResult(env, row, {
    providerStatus,
    outcome: providerStatus === 'PROCESSING' ? 'processing' : null,
    httpStatus: response.status,
    errorCode,
    errorDetail: errorCode ? 'O provedor concluiu o processamento com falha.' : null,
  }, now);
}

async function processGoogleDataManagerDeliveries(
  env,
  { now = Date.now(), limit = DELIVERY_LIMIT } = {},
) {
  if (env.GOOGLE_DATA_MANAGER_ENABLED !== 'true') {
    return {
      enabled: false,
      recovered: 0,
      selected: 0,
      accepted: 0,
      delivered: 0,
      retry: 0,
      failed: 0,
      blocked: 0,
    };
  }
  if (!env.DB) throw new Error('Binding D1 DB ausente.');

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || DELIVERY_LIMIT));
  const recovered = await recoverExpiredLeases(env, now);
  await requeueDynamicGoogleDeliveries(env, now);
  const rows = await dueDeliveries(env, now, safeLimit);
  const summary = {
    enabled: true,
    recovered,
    selected: rows.length,
    accepted: 0,
    delivered: 0,
    retry: 0,
    failed: 0,
    blocked: 0,
  };

  for (const selected of rows) {
    const row = await claimDelivery(env, selected, now);
    if (!row) continue;
    const outcome = selected.status === 'accepted'
      ? await processStatus(env, row, now)
      : await processIngest(env, row, now);
    if (Object.hasOwn(summary, outcome)) summary[outcome] += 1;
  }
  return summary;
}

function resetGoogleTokenCacheForTests() {
  tokenCache = null;
}

export {
  DELIVERY_STATUSES,
  GOOGLE_DESTINATION,
  buildGoogleDataManagerPayload,
  createServiceAccountAssertion,
  destinationForEvent,
  evaluateGoogleDelivery,
  googleDeliveryId,
  parseGoogleDestinations,
  prepareGoogleDelivery,
  processGoogleDataManagerDeliveries,
  reconcileMissingGoogleDeliveries,
  requeueDynamicGoogleDeliveries,
  requeueGoogleConfigurationBlocked,
  resetGoogleTokenCacheForTests,
  retryableHttpStatus,
};
