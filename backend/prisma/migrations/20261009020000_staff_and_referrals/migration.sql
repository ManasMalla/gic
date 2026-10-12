-- Staff accounts (RBAC) and the referral codes that organisers hand out. Idempotent.
create table if not exists staff_users (
  email      text primary key,                      -- lower-case Google account
  role       text not null check (role in ('super_admin', 'admin', 'core')),
  created_at timestamptz not null default now(),
  created_by text
);
create table if not exists referral_codes (
  code       text primary key,                      -- upper-case
  label      text not null default '',              -- who/what it was issued to
  active     boolean not null default true,
  created_by text not null,
  created_at timestamptz not null default now()
);
