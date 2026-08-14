# Runbook — ledger de conversões do Worker e D1

Última revisão: 13 de agosto de 2026.

## Objetivo e fronteiras

O webhook confirmado do Jotform é a fonte autoritativa para três fatos:

- `lead_created`;
- `lead_sb2b`;
- `lead_b2b50`.

O navegador emite somente eventos diagnósticos, como `form_start`,
`form_submit_attempt` e `form_submit_acknowledged`. Nenhum deles confirma que o
Jotform criou a submissão.

O ledger não chama Google Ads, Data Manager nem Rybbit. Nele, `ready` significa
“evento factual íntegro e pertencente ao piloto”. Não significa “enviado ao Google”
nem “apto a upload por GCLID”. Consentimento, chave de correspondência, janela,
tentativas e resposta do provedor pertencem à futura camada de entregas.

## Campos técnicos do formulário

| Campo | Uso |
|---|---|
| `q5_q5_radio3` | faixa de vidas |
| `q11_q11_textbox9` | landing e variante |
| `q12` a `q19` | visitante, primeira landing, referrer e UTMs |
| `q20_q20_textbox18` | GCLID |
| `q22_ad_user_data_consent` | `granted`, `denied` ou `unknown` |
| `q23_gclid_captured_at` | instante ISO em que o GCLID foi capturado |

Q22 e q23 são campos ocultos no Jotform. Q20 e q23 são tratados como um par:
sem timestamp válido, não futuro e com no máximo 90 dias, o Worker descarta ambos.
O Worker nunca infere consentimento pela presença do GCLID.

Nome, empresa, e-mail e telefone não são copiados para o D1.

## Regra dos eventos

| Faixa | Eventos |
|---|---|
| `1–9`, `10–29`, `30–49` | `lead_created` + `lead_sb2b` |
| `50–99`, `100–299`, `300+` | `lead_created` + `lead_b2b50` |
| ausente, inválida ou legado `30–99` | somente `lead_created` |

Os formulários antigos de `/analise` continuam gravando atribuição, mas não geram
eventos no ledger.

O identificador interno pode ser longo:

~~~text
event_id = klout:v1:jotform:<form_id>:<submission_id>:<event_name>
~~~

O identificador destinado à deduplicação externa é curto, determinístico e limitado
a 64 caracteres:

~~~text
transaction_id = jf:<submission_id_compacto>:<c|s|50>
~~~

`c`, `s` e `50` representam `lead_created`, `lead_sb2b` e `lead_b2b50`.
Reentregas do mesmo webhook atualizam o mesmo evento.

## Estado factual

Um evento fica `ready` quando:

1. a origem foi reconhecida pelo Worker;
2. a landing pertence ao piloto — Bradesco Saúde, Reajuste Técnica ou Sensorial;
3. a submissão não tem marcadores explícitos de QA.

Os bloqueios factuais são:

| Motivo | Significado |
|---|---|
| `test_submission` | tuple de QA ou prefixo técnico de teste |
| `integrity_conflict` | origem ausente, inválida ou conflitante |
| `outside_pilot_scope` | landing reconhecida, mas fora das três frentes |

`experiment_forced=1` registra que a variante foi escolhida por URL. Isso exclui a
visita da leitura A/B aleatória, mas não transforma o lead em QA e não o bloqueia.
As URLs Técnica e Sensorial podem ser usadas normalmente pela mídia.

Consentimento negado, GCLID ausente ou expirado não alteram a existência factual do
lead. Essas condições serão avaliadas por destino em `lead_event_deliveries`, quando
o conector do Data Manager for implementado.

## Persistência e retenção

`lead_conversion_events` guarda somente IDs técnicos, evento, horário confirmado pelo
Worker, classificação e estado factual. O GCLID permanece apenas em
`lead_attributions`.

- o GCLID é aceito e apagado pela sua própria data de captura, com teto de 90 dias;
- replay com o mesmo timestamp expirado não restaura o identificador;
- atribuição e eventos são eliminados após 180 dias;
- `ON DELETE CASCADE` remove os eventos com a atribuição;
- uma tombstone com o digest SHA-256 de `(form_id, submission_id)` impede que um
  replay recrie dados já eliminados.

A tombstone contém somente o digest e o instante do purge. O ID bruto é eliminado e
não aparece nessa tabela; GCLID, UTM e contexto comercial também não são copiados.

## Migrações e arquivos

- `migrations/0003_add_conversion_event_ledger.sql`: cria o ledger;
- `migrations/0004_separate_ledger_readiness_and_click_time.sql`: separa fato de
  entrega Google, adiciona q23, IDs curtos e tombstones;
- `worker.mjs`: normalização, batch atômico, auditoria e retenção;
- `worker.test.mjs`: contrato e regressões;
- `schema.sql`: snapshot de referência, não mecanismo de atualização;
- `src/lib/attribution.ts`: first touch e latest paid click;
- formulários Svelte: q22/q23 e eventos diagnósticos.

Use somente `wrangler d1 migrations apply`. Não aplique `schema.sql` junto das
migrações.

## Validação local

Na raiz:

~~~bash
npm run test:worker
npm run check
npm run build
git diff --check
~~~

No diretório do Worker:

~~~bash
npx wrangler d1 migrations apply klout_lead_attribution --local
npx wrangler deploy --dry-run
~~~

