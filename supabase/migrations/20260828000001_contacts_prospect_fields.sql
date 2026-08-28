-- Prospecção outbound: campos de prospecção no contato.
-- Contatos existentes (inbound) ficam com prospect_status nulo — nada muda pra eles.

create type public.prospect_status as enum (
  'a_abordar',
  'conexao_enviada',
  'mensagem_1',
  'follow_up_1',
  'follow_up_2',
  'respondeu',
  'reuniao_marcada',
  'descartado'
);

alter table public.contacts
  add column linkedin_url text,
  add column instagram_handle text,
  add column city text,
  add column state text check (state is null or char_length(state) = 2),
  add column specialty text,
  add column icp_score smallint check (icp_score is null or (icp_score >= 0 and icp_score <= 100)),
  add column prospect_status public.prospect_status,
  add column list_source text;

-- Kanban de prospecção lista só quem tem status; índice parcial mantém a busca leve.
create index contacts_org_prospect_status_idx
  on public.contacts(organization_id, prospect_status)
  where prospect_status is not null;
