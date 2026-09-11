import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { buildDvNotifications } from "@/lib/notifications/presets";
import { automationSchema } from "@/lib/automations/schemas";
import { ACTIONS, TRIGGERS } from "@/lib/automations/registry";
import { interpolate } from "@/lib/automations/templating";
import { isCrmEventCurrent } from "@/lib/notifications/current-event";
import { ConsoleAdapter } from "@/lib/email/adapters/supabase-smtp";

const query = vi.hoisted(() => {
  const q: Record<string, any> = {};
  for (const method of ["from", "select", "eq"]) q[method] = vi.fn(() => q);
  q.maybeSingle = vi.fn();
  return q;
});
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => query }));
const owner = "00000000-0000-4000-8000-000000000003";
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("avisos internos da DV", () => {
  it("envia somente ao comercial e produz ações válidas mesmo com nomes longos", () => {
    const rules = buildDvNotifications("comercial@dvmkt.com.br", owner, "https://crm.dvmkt.com.br");
    expect(rules).toHaveLength(4);
    for (const rule of rules) {
      expect(automationSchema.safeParse(rule).success).toBe(true);
      expect(rule.status).toBe("draft");
      const context = structuredClone(TRIGGERS[rule.trigger_type]!.sampleContext);
      if (context.contact)
        Object.assign(context.contact, { name: "X".repeat(200), email: "cliente@example.com" });
      for (const action of rule.actions) {
        const config = interpolate(action.config, context) as Record<string, unknown>;
        expect(ACTIONS[action.type]!.inputSchema.safeParse(config).success, action.type).toBe(true);
        if (action.type === "send_email") expect(config.to).toBe("comercial@dvmkt.com.br");
        expect(JSON.stringify(config)).not.toContain("{{");
      }
    }
  });
  it.each([
    [null, false],
    [{ status: "done", due_date: "2026-09-11" }, false],
    [{ status: "pending", due_date: "2026-09-12" }, false],
    [{ status: "pending", due_date: "2026-09-11" }, true],
  ])("cancela aviso de tarefa excluída, concluída ou reagendada", async (data, expected) => {
    query.maybeSingle.mockResolvedValue({ data, error: null });
    expect(
      await isCrmEventCurrent("crm.task_due", owner, {
        task: { id: "task-a", due_date: "2026-09-11" },
      }),
    ).toBe(expected);
    expect(query.eq).toHaveBeenCalledWith("organization_id", owner);
    expect(query.eq).toHaveBeenCalledWith("id", "task-a");
  });
  it("não envia diante de erro ao conferir a tarefa", async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: new Error("database unavailable") });
    await expect(
      isCrmEventCurrent("crm.task_due", owner, { task: { id: "task-a", due_date: "2026-09-11" } }),
    ).rejects.toThrow();
  });
  it("cancela acompanhamento se a proposta saiu da etapa", async () => {
    query.maybeSingle.mockResolvedValue({ data: { stage: "won" }, error: null });
    expect(await isCrmEventCurrent("crm.proposal_sent", owner, { deal: { id: "deal-a" } })).toBe(
      false,
    );
  });
  it("não informa envio bem sucedido sem provedor em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      (
        await new ConsoleAdapter().send({
          to: "comercial@dvmkt.com.br",
          subject: "teste",
          react: createElement("p", null, "Teste"),
        })
      ).ok,
    ).toBe(false);
  });
});
