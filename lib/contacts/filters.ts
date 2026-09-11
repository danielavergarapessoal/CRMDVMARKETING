import { LEAD_SOURCES } from "@/lib/leads/sources";
import type { ContactWithCompany } from "./queries";
export const DIAGNOSIS_TAG = "Diagnóstico de Maturidade";
export const SOURCE_LABELS = {
  all: "Todas as origens",
  dv: "Inseridos pela DV",
  captured: "Captados por formulário",
  unknown: "Origem não identificada",
};
export type ContactFilters = {
  search: string;
  tag: string;
  tagMode: "include" | "exclude";
  source: keyof typeof SOURCE_LABELS;
};
export const EMPTY_FILTERS: ContactFilters = {
  search: "",
  tag: "",
  tagMode: "include",
  source: "all",
};
const captureTags = new Set(
  Object.values(LEAD_SOURCES)
    .flatMap((s) => s.tags)
    .filter((t) => t !== "DV Médico" && t !== "DV Saúde"),
);
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function contactSource(c: ContactWithCompany): Exclude<ContactFilters["source"], "all"> {
  if (
    c.tags.some((t) => captureTags.has(t.name)) ||
    c.notes?.startsWith("Lead capturado via landing page:")
  )
    return "captured";
  if (
    c.created_by ||
    c.list_source ||
    c.tags.some((t) => t.name === "Outbound" || t.name.startsWith("Outbound "))
  )
    return "dv";
  return "unknown";
}
export function filterContacts(contacts: ContactWithCompany[], f: ContactFilters) {
  const search = normalize(f.search.trim());
  return contacts.filter((c) => {
    if (f.source !== "all" && contactSource(c) !== f.source) return false;
    if (f.tag && c.tags.some((t) => t.name === f.tag) !== (f.tagMode === "include")) return false;
    return (
      !search ||
      normalize([c.name, c.email, c.phone, c.companyName].filter(Boolean).join(" ")).includes(
        search,
      )
    );
  });
}
