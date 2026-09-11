import { z } from "zod";
import type { AutomationInput } from "@/lib/automations/schemas";

/** Internal notices only. Never uses the lead's address as the recipient. */
export function buildDvNotifications(
  recipient: string,
  ownerId: string,
  baseUrl: string,
): AutomationInput[] {
  z.string().email().parse(recipient);
  z.string().uuid().parse(ownerId);
  const url = new URL(baseUrl);
  if (url.protocol !== "https:") throw new Error("Use uma URL HTTPS para o CRM");
  const base = url.origin;
  const email = (subject: string, body: string) => ({
    type: "send_email",
    on_error: "stop" as const,
    config: { to: recipient, subject, body, heading: "Acompanhamento comercial DV" },
  });
  const task = (title: string, description: string, due: number, link: Record<string, string>) => ({
    type: "create_task",
    on_error: "stop" as const,
    config: {
      title,
      description,
      assigned_to: ownerId,
      due_in_days: due,
      priority: "high",
      reuse_pending: true,
      ...link,
    },
  });
  const common = { status: "draft" as const, trigger_config: {}, conditions: [] };
  return [
    {
      ...common,
      name: "DV · Novo lead e primeiro contato",
      trigger_type: "crm.lead_received",
      description:
        "Novo contato: cria uma tarefa para hoje e avisa o comercial por e-mail. Vale para novos cadastros e capturas, sem disparar para contatos antigos.",
      actions: [
        task(
          "Fazer primeiro contato",
          "Contato: {{contact.name}}. Origem: {{contact.origin}}. Abrir a ficha, conferir os dados e iniciar o contato.",
          0,
          { contact_id: "{{contact.id}}" },
        ),
        email(
          "[CRM DV] Um novo contato chegou",
          "Um novo contato entrou no CRM.\n\nNome: {{contact.name}}\nOrigem: {{contact.origin}}\nE-mail: {{contact.email}}\nTelefone: {{contact.phone}}\n\nConfira a tarefa de primeiro contato e registre o próximo retorno.\n" +
            base +
            "/app/{{org.slug}}/contatos/{{contact.id}}",
        ),
      ],
    },
    {
      ...common,
      name: "DV · Acompanhamento de proposta",
      trigger_type: "crm.proposal_sent",
      description:
        "Ao marcar uma proposta como enviada, cria um retorno em dois dias corridos e avisa o comercial. Não envia proposta nem mensagem ao cliente.",
      actions: [
        task(
          "Acompanhar proposta enviada",
          "Retomar a negociação {{deal.name}}. Conferir se a proposta foi recebida e registrar o próximo passo.",
          2,
          { deal_id: "{{deal.id}}" },
        ),
        email(
          "[CRM DV] Proposta enviada: acompanhe o próximo retorno",
          "A negociação {{deal.name}} foi marcada como Proposta enviada.\n\nConfira a tarefa de acompanhamento. Você pode alterar a data conforme o combinado com o lead.\n" +
            base +
            "/app/{{org.slug}}/deals/{{deal.id}}",
        ),
      ],
    },
    {
      ...common,
      name: "DV · Retornos agendados",
      trigger_type: "crm.task_due",
      description:
        "Avisa a partir das 9h de Brasília sobre tarefas que vencem hoje, uma vez por tarefa e data. Concluir ou reagendar antes do envio cancela o aviso anterior.",
      actions: [
        email(
          "[CRM DV] Você tem um retorno agendado",
          "Sua tarefa para hoje:\n\n{{task.title}}\n\nAbra a tarefa, realize o contato e marque como concluída ou reagende.\n" +
            base +
            "/app/{{org.slug}}/tarefas/{{task.id}}",
        ),
      ],
    },
    {
      ...common,
      name: "DV · Resumo de pendências",
      trigger_type: "crm.overdue_digest",
      description:
        "Um resumo diário a partir das 9h de Brasília, somente quando houver tarefas atrasadas. O e-mail lista até 20; a lista completa fica no CRM.",
      actions: [
        email(
          "[CRM DV] Resumo de retornos atrasados",
          "Você tem {{digest.count}} tarefa(s) atrasada(s).\n\n{{digest.items}}\n\nConfira a lista completa para concluir ou reagendar os retornos:\n" +
            base +
            "/app/{{org.slug}}/tarefas",
        ),
      ],
    },
  ];
}
