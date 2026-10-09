-- Matching now also uses the founder's email. Widen the allowed match methods (idempotent: runs every start).
alter table payments drop constraint if exists payments_match_method_check;
alter table payments add constraint payments_match_method_check
  check (match_method in ('reference', 'transaction', 'founder_email', 'email', 'manual'));
