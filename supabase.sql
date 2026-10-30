-- Tabela de respostas do experimento.
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

-- Ativa segurança em nível de linha.
alter table public.experiment_responses enable row level security;

-- Remove as políticas antigas do protótipo, se existirem.
drop policy if exists "anonymous can submit experiment responses" on public.experiment_responses;
drop policy if exists "anonymous can read experiment responses" on public.experiment_responses;
drop policy if exists "anonymous can update experiment responses" on public.experiment_responses;
drop policy if exists "authenticated can read experiment responses" on public.experiment_responses;

-- Remove privilégios prévios e concede somente o necessário.
revoke all on table public.experiment_responses from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Participantes anônimos podem inserir, mas não consultar, atualizar ou excluir.
grant insert on table public.experiment_responses to anon;
create policy "anonymous can submit experiment responses"
on public.experiment_responses
for insert
to anon
with check (true);

-- Usuários autenticados (conta do administrador) podem consultar os resultados.
grant select on table public.experiment_responses to authenticated;
create policy "authenticated can read experiment responses"
on public.experiment_responses
for select
to authenticated
using (true);

-- Não são criadas políticas de UPDATE ou DELETE.
-- Para o Realtime: Database -> Publications -> supabase_realtime -> adicione experiment_responses.
