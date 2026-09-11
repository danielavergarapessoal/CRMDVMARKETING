import { logError } from "@/lib/logger";
import { createServiceClient } from "@/lib/supabase/service";

let running = false;
/** Durable queue and deduplication live in Postgres; restarts do not lose reminders. */
export async function queueCrmReminders(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const { error } = await createServiceClient().rpc("queue_crm_reminders");
    if (error) logError("notifications.queue", error);
  } finally {
    running = false;
  }
}
