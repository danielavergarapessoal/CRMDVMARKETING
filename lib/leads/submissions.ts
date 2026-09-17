import { z } from "zod";

/**
 * Formato das respostas de diagnóstico/pesquisa que a landing page manda junto
 * com o lead. Tudo opcional: uma pesquisa simples pode mandar só `answers`, um
 * e-book pode mandar só `notionUrl`.
 */

const NOTION_HOSTS = ["https://app.notion.com/", "https://www.notion.so/"];

export function isNotionUrl(url: string): boolean {
  return NOTION_HOSTS.some((host) => url.startsWith(host));
}

const dimensionSchema = z.object({
  label: z.string().trim().min(1).max(60),
  score: z.number().min(0).max(1000),
  max: z.number().min(1).max(1000),
});

const answerSchema = z.object({
  section: z.string().trim().max(60).optional(),
  question: z.string().trim().min(1).max(400),
  answer: z.string().trim().max(1000),
  value: z.union([z.string().max(40), z.number()]).optional(),
});

export const submissionSchema = z.object({
  externalId: z.string().trim().max(80).optional(),
  submittedAt: z.string().datetime({ offset: true }).optional(),
  stage: z.string().trim().max(80).optional(),
  scoreTotal: z.number().int().min(0).max(10000).optional(),
  scoreMax: z.number().int().min(1).max(10000).optional(),
  recommendedPlan: z.string().trim().max(120).optional(),
  priority: z.string().trim().max(40).optional(),
  summary: z.string().trim().max(4000).optional(),
  dimensions: z.array(dimensionSchema).max(20).optional(),
  answers: z.array(answerSchema).max(200).optional(),
  extra: z.record(z.string().max(60), z.string().max(400)).optional(),
  notionUrl: z.string().trim().max(500).refine(isNotionUrl, "Link do Notion inválido").optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type SubmissionDimension = z.infer<typeof dimensionSchema>;
export type SubmissionAnswer = z.infer<typeof answerSchema>;

/** Lê os JSON guardados no banco sem confiar no formato (linha antiga/corrompida vira lista vazia). */
export function parseDimensions(raw: unknown): SubmissionDimension[] {
  const parsed = z.array(dimensionSchema).safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function parseAnswers(raw: unknown): SubmissionAnswer[] {
  const parsed = z.array(answerSchema).safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function parseExtra(raw: unknown): Record<string, string> {
  const parsed = z.record(z.string(), z.string()).safeParse(raw);
  return parsed.success ? parsed.data : {};
}
