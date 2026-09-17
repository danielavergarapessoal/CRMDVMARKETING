import { createClient } from "@/lib/supabase/server";
import {
  parseAnswers,
  parseDimensions,
  parseExtra,
  type SubmissionAnswer,
  type SubmissionDimension,
} from "./submissions";

export type ContactSubmission = {
  id: string;
  sourceLabel: string;
  externalId: string | null;
  submittedAt: string;
  stage: string | null;
  scoreTotal: number | null;
  scoreMax: number | null;
  recommendedPlan: string | null;
  priority: string | null;
  summary: string | null;
  dimensions: SubmissionDimension[];
  answers: SubmissionAnswer[];
  extra: Record<string, string>;
  notionUrl: string | null;
};

/** Diagnósticos/pesquisas que o contato respondeu, do mais recente pro mais antigo. */
export async function getContactSubmissions(
  orgId: string,
  contactId: string,
): Promise<ContactSubmission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_submissions")
    .select("*")
    .eq("organization_id", orgId)
    .eq("contact_id", contactId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    sourceLabel: row.source_label,
    externalId: row.external_id,
    submittedAt: row.submitted_at,
    stage: row.stage,
    scoreTotal: row.score_total,
    scoreMax: row.score_max,
    recommendedPlan: row.recommended_plan,
    priority: row.priority,
    summary: row.summary,
    dimensions: parseDimensions(row.dimensions),
    answers: parseAnswers(row.answers),
    extra: parseExtra(row.extra),
    notionUrl: row.notion_url,
  }));
}
