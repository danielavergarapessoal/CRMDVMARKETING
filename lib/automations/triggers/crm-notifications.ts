import { z } from "zod";
import type { TriggerDefinition } from "../schemas";

const org = z.object({ id: z.string().uuid(), name: z.string(), slug: z.string() });
const sampleOrg = {
  id: "00000000-0000-4000-8000-000000000003",
  name: "DV Marketing Médico",
  slug: "crmdv",
};
const sampleId = "00000000-0000-4000-8000-000000000005";
function definition(
  id: string,
  label: string,
  description: string,
  key: string,
  shape: z.ZodType,
  sample: Record<string, unknown>,
): TriggerDefinition {
  return {
    id,
    label,
    description,
    contextSchema: z.object({ org, [key]: shape }),
    triggerConfigSchema: z.object({}),
    variables: Object.keys(sample)
      .map((k) => `{{${key}.${k}}}`)
      .concat(["{{org.name}}", "{{org.slug}}"]),
    variableLabels: Object.fromEntries(
      Object.entries(sample).map(([k, v]) => [
        key + "." + k,
        {
          label:
            (
              {
                id: "Identificador",
                name: "Nome",
                email: "E-mail",
                phone: "Telefone",
                origin: "Origem do contato",
                title: "Título da tarefa",
                due_date: "Data do retorno",
                date: "Data do resumo",
                count: "Quantidade de pendências",
                items: "Lista de pendências",
              } as Record<string, string>
            )[k] ?? k,
          example: v == null ? "" : String(v),
        },
      ]),
    ),
    sampleContext: { org: sampleOrg, [key]: sample },
  };
}
export const crmLeadTrigger = definition(
  "crm.lead_received",
  "Novo contato ou lead",
  "Contato salvo no CRM, inclusive pelas páginas de captura. O aviso é registrado junto com o cadastro.",
  "contact",
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    origin: z.string(),
  }),
  {
    id: sampleId,
    name: "Contato de demonstração",
    email: "lead@example.com",
    phone: null,
    origin: "Diagnóstico de Maturidade",
  },
);
export const crmProposalTrigger = definition(
  "crm.proposal_sent",
  "Proposta marcada como enviada",
  "Ao criar uma proposta enviada ou mover uma negociação para essa etapa. Não envia a proposta ao cliente.",
  "deal",
  z.object({ id: z.string().uuid(), name: z.string() }),
  { id: sampleId, name: "Assessoria estratégica" },
);
export const crmTaskDueTrigger = definition(
  "crm.task_due",
  "Retorno agendado para hoje",
  "A partir das 9h de Brasília, uma vez por tarefa e data. Tarefas concluídas não recebem aviso.",
  "task",
  z.object({ id: z.string().uuid(), title: z.string(), due_date: z.string() }),
  { id: sampleId, title: "Retomar a conversa com o lead", due_date: "2026-09-15" },
);
export const crmOverdueTrigger = definition(
  "crm.overdue_digest",
  "Resumo diário de retornos atrasados",
  "A partir das 9h de Brasília, um resumo por dia, somente quando houver tarefas atrasadas.",
  "digest",
  z.object({ date: z.string(), count: z.number(), items: z.string() }),
  { date: "2026-09-15", count: 1, items: "Retomar proposta — vencimento 14/09/2026" },
);
