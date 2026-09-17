-- Respostas de diagnósticos/pesquisas que chegam junto com o lead das landing pages.
-- Uma linha por envio (o mesmo contato pode responder mais de uma pesquisa).
-- Escrita só pelo endpoint /api/leads/capture (service role); membros apenas leem.

create table public.lead_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  source text not null,
  source_label text not null,
  external_id text,
  submitted_at timestamptz not null default now(),
  stage text,
  score_total smallint,
  score_max smallint,
  recommended_plan text,
  priority text,
  summary text,
  -- [{ "label": "Clareza", "score": 7, "max": 12 }]
  dimensions jsonb not null default '[]'::jsonb,
  -- [{ "section": "Clareza", "question": "...", "answer": "...", "value": "3" }]
  answers jsonb not null default '[]'::jsonb,
  -- dados soltos da pesquisa (ex.: { "Atendimento": "Misto" })
  extra jsonb not null default '{}'::jsonb,
  notion_url text,
  created_at timestamptz not null default now(),
  constraint lead_submissions_notion_url_check check (
    notion_url is null
    or notion_url like 'https://app.notion.com/%'
    or notion_url like 'https://www.notion.so/%'
  )
);

create index lead_submissions_organization_id_idx on public.lead_submissions(organization_id);
create index lead_submissions_contact_id_idx on public.lead_submissions(contact_id, submitted_at desc);

-- Reenvio do mesmo diagnóstico (mesmo external_id) atualiza em vez de duplicar.
create unique index lead_submissions_external_id_key
  on public.lead_submissions(organization_id, source, external_id)
  where external_id is not null;

-- ENABLE é suficiente (FORCE causa recursão com os helpers SECURITY DEFINER).
alter table public.lead_submissions enable row level security;

create policy "members read"
  on public.lead_submissions for select
  using (public.is_org_member(organization_id));

create policy "admins delete"
  on public.lead_submissions for delete
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));
