-- Append-only private progress. Pseudonyms only; no public leaderboard.
create table if not exists public.frit_academy_orders (
 user_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 profile_id uuid not null,
 profile_name text not null check (char_length(profile_name) between 1 and 24),
 module text not null check (module in ('fries','sauce','spelling','cash','time')),
 level smallint not null check (level between 1 and 3),
 attempts smallint not null check (attempts between 1 and 100),
 assisted boolean not null default false,
 completed_at timestamptz not null,
 primary key (user_id,id)
);
alter table public.frit_academy_orders enable row level security;
revoke all on public.frit_academy_orders from anon;
grant select,insert,delete on public.frit_academy_orders to authenticated;
create policy frit_orders_read_own on public.frit_academy_orders for select to authenticated using ((select auth.uid())=user_id);
create policy frit_orders_insert_own on public.frit_academy_orders for insert to authenticated with check ((select auth.uid())=user_id);
create policy frit_orders_delete_own on public.frit_academy_orders for delete to authenticated using ((select auth.uid())=user_id);
