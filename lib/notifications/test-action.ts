"use server";
import React from "react";
import { z } from "zod";
import { requireOrgRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getEmailProvider } from "@/lib/email";
import AutomationTextEmail from "@/lib/email/templates/automation-text";
import { logError } from "@/lib/logger";

export async function sendNotificationTest(orgSlug: string) {
  if (!z.string().min(1).max(80).safeParse(orgSlug).success)
    return { ok: false, error: "Empresa inválida." };
  const { org } = await requireOrgRole({ orgSlug, roles: ["owner", "admin"] });
  const db = await createClient();
  const { data, error } = await db
    .from("automations")
    .select("actions")
    .eq("organization_id", org.id)
    .eq("trigger_type", "crm.lead_received")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (error) logError("notifications.test.read", error);
  const actions = Array.isArray(data?.actions) ? data.actions : [];
  const parsed = z
    .array(z.object({ type: z.string(), config: z.record(z.string(), z.unknown()) }))
    .safeParse(actions);
  const recipient = parsed.success
    ? parsed.data.find((a) => a.type === "send_email")?.config.to
    : undefined;
  if (!z.string().email().safeParse(recipient).success)
    return { ok: false, error: "Configure o destinatário dos avisos primeiro." };
  const to = String(recipient);
  const result = await getEmailProvider().send({
    to,
    subject: "[CRM DV] Teste dos avisos internos",
    idempotencyKey: `crm-notification-test/${org.id}/${new Date().toISOString().slice(0, 16)}`,
    react: React.createElement(AutomationTextEmail, {
      preview: "Conferência de envio do CRM DV",
      heading: "Avisos do CRM DV",
      body: "Este é um teste de envio dos avisos internos da DV. Nenhum lead ou cliente recebeu esta mensagem.\n\nOs avisos configurados incluem novos contatos, propostas marcadas como enviadas, retornos agendados e resumo de tarefas atrasadas.\n\nAcesse o CRM: https://crm.dvmkt.com.br",
    }),
  });
  if (!result.ok) {
    logError("notifications.test.send", new Error(result.error));
    return {
      ok: false,
      error: "O serviço não confirmou o envio. Verifique a configuração de e-mail do servidor.",
    };
  }
  return { ok: true, id: result.id };
}
