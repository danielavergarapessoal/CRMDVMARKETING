import { describe, expect, it } from "vitest";
import {
  contactSource,
  DIAGNOSIS_TAG,
  EMPTY_FILTERS,
  filterContacts,
} from "../lib/contacts/filters";
import type { ContactWithCompany } from "../lib/contacts/queries";
const contact = (patch: Partial<ContactWithCompany>) =>
  ({
    id: "x",
    name: "João",
    tags: [],
    notes: null,
    created_by: null,
    list_source: null,
    companyName: null,
    email: null,
    phone: null,
    ...patch,
  }) as ContactWithCompany;
describe("segmentação de contatos", () => {
  const diagnosis = contact({ id: "d", tags: [{ name: DIAGNOSIS_TAG, color: "#000" }] });
  const ebook = contact({ id: "e", tags: [{ name: "Jornada do Paciente", color: "#000" }] });
  const manual = contact({ id: "m", created_by: "user" });
  const unknown = contact({ id: "u" });
  const data = [diagnosis, ebook, manual, unknown];
  it("inclui diagnóstico e exclui os demais", () =>
    expect(filterContacts(data, { ...EMPTY_FILTERS, tag: DIAGNOSIS_TAG }).map((c) => c.id)).toEqual(
      ["d"],
    ));
  it("não confunde sem diagnóstico com manual", () => {
    expect(
      filterContacts(data, { ...EMPTY_FILTERS, tag: DIAGNOSIS_TAG, tagMode: "exclude" }).map(
        (c) => c.id,
      ),
    ).toEqual(["e", "m", "u"]);
    expect(filterContacts(data, { ...EMPTY_FILTERS, source: "dv" }).map((c) => c.id)).toEqual([
      "m",
    ]);
  });
  it("mantém origem desconhecida sem inferir DV", () =>
    expect(contactSource(unknown)).toBe("unknown"));
  it("busca sem acentos e combina filtros", () =>
    expect(
      filterContacts(data, { ...EMPTY_FILTERS, search: "joao", source: "captured" }).length,
    ).toBe(2));
  it("reconhece captura pelas notas mesmo sem tag", () =>
    expect(contactSource(contact({ notes: "Lead capturado via landing page: Diagnóstico" }))).toBe(
      "captured",
    ));
});
