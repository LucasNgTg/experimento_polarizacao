-- Tabela de respostas do experimento.
-- Os campos antigos, se já existirem, são preservados; as novas colunas são adicionadas abaixo.
create table if not exists public.experiment_responses (
  id bigint generated always as identity primary key,
  session_id text not null unique,
  condition_code text not null check (condition_code in ('A','B')),
  created_at timestamptz not null default now(),

  identity_verification_support integer check (identity_verification_support between 0 and 100),
  response_certainty integer check (response_certainty between 0 and 100),
  topic_importance integer check (topic_importance between 0 and 100),
  text_aggressiveness integer check (text_aggressiveness between 0 and 100),
  author_confidence integer check (author_confidence between 0 and 100),
  text_respectfulness integer check (text_respectfulness between 0 and 100),
  text_balance integer check (text_balance between 0 and 100),
  argument_strength integer check (argument_strength between 0 and 100),
  author_trust integer check (author_trust between 0 and 100),
  author_sympathy integer check (author_sympathy between 0 and 100),
  text_persuasiveness integer check (text_persuasiveness between 0 and 100),
  anger_indignation integer check (anger_indignation between 0 and 100),
  calm_tranquility integer check (calm_tranquility between 0 and 100),
  urge_to_rebut integer check (urge_to_rebut between 0 and 100),
  ingroup_attitude integer check (ingroup_attitude between 0 and 100),
  outgroup_attitude integer check (outgroup_attitude between 0 and 100),
  opponent_good_faith integer check (opponent_good_faith between 0 and 100),
  perceived_room_agreement integer check (perceived_room_agreement between 0 and 100),
  willingness_to_dialogue integer check (willingness_to_dialogue between 0 and 100),
  sharing_intention integer check (sharing_intention between 0 and 100)
);

-- Migração para projetos que já possuem a tabela com a versão anterior do questionário.
-- Não apaga nem altera as respostas antigas.
alter table public.experiment_responses
  add column if not exists identity_verification_support integer check (identity_verification_support between 0 and 100),
  add column if not exists response_certainty integer check (response_certainty between 0 and 100),
  add column if not exists topic_importance integer check (topic_importance between 0 and 100),
  add column if not exists text_aggressiveness integer check (text_aggressiveness between 0 and 100),
  add column if not exists author_confidence integer check (author_confidence between 0 and 100),
  add column if not exists text_respectfulness integer check (text_respectfulness between 0 and 100),
  add column if not exists text_balance integer check (text_balance between 0 and 100),
  add column if not exists argument_strength integer check (argument_strength between 0 and 100),
  add column if not exists author_trust integer check (author_trust between 0 and 100),
  add column if not exists author_sympathy integer check (author_sympathy between 0 and 100),
  add column if not exists text_persuasiveness integer check (text_persuasiveness between 0 and 100),
  add column if not exists anger_indignation integer check (anger_indignation between 0 and 100),
  add column if not exists calm_tranquility integer check (calm_tranquility between 0 and 100),
  add column if not exists urge_to_rebut integer check (urge_to_rebut between 0 and 100),
  add column if not exists ingroup_attitude integer check (ingroup_attitude between 0 and 100),
  add column if not exists outgroup_attitude integer check (outgroup_attitude between 0 and 100),
  add column if not exists opponent_good_faith integer check (opponent_good_faith between 0 and 100),
  add column if not exists perceived_room_agreement integer check (perceived_room_agreement between 0 and 100),
  add column if not exists willingness_to_dialogue integer check (willingness_to_dialogue between 0 and 100),
  add column if not exists sharing_intention integer check (sharing_intention between 0 and 100);

-- Ativa segurança em nível de linha.
alter table public.experiment_responses enable row level security;

drop policy if exists "anonymous can submit experiment responses" on public.experiment_responses;
drop policy if exists "anonymous can read experiment responses" on public.experiment_responses;
drop policy if exists "anonymous can update experiment responses" on public.experiment_responses;
drop policy if exists "authenticated can read experiment responses" on public.experiment_responses;
drop policy if exists "authenticated can submit experiment responses" on public.experiment_responses;

revoke all on table public.experiment_responses from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Participantes podem inserir respostas, mas não consultá-las ou alterá-las.
grant insert on table public.experiment_responses to anon, authenticated;

create policy "anonymous can submit experiment responses"
on public.experiment_responses
for insert to anon
with check (true);

create policy "authenticated can submit experiment responses"
on public.experiment_responses
for insert to authenticated
with check (true);

-- Somente usuários autenticados (administrador) podem consultar as respostas.
grant select on table public.experiment_responses to authenticated;

create policy "authenticated can read experiment responses"
on public.experiment_responses
for select to authenticated
using (true);

-- Não são concedidas permissões de UPDATE ou DELETE.
-- Para o Realtime: Database -> Publications -> supabase_realtime -> adicione experiment_responses.

-- Guarda a última condição distribuída.
create table if not exists public.experiment_assignment_state (
  singleton boolean primary key default true check (singleton),
  last_condition text check (last_condition in ('A', 'B'))
);

insert into public.experiment_assignment_state (singleton, last_condition)
values (true, null)
on conflict (singleton) do nothing;

-- Guarda a condição atribuída a cada sessão.
create table if not exists public.experiment_assignments (
  session_id text primary key,
  condition_code text not null check (condition_code in ('A', 'B')),
  created_at timestamptz not null default now()
);

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
  perform 1
  from public.experiment_assignment_state
  where singleton = true
  for update;

  select condition_code
  into assigned_condition
  from public.experiment_assignments
  where session_id = p_session_id;

  if found then
    return assigned_condition;
  end if;

  update public.experiment_assignment_state
  set last_condition = case
    when last_condition = 'A' then 'B'
    else 'A'
  end
  where singleton = true
  returning last_condition into assigned_condition;

  insert into public.experiment_assignments (session_id, condition_code)
  values (p_session_id, assigned_condition);

  return assigned_condition;
end;
$$;

revoke all on function public.assign_experiment_condition(text) from public;
grant execute on function public.assign_experiment_condition(text) to anon, authenticated;
