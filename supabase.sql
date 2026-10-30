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

-- Guarda a última condição distribuída.
create table if not exists public.experiment_assignment_state (
  singleton boolean primary key default true check (singleton),
  last_condition text check (last_condition in ('A', 'B'))
);

-- Inicializa a sequência: o primeiro participante receberá A.
insert into public.experiment_assignment_state (singleton, last_condition)
values (true, null)
on conflict (singleton) do nothing;

-- Guarda a condição atribuída a cada sessão.
create table if not exists public.experiment_assignments (
  session_id text primary key,
  condition_code text not null check (condition_code in ('A', 'B')),
  created_at timestamptz not null default now()
);

-- Impede acesso direto às tabelas pelos participantes.
alter table public.experiment_assignment_state enable row level security;
alter table public.experiment_assignments enable row level security;

revoke all on public.experiment_assignment_state from public, anon, authenticated;
revoke all on public.experiment_assignments from public, anon, authenticated;

-- A função faz a atribuição de maneira atômica.
create or replace function public.assign_experiment_condition(p_session_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_condition text;
begin
  -- Bloqueia a linha de controle para serializar as atribuições.
  perform 1
  from public.experiment_assignment_state
  where singleton = true
  for update;

  -- Se esta sessão já recebeu uma condição, reutiliza-a.
  select condition_code
  into assigned_condition
  from public.experiment_assignments
  where session_id = p_session_id;

  if found then
    return assigned_condition;
  end if;

  -- Alterna a condição globalmente.
  update public.experiment_assignment_state
  set last_condition = case
    when last_condition = 'A' then 'B'
    else 'A'
  end
  where singleton = true
  returning last_condition into assigned_condition;

  -- Registra a atribuição para que a sessão possa recuperá-la.
  insert into public.experiment_assignments (session_id, condition_code)
  values (p_session_id, assigned_condition);

  return assigned_condition;
end;
$$;

-- Participantes anônimos podem executar a função, mas não acessar as tabelas.
revoke all on function public.assign_experiment_condition(text) from public;
grant execute on function public.assign_experiment_condition(text) to anon;
