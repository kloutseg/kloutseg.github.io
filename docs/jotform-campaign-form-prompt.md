# Briefing para a IA do Jotform — formulário de campanhas B2B

Cole somente o texto abaixo na IA do Jotform. Ele pede apenas a criação e a configuração estrutural do formulário. Não inclui notificações, autoresposta, integrações internas ou página personalizada de agradecimento.

```text
Crie um único formulário de captação de leads B2B para a Klout Corretora de Seguros. O formulário será usado em três landing pages de campanhas sobre benefícios corporativos e custos de planos de saúde. O objetivo é receber os dados essenciais de uma empresa e permitir que a equipe comercial identifique exatamente de qual landing page cada lead veio.

Idioma e tom:
- Escreva todos os textos em português do Brasil.
- Use tom profissional, claro, consultivo e direto.
- Não use linguagem agressiva de vendas, promessas de economia ou garantia de resultado.
- Explique que o contato é inicial, sem compromisso de troca ou contratação.

Título do formulário:
Solicite um diagnóstico inicial para sua empresa

Descrição:
Conte os dados essenciais da sua empresa. Um consultor da Klout entrará em contato em até um dia útil para entender o contexto e orientar os próximos passos, sem compromisso.

Campos visíveis, nesta ordem:
1. Nome completo — campo de nome — obrigatório.
2. Empresa — campo de texto — obrigatório.
3. Cargo ou função — seleção única — obrigatório. Opções:
   - Sócio(a) / Founder
   - Diretoria / C-level
   - RH / People
   - Financeiro / Compras
   - Benefícios / Operações
   - Gestão geral / Administrativo
4. Faixa de vidas — seleção única — obrigatório. Descrição auxiliar: Titulares + dependentes. Opções:
   - 1–9 vidas
   - 10–29 vidas
   - 30–99 vidas
   - 100–299 vidas
   - 300+ vidas
5. E-mail corporativo — e-mail — obrigatório.
6. WhatsApp — telefone brasileiro — obrigatório.
7. Preferência de contato — seleção única — opcional. Opções:
   - WhatsApp
   - Ligação telefônica
   - E-mail

Campos técnicos ocultos:
Crie campos ocultos para receber dados enviados pelo site. Eles não devem aparecer para o visitante nem ser obrigatórios na interface:
- Origem do lead, identificador interno q16_origem
- Visitor ID, identificador interno q17_visitor_id
- Primeira landing, identificador interno q18_first_landing
- Primeiro referenciador, identificador interno q19_first_referrer
- UTM source, identificador interno q20_utm_source
- UTM medium, identificador interno q21_utm_medium
- UTM campaign, identificador interno q22_utm_campaign
- UTM content, identificador interno q23_utm_content
- UTM term, identificador interno q24_utm_term
- GCLID, identificador interno q25_gclid

Compatibilidade com a integração:
- O site envia os dados para um único formulário Jotform por POST.
- Preserve os identificadores internos acima exatamente como escritos, especialmente q16_origem até q25_gclid.
- Não renomeie nem remova esses campos técnicos.
- Os campos de nome, telefone, e-mail, cargo, empresa e faixa de vidas devem permanecer compatíveis com os campos B2B já existentes no site.
- O campo de origem q16_origem é o principal campo de atribuição e deve ser exibido nas tabelas, relatórios e integrações.

Valores esperados no campo q16_origem:
- /empresas/beneficios/bradesco-saude
- /empresas/custos/reajuste?variant=tecnica
- /empresas/custos/reajuste?variant=sensorial

Botão de envio:
Solicitar diagnóstico

Limites desta tarefa:
- Não configure notificações por e-mail.
- Não configure autoresposta.
- Não configure integrações com planilha, CRM, ClickUp ou qualquer outro serviço.
- Não crie automações de acompanhamento.
- Não altere redirecionamentos nem crie uma página personalizada de agradecimento.
- Mantenha apenas a confirmação padrão de envio do Jotform, se ela for necessária para o funcionamento do formulário.
```

## Depois que a IA criar o formulário

1. Confirme que os campos técnicos estão ocultos e que `q16_origem` aparece nas respostas.
2. Se a IA criar identificadores diferentes, ajuste os nomes internos no editor do Jotform ou recrie os campos com os identificadores indicados no briefing.
3. Copie o ID numérico do formulário.
4. Configure esse ID no ambiente de produção como `PUBLIC_JOTFORM_B2B_CAMPAIGN_FORM_ID`.
5. Publique o site e teste as três URLs:

   - `https://kloutseguros.com.br/empresas/beneficios/bradesco-saude`
   - `https://kloutseguros.com.br/empresas/custos/reajuste/?variant=tecnica`
   - `https://kloutseguros.com.br/empresas/custos/reajuste/?variant=sensorial`

6. No Jotform, confirme que `q16_origem` recebeu um valor diferente em cada teste.
