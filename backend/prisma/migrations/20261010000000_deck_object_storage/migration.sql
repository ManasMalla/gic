-- Pitch decks move to Cloudflare R2: the row keeps where the object lives and its public download URL.
-- `bytes` stays for decks uploaded before this (and for local dev without R2).
alter table application_files alter column bytes drop not null;
alter table application_files add column if not exists object_key text;
alter table application_files add column if not exists public_url text;
