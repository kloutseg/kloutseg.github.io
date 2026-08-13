# Runbook — autorizar o Jotform de campanhas no Worker de atribuição

Última revisão: 12 de agosto de 2026.

## Objetivo

Autorizar o formulário Jotform `262233413435045`, usado pelas landing pages de Bradesco Saúde e reajuste, no Worker Cloudflare `klout-lead-attribution`.

Hoje o site envia os dados de atribuição ao Jotform, mas o Worker aceita somente estes formulários:

- `261337164438055`: B2C;
- `261337328053050`: B2B de `/analise`.

Por isso, um webhook do formulário `262233413435045` chega ao Worker, mas recebe HTTP `400` com:

```json
{"ok":false,"error":"Formulário não autorizado."}
```

Este runbook descreve a alteração de menor escopo possível: acrescentar o novo ID ao `FORM_CONFIG`, sem alterar o banco, os formulários do site ou as integrações internas da Klout.

## Resultado esperado

Depois da mudança:

1. o Jotform continuará sendo o destino principal do cadastro;
2. o webhook do formulário de campanhas será aceito pelo Worker;
3. o Worker normalizará `q12` a `q20`;
4. a atribuição será gravada na tabela D1 `lead_attributions`;
5. os formulários B2C e B2B de `/analise` continuarão funcionando com os mapeamentos atuais.

## Escopo e limites

Esta autorização não muda o destino dos formulários no site. O ID `262233413435045` já está definido em:

- `src/components/campaign/CampaignLeadForm.svelte`;
- `src/components/campaign/ReajusteLeadForm.svelte`.

Ela também não altera o schema D1. A coluna `lead_type` já aceita `b2b`, que será o tipo do novo formulário.

O Worker atual não persiste estes campos do formulário de campanhas:

- `q11_q11_textbox9`, origem específica da landing;
- `landing_id`;
- `variant_id`;
- `thesis`;
- `experiment_forced`.

Portanto, a origem e a variante permanecem disponíveis no Jotform Tables, mas não no D1. O campo `first_landing` guardado no D1 contém o primeiro caminho acessado e não inclui a query string. Ele não substitui `q11` para distinguir `variant=tecnica` de `variant=sensorial`.

Caso a análise futura precise da variante no D1, deve ser aberta outra mudança, com migração de schema, política de retenção e testes próprios. Isso não deve ser improvisado dentro desta autorização.

## Mapeamento exato do formulário `262233413435045`

Os identificadores abaixo vêm da implementação atual dos dois formulários de campanha.

| Dado normalizado no Worker | Campo recebido do Jotform | Fallback aceito pelo Worker | Coluna no D1 |
|---|---|---|---|
| Visitor ID | `q12_q12_textbox10` | `visitor_id` | `visitor_id` |
| Primeira landing | `q13_q13_textbox11` | `first_landing` | `first_landing` |
| Primeiro referenciador | `q14_q14_textbox12` | `first_referrer` | `first_referrer` |
| UTM source | `q15_q15_textbox13` | `utm_source` | `utm_source` |
| UTM medium | `q16_q16_textbox14` | `utm_medium` | `utm_medium` |
| UTM campaign | `q17_q17_textbox15` | `utm_campaign` | `utm_campaign` |
| UTM content | `q18_q18_textbox16` | `utm_content` | `utm_content` |
| UTM term | `q19_q19_textbox17` | `utm_term` | `utm_term` |
| GCLID | `q20_q20_textbox18` | `gclid` | `gclid` |

Os fallbacks são úteis para testes e integrações futuras, mas o payload real do site usa os identificadores `q12` a `q20`.

Se um campo for apagado e recriado no Jotform, seu identificador interno pode mudar. Nesse caso, primeiro atualize e valide o site; depois ajuste este mapeamento no Worker. O rótulo visível no Jotform não é suficiente para determinar o identificador técnico.

## Pré-requisitos

É necessário ter:

- acesso autorizado à conta Cloudflare que contém o Worker e o D1;
- acesso de edição ao formulário `262233413435045` no Jotform;
- Wrangler autenticado por OAuth ou por um API token com permissões mínimas para Workers Scripts, Workers Secrets e D1;
- o diretório `cloudflare/lead-attribution-worker` do repositório atualizado;
- uma janela de implantação em que seja possível executar e conferir um envio de teste;
- o valor já existente de `JOTFORM_WEBHOOK_TOKEN`, ou alguém autorizado a configurar o webhook sem revelar esse valor;
- o valor de `ATTRIBUTION_API_TOKEN` para consultar os registros, ou acesso equivalente ao D1 pelo painel/CLI.

Não coloque tokens em commits, screenshots, tickets ou mensagens. O `database_id` do D1 é um identificador de recurso, não uma credencial; os dois tokens são segredos.

## Bindings e secrets necessários

### Binding D1

O arquivo `wrangler.toml` atual deve manter:

```toml
[[d1_databases]]
binding = "DB"
database_name = "klout_lead_attribution"
database_id = "9520e8b6-2233-4b4d-aff7-f9fd2b9a0e9d"
```

O código acessa o banco por `env.DB`. Alterar o nome do binding sem alterar o código causará HTTP `500` com `Binding D1 DB ausente.`

### Secrets

O Worker usa dois secrets:

| Secret | Função | Necessário para |
|---|---|---|
| `JOTFORM_WEBHOOK_TOKEN` | Protege a rota `/webhooks/jotform/<token>` | Receber qualquer webhook do Jotform |
| `ATTRIBUTION_API_TOKEN` | Protege `GET /attributions` como Bearer token | Consultar e validar registros pela API |

Confirme apenas os nomes, sem tentar imprimir os valores:

```bash
cd cloudflare/lead-attribution-worker
npx wrangler secret list
```

O resultado deve listar os dois nomes. Um deploy normal preserva secrets já existentes.

Se algum secret estiver ausente, use o fluxo autorizado pela Klout para recuperá-lo ou rotacioná-lo. Para cadastrar um valor de forma interativa:

```bash
npx wrangler secret put JOTFORM_WEBHOOK_TOKEN
npx wrangler secret put ATTRIBUTION_API_TOKEN
```

Atenção: `wrangler secret put` cria e publica uma nova versão imediatamente. Não execute esses comandos apenas para “garantir” os valores. Use-os somente quando o secret estiver realmente ausente ou quando uma rotação tiver sido aprovada.

Não rotacione `JOTFORM_WEBHOOK_TOKEN` isoladamente. O token faz parte da URL cadastrada nos webhooks de todos os formulários. Uma rotação exige atualizar, na mesma janela operacional, todas as URLs do Jotform que usam esse Worker.

## Alteração de código

No arquivo `cloudflare/lead-attribution-worker/worker.mjs`, acrescente o bloco abaixo dentro de `FORM_CONFIG`, depois da configuração do formulário B2B atual e antes do fechamento do objeto:

```js
  '262233413435045': {
    leadType: 'b2b',
    fields: {
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
```

Não substitua a configuração B2B de `/analise`. Os dois formulários são independentes e precisam permanecer autorizados.

O `FORM_CONFIG` deverá passar a ter três entradas. Nenhuma outra parte do Worker precisa mudar para esta autorização.

## Validação antes do deploy

### 1. Revisar o diff

O diff deve conter somente a nova entrada no `FORM_CONFIG`:

```bash
git diff -- cloudflare/lead-attribution-worker/worker.mjs
```

Rejeite a mudança se ela alterar:

- IDs ou mapeamentos dos dois formulários existentes;
- `schema.sql`;
- `wrangler.toml`;
- retenção de dados;
- autenticação das rotas;
- consultas de inserção ou exclusão.

### 2. Testar apenas o normalizador

Este teste não usa rede, não grava no D1 e não cria lead no Jotform. Execute dentro de `cloudflare/lead-attribution-worker`:

```bash
node --input-type=module -e "
import { normalizeSubmission } from './worker.mjs';
const raw = {
  formID: '262233413435045',
  submissionID: 'qa-normalizer-campaign-form',
  q12_q12_textbox10: 'visitor-qa',
  q13_q13_textbox11: '/empresas/beneficios/bradesco-saude',
  q14_q14_textbox12: 'https://www.google.com/',
  q15_q15_textbox13: 'google',
  q16_q16_textbox14: 'cpc',
  q17_q17_textbox15: 'qa_worker',
  q18_q18_textbox16: 'runbook',
  q19_q19_textbox17: 'plano saude empresarial',
  q20_q20_textbox18: 'gclid-qa-nao-real'
};
console.log(JSON.stringify(normalizeSubmission({ envelope: {}, raw }), null, 2));
"
```

Confirme no resultado:

- `formId` igual a `262233413435045`;
- `leadType` igual a `b2b`;
- os nove valores nos campos normalizados corretos;
- ausência da propriedade `error`.

### 3. Compilar sem publicar

Registre a versão usada e faça o dry run:

```bash
npx wrangler --version
npx wrangler deploy --dry-run
```

O projeto não fixa o Wrangler no `package.json`. Use a mesma versão para dry run, deploy e eventual rollback; registre a versão no ticket ou log da implantação.

## Teste local completo, recomendado

O teste local valida rota, autenticação, normalização e gravação sem tocar o D1 remoto.

### 1. Preparar o D1 local

```bash
npx wrangler d1 execute klout_lead_attribution --local --file=./schema.sql
```

O schema usa `create ... if not exists`, portanto pode ser reaplicado ao banco local.

### 2. Definir tokens locais descartáveis

O `.gitignore` atual do projeto não cobre `.dev.vars`. Para evitar colocar tokens no diretório versionado, crie um arquivo temporário fora do repositório:

```bash
KLOUT_QA_ENV_FILE="$(mktemp /tmp/klout-worker-qa.XXXXXX)"
chmod 600 "$KLOUT_QA_ENV_FILE"
printf '%s\n' \
  'JOTFORM_WEBHOOK_TOKEN=qa-local-webhook-token' \
  'ATTRIBUTION_API_TOKEN=qa-local-read-token' \
  > "$KLOUT_QA_ENV_FILE"
```

O conteúdo usa somente valores fictícios:

```dotenv
JOTFORM_WEBHOOK_TOKEN=qa-local-webhook-token
ATTRIBUTION_API_TOKEN=qa-local-read-token
```

### 3. Iniciar o Worker local

```bash
npx wrangler dev --env-file "$KLOUT_QA_ENV_FILE"
```

`wrangler dev` usa recursos locais por padrão. Use outro terminal para os passos seguintes e adapte a porta se o Wrangler informar uma diferente de `8787`.

### 4. Verificar saúde e rejeição

```bash
curl --fail-with-body http://127.0.0.1:8787/health
```

Resultado esperado:

```json
{"ok":true}
```

Um token incorreto deve devolver HTTP `401`:

```bash
curl -i -X POST http://127.0.0.1:8787/webhooks/jotform/token-incorreto
```

### 5. Enviar um payload sintético

Use somente dados fictícios e um `submissionID` exclusivo:

```bash
curl --fail-with-body \
  -X POST http://127.0.0.1:8787/webhooks/jotform/qa-local-webhook-token \
  -H 'content-type: application/json' \
  --data '{
    "formID":"262233413435045",
    "submissionID":"qa-local-campaign-001",
    "q12_q12_textbox10":"visitor-qa-local",
    "q13_q13_textbox11":"/empresas/custos/reajuste",
    "q14_q14_textbox12":"https://www.google.com/",
    "q15_q15_textbox13":"google",
    "q16_q16_textbox14":"cpc",
    "q17_q17_textbox15":"qa_worker",
    "q18_q18_textbox16":"runbook",
    "q19_q19_textbox17":"reajuste plano empresarial",
    "q20_q20_textbox18":"gclid-qa-nao-real",
    "created_at":"2026-08-12 12:00:00"
  }'
```