Critérios:

- 19 testes do Worker passam;
- retries mantêm uma atribuição e no máximo dois eventos;
- falha no batch desfaz atribuição e eventos;
- variante por URL não é QA;
- tuple `qa/internal/qa_*` fica `blocked/test_submission`;
- consentimento e GCLID não mudam a verdade do evento;
- q20 sem q23 válido não é persistido;
- `transaction_id` tem no máximo 64 caracteres;
- replay pós-180 dias não recria atribuição nem evento;
- os formulários antigos geram zero evento.

## Publicação segura

1. criar e ocultar q22 e q23 no Jotform;
2. publicar o frontend que envia q22 e o par q20/q23;
3. confirmar o bundle em produção;
4. executar o preflight remoto;
5. aplicar todas as migrações pendentes, incluindo 0004 e 0005;
6. publicar imediatamente o Worker corrigido;
7. executar a reconciliação autenticada para fechar a janela migração → deploy;
8. exigir HTTP 200 em `/ready`;
9. exigir zero gap entre eventos `ready` e deliveries;
10. executar o teste ponta a ponta.

O Worker antigo ignora q22/q23, portanto o frontend pode ser publicado primeiro. O
Worker novo não pode ser publicado antes da coluna criada pela 0004 e das tabelas
criadas pela 0005.

Preflight:

~~~sql
with recursive
expected_events(submission_id, event_name) as (
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
),
transaction_hashes(submission_id, event_name, position, hash) as (
  select submission_id, event_name, 0, 2166136261
  from expected_events

  union all

  select
    submission_id,
    event_name,
    position + 1,
    (((hash | unicode(substr(submission_id, position + 1, 1)))
      - (hash & unicode(substr(submission_id, position + 1, 1))))
      * 16777619) & 4294967295
  from transaction_hashes
  where position < length(submission_id)
),
proposed(tx) as (
  select
    'jf:' ||
      case
        when length(submission_id) <= 44 then submission_id
        else substr(submission_id, 1, 32) || '-' || printf('%08x', hash)
      end ||
      ':' ||
      case event_name
        when 'lead_created' then 'c'
        when 'lead_sb2b' then 's'
        else '50'
      end
  from transaction_hashes
  where position = length(submission_id)
)
select tx, count(*) as total, length(tx) as transaction_id_length
from proposed
group by tx
having count(*) > 1 or length(tx) > 64;
~~~

A consulta reproduz o mesmo `transaction_id` canônico da migração e do Worker. Ela
deve retornar zero linhas; qualquer colisão ou ID acima de 64 caracteres bloqueia a
publicação.

Comandos:

~~~bash
cd cloudflare/lead-attribution-worker
npx wrangler d1 migrations list klout_lead_attribution --remote
npx wrangler d1 migrations apply klout_lead_attribution --remote
npx wrangler deploy
npx wrangler deployments status
WORKER_URL=https://klout-lead-attribution.klout.workers.dev
curl --fail-with-body --request POST \
  --header "Authorization: Bearer ${ATTRIBUTION_API_TOKEN}" \
  "${WORKER_URL}/conversion-events/reconcile"
curl --fail-with-body "${WORKER_URL}/ready"
~~~

## Auditoria

O endpoint exige `ATTRIBUTION_API_TOKEN` por Bearer e responde com
`Cache-Control: no-store`:

~~~text
GET /conversion-events?readiness=blocked&limit=100
GET /conversion-events?readiness=ready&limit=100
~~~

`readiness` aceita exatamente `ready` ou `blocked`; valores vazios, duplicados ou
inválidos retornam 400.

~~~sql
select event_name, readiness, blocked_reason, count(*) as total
from lead_conversion_events
group by event_name, readiness, blocked_reason
order by event_name, readiness, blocked_reason;
~~~

Nunca coloque token em documentação, commit, screenshot ou URL.

## Teste de aceite

Para QA real, use a tuple completa:

~~~text
utm_source=qa
utm_medium=internal
utm_campaign=qa_<identificador>
~~~

Faça uma submissão em Bradesco e nas duas variantes de Reajuste. Todas devem aparecer
no Jotform, em `lead_attributions` e no ledger, mas com
`blocked/test_submission`. Técnica e Sensorial devem manter seus `variant_id`
corretos; `experiment_forced` não é o motivo do bloqueio.

Depois confirme:

- q5 e q11 corretos;
- q22 normalizado;
- q20 e q23 presentes somente como par;
- exatamente um `lead_created` e um evento de porte quando classificado;
- nenhum gap entre atribuições do form e o ledger;
- `/analise` continua funcionando e gera zero evento no ledger.

## Entrega ao Google Ads

A camada de delivery agora existe, separada do ledger, e permanece desligada por
padrão. A migração `0005` cria fila e tentativas; o Worker revalida consentimento,
GCLID e janela no claim, usa OAuth temporário e só marca sucesso após polling do
`requestId`.

A configuração de conta, ações, secrets, deploy escuro, canary, auditoria e rollback
está em [Runbook — Google Ads Data Manager no Worker](./runbook-google-data-manager-worker.md).

Ainda são tarefas externas criar as três ações, conceder acesso à service account e
informar os IDs reais. Não reutilize `readiness` como `sent`, `failed` ou contador de
tentativas, e não ative mídia ou bidding antes do canary concluído.
