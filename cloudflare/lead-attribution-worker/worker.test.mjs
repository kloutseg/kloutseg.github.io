import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import worker, {
  conversionTransactionId,
  detectTestSubmission,
  normalizeAdUserDataConsent,
  normalizeGclidCapturedAt,
  normalizeLifeRange,
  normalizeSubmission,
  normalizeSubmissionOrigin,
  parseLimit,
  purgeExpiredAttributions,
  retentionTombstoneKey,
} from './worker.mjs';
import {
  buildGoogleDataManagerPayload,
  createServiceAccountAssertion,
  evaluateGoogleDelivery,
  parseGoogleDestinations,
  processGoogleDataManagerDeliveries,
  reconcileMissingGoogleDeliveries,
  resetGoogleTokenCacheForTests,
  retryableHttpStatus,
} from './google-data-manager.mjs';

const readSql = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');

class D1Statement {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
    this.values = [];
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes) } };
  }

  async all() {
    return { results: this.database.prepare(this.sql).all(...this.values) };
  }
}

class TestD1 {
  constructor(database) {
    this.database = database;
  }

  prepare(sql) {
    return new D1Statement(this.database, sql);
  }

  async batch(statements) {
    this.database.exec('begin');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      this.database.exec('commit');
      return results;
    } catch (error) {
      this.database.exec('rollback');
      throw error;
    }
  }
}

function createMigratedDatabase() {
  const database = new DatabaseSync(':memory:');
  database.exec('pragma foreign_keys = on');
  database.exec(readSql('./migrations/0001_initial.sql'));
  database.exec(readSql('./migrations/0002_add_campaign_context.sql'));
  database.exec(readSql('./migrations/0003_add_conversion_event_ledger.sql'));
  database.exec(readSql('./migrations/0004_separate_ledger_readiness_and_click_time.sql'));
  database.exec(readSql('./migrations/0005_add_lead_event_deliveries.sql'));
  return database;
}

function webhookRequest(fields) {
  return new Request('https://worker.test/webhooks/jotform/test-secret', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });
}

const workerEnv = (database) => ({
  DB: new TestD1(database),
  JOTFORM_WEBHOOK_TOKEN: 'test-secret',
  ATTRIBUTION_API_TOKEN: 'read-secret',
});

const googleDestinations = () => JSON.stringify({
  lead_created: {
    reference: 'lead_created',
    operatingAccount: { accountType: 'GOOGLE_ADS', accountId: '1234567890' },
    loginAccount: { accountType: 'GOOGLE_ADS', accountId: '9876543210' },
    productDestinationId: '111111',
  },
  lead_sb2b: {
    reference: 'lead_sb2b',
    operatingAccount: { accountType: 'GOOGLE_ADS', accountId: '1234567890' },
    loginAccount: { accountType: 'GOOGLE_ADS', accountId: '9876543210' },
    productDestinationId: '222222',
  },
  lead_b2b50: {
    reference: 'lead_b2b50',
    operatingAccount: { accountType: 'GOOGLE_ADS', accountId: '1234567890' },
    loginAccount: { accountType: 'GOOGLE_ADS', accountId: '9876543210' },
    productDestinationId: '333333',
  },
});

const googleEnv = (database, fetchImpl) => ({
  ...workerEnv(database),
  GOOGLE_DATA_MANAGER_ENABLED: 'true',
  GOOGLE_DATA_MANAGER_DESTINATIONS_JSON: googleDestinations(),
  GOOGLE_DATA_MANAGER_TOKEN_PROVIDER: async () => 'temporary-oauth-token',
  GOOGLE_DATA_MANAGER_FETCH: fetchImpl,
});

const nowIsoForTest = (value) => new Date(value).toISOString();

const campaignFields = (overrides = {}) => ({
  formID: '262233413435045',
  submissionID: 'campaign-ledger-001',
  q5_q5_radio3: '50–99 vidas',
  q11_q11_textbox9: '/empresas/custos/reajuste?variant=tecnica&experiment_forced=false',
  q12_q12_textbox10: 'visitor-production-001',
  q15_q15_textbox13: 'google',
  q16_q16_textbox14: 'cpc',
  q17_q17_textbox15: 'search_reajuste_sp_b2b50',
  q20_q20_textbox18: 'test-gclid-001',
  q22_ad_user_data_consent: 'granted',
  q23_gclid_captured_at: new Date().toISOString(),
  ...overrides,
});

test('normaliza as seis faixas sem inferir valores fora da allowlist', () => {
  const cases = [
    ['1–9 vidas', '1_9', 'sb2b'],
    ['10-29 vidas', '10_29', 'sb2b'],
    ['30–49 VIDAS', '30_49', 'sb2b'],
    ['50–99 vidas', '50_99', 'b2b50'],
    ['100—299 vidas', '100_299', 'b2b50'],
    ['300 + vidas', '300_plus', 'b2b50'],
  ];

  for (const [raw, lifeRange, segment] of cases) {
    assert.deepEqual(normalizeLifeRange(raw), {
      lifeRangeRaw: raw,
      lifeRange,
      leadSizeSegment: segment,
      classificationStatus: 'classified',
      classificationVersion: 'b2b50_v1',
    });
  }
});

test('mantém faixa legada, ausente e inválida fora de B2B50', () => {
  assert.deepEqual(normalizeLifeRange('30-99 vidas'), {
    lifeRangeRaw: '30-99 vidas',
    lifeRange: 'legacy_30_99',
    leadSizeSegment: 'unclassified',
    classificationStatus: 'ambiguous_legacy',
    classificationVersion: 'b2b50_v1',
  });
  assert.deepEqual(normalizeLifeRange(''), {
    lifeRangeRaw: null,
    lifeRange: 'unknown',
    leadSizeSegment: 'unclassified',
    classificationStatus: 'missing',
    classificationVersion: 'b2b50_v1',
  });
  assert.equal(normalizeLifeRange('cerca de 80').leadSizeSegment, 'unclassified');
  assert.equal(normalizeLifeRange('cerca de 80').classificationStatus, 'invalid');
});

