alter table lead_attributions add column gclid_captured_at text;

create table lead_retention_tombstones (
  retention_key text primary key,
  purged_at text not null
) without rowid;

update lead_attributions
set is_test = case
  when (
    lower(trim(coalesce(utm_source, ''))) in ('qa', 'test')
    and lower(trim(coalesce(utm_medium, ''))) = 'internal'
    and (
      lower(trim(coalesce(utm_campaign, ''))) glob 'qa_*'
      or lower(trim(coalesce(utm_campaign, ''))) glob 'test_*'
    )
  )
  or lower(trim(coalesce(visitor_id, ''))) glob 'qa-*'
  or lower(trim(coalesce(visitor_id, ''))) glob 'qa_*'
  or lower(trim(coalesce(visitor_id, ''))) glob 'qa:*'
  or lower(trim(coalesce(visitor_id, ''))) glob 'test-*'
  or lower(trim(coalesce(visitor_id, ''))) glob 'test_*'
  or lower(trim(coalesce(visitor_id, ''))) glob 'test:*'
  or lower(trim(submission_id)) glob 'qa-*'
  or lower(trim(submission_id)) glob 'qa_*'
  or lower(trim(submission_id)) glob 'qa:*'
  or lower(trim(submission_id)) glob 'test-*'
  or lower(trim(submission_id)) glob 'test_*'
  or lower(trim(submission_id)) glob 'test:*'
  then 1
  else 0
END
where form_id = '262233413435045';

drop table if exists _lead_conversion_event_reconciliation;

create table _lead_conversion_event_reconciliation (
  event_id text primary key,
  submission_id text not null,
  event_name text not null,
  transaction_id text not null unique
) without rowid;

with recursive
expected_events(submission_id, event_name) as (
  select submission_id, 'lead_created'
  from lead_attributions
  where form_id = '262233413435045'

  union all

  select
    submission_id,
    case lead_size_segment
      when 'sb2b' then 'lead_sb2b'
      else 'lead_b2b50'
    END
  from lead_attributions
  where form_id = '262233413435045'
    and lead_size_segment in ('sb2b', 'b2b50')
),
transaction_hashes(submission_id, event_name, position, hash) as (
  select submission_id, event_name, 0, 2166136261
  from expected_events

  union all

  select
    submission_id,
    event_name,
    position + 1,
    (
      (
        (
          hash | unicode(substr(submission_id, position + 1, 1))
        ) - (
          hash & unicode(substr(submission_id, position + 1, 1))
        )
      ) * 16777619
    ) & 4294967295
  from transaction_hashes
  where position < length(submission_id)
)
insert into _lead_conversion_event_reconciliation (
  event_id, submission_id, event_name, transaction_id
)
select
  'klout:v1:jotform:262233413435045:' || submission_id || ':' || event_name,
  submission_id,
  event_name,
  'jf:' ||
    case
      when length(submission_id) <= 44 then submission_id
      else substr(submission_id, 1, 32) || '-' || printf('%08x', hash)
    END ||
    ':' ||
    case event_name
      when 'lead_created' then 'c'
      when 'lead_sb2b' then 's'
      else '50'
    END
from transaction_hashes
where position = length(submission_id);

delete from lead_conversion_events
where form_id = '262233413435045'
  and not exists (
    select 1
    from _lead_conversion_event_reconciliation as expected
    where expected.event_id = lead_conversion_events.event_id
  );

update lead_conversion_events
set transaction_id = '~repair~' || printf('%016x', rowid)
where event_id in (
  select event_id from _lead_conversion_event_reconciliation
);

insert into lead_conversion_events (
  event_id, submission_id, form_id, event_name, transaction_id,
  event_time, event_time_source, readiness, blocked_reason,
  classification_version, created_at, updated_at
)
select
  expected.event_id,
  attribution.submission_id,
  attribution.form_id,
  expected.event_name,
  expected.transaction_id,
  attribution.received_at,
  'worker_received_at',
  case
    when attribution.is_test = 1 then 'blocked'
    when attribution.origin_status <> 'recognized' or attribution.origin_status is null then 'blocked'
    when not (
      (attribution.landing_id = 'b2b-beneficios-bradesco-saude'
        and attribution.variant_id = 'bradesco-saude')
      or (
        attribution.landing_id = 'b2b-custos-reajuste'
        and attribution.variant_id in ('reajuste-tecnica', 'reajuste-sensorial')
      )
    ) then 'blocked'
    else 'ready'
  END
  ,
  case
    when attribution.is_test = 1 then 'test_submission'
    when attribution.origin_status <> 'recognized' or attribution.origin_status is null
      then 'integrity_conflict'
    when not (
      (attribution.landing_id = 'b2b-beneficios-bradesco-saude'
        and attribution.variant_id = 'bradesco-saude')
      or (
        attribution.landing_id = 'b2b-custos-reajuste'
        and attribution.variant_id in ('reajuste-tecnica', 'reajuste-sensorial')
      )
    ) then 'outside_pilot_scope'
    else null
  END
  ,
  coalesce(attribution.classification_version, 'b2b50_v1'),
  attribution.received_at,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
from _lead_conversion_event_reconciliation as expected
join lead_attributions as attribution using (submission_id)
where true
on conflict(event_id) do update set
  transaction_id = excluded.transaction_id,
  readiness = excluded.readiness,
  blocked_reason = excluded.blocked_reason,
  classification_version = excluded.classification_version,
  updated_at = excluded.updated_at;

drop table _lead_conversion_event_reconciliation;
