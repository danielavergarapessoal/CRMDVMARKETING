import { describe, expect, it } from "vitest";
import {
  isNotionUrl,
  parseAnswers,
  parseDimensions,
  parseExtra,
  submissionSchema,
} from "@/lib/leads/submissions";

describe("submissionSchema", () => {
  it("aceita um diagnóstico completo", () => {
    const parsed = submissionSchema.safeParse({
      externalId: "LEAD-35",
      submittedAt: "2026-09-16T21:58:47.310Z",
      stage: "Desenvolvimento",
      scoreTotal: 28,
      scoreMax: 60,
      recommendedPlan: "Autoridade",
      priority: "Frio",
      summary: "Está no estágio Desenvolvimento.",
      dimensions: [{ label: "Clareza", score: 7, max: 12 }],
      answers: [
        { section: "Clareza", question: "Seu posicionamento está claro?", answer: "3", value: 3 },
      ],
      extra: { Atendimento: "Misto" },
      notionUrl: "https://app.notion.com/p/3ddd6c50ddcb81f8b1fdd2eea246af73",
    });
    expect(parsed.success).toBe(true);
  });

  it("aceita envio vazio (pesquisa que só manda o link depois)", () => {
    expect(submissionSchema.safeParse({}).success).toBe(true);
  });

  it("recusa link que não é do Notion", () => {
    const parsed = submissionSchema.safeParse({ notionUrl: "https://evil.com/notion" });
    expect(parsed.success).toBe(false);
  });

  it("recusa link javascript:", () => {
    const parsed = submissionSchema.safeParse({ notionUrl: "javascript:alert(1)" });
    expect(parsed.success).toBe(false);
  });

  it("recusa dimensão com máximo zero (evita divisão por zero na barra)", () => {
    const parsed = submissionSchema.safeParse({ dimensions: [{ label: "X", score: 0, max: 0 }] });
    expect(parsed.success).toBe(false);
  });

  it("recusa mais de 200 respostas", () => {
    const answers = Array.from({ length: 201 }, (_, i) => ({ question: `P${i}`, answer: "a" }));
    expect(submissionSchema.safeParse({ answers }).success).toBe(false);
  });
});

describe("isNotionUrl", () => {
  it("reconhece os dois domínios do Notion", () => {
    expect(isNotionUrl("https://app.notion.com/p/abc")).toBe(true);
    expect(isNotionUrl("https://www.notion.so/abc")).toBe(true);
  });

  it("não cai em domínio parecido", () => {
    expect(isNotionUrl("https://app.notion.com.evil.com/p/abc")).toBe(false);
    expect(isNotionUrl("http://app.notion.com/p/abc")).toBe(false);
  });
});

describe("leitura do que está no banco", () => {
  it("devolve lista vazia quando o JSON está fora do formato", () => {
    expect(parseDimensions("lixo")).toEqual([]);
    expect(parseAnswers([{ semPergunta: true }])).toEqual([]);
    expect(parseExtra(null)).toEqual({});
  });

  it("devolve os dados quando o formato está certo", () => {
    expect(parseDimensions([{ label: "Escala", score: 5, max: 12 }])).toHaveLength(1);
    expect(parseExtra({ Atendimento: "Misto" })).toEqual({ Atendimento: "Misto" });
  });
});