test('normaliza consentimento e detecta apenas marcadores explícitos de QA', () => {
  assert.equal(normalizeAdUserDataConsent(' granted '), 'granted');
  assert.equal(normalizeAdUserDataConsent('DENIED'), 'denied');
  assert.equal(normalizeAdUserDataConsent('qualquer'), 'unknown');

  assert.equal(detectTestSubmission({
    experimentForced: 1,
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    submissionId: '123',
    visitorId: '',
  }), 0);
  assert.equal(detectTestSubmission({
    experimentForced: 0,
    utmSource: 'qa',
    utmMedium: 'internal',
    utmCampaign: 'qa_worker',
    submissionId: '123',
    visitorId: '',
  }), 1);
  assert.equal(detectTestSubmission({
    experimentForced: 0,
    utmSource: 'qa',
    utmMedium: 'cpc',
    utmCampaign: 'search',
    submissionId: '123',
    visitorId: '',
  }), 0);
});

test('valida o instante do GCLID e mantém o transaction_id dentro de 64 caracteres', () => {
  const now = Date.parse('2026-08-13T12:00:00.000Z');
  assert.equal(
    normalizeGclidCapturedAt('2026-08-13T11:00:00-01:00', now),
    '2026-08-13T12:00:00.000Z',
  );
  assert.equal(normalizeGclidCapturedAt('inválido', now), null);
  assert.equal(normalizeGclidCapturedAt('2026-08-13T12:06:00.000Z', now), null);
  assert.equal(normalizeGclidCapturedAt('2026-05-01T12:00:00.000Z', now), null);

  const prefix = 'x'.repeat(70);
  const first = conversionTransactionId(prefix + 'a', 'lead_created');
  const second = conversionTransactionId(prefix + 'b', 'lead_created');
  assert.ok(first.length <= 64);
  assert.ok(second.length <= 64);
  assert.notEqual(first, second);
});

test('valida limite dos endpoints de auditoria', () => {
  assert.deepEqual(parseLimit(new URL('https://worker.test/events')), { value: 100 });
  assert.deepEqual(parseLimit(new URL('https://worker.test/events?limit=500')), { value: 500 });
  for (const value of ['0', '501', 'abc', '1.5', '-1']) {
    assert.ok(parseLimit(new URL(`https://worker.test/events?limit=${value}`)).error);
  }
});

test('deriva landing e variante somente de origens permitidas', () => {
  assert.deepEqual(
    normalizeSubmissionOrigin('/empresas/beneficios/bradesco-saude/'),
    {
      submissionOrigin: '/empresas/beneficios/bradesco-saude/',
      landingId: 'b2b-beneficios-bradesco-saude',
      variantId: 'bradesco-saude',
      thesis: 'bradesco',
      originStatus: 'recognized',
      originVersion: 'campaign_origin_v1',
      experimentForced: null,
    },
  );

  assert.deepEqual(
    normalizeSubmissionOrigin(
      '/empresas/custos/reajuste?variant=tecnica&experiment_forced=false',
    ),
    {
      submissionOrigin: '/empresas/custos/reajuste?variant=tecnica&experiment_forced=false',
      landingId: 'b2b-custos-reajuste',
      variantId: 'reajuste-tecnica',
      thesis: 'renovacao-como-decisao-empresarial',
      originStatus: 'recognized',
      originVersion: 'campaign_origin_v1',
      experimentForced: 0,
    },
  );

  const forced = normalizeSubmissionOrigin(
    'https://www.kloutseguros.com.br/empresas/custos/reajuste?variant=sensorial&experiment_forced=true',
  );
  assert.equal(forced.variantId, 'reajuste-sensorial');
  assert.equal(forced.experimentForced, 1);
  assert.equal(forced.originStatus, 'recognized');
});

test('marca origens legadas ou inválidas sem inventar variante', () => {
  const missingVariant = normalizeSubmissionOrigin('/empresas/custos/reajuste');
  assert.equal(missingVariant.landingId, 'b2b-custos-reajuste');
  assert.equal(missingVariant.variantId, null);
  assert.equal(missingVariant.originStatus, 'legacy_missing_variant');

  const missingForced = normalizeSubmissionOrigin(
    '/empresas/custos/reajuste?variant=sensorial',
  );
  assert.equal(missingForced.variantId, 'reajuste-sensorial');
  assert.equal(missingForced.experimentForced, null);
  assert.equal(missingForced.originStatus, 'legacy_missing_forced_flag');

  const invalidVariant = normalizeSubmissionOrigin(
    '/empresas/custos/reajuste?variant=qualquer',
  );
  assert.equal(invalidVariant.variantId, null);
  assert.equal(invalidVariant.originStatus, 'invalid');

  const external = normalizeSubmissionOrigin(
    'https://example.com/empresas/beneficios/bradesco-saude',
  );
  assert.equal(external.landingId, null);
  assert.equal(external.originStatus, 'invalid');
});

