"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOrgRole } from "@/lib/auth/guards";
import { logError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  orgSlug: z.string().min(1).max(100),
  ids: z.array(z.string().uuid()).min(1).max(500),
  confirmation: z.literal("EXCLUIR"),
});
export async function deleteContactsBulkAction(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Selecione de 1 a 500 contatos e confirme a exclusão." };
  const { org } = await requireOrgRole({ orgSlug: parsed.data.orgSlug, roles: ["owner", "admin"] });
  const supabase = await createClient();
  const ids = [...new Set(parsed.data.ids)];
  const { data: visible, error: readError } = await supabase
    .from("contacts")
    .select("id")
    .eq("organization_id", org.id)
    .in("id", ids);
  if (readError || visible?.length !== ids.length)
    return {
      ok: false as const,
      error:
        "A seleção mudou ou contém contatos indisponíveis. Atualize a lista e selecione novamente.",
    };
  const { data, error } = await supabase
    .from("contacts")
    .delete()
    .eq("organization_id", org.id)
    .in("id", ids)
    .select("id");
  if (error) {
    logError("contacts.bulkDelete", error);
    return {
      ok: false as const,
      error: "Não foi possível excluir os contatos. Atualize a lista antes de tentar novamente.",
    };
  }
  revalidatePath(`/app/${parsed.data.orgSlug}`, "layout");
  return { ok: true as const, deleted: data?.length ?? 0 };
}
