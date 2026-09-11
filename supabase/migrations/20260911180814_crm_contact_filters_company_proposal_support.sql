-- Revisar e aplicar antes da publicação. Não executado em produção.
-- A validação de etiquetas passa a usar as permissões/RLS de quem a chamou.
alter function public.assert_tag_scope(uuid, text) security invoker;
grant execute on function public.assert_tag_scope(uuid, text) to authenticated;

-- Negociação e vínculo com o contato são criados na mesma transação.
create or replace function public.create_contact_deal(
  p_org_id uuid, p_contact_id uuid, p_company_id uuid, p_name text,
  p_stage public.deal_stage, p_value numeric, p_expected_close_date date
) returns uuid language plpgsql security invoker set search_path = public as $$
declare v_deal_id uuid; v_company_id uuid;
begin
  if auth.uid() is null or not public.is_org_member(p_org_id) then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;
  if nullif(trim(p_name), '') is null or length(p_name) > 200 or p_value < 0 then
    raise exception 'Dados inválidos' using errcode = '22023';
  end if;
  select company_id into v_company_id from public.contacts
    where id = p_contact_id and organization_id = p_org_id for update;
  if not found then raise exception 'Contato indisponível'; end if;
  if v_company_id is not null and v_company_id <> p_company_id then
    raise exception 'Atualize a empresa do contato antes de criar a proposta';
  end if;
  perform id from public.companies where id = p_company_id and organization_id = p_org_id for share;
  if not found then raise exception 'Empresa indisponível'; end if;
  if v_company_id is null then
    update public.contacts set company_id = p_company_id where id = p_contact_id and organization_id = p_org_id;
  end if;
  insert into public.deals(organization_id, company_id, name, stage, value, expected_close_date, created_by)
    values(p_org_id, p_company_id, trim(p_name), p_stage, p_value, p_expected_close_date, auth.uid()) returning id into v_deal_id;
  insert into public.deal_contacts(deal_id, contact_id) values(v_deal_id, p_contact_id);
  return v_deal_id;
end $$;
revoke all on function public.create_contact_deal(uuid,uuid,uuid,text,public.deal_stage,numeric,date) from public, anon;
grant execute on function public.create_contact_deal(uuid,uuid,uuid,text,public.deal_stage,numeric,date) to authenticated;