test('normaliza o formulário de campanhas e preserva os legados', () => {
  const campaign = normalizeSubmission({
    envelope: { formID: '262233413435045', submissionID: 'campaign-001' },
    raw: {
      q5_q5_radio3: '50–99 vidas',
      q11_q11_textbox9:
        '/empresas/custos/reajuste?variant=sensorial&experiment_forced=false',
      q15_q15_textbox13: 'google',
    },
  });
  assert.equal(campaign.lifeRange, '50_99');
  assert.equal(campaign.leadSizeSegment, 'b2b50');
  assert.equal(campaign.variantId, 'reajuste-sensorial');
  assert.equal(campaign.utmSource, 'google');

  const legacy = normalizeSubmission({
    envelope: { formID: '261337328053050', submissionID: 'legacy-001' },
    raw: { q20_utm_source: 'google' },
  });
  assert.equal(legacy.leadType, 'b2b');
  assert.equal(legacy.lifeRange, null);
  assert.equal(legacy.submissionOrigin, null);
  assert.equal(legacy.utmSource, 'google');
});

test('a migração preserva linhas existentes e adiciona o novo contrato', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(readSql('./migrations/0001_initial.sql'));
  database.prepare(`
    insert into lead_attributions (
      submission_id, form_id, lead_type, received_at
    ) values (?, ?, ?, ?)
  `).run('before-migration', '261337328053050', 'b2b', '2026-08-13T12:00:00.000Z');

  database.exec(readSql('./migrations/0002_add_campaign_context.sql'));
  database.exec(readSql('./migrations/0003_add_conversion_event_ledger.sql'));
  database.exec(readSql('./migrations/0004_separate_ledger_readiness_and_click_time.sql'));
  database.exec(readSql('./migrations/0005_add_lead_event_deliveries.sql'));
  const columns = database.prepare('pragma table_info(lead_attributions)').all();
  const columnNames = new Set(columns.map((column) => column.name));
  for (const name of [
    'life_range_raw',
    'lead_size_segment',
    'submission_origin',
    'variant_id',
    'gclid_captured_at',
  ]) {
    assert.ok(columnNames.has(name), `coluna ausente: ${name}`);
  }

  const preserved = database.prepare(`
    select submission_id, life_range_raw, submission_origin
    from lead_attributions where submission_id = ?
  `).get('before-migration');
  assert.deepEqual({ ...preserved }, {
    submission_id: 'before-migration',
    life_range_raw: null,
    submission_origin: null,
  });
  assert.equal(database.prepare(`
    select count(*) as total from lead_conversion_events
  `).get().total, 0);
});

