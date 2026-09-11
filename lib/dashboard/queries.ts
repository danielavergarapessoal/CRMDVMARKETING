import { DIAGNOSIS_TAG } from "@/lib/contacts/filters";
import { getContactsWithCompany } from "@/lib/contacts/queries";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type Stage = Database["public"]["Enums"]["deal_stage"];
export async function getDashboard(orgId: string) {
  const db = await createClient();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [contacts, pending, overdue, tasks] = await Promise.all([
    getContactsWithCompany(orgId),
    db
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .neq("status", "done"),
    db
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .neq("status", "done")
      .lt("due_date", today),
    db
      .from("tasks")
      .select("id,title,due_date")
      .eq("organization_id", orgId)
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(8),
  ]);
  for (const result of [pending, overdue, tasks]) if (result.error) throw result.error;
  const stages: Record<Stage, number> = {
    new: 0,
    qualified: 0,
    proposal_sent: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };
  let pipeline = 0;
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db
      .from("deals")
      .select("id,stage,value")
      .eq("organization_id", orgId)
      .order("id")
      .range(offset, offset + 499);
    if (error) throw error;
    for (const d of data ?? []) {
      stages[d.stage]++;
      if (d.stage !== "won" && d.stage !== "lost") pipeline += d.value ?? 0;
    }
    if (!data || data.length < 500) break;
  }
  return {
    contacts: contacts.length,
    diagnosis: contacts.filter((c) => c.tags.some((t) => t.name === DIAGNOSIS_TAG)).length,
    pending: pending.count ?? 0,
    overdue: overdue.count ?? 0,
    tasks: tasks.data ?? [],
    stages,
    pipeline,
  };
}
