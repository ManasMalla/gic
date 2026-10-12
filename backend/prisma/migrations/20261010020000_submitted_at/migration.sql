-- A team presses "Submit" once its idea details, deck and video (link or file) are all in. NULL = still a draft.
alter table applications add column if not exists submitted_at timestamptz;
