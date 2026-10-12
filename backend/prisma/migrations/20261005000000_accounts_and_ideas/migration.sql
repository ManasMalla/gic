-- Applications now belong to a signed-in Google account, and are created BEFORE the idea is written:
-- team details first, pay, then (after payment) the portal fills in theme + idea + deck.
alter table applications add column if not exists owner_email text;
create unique index if not exists applications_owner_email_key on applications (owner_email) where owner_email is not null;

alter table applications alter column theme drop not null;
alter table applications alter column idea_title drop not null;
alter table applications alter column pitch_video_link drop not null;

alter table applications add column if not exists problem_statement text;
alter table applications add column if not exists idea_summary text;
alter table applications add column if not exists idea_updated_at timestamptz;
