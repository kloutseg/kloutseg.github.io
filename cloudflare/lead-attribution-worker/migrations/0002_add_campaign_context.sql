alter table lead_attributions add column life_range_raw text;
alter table lead_attributions add column life_range text check (
  life_range is null or life_range in (
    '1_9', '10_29', '30_49', '50_99', '100_299', '300_plus',
    'legacy_30_99', 'unknown'
  )
);
alter table lead_attributions add column lead_size_segment text check (
  lead_size_segment is null or lead_size_segment in ('sb2b', 'b2b50', 'unclassified')
);
alter table lead_attributions add column classification_status text check (
  classification_status is null or classification_status in (
    'classified', 'ambiguous_legacy', 'missing', 'invalid'
  )
);
alter table lead_attributions add column classification_version text;

alter table lead_attributions add column submission_origin text;
alter table lead_attributions add column landing_id text;
alter table lead_attributions add column variant_id text;
alter table lead_attributions add column thesis text;
alter table lead_attributions add column origin_status text check (
  origin_status is null or origin_status in (
    'recognized', 'legacy_missing_variant', 'legacy_missing_forced_flag', 'missing', 'invalid'
  )
);
alter table lead_attributions add column origin_version text;
alter table lead_attributions add column experiment_forced integer check (
  experiment_forced is null or experiment_forced in (0, 1)
);
