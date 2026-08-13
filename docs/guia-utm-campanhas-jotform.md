# Guia de UTMs para as campanhas Klout

Este guia explica como aplicar parâmetros UTM aos links das landing pages e conferir a atribuição no Jotform Tables.

## Objetivo

As UTMs identificam a plataforma, o canal, a campanha e o anúncio que geraram cada acesso. O site já captura esses parâmetros e os envia ao Jotform quando o visitante autoriza cookies analíticos. Não é necessário alterar o código para criar uma nova URL de campanha.

O campo **Origem do lead** é enviado independentemente das UTMs e identifica a landing ou variante que gerou o cadastro.

## Landing pages

### Bradesco Saúde

URL base:

```text
https://kloutseguros.com.br/empresas/beneficios/bradesco-saude
```

### Reajuste

URL base:

```text
https://kloutseguros.com.br/empresas/custos/reajuste
```

Não é necessário usar `variant=tecnica` ou `variant=sensorial` nos anúncios. Sem esse parâmetro, o site distribui automaticamente os acessos entre as duas versões e mantém a versão escolhida para aquele navegador.

O Jotform continuará recebendo a versão efetivamente exibida no campo **Origem do lead**:

```text
/empresas/custos/reajuste?variant=tecnica
```

ou:

```text
/empresas/custos/reajuste?variant=sensorial
```

Use `variant=tecnica` ou `variant=sensorial` somente quando precisar abrir deliberadamente uma versão para revisão ou teste interno.

## Convenção de nomenclatura

Use sempre letras minúsculas, sem acentos, sem espaços e com palavras separadas por `_`.

| Parâmetro | Finalidade | Exemplos |
|---|---|---|
| `utm_source` | Plataforma ou origem | `google`, `instagram`, `facebook`, `linkedin` |
| `utm_medium` | Tipo de canal | `cpc`, `paid_social`, `email`, `whatsapp` |
| `utm_campaign` | Nome estável da campanha | `bradesco_saude_empresarial`, `reajuste_plano_empresarial` |
| `utm_content` | Anúncio, criativo ou variação | `anuncio_01`, `video_02`, `carrossel_01` |
| `utm_term` | Palavra-chave de mídia paga | `plano_saude_empresarial` |

Não alterne grafias como `Google`, `google` e `google_ads`. Cada valor diferente cria uma origem diferente nos relatórios.

## Aplicação no Google Ads

A forma recomendada é manter a landing limpa em **Final URL** e inserir as UTMs em **Final URL suffix**.

### Campanha Bradesco Saúde

Em **Final URL**:

```text
https://kloutseguros.com.br/empresas/beneficios/bradesco-saude
```

Em **Final URL suffix**, sem começar com `?`:

```text
utm_source=google&utm_medium=cpc&utm_campaign=bradesco_saude_empresarial&utm_content=anuncio_01
```

### Campanha Reajuste

Em **Final URL**:

```text
https://kloutseguros.com.br/empresas/custos/reajuste
```

Em **Final URL suffix**, sem começar com `?`:

```text
utm_source=google&utm_medium=cpc&utm_campaign=reajuste_plano_empresarial&utm_content=anuncio_01
```

### Passo a passo no Google Ads

1. Abra a campanha ou o anúncio.
2. Edite o anúncio.
3. Informe a landing no campo **Final URL**.
4. Expanda **Ad URL options (advanced)**.
5. Cole os parâmetros no campo **Final URL suffix**.
6. Salve e use a função de teste de URL do Google Ads.

O sufixo não deve começar com `?`. O Google Ads acrescenta a separação automaticamente.

O **Final URL suffix** também pode ser configurado nos níveis de conta, campanha, grupo de anúncios, anúncio ou palavra-chave. Para evitar que campanhas diferentes recebam o mesmo `utm_campaign`, prefira configurar no nível da campanha ou do anúncio.

## Parâmetros dinâmicos no Google Ads

Quando for útil identificar automaticamente o anúncio e a palavra-chave, use parâmetros ValueTrack:

```text
utm_source=google&utm_medium=cpc&utm_campaign=bradesco_saude_empresarial&utm_content={creative}&utm_term={keyword}
```

- `{creative}` é substituído pelo identificador do anúncio.
- `{keyword}` é substituído pela palavra-chave associada ao clique, quando aplicável.

Se a equipe preferir nomes compreensíveis diretamente no Jotform, use valores estáticos em `utm_content`, como:

```text
utm_content=video_beneficios_01
```

## Aplicação manual em outros canais

Fora do Google Ads, acrescente as UTMs diretamente ao endereço.

O primeiro parâmetro começa com `?`. Os seguintes são separados por `&`:

```text
URL?utm_source=ORIGEM&utm_medium=CANAL&utm_campaign=CAMPANHA&utm_content=CRIATIVO
```

### Instagram Ads

```text
https://kloutseguros.com.br/empresas/beneficios/bradesco-saude?utm_source=instagram&utm_medium=paid_social&utm_campaign=bradesco_saude_empresarial&utm_content=video_01
```

### Facebook Ads

```text
https://kloutseguros.com.br/empresas/custos/reajuste?utm_source=facebook&utm_medium=paid_social&utm_campaign=reajuste_plano_empresarial&utm_content=carrossel_01
```

### E-mail

```text
https://kloutseguros.com.br/empresas/beneficios/bradesco-saude?utm_source=newsletter&utm_medium=email&utm_campaign=bradesco_saude_empresarial&utm_content=cta_principal
```

### WhatsApp

```text
https://kloutseguros.com.br/empresas/custos/reajuste?utm_source=whatsapp&utm_medium=mensagem&utm_campaign=reajuste_plano_empresarial&utm_content=convite_01
```

## Conferência no Jotform Tables

Habilite estas colunas na tabela:

- Origem do lead
- UTM source
- UTM medium
- UTM campaign
- UTM content
- UTM term
- GCLID

É possível filtrar por uma UTM específica. Exemplo:

```text
UTM campaign
Equals
bradesco_saude_empresarial
```

Também é possível combinar filtros, por exemplo:

```text
UTM source = google
UTM campaign = reajuste_plano_empresarial
```

## Teste antes da publicação da campanha

1. Abra uma janela anônima ou um perfil novo do navegador.
2. Acesse a URL completa com UTMs.
3. Aceite os cookies analíticos no banner.
4. Preencha e envie o formulário.
5. Abra o Jotform Tables.
6. Confirme a origem e os campos UTM recebidos.
7. Exclua o cadastro técnico após a validação.

O teste deve ser feito em janela anônima porque o site mantém a primeira atribuição registrada no navegador. Um navegador já utilizado pode continuar associado às UTMs de um acesso anterior.

## Checklist

- [ ] A Final URL usa a landing correta.
- [ ] O Final URL suffix não começa com `?` no Google Ads.
- [ ] `utm_source`, `utm_medium` e `utm_campaign` estão preenchidos.
- [ ] Os valores usam letras minúsculas e não contêm espaços ou acentos.
- [ ] `utm_content` identifica o criativo ou anúncio.
- [ ] A URL foi testada em janela anônima.
- [ ] Os cookies analíticos foram aceitos durante o teste.
- [ ] A submissão apareceu no Jotform Tables com origem e UTMs corretas.

## Referências

- [Google Analytics — Collect campaign data with custom URLs](https://support.google.com/analytics/answer/10917952)
- [Google Ads — Add a Final URL suffix](https://support.google.com/google-ads/answer/9054021)
