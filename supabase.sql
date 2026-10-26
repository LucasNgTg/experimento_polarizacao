create table if not exists public.experiment_responses (
  id bigint generated always as identity primary key,
  session_id text not null unique,
  condition_code text not null check (condition_code in ('A','B')),
  created_at timestamptz not null default now(),
  pre_position integer check (pre_position between 0 and 100),
  post_position integer check (post_position between 0 and 100),
  conviction integer check (conviction between 0 and 100),
  emotion_intensity integer check (emotion_intensity between 0 and 100),
  anger integer check (anger between 0 and 100),
  willingness_to_talk integer check (willingness_to_talk between 0 and 100),
  perceived_competence integer check (perceived_competence between 0 and 100),
  would_read_more integer check (would_read_more between 0 and 100),
  changed_opinion integer check (changed_opinion between 0 and 100)
);

alter table public.experiment_responses enable row level security;

-- MVP de demonstração: permite envio anônimo e leitura para o painel.
-- Use apenas respostas sem dados pessoais. Para uma pesquisa formal,
-- restrinja a leitura administrativa com autenticação/Edge Function.
drop policy if exists "anonymous can submit experiment responses" on public.experiment_responses;
create policy "anonymous can submit experiment responses"
on public.experiment_responses for insert to anon
with check (true);

drop policy if exists "anonymous can read experiment responses" on public.experiment_responses;
create policy "anonymous can read experiment responses"
on public.experiment_responses for select to anon
using (true);

-- Habilite Realtime para esta tabela no painel Supabase:
-- Database -> Publications -> supabase_realtime -> adicione experiment_responses.


drop policy if exists "anonymous can update experiment responses" on public.experiment_responses;
create policy "anonymous can update experiment responses"
on public.experiment_responses for update to anon
using (true) with check (true);
