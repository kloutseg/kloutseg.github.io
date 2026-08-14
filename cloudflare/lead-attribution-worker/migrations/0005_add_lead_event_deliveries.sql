-- Entregas externas permanecem separadas da verdade factual do ledger.
create table lead_event_deliveries (
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

create index idx_lead_event_deliveries_due
  on lead_event_deliveries(status, next_attempt_at);

create index idx_lead_event_deliveries_request
  on lead_event_deliveries(provider_request_id);

create table lead_event_delivery_attempts (
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

create index idx_lead_event_delivery_attempts_delivery
  on lead_event_delivery_attempts(delivery_id, attempt_id);

insert into lead_event_deliveries (
  delivery_id, event_id, destination, status,
  attempt_count, max_attempts, poll_count, max_polls,
  next_attempt_at, created_at, updated_at
)
select
  events.event_id || ':google_data_manager',
  events.event_id,
  'google_data_manager',
  'pending',
  0,
  5,
  0,
  9,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  events.created_at,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
from lead_conversion_events as events
where events.readiness = 'ready';
