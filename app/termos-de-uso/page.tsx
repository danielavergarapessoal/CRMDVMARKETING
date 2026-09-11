import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do CRM da DV Marketing Médico.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:py-16">
      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-12">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          DV Marketing Médico · CRM
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Atualizados em 11 de setembro de 2026</p>

        <div className="mt-9 space-y-8 text-[15px] leading-7 text-card-foreground">
          <p>
            Estes termos regulam o acesso ao CRM DV Marketing e aos canais digitais operados pela
            DANIELA C. VERGARA D ELIA LIMA CONSULTORIA, responsável pela marca DV Marketing Médico.
          </p>

          <Section title="Uso do serviço">
            <p>
              O CRM é destinado à gestão interna de contatos, empresas, oportunidades, tarefas,
              documentos e atendimentos da DV Marketing Médico. O acesso administrativo é restrito a
              pessoas autorizadas. O envio de mensagem aos canais comerciais não cria contratação;
              propostas e contratos dependem de aceite específico.
            </p>
          </Section>

          <Section title="Comunicações pelo WhatsApp">
            <p>
              Ao iniciar uma conversa, o usuário autoriza o recebimento de respostas relacionadas à
              sua solicitação. Mensagens de acompanhamento e comunicações iniciadas pela empresa
              respeitam as regras do WhatsApp Business e as preferências do destinatário. O usuário
              pode pedir a interrupção das comunicações a qualquer momento.
            </p>
          </Section>

          <Section title="Responsabilidades">
            <p>
              O usuário deve fornecer informações corretas e usar os canais de forma lícita. A DV
              adota medidas razoáveis para manter o serviço disponível e seguro, mas indisponibilidades
              temporárias podem ocorrer por manutenção ou serviços de terceiros.
            </p>
          </Section>

          <Section title="Privacidade e propriedade intelectual">
            <p>
              O tratamento de dados pessoais segue a nossa
              {" "}<Link href="/politica-de-privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              . Marcas, textos, interfaces e demais materiais da DV não podem ser reproduzidos sem
              autorização, salvo nos limites permitidos por lei.
            </p>
          </Section>

          <Section title="Contato e foro">
            <p>
              Dúvidas podem ser enviadas para
              {" "}<a href="mailto:comercial@dvmkt.com.br">comercial@dvmkt.com.br</a>. Estes termos são
              regidos pelas leis brasileiras, com observância dos direitos legais aplicáveis ao
              usuário.
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
