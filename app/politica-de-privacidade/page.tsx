import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade do CRM da DV Marketing Médico.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Política de Privacidade" updated="11 de setembro de 2026">
      <p>
        Esta política explica como a DANIELA C. VERGARA D ELIA LIMA CONSULTORIA,
        responsável pela marca DV Marketing Médico, trata dados pessoais no CRM DV Marketing e nos
        canais de atendimento vinculados ao sistema.
      </p>

      <Section title="Dados tratados">
        <p>
          Podemos tratar nome, cargo, empresa, telefone, e-mail, mensagens, origem do contato,
          histórico de atendimento, propostas, tarefas e demais informações fornecidas pelo titular
          ou necessárias à relação comercial.
        </p>
      </Section>

      <Section title="Finalidades e bases legais">
        <p>
          Os dados são usados para responder solicitações, qualificar contatos, elaborar e acompanhar
          propostas, prestar serviços, cumprir obrigações legais, proteger o sistema e manter o
          relacionamento comercial. O tratamento observa as bases legais aplicáveis da Lei nº
          13.709/2018 (LGPD), incluindo execução de contrato ou procedimentos preliminares, legítimo
          interesse, cumprimento de obrigação legal e consentimento quando exigido.
        </p>
      </Section>

      <Section title="WhatsApp e outros fornecedores">
        <p>
          Mensagens enviadas ao número comercial da DV podem ser processadas pela plataforma
          WhatsApp Business da Meta e exibidas no CRM. Também podemos usar provedores de hospedagem,
          banco de dados e e-mail estritamente para operar o serviço. Esses fornecedores tratam os
          dados conforme seus contratos e políticas aplicáveis.
        </p>
      </Section>

      <Section title="Conservação e segurança">
        <p>
          Conservamos os dados pelo tempo necessário às finalidades informadas e às obrigações legais.
          Adotamos controles de acesso, autenticação e medidas técnicas para reduzir riscos de acesso,
          alteração, perda ou divulgação indevida.
        </p>
      </Section>

      <Section title="Direitos do titular">
        <p>
          O titular pode solicitar confirmação de tratamento, acesso, correção, portabilidade,
          informação sobre compartilhamento, anonimização, bloqueio ou exclusão quando cabível, além
          de revogar consentimento. Para exercer seus direitos, escreva para
          {" "}<a href="mailto:comercial@dvmkt.com.br">comercial@dvmkt.com.br</a>.
        </p>
      </Section>

      <Section title="Controladora e contato">
        <p>
          DANIELA C. VERGARA D ELIA LIMA CONSULTORIA — Rua Professor Helion Póvoa, 311,
          apto. 103, bloco 2, Tijuca, Rio de Janeiro/RJ, CEP 20510-190. Contato:
          {" "}<a href="mailto:comercial@dvmkt.com.br">comercial@dvmkt.com.br</a>.
        </p>
      </Section>
    </LegalPage>
  );
}

function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:py-16">
      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-12">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          DV Marketing Médico · CRM
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Atualizada em {updated}</p>
        <div className="mt-9 space-y-8 text-[15px] leading-7 text-card-foreground">{children}</div>
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
