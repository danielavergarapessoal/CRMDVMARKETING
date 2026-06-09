import { ArrowLeftIcon, MessageSquareIcon, UsersIcon, ZapIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Left: form */}
      <div className="relative flex min-h-screen flex-col px-6 py-8 lg:min-h-0 lg:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Voltar
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logodv-verde.png"
              alt="DV Marketing"
              width={497}
              height={363}
              priority
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <p className="text-center font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          DV Marketing · CRM
        </p>
      </div>

      {/* Right: branded panel (Sage — "fundo de impacto"). Hidden on mobile. */}
      <aside className="relative hidden overflow-hidden bg-[#4e6055] text-[#f3f1ef] lg:flex lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-2/3 w-full bg-gradient-to-tl from-[#d4937a]/20 via-transparent to-transparent blur-3xl" />

        <div className="relative flex max-w-md flex-col items-center space-y-8 px-12 text-center">
          <Image
            src="/logo-dv-branca.png"
            alt="DV Marketing"
            width={497}
            height={363}
            priority
            className="h-60 w-auto object-contain"
          />

          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#cfd8d0]">
              / CRM DV Marketing
            </span>
            <h2 className="font-semibold text-4xl tracking-tight leading-[1.1] text-[#f6f4f1]">
              Seus clientes,
              <br />
              <span className="text-[#d4937a]">no controle.</span>
            </h2>
          </div>

          <p className="text-balance text-[#dce2dd] leading-relaxed">
            Contatos, empresas, negócios e atendimento por WhatsApp — tudo organizado num só lugar,
            do jeito da DV Marketing.
          </p>

          <div className="grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg border border-[#5c6f63] bg-[#5c6f63] text-left">
            <Feature
              icon={UsersIcon}
              title="Contatos & funil"
              desc="Leads, empresas e negócios em pipeline."
            />
            <Feature
              icon={MessageSquareIcon}
              title="Inbox WhatsApp"
              desc="Atendimento centralizado por canal."
            />
            <Feature
              icon={ZapIcon}
              title="Automações & IA"
              desc="Respostas e fluxos no automático."
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-[#4e6055] px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#d4937a]" />
      <div>
        <div className="font-medium text-sm text-[#f3f1ef]">{title}</div>
        <div className="text-[#bcc7be] text-xs">{desc}</div>
      </div>
    </div>
  );
}
