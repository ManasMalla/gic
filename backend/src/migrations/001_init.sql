create table if not exists applications (
  id               uuid primary key default gen_random_uuid(),
  reference        text not null unique,
  track            text not null check (track in ('junior', 'main')),
  team_name        text not null,
  institution      text not null,
  theme            text not null,
  idea_title       text not null,
  pitch_video_link text not null,
  data             jsonb not null,                 -- full validated submission
  amount_due       integer not null,               -- paise
  status           text not null default 'awaiting_payment'
                   check (status in ('awaiting_payment', 'paid', 'refunded')),
  created_at       timestamptz not null default now(),
  paid_at          timestamptz
);

-- One row per person on the team; used to match a payer to an application.
create table if not exists application_contacts (
  application_id uuid not null references applications(id) on delete cascade,
  role           text not null,
  email          text not null,                    -- stored lower-case
  phone          text not null default ''
);
create index if not exists application_contacts_email_idx on application_contacts (email);

create table if not exists application_files (
  application_id uuid primary key references applications(id) on delete cascade,
  filename       text not null,
  content_type   text not null,
  size           integer not null,
  bytes          bytea not null
);

-- Every webhook we accept, kept as received (append-only audit log + idempotency key).
create table if not exists payment_events (
  event_id    text primary key,
  event_type  text not null,
  received_at timestamptz not null default now(),
  payload     jsonb not null
);

-- One row per event, with the outcome of matching it to an application.
create table if not exists payments (
  id             uuid primary key default gen_random_uuid(),
  event_id       text not null unique references payment_events(event_id),
  event_type     text not null,
  transaction_id text,
  application_id uuid references applications(id),
  match_status   text not null check (match_status in ('matched', 'needs_review', 'unmatched')),
  match_method   text check (match_method in ('reference', 'transaction', 'email', 'manual')),
  flags          text[] not null default '{}',
  amount         integer,
  currency       text,
  occurred_at    timestamptz not null,
  created_at     timestamptz not null default now(),
  reviewed_at    timestamptz,
  review_note    text
);
create index if not exists payments_review_idx on payments (match_status) where match_status <> 'matched';
create index if not exists payments_txn_idx on payments (transaction_id);
create index if not exists payments_app_idx on payments (application_id);
