-- Prisma models need a primary key; application_contacts had none. Idempotent.
alter table application_contacts add column if not exists id uuid not null default gen_random_uuid();
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'application_contacts'::regclass and contype = 'p') then
    alter table application_contacts add primary key (id);
  end if;
end $$;
