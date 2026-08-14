# Runbook — segmentação B2B50 no Worker e no D1

Última revisão: 13 de agosto de 2026.

## Objetivo

Fazer o webhook confirmado do Jotform ser a fonte autoritativa para:

- faixa de vidas declarada;
- segmento `sb2b`, `b2b50` ou `unclassified`;
- landing de origem;
- variante Técnica ou Sensorial;
- indicação de variante explicitamente escolhida na URL.

Esta etapa não envia conversões ao Google Ads. Ela cria uma base confiável para isso. Nome, e-mail, telefone e demais dados pessoais continuam fora do D1.

## Contrato implantado

O formulário de campanhas `262233413435045` envia:

- `q5_q5_radio3`: faixa de vidas;
- `q11_q11_textbox9`: origem específica da submissão;
- `q12` a `q20`: atribuição já existente;
- `q22_ad_user_data_consent`: estado técnico do consentimento de marketing.
- `q23_gclid_captured_at`: instante de captura do GCLID.

O Worker preserva o valor bruto e classifica por lista fechada:

| Valor canônico | Segmento |
|---|---|
| `1_9`, `10_29`, `30_49` | `sb2b` |
| `50_99`, `100_299`, `300_plus` | `b2b50` |
| `legacy_30_99`, `unknown` | `unclassified` |

O valor legado `30–99 vidas` nunca é promovido a B2B50. Campo vazio ou valor fora da lista também fica como `unclassified`.

As origens reconhecidas são derivadas no Worker, não confiadas a campos livres enviados pelo navegador. Para o piloto atual:

| Origem | `landing_id` | `variant_id` |
|---|---|---|
| `/empresas/beneficios/bradesco-saude` | `b2b-beneficios-bradesco-saude` | `bradesco-saude` |
| `/empresas/custos/reajuste?variant=tecnica&experiment_forced=false` | `b2b-custos-reajuste` | `reajuste-tecnica` |
| `/empresas/custos/reajuste?variant=sensorial&experiment_forced=false` | `b2b-custos-reajuste` | `reajuste-sensorial` |

Uma URL de reajuste com `experiment_forced=true` é válida para mídia e atendimento.
Ela deve ser excluída apenas da leitura A/B aleatória. QA é identificado por marcadores
explícitos — por exemplo, `utm_source=qa`, `utm_medium=internal` e
`utm_campaign=qa_*` — e não pelo parâmetro de variante.

## Arquivos envolvidos

- `cloudflare/lead-attribution-worker/worker.mjs`;
- `cloudflare/lead-attribution-worker/schema.sql`, snapshot somente para referência;
- `cloudflare/lead-attribution-worker/migrations/0001_initial.sql`;
- `cloudflare/lead-attribution-worker/migrations/0002_add_campaign_context.sql`;
- `cloudflare/lead-attribution-worker/migrations/0003_add_conversion_event_ledger.sql`;
- `cloudflare/lead-attribution-worker/migrations/0004_separate_ledger_readiness_and_click_time.sql`;
- `cloudflare/lead-attribution-worker/worker.test.mjs`;
- `src/lib/attribution.ts`;
- `src/lib/campaign-form.ts`;
- `src/components/ConsentBootstrap.astro`;
- `src/components/campaign/ReajusteLeadForm.svelte`.

Não aplique `schema.sql` em bancos novos nem existentes. Use somente as migrações; misturar os dois fluxos causa tentativa de adicionar colunas duplicadas.

## Validação local

Na raiz do projeto:

```bash
npm run test:worker
npm run check
npm run build
```

No diretório do Worker:

```bash
cd cloudflare/lead-attribution-worker
npx wrangler deploy --dry-run
```

Critério mínimo:

- 19 testes do Worker passam;
- nenhuma faixa desconhecida vira `b2b50`;
- três reentregas com o mesmo `submissionID` mantêm uma linha;
- um retry pode preencher campos que estavam nulos, sem substituir valores já gravados;
- os formulários antigos continuam com as novas colunas nulas;
- dry run reconhece o binding `DB`.

## Ordem obrigatória em produção

A ordem é importante. O Worker novo faz INSERT nas colunas novas. Se ele for publicado antes da migração, os webhooks dos três formulários falharão.

### 1. Versionar antes de publicar

Na raiz:

```bash
git status --short
git diff --check
git add \
  cloudflare/lead-attribution-worker/worker.mjs \
  cloudflare/lead-attribution-worker/worker.test.mjs \
  cloudflare/lead-attribution-worker/schema.sql \
  cloudflare/lead-attribution-worker/migrations \
  cloudflare/lead-attribution-worker/wrangler.toml \
  cloudflare/lead-attribution-worker/wrangler.example.toml \
  package.json \
  src/lib/campaign-form.ts \
  src/lib/campaign-form.test.ts \
  src/components/campaign/CampaignLeadForm.svelte \
  src/components/campaign/ReajusteLeadForm.svelte \
  docs/runbook-segmentacao-b2b50-worker-d1.md \
  docs/runbook-autorizar-jotform-campanhas-worker-atribuicao.md \
  docs/jotform-campaign-form-prompt.md \
  docs/guia-utm-campanhas-jotform.md \
  docs/plano-google-ads-b2b-landings-klout.md
git commit -m "feat: classify campaign leads in attribution worker"
git push
```