Resultado esperado:

```json
{"ok":true}
```

### 6. Consultar o D1 local

```bash
npx wrangler d1 execute klout_lead_attribution --local --command="
select submission_id, form_id, lead_type, utm_source, utm_medium, utm_campaign
from lead_attributions
where submission_id = 'qa-local-campaign-001';
"
```

Deve existir uma linha com `form_id = 262233413435045` e `lead_type = b2b`.

O banco local é isolado. Não use `--remote` nesta etapa.

Ao terminar, encerre `wrangler dev` e apague o arquivo temporário. Antes de removê-lo, confirme que a variável ainda começa com `/tmp/klout-worker-qa.`:

```bash
printf '%s\n' "$KLOUT_QA_ENV_FILE"
rm -- "$KLOUT_QA_ENV_FILE"
unset KLOUT_QA_ENV_FILE
```

## Deploy em produção

### 1. Registrar o estado anterior

Dentro de `cloudflare/lead-attribution-worker`, execute:

```bash
npx wrangler deployments list
npx wrangler deployments status
npx wrangler secret list
```

Guarde o ID da versão estável anterior. Ele permite rollback explícito, sem depender da seleção automática.

### 2. Confirmar o binding remoto

O banco deve conter a tabela já usada pelos formulários existentes:

```bash
npx wrangler d1 execute klout_lead_attribution --remote --command="
select name
from sqlite_schema
where type = 'table' and name = 'lead_attributions';
"
```

Se a tabela não existir, interrompa o deploy e investigue conta, ambiente e `database_id`. Não crie uma nova tabela sem confirmar que está na conta e no banco corretos.

### 3. Publicar

```bash
npx wrangler deploy
```

O deploy deve informar:

- Worker `klout-lead-attribution`;
- binding `DB` para `klout_lead_attribution`;
- cron `17 4 * * *`;
- URL ou rota de produção esperada.

Depois, confirme o novo estado:

```bash
npx wrangler deployments status
curl --fail-with-body https://SEU-WORKER.workers.dev/health
```

Não execute novamente `schema.sql`: esta mudança não requer migração.

## Configurar o webhook no Jotform

No formulário `262233413435045`:

1. abra o Form Builder;
2. vá a **Settings**;
3. abra **Integrations**;
4. procure **Webhooks**;
5. adicione a URL de produção do Worker;
6. salve e confirme que a integração está habilitada somente no formulário correto.

Formato da URL:

```text
https://SEU-WORKER.workers.dev/webhooks/jotform/VALOR_DO_JOTFORM_WEBHOOK_TOKEN
```

Use exatamente o mesmo `JOTFORM_WEBHOOK_TOKEN` configurado no Worker. Se o valor contiver `/`, `?`, `#`, `%` ou outro caractere reservado de URL, ele precisa estar percent-encoded no endereço. Tokens URL-safe evitam essa ambiguidade.

Nunca publique a URL completa em documentação, porque o token está incorporado nela.

Adicionar o novo ID ao código e cadastrar o webhook são etapas independentes. O Worker autorizado sem integração no Jotform não receberá nada; o webhook cadastrado antes do deploy continuará recebendo HTTP `400` até a nova versão entrar em produção.

## Validação segura em produção

### Teste A — Worker e D1, sem criar lead no Jotform

Este teste prova a rota e a gravação no D1, mas não prova a configuração do webhook no Jotform.

1. Use um payload sintético, sem nome, e-mail, telefone ou outro dado pessoal.
2. Use um `submissionID` exclusivo, como `qa-prod-campaign-AAAAMMDD-001`.
3. Faça um POST equivalente ao teste local, substituindo a URL e o token.
4. Consulte `GET /attributions?limit=20` com `Authorization: Bearer <ATTRIBUTION_API_TOKEN>` ou consulte o D1 remoto pelo `submissionID` exato.

Para evitar expor tokens no histórico, leia-os de forma interativa:

```bash
read -rsp 'Jotform webhook token: ' KLOUT_WEBHOOK_QA_TOKEN
read -rsp 'Attribution API token: ' KLOUT_ATTRIBUTION_QA_TOKEN
```

Depois do teste:

```bash
unset KLOUT_WEBHOOK_QA_TOKEN KLOUT_ATTRIBUTION_QA_TOKEN
```

Não cole os valores na linha de comando, em arquivos versionados ou no corpo do payload.

### Teste B — Jotform até D1

Este é o teste obrigatório antes de considerar a implantação concluída.

1. Abra uma janela anônima.
2. Acesse uma das landings com UTMs claramente técnicas, por exemplo:

```text
https://kloutseguros.com.br/empresas/beneficios/bradesco-saude?utm_source=qa&utm_medium=internal&utm_campaign=qa_worker_attribution&utm_content=end_to_end
```

3. Aceite cookies analíticos; aceite também marketing apenas se quiser validar o GCLID.
4. Preencha o formulário com uma identidade interna de teste previamente autorizada, nunca com dados de terceiros.
5. Confirme a submissão no Jotform Tables e copie o `submissionID`.
6. Consulte no D1 remoto esse `submissionID` exato:

```bash
npx wrangler d1 execute klout_lead_attribution --remote --command="
select submission_id, form_id, lead_type, visitor_id, first_landing,
       utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid,
       submitted_at, received_at
from lead_attributions
where submission_id = 'SUBMISSION_ID_DO_TESTE';
"
```

Resultado esperado:

- uma única linha;
- `form_id = 262233413435045`;
- `lead_type = b2b`;
- `utm_source = qa`;
- `utm_medium = internal`;
- `utm_campaign = qa_worker_attribution`;
- `utm_content = end_to_end`;
- `first_landing = /empresas/beneficios/bradesco-saude`;
- `visitor_id` preenchido após consentimento analítico;
- `gclid` vazio, porque o URL de exemplo não contém um identificador real.

Sem consentimento analítico, é esperado que os campos de atribuição não sejam enviados pelo site. O Worker ainda pode criar uma linha com valores nulos se o webhook trouxer `formID` e `submissionID`. Isso não é falha da autorização.

### Regressão obrigatória

Depois do novo formulário, confirme ao menos um webhook já existente ou um teste sintético para cada ID anterior:

- `261337164438055` deve continuar normalizado como `b2c`;
- `261337328053050` deve continuar normalizado como `b2b`.

Não é necessário criar leads reais. O teste de `normalizeSubmission` com payloads sintéticos é suficiente para a regressão do mapeamento, desde que a saúde dos webhooks existentes também seja confirmada pelos registros operacionais.

## Critérios de aceite

A autorização só está concluída quando:

- [ ] o diff adiciona apenas a terceira entrada em `FORM_CONFIG`;
- [ ] o normalizador aceita `262233413435045` como `b2b`;
- [ ] `wrangler deploy --dry-run` termina sem erro;
- [ ] os secrets `JOTFORM_WEBHOOK_TOKEN` e `ATTRIBUTION_API_TOKEN` existem;
- [ ] o binding remoto `DB` aponta para `klout_lead_attribution`;
- [ ] o deploy de produção está ativo e `/health` responde `{"ok":true}`;
- [ ] o webhook está habilitado no formulário `262233413435045`;
- [ ] uma submissão ponta a ponta aparece no Jotform Tables;
- [ ] o mesmo `submissionID` aparece uma única vez no D1;
- [ ] UTMs e primeira landing correspondem ao teste;
- [ ] os dois formulários antigos continuam aceitos;
- [ ] a versão estável anterior foi registrada para rollback;
- [ ] o responsável e a data do teste foram anotados.

## Diagnóstico rápido