test('migração 0004 reconcilia a janela de deploy e usa o contrato canônico', () => {
  const database = new DatabaseSync(':memory:');
  database.exec('pragma foreign_keys = on');
  database.exec(readSql('./migrations/0001_initial.sql'));
  database.exec(readSql('./migrations/0002_add_campaign_context.sql'));

  const commonPrefix = 'campaign-' + 'x'.repeat(55);
  const longIds = [commonPrefix + 'a', commonPrefix + 'b'];
  const insertAttribution = (submissionId, experimentForced = 0) => {
    database.prepare(`
      insert into lead_attributions (
        submission_id, form_id, lead_type,
        life_range_raw, life_range, lead_size_segment,
        classification_status, classification_version,
        submission_origin, landing_id, variant_id, thesis,
        origin_status, origin_version, experiment_forced,
        visitor_id, utm_source, utm_medium, utm_campaign, received_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      submissionId,
      '262233413435045',
      'b2b',
      '50–99 vidas',
      '50_99',
      'b2b50',
      'classified',
      'b2b50_v1',
      '/empresas/custos/reajuste?variant=tecnica&experiment_forced=false',
      'b2b-custos-reajuste',
      'reajuste-tecnica',
      'renovacao-como-decisao-empresarial',
      'recognized',
      'campaign_origin_v1',
      experimentForced,
      'visitor-production',
      'google',
      'cpc',
      'search_reajuste',
      '2026-08-13T12:00:00.000Z',
    );
  };

  for (const submissionId of longIds) insertAttribution(submissionId);
  database.exec(readSql('./migrations/0003_add_conversion_event_ledger.sql'));

  insertAttribution('qa_existing_001');
  insertAttribution('forced-existing', 1);
  database.prepare(`
    update lead_attributions set is_test = 1 where submission_id = ?
  `).run('forced-existing');

  database.exec(readSql('./migrations/0004_separate_ledger_readiness_and_click_time.sql'));

  const longEvents = database.prepare(`
    select submission_id, event_name, transaction_id
    from lead_conversion_events
    where submission_id in (?, ?)
    order by submission_id, event_name
  `).all(...longIds);
  assert.equal(longEvents.length, 4);
  for (const event of longEvents) {
    assert.equal(
      event.transaction_id,
      conversionTransactionId(event.submission_id, event.event_name),
    );
    assert.ok(event.transaction_id.length <= 64);
  }
  assert.notEqual(longEvents[0].transaction_id, longEvents[2].transaction_id);

  const qa = database.prepare(`
    select attribution.is_test, events.readiness, events.blocked_reason
    from lead_attributions as attribution
    join lead_conversion_events as events using (submission_id)
    where attribution.submission_id = ?
    order by events.event_name
  `).all('qa_existing_001');
  assert.equal(qa.length, 2);
  assert.ok(qa.every((row) =>
    row.is_test === 1
    && row.readiness === 'blocked'
    && row.blocked_reason === 'test_submission'
  ));

  const forced = database.prepare(`
    select attribution.is_test, events.readiness, events.blocked_reason
    from lead_attributions as attribution
    join lead_conversion_events as events using (submission_id)
    where attribution.submission_id = ?
    order by events.event_name
  `).all('forced-existing');
  assert.equal(forced.length, 2);
  assert.ok(forced.every((row) =>
    row.is_test === 0 && row.readiness === 'ready' && row.blocked_reason === null
  ));

  assert.equal(database.prepare(`
    select count(*) as total
    from lead_conversion_events
    where submission_id in ('qa_existing_001', 'forced-existing')
  `).get().total, 4);
});

test('webhook é idempotente, enriquece retry incompleto e expõe contexto na auditoria', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);
  const baseFields = {
    formID: '262233413435045',
    submissionID: 'campaign-retry-001',
    q15_q15_textbox13: 'google',
  };

  const incomplete = await worker.fetch(webhookRequest(baseFields), env);
  assert.equal(incomplete.status, 200);

  const completeFields = {
    ...baseFields,
    q5_q5_radio3: '100–299 vidas',
    q11_q11_textbox9:
      '/empresas/custos/reajuste?variant=tecnica&experiment_forced=false',
    q12_q12_textbox10: 'visitor-qa',
    q17_q17_textbox15: 'search_reajuste_sp_b2b50',
  };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await worker.fetch(webhookRequest(completeFields), env);
    assert.equal(response.status, 200);
  }

  const count = database.prepare(`
    select count(*) as total from lead_attributions where submission_id = ?
  `).get('campaign-retry-001');
  assert.equal(count.total, 1);

  const stored = database.prepare(`
    select life_range, lead_size_segment, classification_status,
      landing_id, variant_id, origin_status, experiment_forced,
      visitor_id, utm_campaign
    from lead_attributions where submission_id = ?
  `).get('campaign-retry-001');
  assert.deepEqual({ ...stored }, {
    life_range: '100_299',
    lead_size_segment: 'b2b50',
    classification_status: 'classified',
    landing_id: 'b2b-custos-reajuste',
    variant_id: 'reajuste-tecnica',
    origin_status: 'recognized',
    experiment_forced: 0,
    visitor_id: 'visitor-qa',
    utm_campaign: 'search_reajuste_sp_b2b50',
  });

  const auditResponse = await worker.fetch(
    new Request('https://worker.test/attributions?limit=10', {
      headers: { authorization: 'Bearer read-secret' },
    }),
    env,
  );
  assert.equal(auditResponse.status, 200);
  const audit = await auditResponse.json();
  assert.equal(audit.attributions[0].submission_id, 'campaign-retry-001');
  assert.equal(audit.attributions[0].lead_size_segment, 'b2b50');
  assert.equal(audit.attributions[0].variant_id, 'reajuste-tecnica');
  assert.equal(audit.attributions[0].has_gclid, 0);
  for (const field of ['gclid', 'visitor_id', 'first_landing', 'first_referrer']) {
    assert.equal(Object.hasOwn(audit.attributions[0], field), false);
  }
});

test('ledger gera lead_created e exatamente um evento de porte pronto', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await worker.fetch(webhookRequest(campaignFields()), env);
    assert.equal(response.status, 200);
  }

  const events = database.prepare(`
    select event_name, transaction_id, readiness, blocked_reason
    from lead_conversion_events
    where submission_id = ?
    order by event_name
  `).all('campaign-ledger-001');
  assert.deepEqual(events.map((event) => ({ ...event })), [
    {
      event_name: 'lead_b2b50',
      transaction_id: 'jf:campaign-ledger-001:50',
      readiness: 'ready',
      blocked_reason: null,
    },
    {
      event_name: 'lead_created',
      transaction_id: 'jf:campaign-ledger-001:c',
      readiness: 'ready',
      blocked_reason: null,
    },
  ]);

  const eventAudit = await worker.fetch(
    new Request('https://worker.test/conversion-events?readiness=ready&limit=10', {
      headers: { authorization: 'Bearer read-secret' },
    }),
    env,
  );
  assert.equal(eventAudit.status, 200);
  assert.equal(eventAudit.headers.get('cache-control'), 'no-store');
  const audit = await eventAudit.json();
  assert.equal(audit.events.length, 2);
  assert.equal(audit.events[0].ad_user_data_consent, 'granted');
});

test('readiness detecta gaps e a reconciliação autenticada é idempotente', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);
  await worker.fetch(webhookRequest(campaignFields({
    submissionID: 'campaign-reconcile-001',
  })), env);

  database.prepare(`
    delete from lead_conversion_events
    where submission_id = ? and event_name = 'lead_b2b50'
  `).run('campaign-reconcile-001');

  const notReady = await worker.fetch(new Request('https://worker.test/ready'), env);
  assert.equal(notReady.status, 503);
  assert.equal((await notReady.json()).missing_events, 1);

  const unauthorized = await worker.fetch(new Request(
    'https://worker.test/conversion-events/reconcile',
    { method: 'POST' },
  ), env);
  assert.equal(unauthorized.status, 401);

  const reconcileRequest = () => new Request(
    'https://worker.test/conversion-events/reconcile',
    {
      method: 'POST',
      headers: { authorization: 'Bearer read-secret' },
    },
  );
  const reconciled = await worker.fetch(reconcileRequest(), env);
  assert.equal(reconciled.status, 200);
  assert.deepEqual(await reconciled.json(), {
    ok: true,
    reconciled_submissions: 1,
    missing_events: 0,
  });

  const repeated = await worker.fetch(reconcileRequest(), env);
  assert.equal(repeated.status, 200);
  assert.equal((await repeated.json()).reconciled_submissions, 0);

  const ready = await worker.fetch(new Request('https://worker.test/ready'), env);
  assert.equal(ready.status, 200);
  assert.equal((await ready.json()).missing_events, 0);
  assert.equal(database.prepare(`
    select count(*) as total from lead_conversion_events where submission_id = ?
  `).get('campaign-reconcile-001').total, 2);
});

test('variante explícita continua pronta e QA explícito permanece bloqueado', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);
  const fields = campaignFields({
    submissionID: 'campaign-forced-001',
    q5_q5_radio3: '30–49 vidas',
    q11_q11_textbox9:
      '/empresas/custos/reajuste?variant=sensorial&experiment_forced=true',
  });

  const response = await worker.fetch(webhookRequest(fields), env);
  assert.equal(response.status, 200);

  const events = database.prepare(`
    select event_name, readiness, blocked_reason
    from lead_conversion_events
    where submission_id = ?
    order by event_name
  `).all('campaign-forced-001');
  assert.deepEqual(events.map((event) => ({ ...event })), [
    { event_name: 'lead_created', readiness: 'ready', blocked_reason: null },
    { event_name: 'lead_sb2b', readiness: 'ready', blocked_reason: null },
  ]);

  await worker.fetch(webhookRequest(campaignFields({
    submissionID: 'campaign-qa-001',
    q15_q15_textbox13: 'qa',
    q16_q16_textbox14: 'internal',
    q17_q17_textbox15: 'qa_ledger',
  })), env);
  const qaEvents = database.prepare(
    "select distinct readiness, blocked_reason from lead_conversion_events where submission_id = ?",
  ).all('campaign-qa-001');
  assert.deepEqual(qaEvents.map((event) => ({ ...event })), [
    { readiness: 'blocked', blocked_reason: 'test_submission' },
  ]);
});

test('ledger factual independe de consentimento ou GCLID', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);
  const cases = [
    ['campaign-consent-unknown', '', 'unknown'],
    ['campaign-consent-denied', 'test-gclid', 'denied'],
    ['campaign-no-gclid', '', 'granted'],
  ];

  for (const [submissionID, gclid, consent] of cases) {
    const response = await worker.fetch(webhookRequest(campaignFields({
      submissionID,
      q20_q20_textbox18: gclid,
      q22_ad_user_data_consent: consent,
    })), env);
    assert.equal(response.status, 200);
    const event = database.prepare(`
      select readiness, blocked_reason
      from lead_conversion_events
      where submission_id = ? and event_name = 'lead_created'
    `).get(submissionID);
    assert.deepEqual({ ...event }, { readiness: 'ready', blocked_reason: null });
  }
});

test('faixa não classificada gera somente lead_created e forms legados não geram ledger', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);

  await worker.fetch(webhookRequest(campaignFields({
    submissionID: 'campaign-unclassified-001',
    q5_q5_radio3: '30–99 vidas',
  })), env);
  await worker.fetch(webhookRequest({
    formID: '261337328053050',
    submissionID: 'legacy-ledger-001',
    q17_visitor_id: 'legacy-visitor',
    q20_utm_source: 'google',
  }), env);

  const campaignEvents = database.prepare(`
    select event_name from lead_conversion_events where submission_id = ?
  `).all('campaign-unclassified-001');
  assert.deepEqual(campaignEvents.map(({ event_name }) => event_name), ['lead_created']);
  assert.equal(database.prepare(`
    select count(*) as total from lead_conversion_events where submission_id = ?
  `).get('legacy-ledger-001').total, 0);
});

test('batch do webhook faz rollback de atribuição e eventos quando uma statement falha', async () => {
  const database = createMigratedDatabase();
  database.exec(`
    create trigger fail_b2b50 before insert on lead_conversion_events
    when new.event_name = 'lead_b2b50'
    begin
      select raise(abort, 'forced ledger failure');
    end;
  `);
  const env = workerEnv(database);

  await assert.rejects(
    worker.fetch(webhookRequest(campaignFields({
      submissionID: 'campaign-rollback-001',
    })), env),
    /forced ledger failure/,
  );
  assert.equal(database.prepare(`
    select count(*) as total from lead_attributions where submission_id = ?
  `).get('campaign-rollback-001').total, 0);
  assert.equal(database.prepare(`
    select count(*) as total from lead_conversion_events where submission_id = ?
  `).get('campaign-rollback-001').total, 0);
});

test('endpoint de eventos exige token e rejeita limite inválido', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);

  assert.equal(
    (await worker.fetch(new Request('https://worker.test/conversion-events'), env)).status,
    401,
  );
  assert.equal(
    (await worker.fetch(
      new Request('https://worker.test/conversion-events?limit=abc', {
        headers: { authorization: 'Bearer read-secret' },
      }),
      env,
    )).status,
    400,
  );
  for (const query of [
    'readiness=readyy',
    'readiness=',
    'readiness=READY',
    'readiness=ready&readiness=blocked',
  ]) {
    const response = await worker.fetch(
      new Request('https://worker.test/conversion-events?' + query, {
        headers: { authorization: 'Bearer read-secret' },
      }),
      env,
    );
    assert.equal(response.status, 400);
  }
});

test('purge não permite restaurar GCLID expirado e remove o ledger por cascade', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);
  const fields = campaignFields({ submissionID: 'campaign-retention-001' });
  await worker.fetch(webhookRequest(fields), env);

  database.prepare(`
    update lead_attributions
    set gclid_captured_at = ?
    where submission_id = ?
  `).run('2026-05-01T12:00:00.000Z', 'campaign-retention-001');
  await purgeExpiredAttributions(env);

  assert.equal(database.prepare(`
    select gclid from lead_attributions where submission_id = ?
  `).get('campaign-retention-001').gclid, null);
  assert.deepEqual(
    database.prepare(`
      select distinct readiness, blocked_reason
      from lead_conversion_events
      where submission_id = ?
    `).all('campaign-retention-001').map((row) => ({ ...row })),
    [{ readiness: 'ready', blocked_reason: null }],
  );

  fields.q23_gclid_captured_at = '2026-05-01T12:00:00.000Z';
  await worker.fetch(webhookRequest(fields), env);
  assert.equal(database.prepare(`
    select gclid from lead_attributions where submission_id = ?
  `).get('campaign-retention-001').gclid, null);

  database.prepare(`
    update lead_attributions
    set received_at = ?
    where submission_id = ?
  `).run('2025-01-01T12:00:00.000Z', 'campaign-retention-001');
  await purgeExpiredAttributions(env);
  assert.equal(database.prepare(`
    select count(*) as total from lead_attributions where submission_id = ?
  `).get('campaign-retention-001').total, 0);
  assert.equal(database.prepare(`
    select count(*) as total from lead_conversion_events where submission_id = ?
  `).get('campaign-retention-001').total, 0);
  const retentionKey = await retentionTombstoneKey(
    '262233413435045',
    'campaign-retention-001',
  );
  assert.equal(database.prepare(
    'select count(*) as total from lead_retention_tombstones where retention_key = ?',
  ).get(retentionKey).total, 1);
  assert.equal(database.prepare(
    "select count(*) as total from lead_retention_tombstones where retention_key like '%campaign-retention-001%'",
  ).get().total, 0);

  await worker.fetch(webhookRequest(fields), env);
  assert.equal(database.prepare(
    'select count(*) as total from lead_attributions where submission_id = ?',
  ).get('campaign-retention-001').total, 0);
  assert.equal(database.prepare(
    'select count(*) as total from lead_conversion_events where submission_id = ?',
  ).get('campaign-retention-001').total, 0);
});

test('Data Manager valida configuração, elegibilidade, payload e JWT de service account', async () => {
  const destinations = parseGoogleDestinations({
    GOOGLE_DATA_MANAGER_DESTINATIONS_JSON: googleDestinations(),
  });
  assert.equal(destinations.lead_b2b50.productDestinationId, '333333');
  assert.equal(destinations.lead_created.operatingAccount.accountId, '1234567890');
  assert.equal(parseGoogleDestinations({
    GOOGLE_DATA_MANAGER_DESTINATIONS_JSON: '{"lead_created":{"reference":"wrong"}}',
  }), null);

  const now = Date.parse('2026-08-14T12:00:00.000Z');
  const row = {
    readiness: 'ready',
    ad_user_data_consent: 'granted',
    gclid: 'gclid-safe-test',
    gclid_captured_at: '2026-08-14T11:00:00.000Z',
    transaction_id: 'jf:submission:c',
    event_time: '2026-08-14T11:30:00.000Z',
  };
  assert.deepEqual(evaluateGoogleDelivery(row, now), { eligible: true });
  assert.deepEqual(
    evaluateGoogleDelivery({ ...row, ad_user_data_consent: 'denied' }, now),
    { eligible: false, reason: 'consent_denied' },
  );
  assert.deepEqual(
    evaluateGoogleDelivery({ ...row, gclid_captured_at: '2026-05-01T00:00:00.000Z' }, now),
    { eligible: false, reason: 'expired_match_key' },
  );

  assert.deepEqual(buildGoogleDataManagerPayload(row, destinations.lead_created), {
    destinations: [destinations.lead_created],
    events: [{
      destinationReferences: ['lead_created'],
      transactionId: 'jf:submission:c',
      eventTimestamp: '2026-08-14T11:30:00.000Z',
      consent: { adUserData: 'CONSENT_GRANTED' },
      adIdentifiers: { gclid: 'gclid-safe-test' },
      eventSource: 'WEB',
    }],
  });
  assert.equal(retryableHttpStatus(408), true);
  assert.equal(retryableHttpStatus(429), true);
  assert.equal(retryableHttpStatus(503), true);
  assert.equal(retryableHttpStatus(400), false);

  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 1024 });
  const assertion = await createServiceAccountAssertion({
    GOOGLE_SERVICE_ACCOUNT_EMAIL: 'delivery@example.iam.gserviceaccount.com',
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey.export({
      type: 'pkcs8',
      format: 'pem',
    }),
  }, now);
  const [headerPart, claimsPart, signaturePart] = assertion.split('.');
  assert.ok(signaturePart.length > 20);
  assert.deepEqual(
    JSON.parse(Buffer.from(headerPart, 'base64url').toString()),
    { alg: 'RS256', typ: 'JWT' },
  );
  const claims = JSON.parse(Buffer.from(claimsPart, 'base64url').toString());
  assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
  assert.equal(claims.scope, 'https://www.googleapis.com/auth/datamanager');
  assert.equal(claims.exp - claims.iat, 3600);
});

test('fila é atômica, idempotente, ignora QA e fica inerte quando desabilitada', async () => {
  const database = createMigratedDatabase();
  const env = workerEnv(database);
  const production = campaignFields({ submissionID: 'campaign-queue-001' });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    assert.equal((await worker.fetch(webhookRequest(production), env)).status, 200);
  }
  await worker.fetch(webhookRequest(campaignFields({
    submissionID: 'qa_queue_001',
    q15_q15_textbox13: 'qa',
    q16_q16_textbox14: 'internal',
    q17_q17_textbox15: 'qa_delivery',
  })), env);

  assert.equal(database.prepare(`
    select count(*) as total
    from lead_event_deliveries
    where event_id like '%campaign-queue-001%'
  `).get().total, 2);
  assert.equal(database.prepare(`
    select count(*) as total
    from lead_event_deliveries
    where event_id like '%qa_queue_001%'
  `).get().total, 0);
  assert.equal(await reconcileMissingGoogleDeliveries(env), 0);
  assert.equal(await reconcileMissingGoogleDeliveries(env), 0);

  let externalCalls = 0;
  const result = await processGoogleDataManagerDeliveries({
    ...env,
    GOOGLE_DATA_MANAGER_ENABLED: 'false',
    GOOGLE_DATA_MANAGER_FETCH: async () => {
      externalCalls += 1;
      throw new Error('não deveria chamar');
    },
  });
  assert.equal(result.enabled, false);
  assert.equal(externalCalls, 0);
  assert.equal(database.prepare(`
    select count(*) as total from lead_event_deliveries where status = 'pending'
  `).get().total, 2);

  assert.equal((await worker.fetch(
    new Request('https://worker.test/lead-event-deliveries'),
    env,
  )).status, 401);
  const auditResponse = await worker.fetch(
    new Request('https://worker.test/lead-event-deliveries?status=pending&limit=10', {
      headers: { authorization: 'Bearer read-secret' },
    }),
    env,
  );
  assert.equal(auditResponse.status, 200);
  const audit = await auditResponse.json();
  assert.equal(audit.deliveries.length, 2);
  assert.equal(Object.hasOwn(audit.deliveries[0], 'gclid'), false);
});

test('falha ao enfileirar reverte atribuição e ledger no mesmo batch', async () => {
  const database = createMigratedDatabase();
  database.exec(`
    create trigger fail_delivery before insert on lead_event_deliveries
    begin
      select raise(abort, 'forced delivery failure');
    end;
  `);
  const env = workerEnv(database);
  await assert.rejects(
    worker.fetch(webhookRequest(campaignFields({
      submissionID: 'campaign-delivery-rollback-001',
    })), env),
    /forced delivery failure/,
  );
  for (const table of [
    'lead_attributions',
    'lead_conversion_events',
    'lead_event_deliveries',
  ]) {
    assert.equal(database.prepare(
      'select count(*) as total from ' + table,
    ).get().total, 0);
  }
});

test('consentimento e match key bloqueiam delivery sem alterar o ledger factual', async () => {
  const database = createMigratedDatabase();
  let externalCalls = 0;
  const env = googleEnv(database, async () => {
    externalCalls += 1;
    throw new Error('não deveria chamar');
  });
  const now = Date.now();
  const cases = [
    ['delivery-consent-unknown', 'unknown', 'gclid-unknown'],
    ['delivery-consent-denied', 'denied', 'gclid-denied'],
    ['delivery-match-missing', 'granted', ''],
    ['delivery-match-expired', 'granted', 'gclid-expired'],
  ];
  for (const [submissionID, consent, gclid] of cases) {
    await worker.fetch(webhookRequest(campaignFields({
      submissionID,
      q20_q20_textbox18: gclid,
      q22_ad_user_data_consent: consent,
      q23_gclid_captured_at: nowIsoForTest(now),
    })), env);
  }
  database.prepare(`
    update lead_attributions
    set gclid_captured_at = '2026-01-01T00:00:00.000Z'
    where submission_id = 'delivery-match-expired'
  `).run();

  const result = await processGoogleDataManagerDeliveries(env, { now: now + 1000 });
  assert.equal(result.blocked, 8);
  assert.equal(externalCalls, 0);
  assert.deepEqual(database.prepare(`
    select blocked_reason, count(*) as total
    from lead_event_deliveries
    group by blocked_reason
    order by blocked_reason
  `).all().map((row) => ({ ...row })), [
    { blocked_reason: 'consent_denied', total: 2 },
    { blocked_reason: 'consent_unknown', total: 2 },
    { blocked_reason: 'expired_match_key', total: 2 },
    { blocked_reason: 'missing_match_key', total: 2 },
  ]);
  assert.equal(database.prepare(`
    select count(*) as total from lead_conversion_events where readiness = 'ready'
  `).get().total, 8);
});

test('revogação explícita prevalece e impede uma entrega ainda pendente', async () => {
  const database = createMigratedDatabase();
  let externalCalls = 0;
  const env = googleEnv(database, async () => {
    externalCalls += 1;
    throw new Error('não deveria chamar');
  });
  const submissionID = 'delivery-consent-revoked';
  await worker.fetch(webhookRequest(campaignFields({ submissionID })), env);
  await worker.fetch(webhookRequest(campaignFields({
    submissionID,
    q22_ad_user_data_consent: 'denied',
  })), env);

  assert.equal(database.prepare(`
    select ad_user_data_consent from lead_attributions where submission_id = ?
  `).get(submissionID).ad_user_data_consent, 'denied');
  const result = await processGoogleDataManagerDeliveries(env);
  assert.equal(result.blocked, 2);
  assert.equal(externalCalls, 0);
});

test('claim concorrente envia uma vez, persiste requestId e só conclui após polling', async () => {
  resetGoogleTokenCacheForTests();
  const database = createMigratedDatabase();
  const now = Date.now();
  const calls = [];
  let mode = 'ingest';
  let requestSequence = 0;
  const env = googleEnv(database, async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (mode === 'ingest') {
      requestSequence += 1;
      const requestId = requestSequence === 1
        ? 'request-' + 'x'.repeat(700)
        : 'request-' + requestSequence;
      return new Response(JSON.stringify({ requestId }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (mode === 'auth') {
      return new Response(JSON.stringify({ error: { status: 'UNAUTHENTICATED' } }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    const requestStatus = mode === 'processing' ? 'PROCESSING' : 'SUCCESS';
    return new Response(JSON.stringify({
      requestStatusPerDestination: [{ requestStatus }],
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });
  await worker.fetch(webhookRequest(campaignFields({
    submissionID: 'delivery-concurrent-001',
    q23_gclid_captured_at: nowIsoForTest(now),
  })), env);

  const summaries = await Promise.all([
    processGoogleDataManagerDeliveries(env, { now: now + 1000 }),
    processGoogleDataManagerDeliveries(env, { now: now + 1000 }),
  ]);
  assert.equal(summaries.reduce((total, item) => total + item.accepted, 0), 2);
  assert.equal(calls.length, 2);

  for (const call of calls) {
    assert.equal(call.url, 'https://datamanager.googleapis.com/v1/events:ingest');
    assert.equal(call.options.headers.authorization, 'Bearer temporary-oauth-token');
    const payload = JSON.parse(call.options.body);
    assert.equal(payload.events.length, 1);
    assert.equal(payload.events[0].consent.adUserData, 'CONSENT_GRANTED');
    assert.equal(payload.events[0].eventSource, 'WEB');
    assert.equal(Object.hasOwn(payload.events[0], 'userData'), false);
  }

  const accepted = database.prepare(`
    select status, provider_request_id, payload_sha256
    from lead_event_deliveries order by delivery_id
  `).all();
  assert.ok(accepted.every((row) =>
    row.status === 'accepted'
    && row.provider_request_id
    && /^[a-f0-9]{64}$/.test(row.payload_sha256)
  ));

  mode = 'auth';
  const authFailureAt = now + 25 * 60 * 60 * 1000;
  const deferred = await processGoogleDataManagerDeliveries(env, { now: authFailureAt });
  assert.equal(deferred.accepted, 2);
  assert.equal(database.prepare(`
    select count(*) as total
    from lead_event_deliveries
    where status = 'accepted' and poll_count = 0 and last_http_status = 401
  `).get().total, 2);

  mode = 'processing';
  const firstPollAt = authFailureAt + 31 * 60 * 1000;
  const processing = await processGoogleDataManagerDeliveries(env, { now: firstPollAt });
  assert.equal(processing.accepted, 2);
  assert.equal(database.prepare(`
    select count(*) as total from lead_event_deliveries where status = 'accepted'
  `).get().total, 2);

  mode = 'success';
  const successAt = firstPollAt + 31 * 60 * 1000;
  const completed = await processGoogleDataManagerDeliveries(env, { now: successAt });
  assert.equal(completed.delivered, 2);
  assert.equal(database.prepare(`
    select count(*) as total from lead_event_deliveries where status = 'delivered'
  `).get().total, 2);
  assert.equal(database.prepare(`
    select count(*) as total from lead_event_delivery_attempts
  `).get().total, 8);
  assert.equal(database.prepare(`
    select count(*) as total
    from lead_event_delivery_attempts
    where error_detail like '%gclid%'
  `).get().total, 0);
});

test('429/5xx fazem retry e erro 4xx termina sem resposta bruta no D1', async () => {
  const database = createMigratedDatabase();
  const now = Date.now();
  let mode = 'retry';
  let retryCalls = 0;
  const env = googleEnv(database, async () => {
    if (mode === 'retry') {
      retryCalls += 1;
      const status = retryCalls === 1 ? 429 : 503;
      return new Response(JSON.stringify({
        error: { status: status === 429 ? 'RESOURCE_EXHAUSTED' : 'UNAVAILABLE' },
      }), {
        status,
        headers: {
          'content-type': 'application/json',
          'retry-after': '60',
        },
      });
    }
    return new Response(JSON.stringify({
      error: {
        status: 'INVALID_ARGUMENT',
        message: 'gclid-sensitive-value must never be persisted',
      },
    }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  });
  await worker.fetch(webhookRequest(campaignFields({
    submissionID: 'delivery-retry-001',
    q23_gclid_captured_at: nowIsoForTest(now),
  })), env);

  const retried = await processGoogleDataManagerDeliveries(env, { now: now + 1000 });
  assert.equal(retried.retry, 2);
  assert.equal(database.prepare(`
    select count(*) as total from lead_event_deliveries where status = 'retry'
  `).get().total, 2);

  database.prepare(`
    update lead_event_deliveries set next_attempt_at = ?
  `).run(nowIsoForTest(now + 1001));
  mode = 'permanent';
  const failed = await processGoogleDataManagerDeliveries(env, { now: now + 1001 });
  assert.equal(failed.failed, 2);
  const rows = database.prepare(`
    select status, attempt_count, last_error_code, last_error_detail
    from lead_event_deliveries
    order by delivery_id
  `).all();
  assert.ok(rows.every((row) =>
    row.status === 'failed'
    && row.attempt_count === 2
    && row.last_error_code === 'INVALID_ARGUMENT'
    && !row.last_error_detail.includes('gclid-sensitive-value')
  ));
});

test('configuração ausente bloqueia sem rede e pode ser reaberta apenas por rota autenticada', async () => {
  const database = createMigratedDatabase();
  const env = {
    ...workerEnv(database),
    GOOGLE_DATA_MANAGER_ENABLED: 'true',
    GOOGLE_DATA_MANAGER_DESTINATIONS_JSON: '{}',
    GOOGLE_DATA_MANAGER_TOKEN_PROVIDER: async () => 'temporary-oauth-token',
    GOOGLE_DATA_MANAGER_FETCH: async () => {
      throw new Error('não deveria chamar');
    },
  };
  await worker.fetch(webhookRequest(campaignFields({
    submissionID: 'delivery-config-001',
  })), env);
  const blocked = await processGoogleDataManagerDeliveries(env);
  assert.equal(blocked.blocked, 2);

  assert.equal((await worker.fetch(new Request(
    'https://worker.test/lead-event-deliveries/requeue-configuration',
    { method: 'POST' },
  ), env)).status, 401);
  const requeued = await worker.fetch(new Request(
    'https://worker.test/lead-event-deliveries/requeue-configuration',
    {
      method: 'POST',
      headers: { authorization: 'Bearer read-secret' },
    },
  ), env);
  assert.equal(requeued.status, 200);
  assert.equal((await requeued.json()).requeued, 2);
  assert.equal(database.prepare(`
    select count(*) as total from lead_event_deliveries where status = 'pending'
  `).get().total, 2);
});
