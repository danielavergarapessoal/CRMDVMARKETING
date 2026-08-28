import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  type LucideIcon,
  ShieldCheckIcon,
  UserRoundCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrgMember } from "@/lib/auth/guards";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Materiais avulsos" };

type ApprovalStatus = "pending" | "adjustments" | "approved";

type ApprovalMaterial = {
  id: string;
  title: string;
  client: string;
  format: string;
  channel: string;
  unboundStage: string;
  dueDate: string;
  owner: string;
  status: ApprovalStatus;
  summary: string;
  attentionPoints: string[];
  cfmChecks: string[];
};

const statusConfig: Record<
  ApprovalStatus,
  { label: string; tone: "default" | "secondary" | "outline" }
> = {
  pending: { label: "aguardando decisão", tone: "default" },
  adjustments: { label: "ajustes solicitados", tone: "secondary" },
  approved: { label: "aprovado", tone: "outline" },
};

const materials: [ApprovalMaterial, ...ApprovalMaterial[]] = [
  {
    id: "MAV-001",
    title: "Post educativo sobre sinais de alerta",
    client: "Cliente médico premium",
    format: "Carrossel",
    channel: "Instagram",
    unboundStage: "consideração",
    dueDate: "06/07/2026, 17h",
    owner: "Daniela Vergara",
    status: "pending",
    summary:
      "Conteúdo avulso de orientação, sem promessa de resultado e com chamada para avaliação individual.",
    attentionPoints: [
      "Validar se a linguagem evita tom alarmista.",
      "Confirmar se a fonte científica citada está nomeada.",
      "Revisar se a chamada respeita aprovação humana antes da publicação.",
    ],
    cfmChecks: [
      "Sem antes/depois.",
      "Sem garantia de desfecho clínico.",
      "Sem sensacionalismo.",
      "Sem exposição de paciente.",
    ],
  },
  {
    id: "MAV-002",
    title: "Legenda institucional para campanha local",
    client: "Clínica particular",
    format: "Legenda",
    channel: "Instagram e Facebook",
    unboundStage: "descoberta",
    dueDate: "07/07/2026, 11h",
    owner: "Equipe DV",
    status: "adjustments",
    summary:
      "Texto de autoridade percebida com foco em critério, reputação e contexto de atendimento.",
    attentionPoints: [
      "Trocar expressão que pode soar como promessa.",
      "Deixar a evidência mais precisa, com fonte nomeada.",
      "Reduzir adjetivos superlativos.",
    ],
    cfmChecks: [
      "Sem comparação depreciativa.",
      "Sem autopromoção excessiva.",
      "Sem linguagem de urgência comercial.",
      "Com orientação de aprovação final.",
    ],
  },
  {
    id: "MAV-003",
    title: "Story de agenda com comunicação sóbria",
    client: "Consultório médico",
    format: "Story",
    channel: "Instagram",
    unboundStage: "conversão",
    dueDate: "08/07/2026, 09h",
    owner: "Daniela Vergara",
    status: "approved",
    summary: "Peça simples de disponibilidade, com linguagem informativa e sem indução indevida.",
    attentionPoints: [
      "Manter sem desconto, escassez artificial ou promessa.",
      "Confirmar dados de contato antes da publicação.",
      "Enviar para aprovação humana final do cliente.",
    ],
    cfmChecks: [
      "Sem oferta promocional.",
      "Sem promessa de resultado.",
      "Sem dado sensível.",
      "Com tom informativo.",
    ],
  },
];

const pendingCount = materials.filter((material) => material.status === "pending").length;
const adjustmentsCount = materials.filter((material) => material.status === "adjustments").length;
const approvedCount = materials.filter((material) => material.status === "approved").length;
const highlightedMaterial = materials[0];

