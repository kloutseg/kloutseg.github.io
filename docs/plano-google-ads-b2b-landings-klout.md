# Plano de campanha Google Ads — aquisição B2B Klout

Última verificação da plataforma: **12 de agosto de 2026**.

Escopo: piloto de 30 dias para as landing pages de Bradesco Saúde e Reajuste, com orçamento máximo de mídia de **R$ 6.000**.

Este documento é, ao mesmo tempo:

- um roteiro operacional para configurar a campanha na interface atual do Google Ads;
- o protocolo de medição e decisão do primeiro mês;
- uma fonte de referência para uma futura skill `klout-ads`;
- um registro explícito do que é fato, hipótese, recomendação ou pendência.

As instruções de interface e os recursos da plataforma são voláteis. Antes de reutilizar o plano em outra campanha, confira a data acima e valide os pontos marcados como atuais na documentação oficial.

## 1. Decisão executiva

O primeiro mês deve responder a uma pergunta comercial:

> Qual avenida de demanda traz oportunidades B2B de maior porte para a Klout: a busca puxada por uma operadora conhecida ou a busca puxada pelo problema contratual que a Klout sabe resolver?

Para responder com o mínimo de interferência, a recomendação é criar duas campanhas de Pesquisa independentes:

| Campanha | Tese | Landing | Orçamento inicial |
|---|---|---|---:|
| `S | SP | B2B50 | BRADESCO | M01` | Demanda puxada pela operadora | `/empresas/beneficios/bradesco-saude` | R$ 3.000 |
| `S | SP | B2B50 | REAJUSTE | M01` | Demanda puxada pelo problema e pela consultoria Klout | `/empresas/custos/reajuste` | R$ 3.000 |

A página de Reajuste continuará distribuindo os visitantes entre as versões Técnica e Sensorial. Nos anúncios, deve ser usada a URL limpa, sem `?variant=`. Assim, Técnica versus Sensorial permanece uma hipótese exploratória interna à campanha de Reajuste.

### Por que começar com 50% para cada tese

O posicionamento Klout é a aposta estratégica mais alinhada ao futuro da empresa, mas a landing Bradesco existe justamente para verificar se a procura por uma operadora conhecida abre uma porta comercial mais eficiente. Colocar mais verba antecipadamente em uma das teses transformaria uma preferência em resultado.

O orçamento igual não pressupõe que as duas campanhas terão o mesmo CPC, volume ou número de leads. Ele compra uma oportunidade semelhante de observação. Se uma delas não conseguir gastar por falta de buscas elegíveis, isso também será um aprendizado.

### O que o piloto não poderá provar

Bradesco versus Reajuste não é um A/B causal. As consultas, as ofertas e as motivações serão diferentes. O resultado deverá ser formulado como:

- “a demanda de marca produziu maior proporção de empresas com 100+ vidas”; ou
- “a demanda por reajuste gerou menos formulários, porém mais empresas qualificadas”; ou
- “o sinal foi inconclusivo dentro do orçamento e do período”.

Não deverá ser formulado como “a landing X é melhor”, porque a landing não será a única variável diferente.

## 2. Premissas confirmadas

### Mercado e atendimento

- A Klout atende todo o Brasil.
- São Paulo concentra os esforços atuais.
- Outras regiões poderão ser exploradas quando houver uma lista objetiva de praças prioritárias por operadora.
- Não há restrição setorial no piloto.
- Os decisores prioritários são RH e Financeiro.

### Perfil de lead

- O corte operacional de B2B autêntico será **50 vidas ou mais**.
- Leads abaixo de 50 vidas não serão descartados. Serão classificados como `sB2B` e encaminhados para avaliação comercial separada.
- A faixa de vidas será usada como primeiro sinal de maturidade organizacional. Ela não substitui a avaliação posterior de estrutura, necessidade e capacidade de decisão.

### Oferta Bradesco

A Klout atende três situações:

1. revisão de contrato de quem já utiliza Bradesco Saúde;
2. migração de outra operadora para Bradesco Saúde;
3. contratação por empresa que ainda não possui plano.

A Klout atua como consultoria e corretora, é parceira da Bradesco Seguros e pode desenvolver o relacionamento por meio de serviços gratuitos, como palestras nas empresas.

### Oferta Reajuste

A Klout revisa a apólice que se aproxima da renovação e organiza a decisão entre:

- manter e negociar o contrato atual;
- ajustar desenho, rede ou regras;
- comparar outras alternativas;
- migrar quando houver uma justificativa consistente.

O momento da renovação indica temperatura comercial, não elegibilidade. Uma empresa fora da janela imediata continua sendo oportunidade, mas deve ser classificada como fria, morna ou quente pelo processo comercial.

### Orçamento

- Os R$ 6.000 são destinados integralmente à mídia do Google Ads.
- A verba pode ser redistribuída durante o mês.
- O plano assume 30 dias corridos, com anúncios elegíveis somente de segunda a sexta-feira.
- Se a intenção for veicular durante 30 dias úteis completos, o voo precisará durar aproximadamente 42 dias corridos. Nesse caso, altere as datas antes de publicar.

## 3. Pendências que não devem virar números inventados

Os pontos abaixo não impedem a redação do plano, mas limitam conclusões econômicas:

- margem ou comissão líquida por contrato;
- duração média do relacionamento;
- taxa histórica entre lead, reunião, proposta e venda;
- capacidade diária de atendimento;
- SLA interno além da promessa pública de até 24 horas úteis;
- lista de regiões prioritárias fora de São Paulo;
- critérios comerciais posteriores ao corte de 50 vidas;
- prazo médio entre envio do formulário e fechamento;
- significado exato da afirmação “uma venda a cada 200”.

A estimativa de R$ 10 mil mensais por venda será registrada como **estimativa de receita**, não como margem e não como valor de conversão no Google Ads.

Se “uma venda a cada 200” significar 200 leads, a taxa implícita é de 0,5%. Para gerar 200 leads com R$ 6 mil, seria necessário um CPL médio de R$ 30. Se significar uma venda a cada R$ 200 investidos, o CAC de mídia pretendido é R$ 200 e o orçamento pressuporia 30 vendas. São cenários profundamente diferentes. Até a unidade ser confirmada, nenhum deles será usado como meta de lance. Os cálculos apenas tornam a ambiguidade visível; não demonstram viabilidade.

## 4. Decisões recomendadas e alternativas

| Tema | Escolha para o piloto | Motivo | Alternativa e quando considerar |
|---|---|---|---|
| Tipo de campanha | Pesquisa | Captura demanda já expressa e permite estudar consultas | LinkedIn Ads em ciclo posterior, para criar demanda por cargo e empresa |
| Rede | Somente Google Search | Evita misturar inventários na primeira referência | Testar parceiros de pesquisa em campanha ou experimento separado |
| AI Max | Desligado | Pode expandir consultas, criar textos e selecionar outra URL | Testar após conversões e negativas confiáveis |
| Correspondência | Exata e de frase | Reduz dispersão em conta nova com verba limitada | Ampla somente com conversão confiável e Smart Bidding |
| Lance | Maximizar conversões, sem CPA desejado | O objetivo é formulário B2B50 confirmado, não clique | Maximizar cliques por 3–5 dias apenas como contingência técnica |
| Orçamento | Total de campanha | Cria limite máximo exato para o voo | Orçamento diário se a campanha se tornar contínua |
| Divisão | R$ 3 mil por tese | Preserva a comparação inicial | Mover até R$ 600 após o período de congelamento e mediante regra registrada |
| Geografia | Estado de São Paulo | Concentra operação e produz uma referência comparável | Duplicar a vencedora para praças priorizadas fora de SP |
| Agenda | Segunda a sexta, dia inteiro | O formulário é assíncrono e ainda não há dados por hora | Restringir a 07h–20h se a operação exigir contato quase imediato |
| Conversão primária | Lead confirmado com 50+ vidas | Alinha o lance ao corte B2B definido | Migrar depois para lead qualificado comercialmente |
| Reajuste | URL limpa com divisão Técnica/Sensorial | Mantém sorteio persistente do site | URLs forçadas apenas para QA, nunca para leitura do experimento |

