import { ExternalLinkIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { ContactSubmission } from "@/lib/leads/queries";
import { isNotionUrl, type SubmissionAnswer } from "@/lib/leads/submissions";
import { cn } from "@/lib/utils";

type Props = { submissions: ContactSubmission[] };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

function groupBySection(answers: SubmissionAnswer[]): [string, SubmissionAnswer[]][] {
  const groups = new Map<string, SubmissionAnswer[]>();
  for (const a of answers) {
    const key = a.section ?? "Respostas";
    const list = groups.get(key);
    if (list) list.push(a);
    else groups.set(key, [a]);
  }
  return [...groups.entries()];
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 px-3 py-2">
      <p className="label-mono text-[10px] text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}

function SubmissionCard({ s }: { s: ContactSubmission }) {
  const weakest =
    s.dimensions.length > 1
      ? s.dimensions.reduce((min, d) => (d.score / d.max < min.score / min.max ? d : min))
      : null;
  const extraEntries = Object.entries(s.extra);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-sm">{s.sourceLabel}</p>
          <p className="text-muted-foreground text-xs">
            Respondido em {formatDate(s.submittedAt)}
            {s.externalId ? ` · ${s.externalId}` : ""}
          </p>
        </div>
        {s.notionUrl && isNotionUrl(s.notionUrl) && (
          <a
            href={s.notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            Abrir no Notion
          </a>
        )}
      </div>

      {(s.stage || s.scoreTotal !== null || s.recommendedPlan || s.priority) && (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {s.stage && <Fact label="estágio" value={s.stage} />}
          {s.scoreTotal !== null && (
            <Fact
              label="pontuação"
              value={s.scoreMax ? `${s.scoreTotal} de ${s.scoreMax}` : String(s.scoreTotal)}
            />
          )}
          {s.recommendedPlan && <Fact label="plano recomendado" value={s.recommendedPlan} />}
          {s.priority && <Fact label="prioridade" value={s.priority} />}
        </div>
      )}

      {s.dimensions.length > 0 && (
        <ul className="space-y-2">
          {s.dimensions.map((d) => (
            <li key={d.label} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3">
              <span className="truncate text-sm">{d.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${d === weakest ? "bg-destructive/70" : "bg-primary"}`}
                  style={{ width: `${Math.min(100, (d.score / d.max) * 100)}%` }}
                />
              </div>
              <span className="text-right font-mono text-muted-foreground text-xs">
                {d.score}/{d.max}
              </span>
            </li>
          ))}
          {weakest && (
            <li className="text-muted-foreground text-xs">
              Ponto mais fraco: <span className="text-foreground">{weakest.label}</span>
            </li>
          )}
        </ul>
      )}

      {s.summary && <p className="whitespace-pre-line text-sm leading-relaxed">{s.summary}</p>}

      {extraEntries.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {extraEntries.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="text-muted-foreground">{k}:</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {s.answers.length > 0 && (
        <details className="rounded-md border border-border/60">
          <summary className="cursor-pointer px-3 py-2 font-medium text-sm">
            Ver as {s.answers.length} respostas
          </summary>
          <div className="space-y-4 border-border/60 border-t px-3 py-3">
            {groupBySection(s.answers).map(([section, items]) => (
              <div key={section} className="space-y-2">
                <p className="label-mono text-[10px] text-muted-foreground">{section}</p>
                <ul className="space-y-2">
                  {items.map((a) => (
                    <li key={a.question} className="text-sm">
                      <p className="text-muted-foreground">{a.question}</p>
                      <p>{a.answer}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export function ContactSubmissionsPanel({ submissions }: Props) {
  return (
    <div className="space-y-8">
      {submissions.map((s, i) => (
        <div key={s.id} className={i > 0 ? "border-border/60 border-t pt-8" : undefined}>
          <SubmissionCard s={s} />
        </div>
      ))}
    </div>
  );
}
