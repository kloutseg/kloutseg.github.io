import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import worker, {
  normalizeLifeRange,
  normalizeSubmission,
  normalizeSubmissionOrigin,
} from './worker.mjs';

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
    return Promise.all(statements.map((statement) => statement.run()));
  }
}

function createMigratedDatabase() {
  const database = new DatabaseSync(':memory:');
  database.exec(readSql('./migrations/0001_initial.sql'));
  database.exec(readSql('./migrations/0002_add_campaign_context.sql'));
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
  const columns = database.prepare('pragma table_info(lead_attributions)').all();
  const columnNames = new Set(columns.map((column) => column.name));
  for (const name of ['life_range_raw', 'lead_size_segment', 'submission_origin', 'variant_id']) {
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
});
