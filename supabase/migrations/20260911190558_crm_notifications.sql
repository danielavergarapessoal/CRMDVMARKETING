-- Durable internal notifications. No existing contacts or deals are changed.
create or replace function public.queue_crm_contact_notice() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.automation_runs(organization_id,automation_id,trigger_event_id,trigger_payload)
  select new.organization_id,a.id,'crm-lead:'||new.id,
    jsonb_build_object('org',jsonb_build_object('id',o.id,'name',o.name,'slug',o.slug),
      'contact',jsonb_build_object('id',new.id,'name',new.name,'email',new.email,'phone',new.phone,
        'origin',case when new.notes like 'Lead capturado via landing page:%' then btrim(substr(new.notes,length('Lead capturado via landing page:')+1)) else coalesce(nullif(new.list_source,''),'Cadastro no CRM') end),
      '_meta',jsonb_build_object('depth',0,'dry_run',false))
  from public.automations a join public.organizations o on o.id=a.organization_id
  where a.organization_id=new.organization_id and a.trigger_type='crm.lead_received' and a.status='active'
  on conflict(automation_id,trigger_event_id) do nothing;
  return new;
end $$;
revoke all on function public.queue_crm_contact_notice() from public,anon,authenticated;
create trigger crm_contact_notice after insert on public.contacts for each row execute function public.queue_crm_contact_notice();

create or replace function public.queue_crm_proposal_notice() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.stage <> 'proposal_sent' then return new; end if;
  if tg_op='UPDATE' and old.stage=new.stage then return new; end if;
  insert into public.automation_runs(organization_id,automation_id,trigger_event_id,trigger_payload)
  select new.organization_id,a.id,'crm-proposal:'||new.id||':'||gen_random_uuid(),
    jsonb_build_object('org',jsonb_build_object('id',o.id,'name',o.name,'slug',o.slug),
      'deal',jsonb_build_object('id',new.id,'name',new.name),
      '_meta',jsonb_build_object('depth',0,'dry_run',false))
  from public.automations a join public.organizations o on o.id=a.organization_id
  where a.organization_id=new.organization_id and a.trigger_type='crm.proposal_sent' and a.status='active';
  return new;
end $$;
revoke all on function public.queue_crm_proposal_notice() from public,anon,authenticated;
create trigger crm_proposal_notice after insert or update of stage on public.deals for each row execute function public.queue_crm_proposal_notice();

create or replace function public.queue_crm_reminders(p_now timestamptz default now()) returns integer
language plpgsql security definer set search_path=public as $$
declare local_now timestamp := p_now at time zone 'America/Sao_Paulo'; affected integer; total integer:=0;
begin
  if local_now::time < time '09:00' then return 0; end if;
  insert into public.automation_runs(organization_id,automation_id,trigger_event_id,trigger_payload)
  select t.organization_id,a.id,'crm-task:'||t.id||':'||t.due_date,
    jsonb_build_object('org',jsonb_build_object('id',o.id,'name',o.name,'slug',o.slug),
      'task',jsonb_build_object('id',t.id,'title',t.title,'due_date',t.due_date),
      '_meta',jsonb_build_object('depth',0,'dry_run',false))
  from public.tasks t join public.organizations o on o.id=t.organization_id
    join public.automations a on a.organization_id=t.organization_id and a.trigger_type='crm.task_due' and a.status='active'
  where t.status<>'done' and t.due_date=local_now::date
  on conflict(automation_id,trigger_event_id) do nothing;
  get diagnostics affected=row_count; total:=total+affected;
  insert into public.automation_runs(organization_id,automation_id,trigger_event_id,trigger_payload)
  select a.organization_id,a.id,'crm-overdue:'||local_now::date,
    jsonb_build_object('org',jsonb_build_object('id',o.id,'name',o.name,'slug',o.slug),
      'digest',jsonb_build_object('date',local_now::date,'count',d.total,'items',d.items),
      '_meta',jsonb_build_object('depth',0,'dry_run',false))
  from public.automations a join public.organizations o on o.id=a.organization_id
  cross join lateral (
    select max(q.total) as total,string_agg(left(q.title,150)||' — '||to_char(q.due_date,'DD/MM/YYYY'),E'\n' order by q.due_date,q.id) as items
    from (select id,title,due_date,count(*) over() as total from public.tasks
      where organization_id=a.organization_id and status<>'done' and due_date<local_now::date
      order by due_date,id limit 20) q
  ) d
  where a.status='active' and a.trigger_type='crm.overdue_digest' and d.total>0
  on conflict(automation_id,trigger_event_id) do nothing;
  get diagnostics affected=row_count; return total+affected;
end $$;
revoke all on function public.queue_crm_reminders(timestamptz) from public,anon,authenticated;
grant execute on function public.queue_crm_reminders(timestamptz) to service_role;

-- Lock the lookup path for existing trigger helpers.
alter function public.set_deal_close_date() set search_path=public;
alter function public.deal_tag_links_check_scope() set search_path=public;
alter function public.company_tag_links_check_scope() set search_path=public;
alter function public.contact_tag_links_check_scope() set search_path=public;
alter function public.conversation_tag_links_check_scope() set search_path=public;
