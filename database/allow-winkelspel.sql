-- Applied to the existing progress table for Het winkelspel.
-- Preserves existing games and row ownership policies.
begin;
alter table public.exercise_attempts drop constraint exercise_attempts_exercise_key_check;
alter table public.exercise_attempts add constraint exercise_attempts_exercise_key_check
check (exercise_key in ('app-taal-spelling','app-wiskunde-splitsingen','app-wiskunde-plus-min','app-wiskunde-maaldeeltafels','app-wiskunde-kloklezen','app-wiskunde-winkelspel'));
commit;
