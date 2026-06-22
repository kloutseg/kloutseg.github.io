create table if not exists lead_attributions (
  submission_id text primary key,
  form_id text not null,
  lead_type text not null check (lead_type in ('b2c', 'b2b')),
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

