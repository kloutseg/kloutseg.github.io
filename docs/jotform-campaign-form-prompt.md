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
   - 30–49 vidas
   - 50–99 vidas
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
- Origem do lead, nome técnico q11_q11_textbox9
- Visitor ID, nome técnico q12_q12_textbox10
- Primeira landing, nome técnico q13_q13_textbox11
- Primeiro referenciador, nome técnico q14_q14_textbox12
- UTM source, nome técnico q15_q15_textbox13
- UTM medium, nome técnico q16_q16_textbox14
- UTM campaign, nome técnico q17_q17_textbox15
- UTM content, nome técnico q18_q18_textbox16
- UTM term, nome técnico q19_q19_textbox17
- GCLID, nome técnico q20_q20_textbox18

Compatibilidade com a integração:
- O site envia os dados para um único formulário Jotform por POST.
- Preserve os nomes técnicos acima exatamente como escritos, especialmente q11 até q20.
- Não renomeie nem remova esses campos técnicos.
- Os campos de nome, telefone, e-mail, cargo, empresa e faixa de vidas devem permanecer compatíveis com os campos B2B já existentes no site.
- O campo de origem q11_q11_textbox9 é o principal campo de atribuição e deve ser exibido nas tabelas, relatórios e integrações.

Valores esperados no campo q11_q11_textbox9:
- /empresas/beneficios/bradesco-saude
- /empresas/custos/reajuste?variant=tecnica&experiment_forced=false
- /empresas/custos/reajuste?variant=sensorial&experiment_forced=false
- Em acessos manuais de QA, o último valor será true.

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

1. Confirme que os campos técnicos estão ocultos e que `q11_q11_textbox9` aparece nas respostas.
2. Não apague nem recrie perguntas do formulário existente. Isso muda os qids. Se algum nome técnico divergir, atualize primeiro o código e o Worker como uma mudança coordenada.
3. Confirme que o ID numérico do formulário é `262233413435045`. Esse ID fica definido diretamente nos componentes das campanhas e não depende de variável de ambiente.
4. Publique o site e teste as três URLs:

   - `https://kloutseguros.com.br/empresas/beneficios/bradesco-saude`
   - `https://kloutseguros.com.br/empresas/custos/reajuste/?variant=tecnica`
   - `https://kloutseguros.com.br/empresas/custos/reajuste/?variant=sensorial`

5. No Jotform, confirme que o campo “Origem do lead” recebeu um valor diferente em cada teste.
