-- Optional referral code entered at registration (stored upper-cased). Backfills any already kept in the JSON.
alter table applications add column if not exists referral_code text;
update applications set referral_code = upper(nullif(trim(data->>'referralCode'), ''))
  where referral_code is null and data ? 'referralCode';
create index if not exists applications_referral_code_idx on applications (referral_code) where referral_code is not null;
