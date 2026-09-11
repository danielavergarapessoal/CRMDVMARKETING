import { createServiceClient } from "@/lib/supabase/service";

export async function isCrmEventCurrent(
  type: string,
  orgId: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const db = createServiceClient();
  if (type === "crm.task_due") {
    const task = payload.task as { id: string; due_date: string };
    const { data, error } = await db
      .from("tasks")
      .select("status,due_date")
      .eq("organization_id", orgId)
      .eq("id", task.id)
      .maybeSingle();
    if (error) throw error;
    return !!data && data.status !== "done" && data.due_date === task.due_date;
  }
  if (type === "crm.lead_received") {
    const contact = payload.contact as { id: string };
    const { data, error } = await db
      .from("contacts")
      .select("id")
      .eq("organization_id", orgId)
      .eq("id", contact.id)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  }
  if (type === "crm.proposal_sent") {
    const deal = payload.deal as { id: string };
    const { data, error } = await db
      .from("deals")
      .select("stage")
      .eq("organization_id", orgId)
      .eq("id", deal.id)
      .maybeSingle();
    if (error) throw error;
    return !!data && data.stage === "proposal_sent";
  }
  return true;
}