Revise o `git status` antes de adicionar arquivos. Não inclua `.env`, tokens, exports do D1 ou arquivos de QA.

### 2. Registrar o estado estável

```bash
cd cloudflare/lead-attribution-worker
npx wrangler whoami
npx wrangler deployments status
npx wrangler secret list
```

Guarde o ID da versão estável anterior. Confirme os secrets apenas pelos nomes:

- `JOTFORM_WEBHOOK_TOKEN`;
- `ATTRIBUTION_API_TOKEN`.

### 3. Conferir banco e migrações pendentes

```bash
npx wrangler d1 execute klout_lead_attribution --remote --command="
select count(*) as total_before from lead_attributions;
"

npx wrangler d1 migrations list klout_lead_attribution --remote
```

Antes de cada release, aplique somente as migrações listadas como pendentes. No estado
atual, a sequência completa é 0001 → 0002 → 0003 → 0004; o Wrangler registra as já
executadas e aplica apenas a próxima.

### 4. Migrar o D1 antes do Worker

```bash
npx wrangler d1 migrations apply klout_lead_attribution --remote
```

O Wrangler cria um backup antes de aplicar. Não interrompa o comando.

Confirme as colunas:

```bash
npx wrangler d1 execute klout_lead_attribution --remote --command="
select name
from pragma_table_info('lead_attributions')
where name in (
  'life_range_raw',
  'life_range',
  'lead_size_segment',
  'submission_origin',
  'landing_id',
  'variant_id',
  'experiment_forced',
  'ad_user_data_consent',
  'is_test',
  'gclid_captured_at'
)
order by name;
"
```

Repita a contagem e confirme que `total_after = total_before`.

### 5. Publicar o Worker

```bash
npx wrangler deploy
npx wrangler deployments status
curl --fail-with-body https://klout-lead-attribution.klout.workers.dev/health
curl --fail-with-body https://klout-lead-attribution.klout.workers.dev/ready
```

O `/health` é apenas o sinal de processo vivo e deve retornar `{"ok":true}`.
O gate de publicação é o `/ready`: ele deve responder HTTP 200 com
`{"ok":true,"missing_events":0}`. Uma resposta HTTP 503 bloqueia a publicação e
exige a reconciliação descrita no runbook do ledger.

## Teste ponta a ponta

Faça três submissões claramente marcadas como QA:

1. Bradesco com `30–49 vidas`;
2. Reajuste Técnica com `50–99 vidas`;
3. Reajuste Sensorial com `100–299 vidas`.

Para validar QA, use a tuple `qa/internal/qa_*`. Para validar o roteamento explícito,
abra Técnica ou Sensorial com `?variant=...`: a origem deverá registrar
`experiment_forced=true`, mas o ledger não deve considerar isso QA. Para validar o
sorteio real, use a URL limpa em outro navegador e espere `experiment_forced=false`.

Consulte no D1:

```sql
select
  submission_id,
  form_id,
  life_range_raw,
  life_range,
  lead_size_segment,
  classification_status,
  submission_origin,
  landing_id,
  variant_id,
  origin_status,
  experiment_forced,
  utm_source,
  utm_campaign,
  received_at
from lead_attributions
where form_id = '262233413435045'
order by received_at desc
limit 10;
```

Resultado esperado:

- `30–49` → `sb2b`;
- `50–99` e `100–299` → `b2b50`;
- Bradesco, Técnica e Sensorial têm IDs distintos e corretos;
- envio por variante explícita tem `experiment_forced = 1`, sem virar teste por isso;
- envio pela URL limpa tem `experiment_forced = 0`;
- cada `submission_id` aparece uma única vez.

Faça também um smoke test em `/analise`. As colunas novas devem ficar nulas e a atribuição antiga deve continuar chegando.

## Rollback

Se o Worker novo falhar, volte apenas o código:

```bash
npx wrangler rollback ID_DA_VERSAO_ESTAVEL --message "Rollback: classificação B2B50"
```

Mantenha as colunas novas. Elas são nulas, compatíveis com a versão anterior e não exigem rollback destrutivo do banco.

Se a migração falhar, não publique o Worker. Use o backup criado pelo D1 e investigue antes de tentar novamente.

## Continuação

O ledger idempotente foi criado na migração `0003` e corrigido pela `0004`, que separa
o fato comercial da futura elegibilidade de entrega ao Google. O contrato, a auditoria e os
critérios de bloqueio estão em
[`runbook-ledger-conversoes-worker-d1.md`](./runbook-ledger-conversoes-worker-d1.md).

A próxima etapa é criar as ações no Google Ads e, depois, uma camada separada de entregas
para o Data Manager API. Rybbit permanece responsável pelo funil e pela UX, nunca pela
confirmação autoritativa do cadastro.
