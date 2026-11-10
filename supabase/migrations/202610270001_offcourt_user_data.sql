create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.quiz_runs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('short', 'long')),
  score integer not null check (score >= 0),
  total integer not null check (total in (5, 10)),
  completed_at timestamptz not null default now(),
  constraint quiz_score_within_total check (score <= total)
);

alter table public.favorites enable row level security;
alter table public.quiz_runs enable row level security;

create policy "Users can read their own favorites" on public.favorites
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their own favorites" on public.favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own favorites" on public.favorites
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can remove their own favorites" on public.favorites
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their own quiz runs" on public.quiz_runs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can record their own quiz runs" on public.quiz_runs
  for insert to authenticated with check ((select auth.uid()) = user_id);
