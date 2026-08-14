alter table lead_attributions add column ad_user_data_consent text not null default 'unknown' check (
  ad_user_data_consent in ('granted', 'denied', 'unknown')
);

alter table lead_attributions add column is_test integer not null default 0 check (
  is_test in (0, 1)
);

update lead_attributions
set is_test = 1
where form_id = '262233413435045'
  and (
    experiment_forced = 1
    or (
      lower(coalesce(utm_source, '')) in ('qa', 'test')
      and lower(coalesce(utm_medium, '')) = 'internal'
      and (
        lower(coalesce(utm_campaign, '')) glob 'qa_*'
        or lower(coalesce(utm_campaign, '')) glob 'test_*'
      )
    )
    or lower(coalesce(visitor_id, '')) glob 'qa-*'
    or lower(coalesce(visitor_id, '')) glob 'test-*'
    or lower(submission_id) glob 'qa-*'
    or lower(submission_id) glob 'test-*'
  );

create table lead_conversion_events (
  event_id text primary key,
  submission_id text not null,
  form_id text not null,
  event_name text not null check (
    event_name in ('lead_created', 'lead_sb2b', 'lead_b2b50')
  ),
  transaction_id text not null unique,
  event_time text not null,
  event_time_source text not null check (
    event_time_source in ('worker_received_at', 'jotform_submitted_at')
  ),
  readiness text not null check (readiness in ('ready', 'blocked')),
  blocked_reason text check (
    blocked_reason is null or blocked_reason in (
      'test_submission', 'integrity_conflict', 'consent_unknown',
      'consent_denied', 'missing_match_key', 'outside_pilot_scope'
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

create index idx_lead_conversion_events_readiness
  on lead_conversion_events(readiness, event_time);

create index idx_lead_conversion_events_submission
  on lead_conversion_events(submission_id);

insert into lead_conversion_events (
  event_id, submission_id, form_id, event_name, transaction_id,
  event_time, event_time_source, readiness, blocked_reason,
  classification_version, created_at, updated_at
)
select
  'klout:v1:jotform:' || form_id || ':' || submission_id || ':lead_created',
  submission_id,
  form_id,
  'lead_created',
  'klout:v1:jotform:' || form_id || ':' || submission_id || ':lead_created',
  received_at,
  'worker_received_at',
  case
    when is_test = 1 then 'blocked'
    when origin_status <> 'recognized' or origin_status is null then 'blocked'
    when not (
      (landing_id = 'b2b-beneficios-bradesco-saude' and variant_id = 'bradesco-saude')
      or (
        landing_id = 'b2b-custos-reajuste'
        and variant_id in ('reajuste-tecnica', 'reajuste-sensorial')
      )
    ) then 'blocked'
    when ad_user_data_consent <> 'granted' then 'blocked'
    when gclid is null or gclid = '' then 'blocked'
    else 'ready'
  end,
  case
    when is_test = 1 then 'test_submission'
    when origin_status <> 'recognized' or origin_status is null then 'integrity_conflict'
    when not (
      (landing_id = 'b2b-beneficios-bradesco-saude' and variant_id = 'bradesco-saude')
      or (
        landing_id = 'b2b-custos-reajuste'
        and variant_id in ('reajuste-tecnica', 'reajuste-sensorial')
      )
    ) then 'outside_pilot_scope'
    when ad_user_data_consent = 'denied' then 'consent_denied'
    when ad_user_data_consent <> 'granted' then 'consent_unknown'
    when gclid is null or gclid = '' then 'missing_match_key'
    else null
  end,
  coalesce(classification_version, 'b2b50_v1'),
  received_at,
  received_at
from lead_attributions
where form_id = '262233413435045';

insert into lead_conversion_events (
  event_id, submission_id, form_id, event_name, transaction_id,
  event_time, event_time_source, readiness, blocked_reason,
  classification_version, created_at, updated_at
)
select
  'klout:v1:jotform:' || form_id || ':' || submission_id || ':' ||
    case lead_size_segment when 'sb2b' then 'lead_sb2b' else 'lead_b2b50' end,
  submission_id,
  form_id,
  case lead_size_segment when 'sb2b' then 'lead_sb2b' else 'lead_b2b50' end,
  'klout:v1:jotform:' || form_id || ':' || submission_id || ':' ||
    case lead_size_segment when 'sb2b' then 'lead_sb2b' else 'lead_b2b50' end,
  received_at,
  'worker_received_at',
  case
    when is_test = 1 then 'blocked'
    when origin_status <> 'recognized' or origin_status is null then 'blocked'
    when not (
      (landing_id = 'b2b-beneficios-bradesco-saude' and variant_id = 'bradesco-saude')
      or (
        landing_id = 'b2b-custos-reajuste'
        and variant_id in ('reajuste-tecnica', 'reajuste-sensorial')
      )
    ) then 'blocked'
    when ad_user_data_consent <> 'granted' then 'blocked'
    when gclid is null or gclid = '' then 'blocked'
    else 'ready'
  end,
  case
    when is_test = 1 then 'test_submission'
    when origin_status <> 'recognized' or origin_status is null then 'integrity_conflict'
    when not (
      (landing_id = 'b2b-beneficios-bradesco-saude' and variant_id = 'bradesco-saude')
      or (
        landing_id = 'b2b-custos-reajuste'
        and variant_id in ('reajuste-tecnica', 'reajuste-sensorial')
      )
    ) then 'outside_pilot_scope'
    when ad_user_data_consent = 'denied' then 'consent_denied'
    when ad_user_data_consent <> 'granted' then 'consent_unknown'
    when gclid is null or gclid = '' then 'missing_match_key'
    else null
  end,
  coalesce(classification_version, 'b2b50_v1'),
  received_at,
  received_at
from lead_attributions
where form_id = '262233413435045'
  and lead_size_segment in ('sb2b', 'b2b50');
