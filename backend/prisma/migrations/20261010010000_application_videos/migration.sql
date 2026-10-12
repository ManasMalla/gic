-- Optional pitch-video FILE (max 25 MB), stored in Cloudflare R2 (never in Postgres); the row keeps the object key and public URL.
create table if not exists application_videos (
  application_id uuid primary key references applications(id) on delete cascade,
  filename       text not null,
  content_type   text not null,
  size           integer not null,
  object_key     text not null,
  public_url     text not null,
  uploaded_at    timestamptz not null default now()
);
