-- LGPD: exclusão definitiva dos dados de um titular.
--
-- Apagar só a linha de `contacts` deixa para trás as conversas (FK SET NULL) com
-- telefone e o texto das mensagens, e as tarefas ligadas ao contato. Esta função
-- apaga tudo numa transação só: ou vai tudo, ou nada.
--
-- SECURITY INVOKER de propósito: valem as policies de quem chama (só owner/admin
-- apaga `contacts` e `tasks`). Se o contato não for apagado, nada é apagado.
--
-- Conversas entram por dois caminhos: as ligadas ao contato (`contact_id`) e as
-- "não identificadas" do mesmo telefone (contact_id nulo, `external_thread_id`
-- com os mesmos dígitos, tolerando o 55 na frente). Mínimo de 10 dígitos para
-- não casar telefone curto/incompleto com conversa de outra pessoa.

create or replace function public.erase_contact_data(_org_id uuid, _contact_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  _phone text;
  _conv_ids uuid[];
  _conversations int := 0;
  _messages int := 0;
  _tasks int := 0;
  _submissions int := 0;
  _deleted int := 0;
begin
  select regexp_replace(coalesce(phone, ''), '\D', '', 'g') into _phone
  from contacts
  where id = _contact_id and organization_id = _org_id;

  if not found then
    return jsonb_build_object('deleted', false);
  end if;

  select coalesce(array_agg(c.id), '{}') into _conv_ids
  from conversations c
  where c.organization_id = _org_id
    and (
      c.contact_id = _contact_id
      or (
        c.contact_id is null
        and length(_phone) >= 10
        and length(regexp_replace(coalesce(c.external_thread_id, ''), '\D', '', 'g')) >= 10
        and (
          regexp_replace(c.external_thread_id, '\D', '', 'g') like '%' || _phone
          or _phone like '%' || regexp_replace(c.external_thread_id, '\D', '', 'g')
        )
      )
    );

  select count(*) into _messages from messages where conversation_id = any(_conv_ids);
  select count(*) into _submissions from lead_submissions where contact_id = _contact_id;

  delete from tasks where organization_id = _org_id and contact_id = _contact_id;
  get diagnostics _tasks = row_count;

  -- mensagens, etiquetas da conversa e execuções do agente saem em cascata
  delete from conversations where id = any(_conv_ids);
  get diagnostics _conversations = row_count;

  -- fichas de diagnóstico, etiquetas, vínculos com deals e toques saem em cascata
  delete from contacts where id = _contact_id and organization_id = _org_id;
  get diagnostics _deleted = row_count;

  if _deleted = 0 then
    -- policy recusou o DELETE do contato: desfaz tarefas/conversas já apagadas
    raise exception 'erase_contact_data: contato nao apagado (sem permissao)';
  end if;

  return jsonb_build_object(
    'deleted', true,
    'conversations', _conversations,
    'messages', _messages,
    'tasks', _tasks,
    'submissions', _submissions
  );
end;
$$;

revoke all on function public.erase_contact_data(uuid, uuid) from public, anon;
grant execute on function public.erase_contact_data(uuid, uuid) to authenticated;
