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
  ad_user_data_consent text not null default 'unknown' check (
    ad_user_data_consent in ('granted', 'denied', 'unknown')
  ),
  is_test integer not null default 0 check (is_test in (0, 1)),
  visitor_id text,
  first_landing text,
  first_referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  gclid_captured_at text,
  submitted_at text,
  received_at text not null
);

create index if not exists idx_lead_attributions_visitor
  on lead_attributions(visitor_id);

create index if not exists idx_lead_attributions_received
  on lead_attributions(received_at);

create table if not exists lead_conversion_events (
  event_id text primary key,
  submission_id text not null,
  form_id text not null,
  event_name text not null check (
    event_name in ('lead_created', 'lead_sb2b', 'lead_b2b50')
  ),
  transaction_id text not null unique check (
    length(transaction_id) between 1 and 64
  ),
  event_time text not null,
  event_time_source text not null check (
    event_time_source in ('worker_received_at', 'jotform_submitted_at')
  ),
  readiness text not null check (readiness in ('ready', 'blocked')),
  blocked_reason text check (
    blocked_reason is null or blocked_reason in (
      'test_submission', 'integrity_conflict', 'outside_pilot_scope'
    )
  ),
  classification_version text not null,
  created_at text not null,
  updated_at text not null,
  foreign key (submission_id) references lead_attributions(submission_id) on delete cascade,
  unique (submission_id, event_name),
  check (
    (readiness = 'ready' and blocked_reason is null)
    or (readiness = 'blocked' and blocked_reason is not null)
  )
);

create index if not exists idx_lead_conversion_events_readiness
  on lead_conversion_events(readiness, event_time);

create index if not exists idx_lead_conversion_events_submission
  on lead_conversion_events(submission_id);

create table if not exists lead_retention_tombstones (
  retention_key text primary key,
  purged_at text not null
) without rowid;

create trigger if not exists validate_lead_conversion_transaction_id_insert
before insert on lead_conversion_events
when length(new.transaction_id) < 1 or length(new.transaction_id) > 64
begin
  select raise(abort, 'transaction_id must contain between 1 and 64 characters');
end;

create trigger if not exists validate_lead_conversion_transaction_id_update
before update of transaction_id on lead_conversion_events
when length(new.transaction_id) < 1 or length(new.transaction_id) > 64
begin
  select raise(abort, 'transaction_id must contain between 1 and 64 characters');
end;

create table if not exists lead_event_deliveries (
  delivery_id text primary key,
  event_id text not null,
  destination text not null,
  status text not null check (
    status in ('pending', 'processing', 'retry', 'accepted', 'delivered', 'failed', 'blocked')
  ),
  blocked_reason text check (
    blocked_reason is null or blocked_reason in (
      'event_not_ready', 'consent_unknown', 'consent_denied',
      'missing_match_key', 'expired_match_key', 'configuration_missing'
    )
  ),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 5 check (max_attempts between 1 and 20),
  poll_count integer not null default 0 check (poll_count >= 0),
  max_polls integer not null default 9 check (max_polls between 1 and 96),
  next_attempt_at text,
  lease_token text,
  lease_expires_at text,
  provider_request_id text,
  provider_status text,
  last_http_status integer,
  last_error_code text,
  last_error_detail text,
  payload_sha256 text,
  accepted_at text,
  delivered_at text,
  created_at text not null,
  updated_at text not null,
  foreign key (event_id) references lead_conversion_events(event_id) on delete cascade,
  unique (event_id, destination),
  check (
    (status = 'blocked' and blocked_reason is not null)
    or (status <> 'blocked' and blocked_reason is null)
  )
);

create index if not exists idx_lead_event_deliveries_due
  on lead_event_deliveries(status, next_attempt_at);

create index if not exists idx_lead_event_deliveries_request
  on lead_event_deliveries(provider_request_id);

create table if not exists lead_event_delivery_attempts (
  attempt_id integer primary key autoincrement,
  delivery_id text not null,
  attempted_at text not null,
  phase text not null check (phase in ('ingest', 'status')),
  outcome text not null check (
    outcome in ('accepted', 'delivered', 'transient_failure', 'permanent_failure', 'blocked', 'processing')
  ),
  http_status integer,
  provider_request_id text,
  provider_status text,
  error_code text,
  error_detail text,
  foreign key (delivery_id) references lead_event_deliveries(delivery_id) on delete cascade
);

create index if not exists idx_lead_event_delivery_attempts_delivery
  on lead_event_delivery_attempts(delivery_id, attempt_id);
