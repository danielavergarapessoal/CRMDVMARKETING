/**
 * Configuração da captação de leads das landing pages.
 *
 * Cada "source" (origem) é o identificador que a landing page envia. O CRM cria
 * o contato e aplica as tags configuradas aqui automaticamente.
 *
 * Pra adicionar uma página nova: acrescente uma entrada aqui com o slug e as tags.
 */

/** Workspace (org) onde os leads caem. Confirmado: "CRM DV MKT". */
export const LEAD_CAPTURE_ORG_SLUG = "crmdv";

/** Tag de origem comum a todos os leads do funil médico. */
const ORIGIN = "DV Médico";

/** Tag de origem comum a todos os leads da vertical Saúde (DV Marketing Saúde). */
const ORIGIN_SAUDE = "DV Saúde";

export type LeadSourceConfig = {
  /** Rótulo legível (vai pras anotações do contato). */
  label: string;
  /** Tags aplicadas automaticamente no contato. */
  tags: string[];
};

export const LEAD_SOURCES: Record<string, LeadSourceConfig> = {
  "autoridade-percebida": {
    label: "Autoridade Percebida",
    tags: [ORIGIN, "Autoridade Percebida"],
  },
  "maturidade-da-marca-medica": {
    label: "Maturidade da Marca Médica",
    tags: [ORIGIN, "Maturidade da Marca Médica"],
  },
  "marketing-medico-maduro": {
    label: "Marketing Médico Maduro",
    tags: [ORIGIN, "Marketing Médico Maduro"],
  },
  "marca-medica-premium": {
    label: "Marca Médica Premium",
    tags: [ORIGIN, "Marca Médica Premium"],
  },
  "diagnostico-maturidade": {
    label: "Diagnóstico de Maturidade",
    tags: [ORIGIN, "Diagnóstico de Maturidade"],
  },
  "jornada-do-paciente": {
    label: "Jornada do Paciente",
    tags: [ORIGIN, "Jornada do Paciente"],
  },
  "10-estrategias": {
    label: "10 Estratégias para Crescimento Sustentável",
    tags: [ORIGIN, "10 Estratégias"],
  },

  // ————— DV Marketing Saúde (vertical Saúde/longevidade) —————
  "saude-diagnostico-maturidade": {
    label: "Diagnóstico de Maturidade — DV Saúde",
    tags: [ORIGIN_SAUDE, "Diagnóstico de Maturidade"],
  },
  "saude-ebook-marca-invisivel": {
    label: "E-book A Marca Invisível — DV Saúde",
    tags: [ORIGIN_SAUDE, "Marca Invisível"],
  },
  "saude-ebook-seis-dimensoes": {
    label: "E-book Invisível ou Inevitável (6 Dimensões) — DV Saúde",
    tags: [ORIGIN_SAUDE, "Seis Dimensões"],
  },
  "saude-ebook-reputacao-tabela": {
    label: "E-book Reputação que Negocia Tabela — DV Saúde",
    tags: [ORIGIN_SAUDE, "Reputação e Tabela"],
  },
  "saude-ebook-da-alta-ao-vinculo": {
    label: "E-book Da Alta ao Vínculo — DV Saúde",
    tags: [ORIGIN_SAUDE, "Da Alta ao Vínculo"],
  },
  "saude-ebook-primeiro-passo": {
    label: "E-book O Primeiro Passo — DV Saúde",
    tags: [ORIGIN_SAUDE, "Primeiro Passo"],
  },
  "saude-site": {
    label: "Site DV Marketing Saúde",
    tags: [ORIGIN_SAUDE, "Site Saúde"],
  },
};

/** Cor da tag ao criar (Sage pra DV Médico, Ardósia pra DV Saúde, Terracota pras páginas). */
export function tagColorFor(tagName: string): string {
  if (tagName === ORIGIN) return "#6e8676";
  if (tagName === ORIGIN_SAUDE) return "#3d405b";
  return "#d4937a";
}
