# Modelo de landing técnica

Padrão reutilizável derivado da variante técnica de `/empresas/custos/reajuste/?variant=tecnica`. A referência de implementação é `src/components/campaign/ReajusteExperiment.astro`.

O objetivo não é reproduzir efeitos. É criar páginas B2B que transformam um problema pouco claro em uma decisão empresarial compreensível.

## Princípio

A narrativa deve seguir esta ordem:

1. Contexto e risco da decisão.
2. Variáveis que precisam ser lidas.
3. Critérios e evidência.
4. Síntese e próximo passo.

Cada viewport tem uma ideia dominante. A página alterna análise em superfícies claras e síntese em azul profundo. Essa alternância marca mudanças do raciocínio, não serve apenas para destacar blocos.

Evitar a estética de portal premium: dashboards, cards em excesso, vidro, gradientes luminosos, métricas decorativas e tom celebratório.

## Tokens visuais

| Papel | Token | Referência |
| --- | --- | --- |
| Página | `--page` | `hsl(207 24% 96%)` |
| Superfície | `--surface` | `hsl(0 0% 100%)` |
| Texto | `--ink` | `hsl(212 43% 12%)` |
| Texto secundário | `--muted` | `hsl(212 16% 38%)` |
| Linha | `--line` | `hsla(212 26% 24% / .16)` |
| Acento | `--accent` | `hsl(40 34% 48%)` |
| Azul de origem | `--technical-blue-origin` | `hsl(215 55% 6%)` |
| Azul de conexão | `--technical-blue-join` | `hsl(211 47% 10.5%)` |
| Azul de destino | `--technical-blue-destination` | `hsl(206 39% 15%)` |

Regras:

- Branco serve à análise; azul profundo à síntese, mudança de perspectiva e conversão.
- Dourado somente em índices, labels e sinais pequenos de progresso.
- Bordas são estruturais: finas, neutras e com raio discreto.
- Sombras devem ser rasas e difusas. Não usar brilho ou aspecto vítreo.

## Tipografia e grade

- **Título:** IBM Plex Serif, peso 400, entrelinha de `.96` a `1.08`, tracking negativo discreto.
- **Texto:** Proxima Nova, entrelinha de `1.6` a `1.7`.
- **Metadados e índices:** IBM Plex Mono, caixa alta, `.58rem` a `.7rem`, tracking de `.1em` a `.15em`.
- **Container:** máximo de 1240 px; respiro lateral `clamp(1.25rem, 5vw, 4.5rem)`.
- **Seção:** espaço vertical `clamp(5.5rem, 9vw, 8rem)`.
- Em desktop, usar duas colunas assimétricas. Não centralizar todo o conteúdo.
- Um título deve ter de 9 a 18 palavras e, preferencialmente, até seis linhas em desktop.

### Receitas de composição

| Bloco | Estrutura |
| --- | --- |
| Abertura | título à esquerda + mídia/faixa vertical azul à direita |
| Problema | tese ampla + cartão contextual deslocado |
| Critérios | título curto + grade ou lista de 3–4 itens com linhas |
| Evidência | retrato vertical + texto analítico |
| Conversão | azul profundo + título, prova e CTA explícito |
| Formulário | superfície branca, campos em grade, uma ação principal |

## Regras de seção

1. Uma seção responde a uma ideia; não montar catálogos de benefícios.
2. Cards acrescentam contexto, não repetem o título.
3. Listas devem ter leitura linear e numeração consistente: `01 / 02 / 03`.
4. Alternar densidade: após uma seção muito textual, apresentar evidência, critérios ou ação.
5. A promessa final e o primeiro campo do formulário devem formar uma sequência contínua, sem espaço morto.
6. CTAs em fundo escuro têm mínimo de 48 px de altura e contraste alto.

## Animação

Movimento só é permitido quando esclarece **relação**, **mudança de estado** ou **ordem de leitura**.

### Usos válidos

- Revelar a mídia do hero depois do contexto textual.
- Converter um cartão escuro em superfície clara para materializar “problema → leitura”.
- Fixar uma sequência de critérios quando a comparação depender disso.
- Abrir acordeões ou diálogos como resposta a ação explícita.

### Usos proibidos

