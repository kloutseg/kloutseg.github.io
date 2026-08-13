-- Snapshot de referência do schema atual.
-- Para criar ou atualizar um D1, use `wrangler d1 migrations apply`.
-- Não aplique este arquivo junto com o diretório migrations.

create table if not exists lead_attributions (
  submission_id text primary key,
  form_id text not null,
  lead_type text not null check (lead_type in ('b2c', 'b2b')),
  life_range_raw text,
  life_range text check (
    life_range is null or life_range in (
      '1_9', '10_29', '30_49', '50_99', '100_299', '300_plus',
      'legacy_30_99', 'unknown'
    )
  ),
  lead_size_segment text check (
    lead_size_segment is null or lead_size_segment in ('sb2b', 'b2b50', 'unclassified')
  ),
  classification_status text check (
    classification_status is null or classification_status in (
      'classified', 'ambiguous_legacy', 'missing', 'invalid'
    )
  ),
  classification_version text,
  submission_origin text,
  landing_id text,
  variant_id text,
  thesis text,
  origin_status text check (
    origin_status is null or origin_status in (
      'recognized', 'legacy_missing_variant', 'legacy_missing_forced_flag', 'missing', 'invalid'
    )
  ),
  origin_version text,
  experiment_forced integer check (
    experiment_forced is null or experiment_forced in (0, 1)
  ),
  visitor_id text,
  first_landing text,
  first_referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  submitted_at text,
  received_at text not null
);

create index if not exists idx_lead_attributions_visitor
  on lead_attributions(visitor_id);

create index if not exists idx_lead_attributions_received
  on lead_attributions(received_at);