export default async function LooseMaterialsApprovalPage({ params }: Props) {
  const { orgSlug } = await params;
  const { org } = await requireOrgMember({ orgSlug });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="label-mono">/ materiais-avulsos</span>
          <h1 className="font-semibold text-3xl">Aprovação de material avulso</h1>
          <p className="max-w-2xl text-muted-foreground text-sm">
            Fila de revisão para peças pontuais da {org.name}, com critério de marca, clareza
            comercial e conformidade com publicidade médica.
          </p>
        </div>
        <Badge variant="outline" className="h-7 px-3">
          aprovação humana obrigatória
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="border-b border-border/60 bg-card/40 py-3">
            <CardTitle className="label-mono text-[10px]">/ em revisão</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-4 pt-2">
            <div>
              <p className="font-semibold text-3xl">{pendingCount}</p>
              <p className="text-muted-foreground text-sm">aguardando decisão</p>
            </div>
            <ClipboardCheckIcon className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 bg-card/40 py-3">
            <CardTitle className="label-mono text-[10px]">/ ajustes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-4 pt-2">
            <div>
              <p className="font-semibold text-3xl">{adjustmentsCount}</p>
              <p className="text-muted-foreground text-sm">precisam voltar para produção</p>
            </div>
            <AlertTriangleIcon className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 bg-card/40 py-3">
            <CardTitle className="label-mono text-[10px]">/ aprovados</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-4 pt-2">
            <div>
              <p className="font-semibold text-3xl">{approvedCount}</p>
              <p className="text-muted-foreground text-sm">liberados para próxima etapa</p>
            </div>
            <CheckCircle2Icon className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="space-y-3">
          {materials.map((material) => {
            const status = statusConfig[material.status];

            return (
              <Card key={material.id}>
                <CardContent className="space-y-4 pt-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="label-mono text-[10px]">{material.id}</span>
                        <Badge variant={status.tone}>{status.label}</Badge>
                      </div>
                      <h2 className="font-medium text-lg">{material.title}</h2>
                      <p className="text-muted-foreground text-sm">{material.summary}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-right">
                      <p className="label-mono text-[10px]">prazo</p>
                      <p className="font-medium text-sm">{material.dueDate}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <MetaItem label="cliente" value={material.client} />
                    <MetaItem label="formato" value={material.format} />
                    <MetaItem label="canal" value={material.channel} />
                    <MetaItem label="etapa" value={material.unboundStage} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-border/60 bg-card/40 py-3">
              <CardTitle className="label-mono text-[10px]">/ decisão prioritária</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              <div className="space-y-1">
                <Badge>{statusConfig[highlightedMaterial.status].label}</Badge>
                <h2 className="font-semibold text-xl">{highlightedMaterial.title}</h2>
                <p className="text-muted-foreground text-sm">{highlightedMaterial.summary}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DecisionMeta
                  icon={CalendarClockIcon}
                  label="prazo"
                  value={highlightedMaterial.dueDate}
                />
                <DecisionMeta
                  icon={UserRoundCheckIcon}
                  label="responsável"
                  value={highlightedMaterial.owner}
                />
              </div>

              <div className="space-y-2">
                <p className="label-mono text-[10px]">/ pontos de atenção</p>
                <ul className="space-y-2">
                  {highlightedMaterial.attentionPoints.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2 rounded-lg border border-border/70 bg-muted/20 p-3 text-sm"
                    >
                      <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/60 bg-card/40 py-3">
              <CardTitle className="label-mono text-[10px]">/ checklist cfm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {highlightedMaterial.cfmChecks.map((check) => (
                <div key={check} className="flex items-start gap-3 text-sm">
                  <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{check}</span>
                </div>
              ))}
              <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-muted-foreground text-sm">
                Toda evidência clínica deve ter fonte nomeada e revisão humana antes de publicar.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <p className="label-mono text-[10px]">{label}</p>
      <p className="mt-1 font-medium text-sm">{value}</p>
    </div>
  );
}

function DecisionMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="label-mono text-[10px]">{label}</p>
        <p className="mt-1 font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}
