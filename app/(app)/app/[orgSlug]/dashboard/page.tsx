import Link from "next/link";
import { requireOrgMember } from "@/lib/auth/guards";
import { getDashboard } from "@/lib/dashboard/queries";
import { STAGE_LABELS } from "@/lib/deals/stages";
export const metadata = { title: "Início" };
export default async function DashboardPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { org } = await requireOrgMember({ orgSlug });
  const d = await getDashboard(org.id);
  const cards = [
    ["Contatos cadastrados", String(d.contacts), "contatos"],
    ["Diagnóstico de Maturidade", String(d.diagnosis), "contatos?tag=diagnostico"],
    ["Tarefas pendentes", String(d.pending), "tarefas"],
    ["Tarefas atrasadas", String(d.overdue), "tarefas"],
  ];
  return (
    <div className="space-y-8">
      <div>
        <span className="label-mono">/ acompanhamento comercial</span>
        <h1 className="text-3xl font-semibold">Seu dia no CRM</h1>
        <p className="text-sm text-muted-foreground">
          {org.name} · Dados dos cadastros atuais, atualizados ao abrir esta página.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, path]) => (
          <Link
            key={label}
            href={`/app/${orgSlug}/${path}`}
            className="rounded-xl border bg-card p-5 hover:border-primary"
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </Link>
        ))}
      </div>
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Negociações</h2>
        <p>
          Valor das oportunidades abertas:{" "}
          <strong>
            {d.pipeline.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Previsão comercial; não representa receita recebida.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Object.entries(d.stages).map(([stage, count]) => (
            <div key={stage} className="rounded-lg border p-3">
              <p className="text-sm">{STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}</p>
              <strong className="text-xl">{count}</strong>
            </div>
          ))}
        </div>
        <Link className="text-primary underline" href={`/app/${orgSlug}/deals`}>
          Abrir negociações
        </Link>
      </section>
      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Próximas ações</h2>
        {d.tasks.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhuma tarefa pendente. Abra um contato para agendar o próximo retorno.
          </p>
        ) : (
          <ul className="space-y-2">
            {d.tasks.map((t) => (
              <li key={t.id}>
                <Link
                  className="flex justify-between gap-4 rounded-lg border p-3 hover:border-primary"
                  href={`/app/${orgSlug}/tarefas/${t.id}`}
                >
                  <span>{t.title}</span>
                  <span>
                    {t.due_date
                      ? t.due_date.slice(0, 10).split("-").reverse().join("/")
                      : "Sem data"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-sm text-muted-foreground">
        Rotina: abra o contato, complete a empresa, adicione a proposta e agende uma tarefa com o
        próximo retorno.
      </p>
    </div>
  );
}
