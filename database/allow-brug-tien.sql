-- Extend the existing exercise allowlist; leave row ownership and RLS intact.
begin;
alter table public.exercise_attempts drop constraint exercise_attempts_exercise_key_check;
alter table public.exercise_attempts add constraint exercise_attempts_exercise_key_check
check (exercise_key in ('app-taal-spelling','app-wiskunde-splitsingen','app-wiskunde-plus-min','app-wiskunde-maaldeeltafels','app-wiskunde-kloklezen','app-wiskunde-winkelspel','app-taal-zinnenbouwer','app-logica-patronen','app-wiskunde-brug-tien'));
commit;
