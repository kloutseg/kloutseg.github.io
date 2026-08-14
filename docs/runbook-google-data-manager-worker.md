# Runbook — Google Ads Data Manager no Worker

Este runbook opera a camada de entrega de conversões do ledger para a Data Manager
API. O ledger factual em `lead_conversion_events` continua sendo a fonte de verdade;
tentativas e estados externos ficam em `lead_event_deliveries` e
`lead_event_delivery_attempts`.

A implementação nasce em modo seguro:

~~~toml
GOOGLE_DATA_MANAGER_ENABLED = "false"
GOOGLE_DATA_MANAGER_DESTINATIONS_JSON = "{}"
~~~

Nesse estado, o webhook cria a fila de forma atômica, mas o Worker não solicita token
OAuth e não faz chamadas à Google.

## Contrato implementado

Cada delivery usa uma requisição unitária e idempotente por `transactionId`:

- `POST https://datamanager.googleapis.com/v1/events:ingest`;
- escopo OAuth `https://www.googleapis.com/auth/datamanager`;
- `destinations` com conta Google Ads e ID numérico da ação;
- evento com `eventTimestamp`, `transactionId`, `eventSource=WEB`;
- GCLID somente em `adIdentifiers.gclid`;
- `consent.adUserData=CONSENT_GRANTED` somente após consentimento explícito;
- HTTP 2xx com `requestId` significa `accepted`, nunca `delivered`;
- conclusão somente após `GET /v1/requestStatus:retrieve?requestId=...`;
- `SUCCESS` conclui, `PROCESSING` reagenda e
  `FAILED`/`PARTIAL_SUCCESS` encerram com falha auditável.

Referências oficiais:

- [events.ingest](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest)
- [Destination](https://developers.google.com/data-manager/api/reference/rest/v1/Destination)
- [Consent](https://developers.google.com/data-manager/api/reference/rest/v1/Consent)
- [requestStatus.retrieve](https://developers.google.com/data-manager/api/reference/rest/v1/requestStatus/retrieve)
- [configuração de acesso](https://developers.google.com/data-manager/api/devguides/quickstart/set-up-access)
- [limites e cotas](https://developers.google.com/data-manager/api/devguides/limits)

## Pré-requisitos externos

Antes de habilitar qualquer envio:

1. habilite a Data Manager API no projeto Google Cloud;
2. crie uma service account exclusiva para esta integração;
3. conceda a ela `roles/serviceusage.serviceUsageConsumer`;
4. adicione o e-mail da service account à conta Google Ads ou à conta administradora
   que tenha acesso de escrita ao cliente;
5. crie e anote os IDs numéricos das três ações:
   `lead_created`, `lead_sb2b` e `lead_b2b50`;
6. mantenha `lead_created` e `lead_sb2b` como secundárias e valide
   `lead_b2b50` antes de qualquer mudança de bidding.

A documentação da Google recomenda impersonação em vez de chaves persistentes.
Como o Worker não possui ADC, esta versão aceita uma chave PKCS#8 armazenada como
Cloudflare secret e troca JWT RS256 por access tokens temporários. Trate isso como
credencial sensível: menor privilégio, rotação periódica, sobreposição durante a
rotação e revogação imediata da chave anterior. A evolução preferível é um broker de
tokens com impersonação, sem chave privada no Worker.

## Destinos

Configure somente ações existentes e IDs sem hífen. Exemplo:

~~~json
{
  "lead_created": {
    "reference": "lead_created",
    "operatingAccount": {
      "accountType": "GOOGLE_ADS",
      "accountId": "1234567890"
    },
    "loginAccount": {
      "accountType": "GOOGLE_ADS",
      "accountId": "9876543210"
    },
    "productDestinationId": "111111"
  },
  "lead_sb2b": {
    "reference": "lead_sb2b",
    "operatingAccount": {
      "accountType": "GOOGLE_ADS",
      "accountId": "1234567890"
    },
    "loginAccount": {
      "accountType": "GOOGLE_ADS",
      "accountId": "9876543210"
    },
    "productDestinationId": "222222"
  },
  "lead_b2b50": {
    "reference": "lead_b2b50",
    "operatingAccount": {
      "accountType": "GOOGLE_ADS",
      "accountId": "1234567890"
    },
    "loginAccount": {
      "accountType": "GOOGLE_ADS",
      "accountId": "9876543210"
    },
    "productDestinationId": "333333"
  }
}
~~~

`operatingAccount` é a conta que recebe a conversão. `loginAccount` é opcional para
acesso direto e, quando usado, deve ser a conta autenticada ou administradora.
`productDestinationId` é apenas o ID numérico da ação, não o resource name.

Mantenha o JSON em `GOOGLE_DATA_MANAGER_DESTINATIONS_JSON` na configuração do
ambiente. O parser rejeita conta, tipo, referência ou ID fora do contrato.

## Secrets

Nunca coloque chave, JWT ou access token em arquivo, commit, log, screenshot ou URL.

No diretório do Worker:

~~~bash
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
~~~

A chave deve ser PKCS#8 com cabeçalhos `BEGIN PRIVATE KEY`. O Worker não aceita access
token estático: ele assina um JWT de uma hora, troca por token OAuth temporário e
mantém o token somente em memória até próximo da expiração.

## Banco e deploy escuro

Aplique sempre migrações antes do código. Em 14 de agosto de 2026, produção ficou
com 0001–0005 aplicadas e o Worker
`fb92053f-e8c3-42e5-bbb4-4e25a56cbe37` ativo em modo escuro. O mesmo comando padrão
foi validado do zero em uma D1 remota temporária. Ainda assim, confirme o estado
antes de cada release.

~~~bash
cd cloudflare/lead-attribution-worker
npx wrangler d1 migrations list klout_lead_attribution --remote
npx wrangler d1 migrations apply klout_lead_attribution --remote
npx wrangler deploy
npx wrangler deployments status
~~~

A migração `0005_add_lead_event_deliveries.sql` cria as duas tabelas e enfileira os
eventos históricos factualmente `ready`. A janela entre migração e deploy é fechada
logo depois do deploy pelo reconciliador autenticado:

~~~text
POST /conversion-events/reconcile
GET  /ready
GET  /lead-event-deliveries?status=pending&limit=100
~~~

Use `Authorization: Bearer <ATTRIBUTION_API_TOKEN>` nas rotas protegidas. O `/ready`
deve responder 200 e `missing_events=0`. Como a flag continua `false`, todo esse
procedimento gera zero chamada à Google.

Invariantes D1:

~~~sql
select count(*) as missing_deliveries
from lead_conversion_events as events
left join lead_event_deliveries as deliveries
  on deliveries.event_id = events.event_id
  and deliveries.destination = 'google_data_manager'
where events.readiness = 'ready'
  and deliveries.delivery_id is null;

select status, blocked_reason, count(*) as total
from lead_event_deliveries
group by status, blocked_reason
order by status, blocked_reason;
~~~

A primeira consulta deve retornar `0`.

## Elegibilidade por delivery

O Worker revalida tudo no instante do claim. Nenhuma dessas condições altera o
`readiness` factual:

- evento deixou de estar `ready` → `event_not_ready`;
- consentimento desconhecido → `consent_unknown`;
- consentimento negado → `consent_denied`;
- GCLID ou instante ausente → `missing_match_key`;
- GCLID inválido, futuro ou com mais de 90 dias → `expired_match_key`;
- destino ou credencial ausente/inválido → `configuration_missing`.

`consent_denied` não é reaberto automaticamente. Bloqueios dinâmicos só voltam a
`pending` quando os dados atuais provam elegibilidade. Após corrigir configuração,
a reabertura é deliberada e autenticada:

~~~text
POST /lead-event-deliveries/requeue-configuration
~~~

## Canary e ativação

Não habilite as três ações de uma vez.

1. mantenha `GOOGLE_DATA_MANAGER_ENABLED=false`;
2. configure apenas um destino de canary e faça deploy;
3. confirme fila, consentimento e GCLID no D1 sem expor o valor do GCLID;
4. altere a flag para `true` e faça novo deploy;
5. execute uma vez `POST /lead-event-deliveries/process`;
6. confirme `accepted` com `provider_request_id`;
7. aguarde pelo menos 30 minutos e confirme `delivered` após polling;
8. verifique a ação no diagnóstico da Data Manager/Google Ads;
9. adicione os outros destinos, reabra `configuration_missing` e amplie gradualmente.

O cron `*/10 * * * *` reconcilia e processa deliveries. O cron diário
`17 4 * * *` também executa retenção; adicionar o cron curto não transforma purge em
operação a cada dez minutos.

## Auditoria

Rotas, todas com `Cache-Control: no-store` e Bearer:

~~~text
GET  /lead-event-deliveries?status=pending&limit=100
GET  /lead-event-deliveries?status=accepted&limit=100
GET  /lead-event-deliveries?status=failed&limit=100
GET  /lead-event-deliveries?status=blocked&limit=100
POST /lead-event-deliveries/process
POST /lead-event-deliveries/requeue-configuration
~~~

A listagem não devolve GCLID, JWT, token ou corpo de resposta do provedor. O D1 guarda
somente IDs operacionais, hash SHA-256 do payload e erros sanitizados.

Alertas mínimos:

- crescimento contínuo de `retry`, `failed` ou `configuration_missing`;
- lease expirado;
- `accepted` por mais de 24 horas;
- 401/403 na ingestão ou polling;
- diferenças entre eventos `ready` e deliveries existentes.

## Rollback

Para interromper imediatamente novas chamadas externas:

1. defina `GOOGLE_DATA_MANAGER_ENABLED=false`;
2. faça deploy;
3. confirme `POST /lead-event-deliveries/process` com `enabled=false`;
4. preserve ledger, deliveries e tentativas para diagnóstico.

Não apague a fila e não mude `transactionId`. Reabilitar o transporte retoma
`pending`, `retry` e polling de `accepted` sem converter aceite assíncrono em sucesso
fictício.

Este runbook não autoriza criação de campanha, gasto de mídia, mudança de orçamento
ou alteração automática da estratégia de lances.
