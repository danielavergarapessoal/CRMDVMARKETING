"use server";

import { z } from "zod";
import { requireOrgRole } from "@/lib/auth/guards";
import { logError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { type EraseContactInput, eraseContactSchema } from "./schemas";

export type EraseContactSummary = {
  conversations: number;
  messages: number;
  tasks: number;
  submissions: number;
};

type Result = { ok: true; data: EraseContactSummary } | { ok: false; error: string };

const rpcResultSchema = z.object({
  deleted: z.boolean(),
  conversations: z.number().optional(),
  messages: z.number().optional(),
  tasks: z.number().optional(),
  submissions: z.number().optional(),
});

/**
 * LGPD: apaga de verdade tudo que o CRM guarda de um titular — contato, fichas de
 * diagnóstico, etiquetas, conversas com as mensagens e tarefas. A exclusão comum
 * (`deleteContactAction`) deixa conversas e tarefas para trás (FK SET NULL).
 */
export async function eraseContactDataAction(input: EraseContactInput): Promise<Result> {
  const parsed = eraseContactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Confirmação inválida." };

  const { org } = await requireOrgRole({
    orgSlug: parsed.data.orgSlug,
    roles: ["owner", "admin"],
  });
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("erase_contact_data", {
    _org_id: org.id,
    _contact_id: parsed.data.id,
  });
  if (error) {
    logError("contacts.erase", error);
    return { ok: false, error: "Não consegui excluir os dados. Nada foi apagado. Tenta de novo." };
  }

  const result = rpcResultSchema.safeParse(data);
  if (!result.success || !result.data.deleted) {
    return {
      ok: false,
      error: "Esse contato não foi encontrado. Atualize a página (F5) e confira a lista.",
    };
  }

  // Sem revalidatePath: a ficha aberta viraria 404 e o comprovante sumiria da tela.
  // Quem atualiza a lista é o diálogo, quando o usuário clica em "Concluir".
  return {
    ok: true,
    data: {
      conversations: result.data.conversations ?? 0,
      messages: result.data.messages ?? 0,
      tasks: result.data.tasks ?? 0,
      submissions: result.data.submissions ?? 0,
    },
  };
}