O [AI Max para campanhas de Pesquisa](https://support.google.com/google-ads/answer/15910187?hl=en) é uma camada de automação dentro de Search. Ao ativá-lo, recursos como expansão de termos, personalização de texto e expansão de URL podem mudar justamente os elementos que o piloto precisa manter sob controle.

Os [parceiros de pesquisa](https://support.google.com/google-ads/answer/1722047?hl=en-GB) são incluídos por padrão. Eles podem ser úteis, mas ampliam o inventário e mudam a qualidade do tráfego. Por isso, devem começar desligados.

## 5. Bloqueios técnicos antes do primeiro real

### 5.1 Faixas separadas no corte de 50 vidas

Em 13 de agosto de 2026, o campo foi atualizado no código das landings e na pergunta existente do Jotform, preservando o identificador `q5_q5_radio3`. As opções canônicas são:

```text
1–9 vidas
10–29 vidas
30–49 vidas
50–99 vidas
100–299 vidas
300+ vidas
```

Critério de aceite:

- `1–9`, `10–29` e `30–49` → `sB2B`, conversão secundária;
- `50–99`, `100–299` e `300+` → `B2B50`, conversão primária inicial.

### 5.2 Confirmar o envio no Jotform

O navegador agora emite `form_submit_attempt` após a validação local e `form_submit_acknowledged` somente depois do carregamento da resposta no iframe oculto, com `completion_signal=iframe_load`. Se a resposta não carregar em 20 segundos, a interface mostra erro e não declara a solicitação recebida. Como o POST é feito para outro domínio, o evento do navegador ainda não comprova de forma inequívoca que o Jotform criou a submissão.

Consequência: esses eventos servem para diagnóstico da interface e do funil. Eles não devem receber nomes de conversão nem orientar os lances.

Soluções, em ordem de robustez:

1. endpoint próprio recebe o formulário, envia ao Jotform, confirma a resposta e então devolve sucesso ao navegador;
2. webhook confirmado do Jotform grava o lead e o evento factual; uma camada de entregas separada envia depois a conversão elegível ao Google Ads;
3. MVP provisório reconcilia diariamente os eventos do navegador com as submissões efetivas do Jotform.

O lançamento pago deve ocorrer somente quando um envio de produção for confirmado de ponta a ponta.

### 5.3 Autorizar o novo formulário no Worker

Em 13 de agosto de 2026, o formulário de campanhas `262233413435045` foi incluído no `FORM_CONFIG`. O webhook foi corrigido e o mesmo `submissionID` foi confirmado no Jotform e no D1. A autorização básica de `q12` a `q20`, portanto, está concluída.

A classificação autoritativa, o ledger factual e a fila de Data Manager estão
publicados. Em 14 de agosto de 2026, as migrações 0004 e 0005 foram aplicadas e o
Worker foi publicado na versão `fb92053f-e8c3-42e5-bbb4-4e25a56cbe37`.
`/ready` respondeu com `missing_events=0`, a fila não apresentou gaps e os sete
eventos existentes eram QA bloqueado. O transporte Google permanece desligado por
`GOOGLE_DATA_MANAGER_ENABLED=false`, sem credenciais ou destinos Google.

Use os dois runbooks:

- [`runbook-segmentacao-b2b50-worker-d1.md`](./runbook-segmentacao-b2b50-worker-d1.md)
- [`runbook-google-data-manager-worker.md`](./runbook-google-data-manager-worker.md)

Não publique o Worker novo antes das migrações remotas. A ordem inversa quebra o
INSERT dos formulários e a criação atômica da fila.

### 5.4 Colocar o GTM em produção

O site lê `PUBLIC_GTM_ID` em `src/components/CookieConsent.astro` e o workflow de
GitHub Pages a injeta por `vars.PUBLIC_GTM_ID`. O container e a existência dessa
variável no escopo do repositório ou da organização ainda precisam ser confirmados.

Antes do lançamento:

1. criar o container no Google Tag Manager;
2. guardar o ID como variável de Actions, por exemplo `PUBLIC_GTM_ID`;
3. confirmar que o job de build recebe a variável;
4. publicar ou reexecutar o workflow;
5. aceitar cookies em produção e confirmar o carregamento pelo Tag Assistant;
6. rejeitar cookies e confirmar o comportamento previsto pelo Consent Mode.

Não confundir `PUBLIC_GTM_ID` com segredo. O ID do container é público; ainda assim, deve existir uma fonte canônica e um processo de deploy testável.

### 5.5 Verificação financeira e marca Bradesco

A conta foi informada como pronta e verificada. Mesmo assim, seguros estão no escopo da [verificação de serviços financeiros no Brasil](https://support.google.com/adspolicy/answer/15332527?co=GENIE.CountryCode%3DBR&hl=pt-br).

Antes de publicar a campanha Bradesco:

- confirmar que a verificação se aplica à conta e ao domínio `kloutseguros.com.br`;
- usar Klout como nome e logo do anunciante;
- deixar claro no anúncio e na landing que a consultoria e a corretagem são realizadas pela Klout;
- conservar a documentação que comprova a parceria;
- não sugerir que a landing é um site oficial do Bradesco.

Recomenda-se incluir na landing uma frase inequívoca, sujeita à aprovação da Klout:

> A consultoria e a corretagem são realizadas pela Klout, parceira Bradesco Seguros.

O Google permite o uso de marcas em determinados contextos de revenda ou informação, desde que a relação fique clara. Consulte a [política de marcas](https://support.google.com/adspolicy/answer/6118?hl=en).

Se a campanha for reprovada:

1. registrar o motivo exato da política;
2. enviar a comprovação ou ajustar a clareza da relação uma única vez;
3. se a reprovação persistir, pausar Bradesco;
4. transferir o saldo não gasto para Reajuste;
5. registrar que a interrupção foi regulatória, não uma conclusão de mercado.

## 6. Arquitetura de mensuração

Cada sistema deve responder a uma pergunta diferente.

| Sistema | Fonte de verdade para |
|---|---|
| Google Ads | custo, consulta, clique, leilão e sinal usado pelo lance |
| Rybbit | comportamento na landing, variante, fricção e funil da sessão |
| Jotform | submissão realmente criada e dados fornecidos pelo lead |
| Worker/D1 | cópia técnica da atribuição recebida por webhook |
| Processo comercial ou CRM | qualificação, reunião, proposta, venda e receita |

Rybbit não substitui a conversão do Google Ads. Jotform Tables não substitui a classificação comercial. O Google Ads não deve ser usado como cadastro mestre.

### 6.1 Dicionário inicial de conversões

| Evento | Definição | Google Ads | Fonte |
|---|---|---|---|
| `form_submit_acknowledged` | Navegador chegou ao estado visual de sucesso | Secundária ou somente diagnóstico | Site/Rybbit |
| `lead_created` | Jotform confirmou a submissão | Secundária | Jotform/webhook |
| `lead_sb2b` | Lead criado com menos de 50 vidas | Secundária | Jotform/processamento |
| `lead_b2b50` | Lead criado com 50+ vidas | **Primária no mês 1** | Jotform/processamento |
| `qualified_lead` | Lead aprovado por critério comercial posterior | Secundária até o processo estabilizar | CRM/processo comercial |
| `meeting_held` | Reunião efetivamente realizada | Secundária | CRM/processo comercial |
| `proposal_created` | Proposta formal enviada | Secundária | CRM/processo comercial |
| `customer_won` | Contrato fechado | Secundária; futura candidata a valor | CRM/financeiro |

Quando `qualified_lead` tiver definição estável, baixa latência e volume suficiente, ela poderá se tornar primária. Nesse momento, `lead_b2b50` deve deixar de orientar o lance para evitar que dois estágios do mesmo lead sejam contados como dois resultados.

O Google separa ações [primárias e secundárias](https://support.google.com/google-ads/answer/11461796?hl=en). As primárias entram na coluna “Conversões” e podem orientar lances; as secundárias permanecem em “Todas as conversões”.

### 6.2 Configuração da conversão primária

Nome sugerido:

```text
Lead B2B 50+ | formulário confirmado
```

Configuração:

- categoria: envio de formulário de lead;
- contagem: `Uma`;
- valor: não usar valor financeiro no mês 1;
- janela de clique: 30 dias;
- atribuição: baseada em dados;
- otimização: primária;
- escopo: somente as duas campanhas deste piloto.

Para geração de leads, a contagem “Uma” evita considerar várias ações do mesmo clique como vários leads. Consulte as [opções de contagem de conversões](https://support.google.com/google-ads/answer/3438531?hl=en-EN).

### 6.3 Conversões offline

O objetivo de médio prazo é devolver ao Google os estágios `qualified_lead` e `customer_won` por meio de Enhanced Conversions for Leads e Google Ads Data Manager.

Em 2026, o Google unificou configurações de conversões aprimoradas e migrou os novos fluxos de upload para o Data Manager. O desenho novo não deve depender do fluxo legado da Google Ads API.

Referências:

- [leads qualificados e convertidos](https://support.google.com/google-ads/answer/11459091?hl=en-IN);
- [Enhanced Conversions for Leads com Data Manager](https://support.google.com/google-ads/answer/15707550?hl=en);
- [mudanças de 2026 nas conversões aprimoradas](https://support.google.com/google-ads/answer/16884284?hl=en).

Campos a preservar por lead:

- ID interno único;
- data e hora;
- landing e variante;
- origem e UTMs;
- GCLID e, quando aplicável, GBRAID/WBRAID;
- faixa de vidas;
- cargo ou área;
- empresa;
- situação atual do contrato;
- operadora atual;
- mês de renovação;
- estágio comercial;
- motivo de perda.

E-mail e telefone só devem ser transmitidos nos fluxos permitidos, normalizados e protegidos conforme a documentação e o consentimento aplicável. Nunca coloque dados pessoais em UTMs, propriedades do Rybbit ou URLs.

### 6.4 Auto-tagging e UTMs

Em `Administração > Configurações da conta > Marcação automática`, mantenha habilitada a opção que adiciona o GCLID aos cliques. A [marcação automática](https://support.google.com/google-ads/answer/3095550?hl=en-A) é necessária para conversões online e offline.

Sufixo da campanha Bradesco:

```text
utm_source=google&utm_medium=cpc&utm_campaign=search_b2b_bradesco_sp_m1&utm_content={creative}&utm_term={keyword}
```

Sufixo da campanha Reajuste:

```text
utm_source=google&utm_medium=cpc&utm_campaign=search_b2b_reajuste_sp_m1&utm_content={creative}&utm_term={keyword}
```

O sufixo é preenchido sem `?`. O Google monta a URL corretamente. Depois de salvar, use o botão **Testar**.

O GCLID será acrescentado pela marcação automática. As UTMs permanecem úteis para Jotform, Rybbit e reconciliação humana. Elas não substituem o GCLID.

## 7. Orçamento e ritmo

### 7.1 O que significa limite máximo

“Limite máximo” significa que o total faturado não poderá ultrapassar R$ 6.000 durante o voo. O saldo depositado na conta não garante sozinho esse comportamento; o limite precisa estar refletido nos orçamentos das campanhas.

Para cada campanha nova, selecione **Orçamento total da campanha** e informe R$ 3.000, usando as mesmas datas de início e fim. Segundo a documentação atual, esse tipo de orçamento está disponível para Search, aceita períodos de 3 a 90 dias e nunca cobra acima do total definido. O tipo de orçamento não pode ser trocado depois da criação. Consulte [orçamentos totais de campanha](https://support.google.com/google-ads/answer/10486938?hl=en).

O orçamento total não possui teto diário. O Google pode gastar mais em um dia e menos em outro para tentar utilizar o valor até o fim.

Se houver 22 dias de segunda a sexta dentro da janela:

```text
R$ 6.000 / 22 = R$ 272,73 por dia elegível na conta
R$ 3.000 / 22 = R$ 136,36 por dia elegível em cada campanha
```

Esses valores são referências de planejamento, não limites diários.

### 7.2 Regra de redistribuição

Nos dez primeiros dias elegíveis:

- manter R$ 3.000 por campanha;
- não mover verba por CTR, CPC ou um único lead;
- corrigir apenas falha técnica, reprovação ou consulta evidentemente indevida.

Depois do décimo dia, permitir no máximo uma redistribuição de **R$ 600**, desde que seja registrada antes da mudança e ocorra uma destas condições:

1. uma campanha não consegue consumir o orçamento por falta de demanda elegível;
2. uma campanha apresenta, ao mesmo tempo, melhor custo por lead B2B50 e melhor composição de porte;
3. uma campanha é bloqueada por política;
4. os termos de uma campanha revelam desvio estrutural de intenção que não pode ser corrigido apenas com negativas.

Se houver poucos leads, mantenha 50/50. Ausência de evidência não autoriza escolher um vencedor.

Não use orçamento compartilhado neste piloto. Ele redistribuiria recursos automaticamente e não é compatível com campanhas de orçamento total. Veja [orçamentos compartilhados](https://support.google.com/google-ads/answer/10487241?hl=en).

### 7.3 Feriados

O agendamento não exclui feriados automaticamente. Se “somente dias úteis” precisar excluir feriados nacionais, estaduais e municipais, programe lembretes para pausar e reativar as campanhas. Registre as pausas porque o sistema recalculará o ritmo no restante do voo.

## 8. Estrutura das campanhas e grupos

### Campanha Bradesco

```text
S | SP | B2B50 | BRADESCO | M01
├── Contratacao_Migracao
└── Revisao_Contrato
```

### Campanha Reajuste

```text
S | SP | B2B50 | REAJUSTE | M01
├── Reajuste_Renovacao
└── Custos_Sinistralidade
```

Quatro grupos são suficientes para separar intenções sem pulverizar R$ 6 mil em dezenas de células. Cada grupo terá uma landing coerente e um RSA no piloto.

O Google recomenda mais de um RSA por grupo em muitos cenários. Aqui, a escolha por um anúncio responsivo por grupo é deliberada: a conta é nova, a verba é limitada e o primeiro teste não é de copy. O segundo RSA deverá ser criado depois, como variação controlada, não como mais uma variável silenciosa.

## 9. Keyword Planner antes da criação

Não trate a lista deste documento como previsão de volume.

Na conta Google Ads:

1. abra `Ferramentas > Planejamento > Planejador de palavras-chave`;
2. selecione **Ver volume de pesquisas e previsões**;
3. cole as keywords de cada grupo;
4. configure Estado de São Paulo;
5. escolha Google Search, sem parceiros;
6. defina o período correspondente ao voo;
7. revise correspondência exata e de frase;
8. exporte volume, cliques estimados, CPC e intervalo de lance de primeira página;
9. salve o arquivo com a data da consulta;
10. marque como `baixo volume` sem mudar automaticamente para ampla.

As previsões do [Keyword Planner](https://support.google.com/google-ads/answer/7337243?hl=en) são atualizadas diariamente e usam dados recentes, ajustados por sazonalidade. Continuam sendo estimativas, não promessa de desempenho.

## 10. Keywords iniciais

Correspondências exata e de frase também são semânticas: não exigem sempre a mesma sequência literal. Por isso, a lista deve ser curta, organizada por intenção e acompanhada pelo relatório de termos. Veja [como a correspondência funciona atualmente](https://support.google.com/google-ads/answer/14996023?hl=en).

### 10.1 Bradesco — `Contratacao_Migracao`

```text
[bradesco saúde empresarial]
"bradesco saúde empresarial"
[plano bradesco saúde empresa]
"plano bradesco saúde para empresa"
[contratar bradesco saúde empresarial]
"cotação bradesco saúde empresarial"
[bradesco saúde coletivo empresarial]
"migrar para bradesco saúde"
[corretora bradesco saúde empresarial]
"bradesco saúde 50 vidas"
```

Motivo: concentra procura comercial explícita, com marca, produto e contexto empresarial. O qualificador `50 vidas` terá pouco volume, mas pode produzir um sinal valioso de porte.

### 10.2 Bradesco — `Revisao_Contrato`

```text
[revisão contrato bradesco saúde]
"revisão contrato bradesco saúde"
[reajuste bradesco saúde empresarial]
"reajuste bradesco saúde empresarial"
[reduzir custo bradesco saúde]
"renegociar bradesco saúde empresarial"
[consultoria bradesco saúde empresarial]
"renovação bradesco saúde empresarial"
```

Motivo: captura empresas que já podem ter relação com a operadora e apresentam um problema contratual. É uma intenção diferente de simples cotação e deve ter relatório próprio.

### 10.3 Reajuste — `Reajuste_Renovacao`

```text
[reajuste plano de saúde empresarial]
"reajuste plano de saúde empresarial"
[aumento plano de saúde empresarial]
"reduzir reajuste plano de saúde empresarial"
[renovação plano de saúde empresarial]
"renovação plano de saúde empresarial"
[renegociar plano de saúde empresarial]
"revisão plano de saúde empresarial"
[revisão apólice saúde empresarial]
```

Motivo: reúne buscas em que a empresa já reconhece o evento que exige decisão. A copy não promete redução; apresenta revisão, comparação e negociação como caminhos possíveis.

### 10.4 Reajuste — `Custos_Sinistralidade`

```text
[reduzir custo plano de saúde empresa]
"reduzir custos plano de saúde empresarial"
[sinistralidade plano de saúde empresarial]
"gestão de sinistralidade plano saúde"
[consultoria plano de saúde empresarial]
"consultoria benefícios saúde empresa"
```

Motivo: aproxima o anúncio de RH e Financeiro que já procuram uma leitura de gestão. É um grupo mais amplo e deve receber atenção especial no relatório de termos.

### 10.5 O que não incluir no início

- keyword ampla;
- nomes de concorrentes como keywords ativas;
- termos genéricos como `plano de saúde`;
- termos B2C sem qualificador empresarial;
- listas extensas geradas automaticamente;
- Dynamic Search Ads;
- keyword insertion dinâmica nos anúncios.

A correspondência ampla depende de Smart Bidding e de sinais de conversão confiáveis. A documentação do Google considera crítico combiná-la com lances inteligentes. No piloto, ainda não existe histórico que permita separar expansão útil de ruído com segurança. Veja [opções de correspondência](https://support.google.com/google-ads/answer/7478529?hl=en-t).

## 11. Negativas iniciais

Crie uma lista compartilhada:

```text
NEG | B2B Saúde | Base
```

### 11.1 Emprego e formação

Negativas amplas de uma palavra:

```text
vaga
vagas
emprego
empregos
salário
salários
curso
cursos
faculdade
concurso
apostila
estágio
estagio
```

Negativas de frase:

```text
"trabalhe conosco"
"modelo de contrato"
```

### 11.2 Pessoa física e microempresa

```text
"plano individual"
"plano familiar"
"pessoa física"
"pessoa fisica"
"coletivo por adesão"
"plano por adesão"
mei
"plano para mei"
```

Esses termos são excluídos do investimento desta campanha porque reproduzem o perfil atual de PF ou pequeno CNPJ que o piloto pretende superar. Leads menores que chegam por termos empresariais continuam sendo aceitos e classificados como `sB2B`.

### 11.3 Suporte e navegação

Negativas amplas:

```text
login
boleto
carteirinha
aplicativo
app
sac
ouvidoria
```

Negativas de frase:

```text
"segunda via"
"2 via"
"central de atendimento"
"telefone bradesco saúde"
"whatsapp bradesco saúde"
"solicitar reembolso"
"status do reembolso"
"autorização de exame"
"autorizacao de exame"
"marcar consulta"
"marcar exame"
"agendar consulta"
"agendar exame"
```

### 11.4 Serviço público

```text
sus
```

### 11.5 Separação entre as teses

Na campanha Reajuste, adicione como negativa de frase:

```text
"bradesco saúde"
```

Isso evita que a demanda explícita de marca seja atribuída ao posicionamento Klout.

### 11.6 Termos que não devem ser negativados sem evidência

Não exclua inicialmente:

```text
preço
valor
cotação
barato
rede
hospital
laboratório
reembolso
ANS
sinistralidade
consultoria
corretora
nomes de outras operadoras
```

Essas palavras podem participar de uma consulta comercial legítima. Por exemplo, `rede credenciada bradesco saúde para empresa` pode indicar uma empresa comparando cobertura, enquanto `guia médico bradesco login` indica suporte. A negativa deve observar a intenção completa.

Negativas não cobrem automaticamente todos os sinônimos, plurais e variações. Use a lista inicial como proteção, depois acrescente termos comprovadamente irrelevantes. Consulte [correspondência de negativas](https://support.google.com/google-ads/answer/9701952?hl=en).

### 11.7 Rotina de termos de pesquisa

Duas vezes por semana:

1. abra `Campanhas > Insights e relatórios > Termos de pesquisa`;
2. filtre cada campanha e grupo;
3. classifique cada termo como:
   - `ICP comercial`;
   - `pesquisa relevante`;
   - `sB2B`;
   - `suporte`;
   - `pessoa física`;
   - `irrelevante`;
4. adicione negativa com a correspondência mais estreita que resolva o problema;
5. registre termo, motivo, escopo e data;
6. não promova automaticamente um termo para keyword apenas porque converteu uma vez.

## 12. Anúncios responsivos de pesquisa

O formato atual permite até 15 títulos de 30 caracteres e quatro descrições de 90. Como os elementos podem aparecer em ordens variadas, cada linha precisa fazer sentido sem depender da anterior. Consulte [anúncios responsivos de pesquisa](https://support.google.com/google-ads/answer/7684791?hl=en).

### Regras editoriais

- escrever o que a Klout realmente fará;
- usar problema, critério e próximo passo;
- evitar “solução completa”, “jornada”, “excelência”, “transforme” e outros termos sem evidência;
- não prometer economia;
- não sugerir contratação oficial diretamente com a operadora;
- não usar urgência artificial;
- não usar números além dos publicados no site e aprovados pela Klout;
- manter a qualificação de 50+ vidas visível;
- manter o retorno de até 24 horas úteis coerente com a landing.

No piloto, não serão usados números institucionais nos anúncios. Isso evita transformar uma prova geral do site em alegação B2B específica sem segmentação comprovada.

### 12.1 RSA Bradesco — Contratação e migração

URL final:

```text
https://kloutseguros.com.br/empresas/beneficios/bradesco-saude
```

Caminhos:

```text
saude-empresa / 50-mais-vidas
```

Títulos:

```text
Bradesco Saúde empresarial
Plano para empresas 50+
Cotação para 50+ vidas
Contrate com apoio da Klout
Compare rede e cobertura
Migre para o Bradesco Saúde
Plano para equipes de 50+
Avalie o contrato atual
Klout, parceira Bradesco
Fale com um consultor
Avalie antes de contratar
Retorno em até 24h úteis
```

Descrições:

```text
Consultoria e corretagem da Klout, parceira Bradesco Seguros, para 50+ vidas.
Já tem plano? Compare o contrato atual com a migração para o Bradesco Saúde.
Ainda não tem plano? Veja opções empresariais com apoio da equipe Klout.
Envie os dados da empresa. A equipe retorna em até 24 horas úteis.
```

Fixação recomendada:

- fixar as duas opções com `50+` na posição de título 2;
- fixar a primeira descrição na posição 1 para tornar a relação entre Klout e Bradesco inequívoca;
- deixar os demais elementos livres.

### 12.2 RSA Bradesco — Revisão de contrato

Títulos:

```text
Revise seu contrato Bradesco
Reajuste Bradesco Saúde
Contrato para 50+ vidas
Entenda o reajuste
Confira rede e regras
Avalie manter ou ajustar
Revisão com apoio da Klout
Klout, parceira Bradesco
Decida antes da renovação
Para RH e Financeiro
Fale com um consultor
Retorno em até 24h úteis
```

Descrições:

```text
Consultoria e corretagem da Klout, parceira Bradesco Seguros, para 50+ vidas.
Sua empresa já tem Bradesco Saúde? Revise reajuste, rede e regras antes de renovar.
A Klout revisa o contrato e aponta os pontos que precisam de decisão.
Envie os dados da empresa. A equipe retorna em até 24 horas úteis.
```

### 12.3 RSA Reajuste — Reajuste e renovação

URL final:

```text
https://kloutseguros.com.br/empresas/custos/reajuste
```

Não acrescente `variant=tecnica` nem `variant=sensorial`.

Caminhos:

```text
reajuste / plano-empresa
```

Títulos:

```text
Reajuste do plano empresarial
Revise antes da renovação
Análise para 50+ vidas
Entenda o próximo reajuste
Compare manter ou migrar
Revise a apólice de saúde
Decida com base no contrato
Para RH e Financeiro
Análise do plano empresarial
Fale com a Klout
Retorno em até 24h úteis
Veja onde o custo mudou
```

Descrições:

```text
Sua empresa tem 50+ vidas? Revise o contrato antes da próxima renovação.
Entenda reajuste, rede e uso para avaliar se vale manter, ajustar ou migrar.
A Klout reúne os pontos do contrato para RH e Financeiro compararem os caminhos.
Envie os dados da empresa. A equipe retorna em até 24 horas úteis.
```

### 12.4 RSA Reajuste — Custos e sinistralidade

Títulos:

```text
Revise o custo com critério
Custo do plano empresarial
Analise a sinistralidade
Plano para 50+ vidas
O que pressiona o custo
Revise uso, rede e contrato
Compare ajuste e migração
Gestão do plano de saúde
Para RH e Financeiro
Reveja antes de renovar
Fale com a Klout
Retorno em até 24h úteis
```

Descrições:

```text
Veja o que pesa no custo do plano: uso, rede, contrato e reajuste previsto.
Para empresas com 50+ vidas. Compare manutenção, ajuste e migração com critério.
A Klout organiza os dados da apólice para RH e Financeiro decidirem o próximo passo.
Envie os dados da empresa. A equipe retorna em até 24 horas úteis.
```

### Por que não produzir dezenas de variações agora

Um RSA já combina títulos e descrições de várias formas. Quatro grupos com 12 títulos cada oferecem variação suficiente para o mês 1. Criar muitos anúncios dificultaria saber se uma diferença veio da consulta, da copy, da landing ou da distribuição automática dos assets.

A força do anúncio é um diagnóstico de variedade e aderência entre assets e keywords; não compõe diretamente o Ad Rank. Se o Google sugerir frases genéricas apenas para alcançar “Excelente”, preserve a clareza da oferta.

## 13. Assets

### 13.1 Callouts

Use em nível de campanha:

```text
Empresas com 50+ vidas
Revisão de contrato
Rede, custo e regras
Retorno em 24h úteis
Para RH e Financeiro
Análise antes de renovar
```

### 13.2 Snippet estruturado

Cabeçalho:

```text
Serviços
```

Valores:

```text
Revisão de contrato
Análise de reajuste
Migração de plano
Contratação empresarial
```

### 13.3 Sitelinks

O Google recomenda sitelinks, mas as landings atuais não têm um conjunto verificado de âncoras estáveis para representar quatro destinos distintos.

Escolha recomendada:

- não enviar o visitante para páginas institucionais diferentes durante o piloto;
- criar âncoras reais e semanticamente coerentes nas landings;
- só então cadastrar sitelinks para essas seções;
- testar cada fragmento em desktop e celular antes de publicar.

Não use quatro sitelinks diferentes apontando para o mesmo conteúdo apenas para melhorar a força do anúncio. O ganho visual não compensa uma navegação falsa.

### 13.4 Assets que ficam de fora

- **Formulário de lead do Google:** desviaria do Jotform e impediria o teste das landings.
- **Ligação:** só ativar quando houver número, agenda de atendimento e rastreamento equivalentes.
- **WhatsApp:** não usar como destino paralelo sem atribuição e qualificação comparáveis.
- **Preço ou promoção:** não há oferta pública que justifique o formato.
- **Imagens:** a conta nova pode ainda não cumprir os critérios de elegibilidade; revisar depois de histórico e aprovação.

Use sempre o nome comercial e o logo da Klout nos assets de empresa.

## 14. Configuração passo a passo no Google Ads

Os nomes podem variar ligeiramente conforme idioma e atualização da conta, mas o fluxo atual segue esta estrutura.

### 14.1 Preparar a conta

1. Abra `Administração > Configurações da conta`.
2. Confirme moeda BRL e fuso de São Paulo.
3. Abra **Marcação automática** e confirme que está ligada.
4. Confirme faturamento e verificação do anunciante.
5. Confirme especificamente o status de serviços financeiros e o domínio.
6. Abra `Recomendações > Configurações de aplicação automática`.
7. Desative todas as aplicações automáticas no piloto.
8. Registre uma captura de tela para a pasta operacional da campanha.

### 14.2 Configurar mensuração

1. Crie ou selecione o container do Google Tag Manager.
2. Instale o Google tag em todas as páginas.
3. Adicione Conversion Linker.
4. Configure Consent Mode com:
   - `ad_storage`;
   - `analytics_storage`;
   - `ad_user_data`;
   - `ad_personalization`.
5. Crie no site o evento provisório de tentativa e o evento autoritativo de lead confirmado.
6. Abra `Metas > Conversões > Resumo > Criar ação de conversão`.
7. Crie `Lead B2B 50+ | formulário confirmado`.
8. Configure contagem `Uma`, janela de 30 dias, atribuição baseada em dados e ação primária.
9. Crie `Lead sB2B <50` e `Lead criado | total` como secundárias.
10. Teste Bradesco, Técnica e Sensorial com o Tag Assistant.
11. Confirme que uma submissão gera somente uma conversão.
12. Reconcilie os IDs com o Jotform.

Não publique a campanha enquanto a conversão primária não tiver sido validada em produção.

### 14.3 Criar a campanha Bradesco

1. Vá a `Campanhas > + > Nova campanha`.
2. Selecione o objetivo **Leads**.
3. Selecione **Pesquisa**.
4. Escolha somente a meta `Lead B2B 50+ | formulário confirmado` para otimização.
5. Nomeie `S | SP | B2B50 | BRADESCO | M01`.
6. Em lances, selecione **Maximizar conversões**.
7. Não informe CPA desejado.
8. Desmarque parceiros de pesquisa.
9. Desmarque Display ou expansão para Display, se a opção aparecer.
10. Deixe AI Max desligado.
11. Confira separadamente:
    - correspondência de termos desligada;
    - personalização de texto desligada;
    - expansão de URL final desligada.
12. Em localização, escolha **Estado de São Paulo**.
13. Em opções de localização, escolha pessoas que estão ou costumam estar na região.
14. Em idioma, escolha português e inglês.
15. Defina as datas do voo de 30 dias corridos.
16. Em agenda, selecione segunda a sexta, 00h–24h.
17. Escolha **Orçamento total da campanha**.
18. Informe R$ 3.000.
19. Crie os dois grupos e cole suas keywords.
20. Crie um RSA por grupo com as copies deste guia.
21. Adicione callouts, snippet e negativas.
22. Em opções de URL, cole o sufixo UTM Bradesco.
23. Use **Testar** na URL.
24. Revise e publique.

### 14.4 Criar a campanha Reajuste

Repita o fluxo, alterando:

- nome para `S | SP | B2B50 | REAJUSTE | M01`;
- URL final para a URL limpa de Reajuste;
- grupos, keywords e anúncios;
- sufixo UTM;
- negativa de frase `"bradesco saúde"`.

Confirme no navegador que a URL limpa sorteia Técnica ou Sensorial, persiste a escolha e envia a origem correta ao Jotform.

### 14.5 Diagnóstico antes da veiculação

1. Use **Visualização e diagnóstico de anúncios**.
2. Não pesquise e clique no próprio anúncio.
3. Confira política, URL, mobile e formulário.
4. Faça uma submissão real de QA em cada landing.
5. Confirme Google Ads, Rybbit, Jotform e Worker.
6. Remova ou marque claramente os leads de teste.
7. Só então habilite as campanhas.

## 15. Lances e automação

### Escolha principal: Maximizar conversões

O objetivo é obter leads B2B50, não o maior número possível de visitas. Maximizar cliques pode concentrar verba em consultas baratas que nunca chegam a empresas maduras.

Use Maximizar conversões sem CPA desejado porque ainda não há CPL ou CPQL histórico. Um alvo inventado pode restringir a campanha antes que ela reconheça demanda.

### Contingência: Maximizar cliques

Use somente se:

- a conversão ainda estiver em diagnóstico, mas houver uma decisão consciente de comprar alguns dias de dados de consulta; ou
- Maximizar conversões não produzir nenhuma entrega mesmo com configuração e demanda validadas.

Nesse caso:

1. limitar a fase a 3–5 dias elegíveis;
2. definir um teto de CPC com base no Keyword Planner;
3. avaliar termos, não “conversões” frágeis;
4. migrar para Maximizar conversões assim que o evento estiver confiável.

Não use CPC otimizado: o ECPC deixou de estar disponível para Search e Display em 2025. CPC manual continua possível, mas exigiria gestão de lances que não acrescenta valor a este piloto.

### O que não usar no mês 1

- CPA desejado;
- ROAS desejado;
- Maximizar valor de conversão;
- Smart Bidding Exploration;
- AI Max;
- correspondência ampla.

Em 17 de agosto de 2026, o Google atualizará o comportamento de campanhas com CPA/ROAS desejado limitadas por orçamento. Isso não afeta a estratégia recomendada, porque o piloto começa sem alvo. A mudança deve ser reavaliada na fase 2. Veja a [atualização de lances de agosto de 2026](https://support.google.com/google-ads/answer/17061251?hl=en).

## 16. Rybbit no piloto

Rybbit entra para explicar o que acontece entre o clique e o cadastro. Não deve receber dados pessoais nem ser tratado como fonte de verdade do lead.

### 16.1 Decisões de configuração

| Recurso | Piloto | Motivo |
|---|---|---|
| Pageview inicial | Ligado | Mede entradas nas landings |
| Bloqueio de bots | Ligado | Reduz ruído comportamental |
| Web Vitals | Ligado | Relaciona desempenho e fricção |
| Erros JavaScript | Ligado | Identifica falhas durante o formulário |
| Autocapture de botões | Desligado | Evita duplicar eventos manuais |
| Autocapture de formulário | Desligado | O submit atual não confirma criação no Jotform |
| Input changes | Desligado | Evita coleta desnecessária e ruído |
| Session Replay | Desligado | Reduz risco de privacidade no primeiro ciclo |
| Identificação por e-mail/telefone | Proibida | Dados pessoais não são necessários para o funil |
| URL completa com parâmetros | Preferencialmente desligada | Evita armazenar GCLID e parâmetros não aprovados |

O Rybbit se apresenta como cookieless, mas isso não elimina a necessidade de análise de privacidade. Para manter coerência com o banner atual, carregue-o somente após consentimento analítico até haver decisão jurídica diferente.

Atualize a política de cookies e privacidade com fornecedor, finalidade, hospedagem, retenção e revogação. Consulte também o [guia da ANPD sobre cookies e tecnologias similares](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).

Como a campanha envolve saúde, não crie Customer Match, remarketing, segmentos próprios ou listas baseadas nas pessoas que preencheram o formulário. Ao configurar Enhanced Conversions for Leads, deixe desmarcada qualquer opção de criação de lista de clientes baseada em conversões. Esses dados serão usados para mensuração e otimização, não para formar audiência. Consulte a [política de publicidade personalizada em categorias sensíveis](https://support.google.com/adspolicy/answer/143465?hl=en).

### 16.2 Instalação

Ainda é preciso decidir entre Rybbit Cloud e self-hosted. Depois da decisão:

1. crie o site `kloutseguros.com.br` no Rybbit;
2. copie o Site ID;
3. instale o script no `<head>` de `Base.astro` ou por componente próprio;
4. condicione o carregamento ao consentimento analítico;
5. não carregue em desenvolvimento ou exclua `localhost` e previews;
6. confirme requisições para `/api/track`;
7. valide pageview, origem e dispositivo no painel;
8. documente Site ID e responsável sem registrar chaves privadas.

A documentação alerta que o GTM pode remover atributos `data-*` de tags inseridas como HTML. A instalação direta no código evita essa sanitização. Consulte [tracking script](https://rybbit.com/docs/script) e [integração via GTM](https://rybbit.com/docs/guides/google-tag-manager).

### 16.3 Contrato de eventos

Eventos comuns às três experiências:

```text
landing_variant_view
cta_click
form_start
form_submit_attempt
form_submit_acknowledged
lead_created
```

Propriedades permitidas:

```text
landing_id
variant_id
thesis
positioning
experiment_id
experiment_forced
form_id
measurement_version
cta_location
cta_key
failure_reason_code
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Propriedades proibidas:

```text
nome
e-mail
telefone
empresa
texto digitado
GCLID
submission ID público
qualquer resposta pessoal do formulário
```

Valores atuais que precisam ser preservados:

| Experiência | `landing_id` | `variant_id` | `thesis` |
|---|---|---|---|
| Bradesco | `b2b-beneficios-bradesco-saude` | `bradesco-saude` | `bradesco` |
| Reajuste Técnica | `b2b-custos-reajuste` | `reajuste-tecnica` | `renovacao-como-decisao-empresarial` |
| Reajuste Sensorial | `b2b-custos-reajuste` | `reajuste-sensorial` | `renovacao-como-decisao-empresarial` |

O acesso forçado por `?variant=` deve enviar `experiment_forced=true` e ser excluído dos relatórios experimentais.

Bradesco e Reajuste agora compartilham `form_start`, `form_submit_attempt` e `form_submit_acknowledged`, com `measurement_version=campaign_forms_v2`. Os eventos finais continuam diagnósticos: `lead_created` deve vir da confirmação autoritativa do Jotform.

O Rybbit aceita eventos por `window.rybbit.event(nome, propriedades)`. Consulte [custom events](https://rybbit.com/docs/track-events).

### 16.4 Goals e funis

Crie estes funis:

```text
Funil principal
landing_variant_view → form_start → form_submit_acknowledged

Funil de CTA
landing_variant_view → cta_click → form_start

Funil do formulário
form_start → form_submit_attempt → form_submit_acknowledged
```

Quando houver confirmação autoritativa na mesma sessão, substitua o último passo do funil principal por `lead_created`.

Filtros obrigatórios:

- `variant_id`;
- `experiment_forced=false`;
- `utm_campaign`;
- dispositivo;
- origem/referrer.

Crie um Goal para `lead_created`, mas mantenha a contagem absoluta oficial no Jotform. Goals do Rybbit são orientados a sessões e podem divergir da contagem de submissões. Consulte [Goals](https://rybbit.com/docs/goals) e [Funnels](https://rybbit.com/docs/funnels).

### 16.5 Perguntas que o Rybbit deverá ajudar a responder

- Qual versão leva mais visitantes ao início do formulário?
- Onde ocorre a maior perda: CTA, primeiro campo ou envio?
- Técnica e Sensorial têm diferença por dispositivo?
- Uma campanha produz sessões mais engajadas, porém menos formulários?
- Há erros JavaScript ou piora de Web Vitals associados a uma variante?
- Termos e anúncios diferentes produzem caminhos distintos na página?

Rybbit não responderá sozinho:

- qual lead possui 50+ vidas;
- qual reunião aconteceu;
- qual proposta foi enviada;
- qual contrato foi fechado;
- quanto custou cada consulta no leilão;
- qual sinal deve orientar o Smart Bidding.

## 17. Classificação de qualidade

Não atribua pesos financeiros enquanto margem e fechamento forem desconhecidos. Use classes descritivas:

| Classe | Definição | Tratamento |
|---|---|---|
| `LQ0` | inválido, duplicado ou sem contato possível | excluir da leitura comercial |
| `LQ1-sB2B` | menos de 50 vidas | encaminhar à operação sB2B; secundária no Ads |
| `LQ2-B2B50` | 50–99 vidas | conversão primária inicial |
| `LQ3-B2B100` | 100–299 vidas | destacar na análise qualitativa |
| `LQ4-B2B300` | 300+ vidas | destacar na análise qualitativa |

Depois do primeiro contato, acrescente:

- cargo e influência no processo;
- empresa real e elegível;
- contratação, migração, revisão ou renovação;
- operadora atual;
- data de renovação;
- temperatura comercial;
- reunião marcada e realizada;
- proposta;
- venda;
- motivo da perda.

Essa estrutura permite interpretar o caso citado pelo briefing: uma landing pode gerar menos leads e ainda assim merecer mais investimento se trouxer maior proporção de `LQ3`, `LQ4`, reuniões e propostas.

## 18. Métricas e fórmulas

### Aquisição

```text
CTR = cliques / impressões
CPC médio = gasto / cliques
Taxa de lead criado = leads criados / cliques
CPL total = gasto / leads criados
```

### Porte e qualidade

```text
Taxa B2B50 = leads B2B50 / leads criados
CPL B2B50 = gasto / leads B2B50
Taxa sB2B = leads abaixo de 50 / leads criados
CPQL = gasto / leads qualificados comercialmente
```

### Processo comercial

```text
Taxa de reunião = reuniões realizadas / leads B2B50
Custo por reunião = gasto / reuniões realizadas
Taxa de proposta = propostas / reuniões realizadas
Custo por proposta = gasto / propostas
Taxa de venda = vendas / leads B2B50
CAC de mídia = gasto / vendas
```

### Guardrails

```text
Taxa de consultas irrelevantes = cliques irrelevantes / cliques analisados
Taxa de duplicidade = leads duplicados / leads criados
Taxa de contato válido = leads contatáveis / leads criados
SLA médio = horário do primeiro contato - horário da submissão
```

CTR e CPC explicam o leilão; não decidem o vencedor. A métrica principal do piloto é o custo por lead B2B50, lido junto da distribuição `LQ2/LQ3/LQ4` e, quando disponível, do CPQL.

## 19. Protocolo experimental

### Hipótese H01 — operadora versus posicionamento Klout

```text
Se a demanda por operadora conhecida reduzir a incerteza inicial,
a campanha Bradesco deverá produzir mais formulários ou menor CPL B2B50.

Se a demanda por problema contratual selecionar empresas mais maduras,
a campanha Reajuste poderá produzir menos formulários, mas maior participação
de LQ3/LQ4, reuniões ou propostas.
```

Métrica principal: CPL B2B50.

Leitura qualitativa: distribuição de porte, motivo, temperatura, decisor e avanço comercial.

Limitação: consultas e ofertas diferentes; não causal.

### Hipótese H02 — Técnica versus Sensorial

```text
Mantendo a mesma origem de tráfego e o sorteio persistente do site,
uma das versões pode reduzir a perda entre visita, início e envio do formulário.
```

Métricas:

- início de formulário por sessão;
- envio reconhecido por início;
- lead criado por sessão;
- B2B50 por lead criado;
- composição de porte.

Exclusões:

- acessos com `experiment_forced=true`;
- tráfego interno;
- QA;
- bots identificados.

O resultado será exploratório. O Google recomenda normalmente quatro a seis semanas quando um experimento segue inconclusivo. Consulte a [página atual de Experimentos](https://support.google.com/google-ads/answer/10682377?hl=en).

### Hipótese H03 — geografia fora de São Paulo

Não ativar até existir uma lista de regiões com justificativa comercial e cobertura prioritária.

Quando disponível:

1. selecionar a tese com melhor sinal de qualidade;
2. duplicar em campanha separada;
3. excluir São Paulo dessa campanha;
4. usar presença, não interesse;
5. limitar a expansão a até R$ 600 do piloto ou criar orçamento adicional;
6. reportar como exploração geográfica, não misturar ao resultado de SP.

### Escala de evidência

Cada conclusão deve receber um destes estados:

```text
inconclusivo
sinal favorável
sinal contrário
validado em novo ciclo
refutado em novo ciclo
```

Uma observação do mês 1 nunca vira automaticamente uma regra da Klout.

Fluxo obrigatório:

```text
dado bruto
→ observação
→ hipótese explicativa
→ novo teste
→ aprendizado aprovado
→ regra da klout-ads
```

## 20. Rotina de operação

### Antes do lançamento

- corrigir faixa de vidas;
- autorizar Worker;
- configurar GTM/Google tag/Consent Mode;
- configurar Rybbit;
- validar conversão confirmada;
- executar Keyword Planner;
- revisar políticas;
- testar as três experiências em celular e desktop;
- salvar configuração inicial e data.

### Dias elegíveis 1–3

Revisar diariamente:

- reprovações;
- gasto e ritmo;
- entrega por campanha;
- URLs e parâmetros;
- confirmação de formulário;
- duplicidade de conversões;
- consultas evidentemente impróprias;
- erros no Rybbit;
- volume Jotform versus Google Ads.

Faça apenas correções. Não mude estrutura, lance, orçamento e copy simultaneamente.

### Dias elegíveis 4–10

- revisar termos duas vezes;
- acrescentar negativas justificadas;
- reunir os primeiros leads com a equipe comercial;
- classificar LQ0–LQ4;
- manter orçamento 50/50;
- não declarar vencedor.

### Dias elegíveis 11–20

- revisar CPQL e composição de porte;
- decidir se a redistribuição máxima de R$ 600 se justifica;
- registrar a decisão antes da alteração;
- preservar as demais variáveis;
- verificar dispositivo, horário e região sem cortar segmentos por amostra pequena.

### Dias elegíveis 21–30

- estabilizar a configuração;
- evitar grandes mudanças;
- documentar termos que merecem novo grupo em fase posterior;
- separar observação de conclusão;
- preparar o fechamento do voo.

### D+30, D+60 e D+90

O resultado comercial pode aparecer depois do fim da mídia. Atualize as coortes:

- D+30: leads, porte, contato e reuniões;
- D+60: propostas e evolução;
- D+90: vendas, receita conhecida e motivos de perda.

Não encerre a análise de uma campanha B2B no dia em que os anúncios param.

## 21. Relatório semanal

Uma linha por campanha e uma visão separada de Técnica/Sensorial:

| Campo | Bradesco | Reajuste | Técnica | Sensorial |
|---|---:|---:|---:|---:|
| Custo | | | | |
| Impressões | | | | |
| Cliques | | | | |
| CPC | | | | |
| Leads criados | | | | |
| `sB2B` | | | | |
| `B2B50` | | | | |
| `LQ3` | | | | |
| `LQ4` | | | | |
| CPL B2B50 | | | | |
| Leads contatáveis | | | | |
| Reuniões | | | | |
| Propostas | | | | |
| Vendas | | | | |
| SLA médio | | | | |
| Consultas irrelevantes | | | | |

Para cada semana, acrescente três textos curtos:

```text
O que observamos:
O que ainda pode explicar o resultado:
O que faremos sem misturar variáveis:
```

## 22. Critérios para pausar ou intervir

Pausar imediatamente quando houver:

- formulário sem submissão confirmada;
- conversão duplicada ou disparada sem lead;
- URL quebrada;
- reprovação de política relevante;
- consumo fora da região definida;
- tráfego massivo de suporte ou pessoa física;
- risco de exposição de dados pessoais;
- gasto que ameace ultrapassar a soma de R$ 6 mil.

Não pausar apenas porque:

- o CTR de um dia foi baixo;
- uma campanha passou dois dias sem lead;
- o CPC subiu em uma única data;
- uma variante perdeu com duas ou três conversões;
- o Google recomendou aumentar orçamento ou ativar automação.

## 23. Próximos testes possíveis

Depois de estabelecer uma referência:

1. AI Max desligado versus ligado, em experimento próprio;
2. correspondência exata/frase versus ampla com Smart Bidding;
3. São Paulo versus praças priorizadas;
4. anúncios para RH versus anúncios para Financeiro;
5. mesma consulta e oferta com framing operadora versus Klout;
6. formulário curto versus qualificação adicional;
7. inclusão de mês de renovação;
8. inclusão de situação atual: Bradesco, outra operadora ou sem contrato;
9. LinkedIn Ads por função e porte;
10. campanhas por setor quando houver uma hipótese comercial concreta.

Para um teste causal futuro na área de Experimentos, use campanha com orçamento diário individual e prazo mais longo. Campanhas com orçamento total deste piloto não devem ser transformadas diretamente no experimento. Consulte [requisitos de experimentos personalizados](https://support.google.com/google-ads/answer/10683687?hl=en).

## 24. Preparação para a futura skill `klout-ads`

A skill não deve incorporar este arquivo inteiro em `SKILL.md`. O fluxo principal deve ser curto e carregar referências conforme a tarefa.

Estrutura recomendada:

```text
klout-ads/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── strategy.md
│   ├── measurement-governance.md
│   ├── experiment-governance.md
│   └── copy-and-compliance.md
└── assets/
    ├── campaign-brief-template.md
    └── experiment-template.md
```

Fontes operacionais versionadas no projeto:

```text
docs/ads/
├── index.md
├── current-brief.yml
├── landing-registry.yml
├── measurement/
│   ├── event-contract.yml
│   ├── conversion-map.yml
│   └── qa-checklist.md
├── keyword-map.yml
├── negative-keywords.yml
├── platform-current.md
├── decisions.md
├── learnings.md
└── experiments/
    └── EXP-ID.yml
```

### O que deve ser regra estável

- definição do ICP;
- classificação `sB2B/B2B50`;
- padrões de copy;
- proibição de alegações sem prova;
- taxonomia de eventos;
- método de experimento;
- proteção de dados;
- processo de aprovação de aprendizados.

### O que deve ser consultado novamente

- interface do Google Ads;
- políticas financeiras e de saúde;
- AI Max e automações;
- limites de formatos;
- CPC e volume;
- termos de pesquisa;
- cobertura geográfica das operadoras;
- desempenho e economia da campanha.

Toda informação volátil deve guardar:

```text
fonte
data de verificação
responsável
escopo
```

### Registro de experimento

```yaml
id: EXP-0001
status: proposta
hypothesis: ""
audience_intent: ""
control: ""
treatment: ""
changed_variable: ""
primary_metric: ""
guardrails: []
budget: 0
start_date: ""
end_date: ""
decision_rule: ""
result: ""
limitations: []
next_action: ""
```

Status permitidos:

```text
proposta
ativa
inconclusiva
sinal_favoravel
sinal_contrario
validada
refutada
substituida
```

### Guardrails da skill

A futura `klout-ads` deverá:

- verificar documentação oficial quando a mecânica da plataforma importar;
- distinguir fato, recomendação, hipótese e pendência;
- nunca inventar CPC, CPL, CPA ou volume;
- não promover uma observação isolada a regra;
- não misturar B2C e B2B;
- não enviar PII em URLs ou analytics comportamental;
- não ativar recomendações automáticas sem revisão;
- não ativar ampla ou AI Max sem medição confiável;
- não permitir que outra URL contamine um teste de landing;
- não escolher vencedor por CTR ou volume bruto;
- não alterar campanha ativa sem registrar a decisão;
- revisar texto para eliminar linguagem genérica de IA;
- usar apenas provas publicadas e aprovadas pela Klout.

## 25. Checklist final de publicação

### Oferta e página

- [x] Faixas `30–49` e `50–99` publicadas e validadas em produção; código e Jotform atualizados em 13/08/2026.
- [ ] Bradesco deixa claro que a atuação é da Klout.
- [ ] Retorno em até 24 horas úteis em todas as mensagens.
- [ ] Nenhuma promessa de economia garantida.
- [ ] Técnica e Sensorial funcionam sem parâmetro forçado.

### Jotform e Worker

- [ ] Formulário `262233413435045` recebe as três origens.
- [x] Worker autoriza o novo ID.
- [x] Webhook grava no D1; fluxo básico validado em 13/08/2026.
- [ ] Testes não alteraram os formulários anteriores.
- [ ] GCLID e UTMs chegam quando o consentimento permite.

### Google e Rybbit

- [ ] GTM carrega em produção.
- [ ] Consent Mode foi testado.
- [ ] Rybbit carrega conforme consentimento analítico.
- [ ] Eventos estão padronizados nas três experiências.
- [ ] `lead_b2b50` só ocorre após confirmação do Jotform.
- [ ] Contagem é `Uma`.
- [ ] Auto-tagging está ligado.
- [ ] Nenhum dado pessoal chega ao Rybbit ou às UTMs.

### Campanhas

- [ ] Pesquisa somente.
- [ ] Parceiros desligados.
- [ ] Display desligada.
- [ ] AI Max e expansão de URL desligados.
- [ ] Recomendações automáticas desligadas.
- [ ] São Paulo por presença.
- [ ] Segunda a sexta.
- [ ] R$ 3 mil de orçamento total em cada campanha.
- [ ] Exact e phrase somente.
- [ ] Negativas compartilhadas aplicadas.
- [ ] Reajuste exclui `"bradesco saúde"`.
- [ ] UTM testada.
- [ ] Anúncios e assets aprovados.

## 26. Referências principais

### Google Ads

- [Verificação de serviços financeiros no Brasil](https://support.google.com/adspolicy/answer/15332527?co=GENIE.CountryCode%3DBR&hl=pt-br)
- [Política de marcas](https://support.google.com/adspolicy/answer/6118?hl=en)
- [AI Max para Pesquisa](https://support.google.com/google-ads/answer/15910187?hl=en)
- [Configurar AI Max](https://support.google.com/google-ads/answer/15909989?hl=en)
- [Rede de Pesquisa e parceiros](https://support.google.com/google-ads/answer/1722047?hl=en-GB)
- [Opções avançadas de localização](https://support.google.com/google-ads/answer/1722038?hl=en)
- [Orçamentos totais](https://support.google.com/google-ads/answer/10486938?hl=en)
- [Agendamento](https://support.google.com/google-ads/answer/6372656?hl=en_)
- [Keyword Planner](https://support.google.com/google-ads/answer/7337243?hl=en)
- [Correspondência de keywords](https://support.google.com/google-ads/answer/14996023?hl=en)
- [Negativas](https://support.google.com/google-ads/answer/9701952?hl=en)
- [Responsive Search Ads](https://support.google.com/google-ads/answer/7684791?hl=en)
- [Conversões primárias e secundárias](https://support.google.com/google-ads/answer/11461796?hl=en)
- [Leads qualificados e convertidos](https://support.google.com/google-ads/answer/11459091?hl=en-IN)
- [Data Manager e Enhanced Conversions for Leads](https://support.google.com/google-ads/answer/15707550?hl=en)
- [Marcação automática](https://support.google.com/google-ads/answer/3095550?hl=en-A)
- [Experimentos](https://support.google.com/google-ads/answer/10682377?hl=en)
- [Recomendações com aplicação automática](https://support.google.com/google-ads/answer/10279006?hl=en)

### Rybbit

- [Tracking script](https://rybbit.com/docs/script)
- [Google Tag Manager](https://rybbit.com/docs/guides/google-tag-manager)
- [Custom events](https://rybbit.com/docs/track-events)
- [Autocapture](https://rybbit.com/docs/autocapture)
- [Goals](https://rybbit.com/docs/goals)
- [Funnels](https://rybbit.com/docs/funnels)
- [Site settings](https://rybbit.com/docs/site-settings)
- [Identify users e privacidade](https://rybbit.com/docs/identify-users)

### Documentos relacionados no projeto

- [`guia-utm-campanhas-jotform.md`](./guia-utm-campanhas-jotform.md)
- [`jotform-campaign-form-prompt.md`](./jotform-campaign-form-prompt.md)
- [`technical-landing-model.md`](./technical-landing-model.md)
- [`runbook-autorizar-jotform-campanhas-worker-atribuicao.md`](./runbook-autorizar-jotform-campanhas-worker-atribuicao.md)
