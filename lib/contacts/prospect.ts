import type { Database } from "@/types/supabase";

export type ProspectStatus = Database["public"]["Enums"]["prospect_status"];

/** Order matters: defines Kanban column order (etapa 2). */
export const PROSPECT_STATUS_ORDER = [
  "a_abordar",
  "conexao_enviada",
  "mensagem_1",
  "follow_up_1",
  "follow_up_2",
  "respondeu",
  "reuniao_marcada",
  "descartado",
] as const satisfies readonly ProspectStatus[];

export const PROSPECT_STATUS_LABELS: Record<ProspectStatus, string> = {
  a_abordar: "A abordar",
  conexao_enviada: "Conexão enviada",
  mensagem_1: "Mensagem 1",
  follow_up_1: "Follow-up 1",
  follow_up_2: "Follow-up 2",
  respondeu: "Respondeu",
  reuniao_marcada: "Reunião marcada",
  descartado: "Descartado",
};

/** Estágios em que o contato espera resposta nossa/deles (base dos alertas de follow-up, etapa 4). */
export const WAITING_STAGES = [
  "conexao_enviada",
  "mensagem_1",
  "follow_up_1",
  "follow_up_2",
] as const satisfies readonly ProspectStatus[];

/** Remove o @ do começo e normaliza pra minúsculas (handle do Instagram é case-insensitive). */
export function normalizeInstagramHandle(v: string): string {
  return v.replace(/^@+/, "").toLowerCase();
}