| Sintoma | Causa provável | Verificação |
|---|---|---|
| Jotform recebe, D1 não recebe | Webhook ausente, URL errada ou Worker ainda sem o novo ID | Integração do formulário, deployment ativo e resposta HTTP |
| HTTP `401` | Token da URL diferente de `JOTFORM_WEBHOOK_TOKEN` | Secret no Worker e URL cadastrada no Jotform |
| HTTP `400` com “Formulário não autorizado” | Versão antiga ativa ou `formID` diferente | `deployments status` e payload do webhook |
| HTTP `400` com “submissionID ausente” | Payload inesperado ou teste incompleto | `submissionID`/`submissionId` no envelope ou `rawRequest` |
| HTTP `500` com “Binding D1 DB ausente” | Binding não publicado como `DB` | `wrangler.toml` e bindings do deployment |
| Linha existe, mas UTMs estão vazias | Sem consentimento analítico, acesso sem UTMs ou nomes internos divergentes | Jotform Tables, consentimento e `q12`–`q20` |
| GCLID vazio | Marketing não autorizado, URL sem GCLID ou retenção expirada | Consentimento de marketing e submissão de teste |
| Técnica e sensorial indistinguíveis no D1 | Limitação conhecida do schema atual | Usar `q11` no Jotform Tables ou abrir evolução do Worker |
| Teste repetido não cria nova linha | `submission_id` é chave primária e a inserção ignora conflito | Usar um novo ID sintético |

## Rollback

### Contenção de menor impacto

Se o problema estiver restrito ao novo formulário:

1. desative ou remova somente o webhook do formulário `262233413435045` no Jotform;
2. preserve os webhooks B2C e B2B existentes;
3. investigue antes de reativar.

Isso interrompe apenas a cópia de atribuição do formulário de campanhas. Os cadastros continuam chegando ao Jotform.

### Rollback do Worker

Se a nova versão afetar o Worker como um todo, volte explicitamente para a versão estável anotada antes do deploy:

```bash
npx wrangler rollback ID_DA_VERSAO_ESTAVEL --message "Rollback: autorização do form 262233413435045"
```

O rollback entra em produção imediatamente. Depois confirme:

```bash
npx wrangler deployments status
curl --fail-with-body https://SEU-WORKER.workers.dev/health
```

Em seguida:

1. remova ou desative o webhook do novo formulário, pois a versão anterior voltará a rejeitá-lo;
2. reverta a alteração no repositório por um commit normal ou `git revert`, preservando o histórico;
3. não use `git reset --hard`;
4. documente horário, versão e motivo;
5. confirme que os webhooks dos dois formulários antigos continuam operacionais.

Como não há migração de schema, o rollback do código não exige rollback do D1. Registros já gravados permanecem no banco; a Cloudflare não os remove ao voltar uma versão. Não apague registros de produção como parte automática do rollback.

### Rotação emergencial do token

Rotacione `JOTFORM_WEBHOOK_TOKEN` apenas se houver suspeita de exposição. Nesse caso:

1. gere um novo token URL-safe;
2. publique-o como secret;
3. atualize imediatamente todas as URLs de webhook dos formulários autorizados;
4. teste cada formulário;
5. invalide qualquer registro externo que contenha a URL anterior.

Uma rotação incompleta interrompe silenciosamente a atribuição dos formulários que mantiverem o token antigo.

## Responsabilidades após a implantação

Defina um responsável por:

- acompanhar erros de webhook no Jotform;
- conferir periodicamente se o volume Jotform e o volume D1 são coerentes;
- investigar linhas sem atribuição sem confundi-las com rejeição de consentimento;
- manter o mapeamento sincronizado se campos forem recriados;
- registrar evoluções necessárias para `variant_id`, `q11`, `gbraid` e `wbraid`.

O Worker atual captura apenas `gclid`. Campanhas que precisem de outros identificadores de clique exigem decisão técnica e de privacidade antes de ampliar o schema e a coleta.

## Referências oficiais

- [Cloudflare — Wrangler: Workers commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
- [Cloudflare — Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare — D1: import and export data](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- [Cloudflare — Worker rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
- [Jotform — Webhooks integration](https://www.jotform.com/integrations/webhooks)