- Títulos que se movem apenas para chamar atenção.
- Parallax contínuo, loops decorativos, contadores sem dado e imagens flutuantes.
- Mais de um elemento dominante animado por viewport.
- Animações que escondem conteúdo ou bloqueiam a conversão.

| Situação | Duração | Curva | Limite |
| --- | ---: | --- | --- |
| Entrada de copy | 420–560 ms | `cubic-bezier(.22, 1, .36, 1)` | opacidade + até 16 px em Y |
| Revelação de mídia | 650–900 ms | mesma curva | clip-path simples + até 12 px em Y |
| Mudança de cartão | 650–900 ms | mesma curva | escala .96–1 + até 24 px em Y |
| Hover e foco | 160–220 ms | ease-out | cor, borda e até 4 px |
| Acordeão/diálogo | 240–360 ms | ease-out | opacidade e translate contido |

Obrigatório:

- Respeitar `prefers-reduced-motion: reduce`: remover pins, transições não essenciais e deslocamentos contínuos.
- Animar `transform` e `opacity`, não layout, filtros pesados ou sombras grandes.
- Não prender o scroll no mobile.
- Manter foco visível e controles operáveis sem animação.
- Renderizar o conteúdo final no HTML antes de a animação iniciar.

## Direção de imagem

As imagens mostram trabalho real de decisão em saúde corporativa. Devem ser observacionais, não posadas.

### Briefing

- Pessoas conversando, revisando documentos, telas ou dados em escritório brasileiro contemporâneo.
- Gesto contido; olhar no assunto e relações de trabalho plausíveis.
- Luz natural ou de escritório suave, contraste moderado, paleta fria/neutra.
- Escala humana: mesa, documentos, reunião, sala de trabalho. Evitar luxo ostensivo.
- Diversidade real sem a transformar em recurso ilustrativo.
- Não usar texto na imagem, logos de terceiros destacados, jalecos genéricos ou apertos de mão de banco de imagens.

### Arquivos e corte

| Uso | Corte | Entrega |
| --- | --- | --- |
| Hero | horizontal, espaço negativo para copy | WebP em 640, 960, 1280 e 1536 px; sujeito no terço oposto ao texto |
| Evidência | retrato vertical | relação próxima de 9:16; WebP em 640 e 864 px |
| Apoio | horizontal ou quadrado | gesto, documento ou contexto; preservar área segura para crop |
| Textura | grão sutil | SVG/CSS em baixa opacidade, sem competir com texto |

O texto alternativo deve explicar a informação editorial da imagem, por exemplo: “Consultora conversa com lideranças de Financeiro e RH em um escritório em São Paulo”.

## Mobile

Mobile é uma composição própria.

- Uma ideia dominante por tela; nunca comprimir duas colunas.
- Títulos em geral entre `2rem` e `2.4rem`, com entrelinha próxima de `1.08`.
- Converter grades densas em linhas com divisórias.
- Campos e CTAs: pelo menos 44 px; ação primária: 48 px.
- Usar `min-height: 100svh` ou `100dvh` somente em hero/seção que aceite crescimento.
- Validar em 390 × 844 e 1440 × 980: sem overflow, conteúdo oculto, targets menores que 44 px ou erros de console.

## Checklist de aceite

- [ ] Há alternância intencional entre análise clara e síntese azul.
- [ ] Existe uma única ação primária por trecho.
- [ ] Cada imagem tem função editorial, crop responsivo e alt específico.
- [ ] Toda animação explica estrutura, estado ou sequência.
- [ ] A experiência com redução de movimento continua completa.
- [ ] Índices, bordas e espaço estabelecem uma grade legível.
- [ ] O formulário está próximo da promessa final e funciona em 390 px.
- [ ] Não há overflow horizontal, alvo essencial menor que 44 px ou erro de console.

## Fluxo de criação

1. Definir a pergunta empresarial que a página resolve.
2. Escrever abertura, problema, critérios, evidência, síntese e conversão.
3. Definir imagem e crop antes de desenhar cada seção.
4. Aplicar tokens e grade; só então introduzir cards.
5. Descrever cada animação em uma frase: o que muda, por que muda e como o usuário percebe.
6. Construir a versão mobile antes do refinamento desktop.
7. Validar foco, contraste, redução de movimento, targets e overflow.

O modelo evolui por critérios e qualidade de leitura, nunca por acúmulo de efeitos.
