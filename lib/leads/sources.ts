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
};

/** Cor da tag ao criar (Sage pra origem, Terracota pras páginas). */
export function tagColorFor(tagName: string): string {
  return tagName === ORIGIN ? "#6e8676" : "#d4937a";
}
