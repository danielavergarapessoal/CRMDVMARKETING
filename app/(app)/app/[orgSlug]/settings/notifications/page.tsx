import Link from "next/link";
import { z } from "zod";
import { requireOrgRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { TestNotificationButton } from "./test-button";
export const metadata = { title: "Avisos por e-mail" };
export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { org } = await requireOrgRole({ orgSlug, roles: ["owner", "admin"] });
  const db = await createClient();
  const { data, error } = await db
    .from("automations")
    .select("id,name,description,trigger_type,status,actions")
    .eq("organization_id", org.id)
    .like("trigger_type", "crm.%")
    .order("created_at");
  if (error) throw error;
  const senderReady =
    process.env.EMAIL_PROVIDER === "resend" &&
    !!process.env.RESEND_API_KEY &&
    !!process.env.EMAIL_FROM;
  const statuses: Record<string, string> = {
    active: "Ativo",
    paused: "Pausado",
    draft: "Rascunho",
  };
  const autoIds = (data ?? []).map((a) => a.id);
  const { data: runs, error: runError } = autoIds.length
    ? await db
        .from("automation_runs")
        .select("id,status,created_at,automation_id")
        .eq("organization_id", org.id)
        .in("automation_id", autoIds)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [], error: null };
  if (runError) throw runError;
  const runLabels: Record<string, string> = {
    completed: "Processado",
    pending: "Na fila",
    running: "Em processamento",
    failed: "Falha — conferir histórico",
    skipped_conditions: "Cancelado: condição mudou",
  };
  return (
    <div className="space-y-6">
      <header>
        <span className="label-mono">/ acompanhamento da DV</span>
        <h1 className="text-3xl font-semibold">Avisos por e-mail</h1>
        <p className="text-muted-foreground">
          Lembretes para você acompanhar os contatos e as propostas da empresa.
        </p>
      </header>
      <section className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="font-semibold">Serviço de envio</h2>
        <p>
          {senderReady
            ? "Serviço de envio configurado. Use o teste abaixo para conferir o recebimento."
            : "Envio ainda não configurado no servidor. Os avisos não devem ser considerados entregues."}
        </p>
        <p className="text-sm text-muted-foreground">
          Retornos do dia e resumo de atrasos entram na fila a partir das 9h, horário de Brasília.
          Tarefas sem data não geram lembrete. Novos contatos e propostas entram na fila ao serem
          salvos.
        </p>
        {senderReady && !!data?.length && <TestNotificationButton orgSlug={orgSlug} />}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Suas regras de aviso</h2>
        {!data?.length && <p>Nenhuma regra configurada.</p>}
        {data?.map((a) => {
          const parsed = z
            .array(z.object({ type: z.string(), config: z.record(z.string(), z.unknown()) }))
            .safeParse(a.actions);
          const recipient = parsed.success
            ? parsed.data.find((x) => x.type === "send_email")?.config.to
            : undefined;
          return (
            <article key={a.id} className="rounded-xl border bg-card p-5 space-y-2">
              <h3 className="font-semibold">
                {a.name} · {statuses[a.status] ?? a.status}
              </h3>
              <p className="text-sm">{a.description}</p>
              <p className="text-sm">
                Destino: {typeof recipient === "string" ? recipient : "Sem e-mail configurado"}
              </p>
              <Link className="text-primary underline" href={`/app/${orgSlug}/automacoes/${a.id}`}>
                Ajustar regra ou ver histórico
              </Link>
            </article>
          );
        })}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Últimos avisos</h2>
        {!runs?.length ? (
          <p className="text-muted-foreground">
            Nenhum evento processado ainda. As regras valem para os próximos cadastros e retornos
            agendados.
          </p>
        ) : (
          <ul className="space-y-2">
            {runs.map((r) => (
              <li key={r.id}>
                <Link
                  className="underline"
                  href={`/app/${orgSlug}/automacoes/${r.automation_id}/runs/${r.id}`}
                >
                  {new Date(r.created_at).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}{" "}
                  · {runLabels[r.status] ?? r.status}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-sm text-muted-foreground">
        Estes são avisos internos. A conexão de uma caixa de e-mail para conversar com clientes e a
        conexão do WhatsApp são configurações separadas.
      </p>
    </div>
  );
}
