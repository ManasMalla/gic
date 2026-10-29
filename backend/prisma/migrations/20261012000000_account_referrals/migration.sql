-- The referral code a Google account arrived with (from a link like gic.gitam.edu/?utm=CODE), kept so it is never lost
-- between the first visit, sign-in and registration. First valid code wins.
create table if not exists account_referrals (
  email      text primary key,                      -- lower-case Google account
  code       text not null,                         -- upper-case, issued in referral_codes
  created_at timestamptz not null default now()
);
