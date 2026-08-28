import { describe, expect, test } from "vitest";
import {
  createContactSchema,
  deleteContactSchema,
  updateContactSchema,
} from "@/lib/contacts/schemas";

const UUID = "11111111-1111-1111-1111-111111111111";

describe("createContactSchema", () => {
  test("accepts minimal valid input", () => {
    const r = createContactSchema.safeParse({ orgSlug: "x", name: "João" });
    expect(r.success).toBe(true);
  });

  test("rejects empty name", () => {
    const r = createContactSchema.safeParse({ orgSlug: "x", name: "" });
    expect(r.success).toBe(false);
  });

  test("rejects invalid email", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      email: "not-an-email",
    });
    expect(r.success).toBe(false);
  });

  test("accepts empty email", () => {
    const r = createContactSchema.safeParse({ orgSlug: "x", name: "João", email: "" });
    expect(r.success).toBe(true);
  });

  test("accepts companyId and title", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      title: "CFO",
      companyId: UUID,
    });
    expect(r.success).toBe(true);
  });

  test("rejects invalid companyId", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      companyId: "no",
    });
    expect(r.success).toBe(false);
  });
});

describe("createContactSchema — campos de prospecção", () => {
  test("accepts full prospect input", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "Dra. Ana",
      linkedinUrl: "https://www.linkedin.com/in/dra-ana",
      instagramHandle: "@dra.ana",
      city: "São Paulo",
      state: "SP",
      specialty: "Cardiologia",
      icpScore: 85,
      prospectStatus: "a_abordar",
      listSource: "LinkedIn Cardiologistas SP",
    });
    expect(r.success).toBe(true);
  });

  test("accepts empty prospect fields (inbound lead unchanged)", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      linkedinUrl: "",
      instagramHandle: "",
      state: "",
      icpScore: null,
      prospectStatus: null,
    });
    expect(r.success).toBe(true);
  });

  test("rejects linkedin url outside linkedin.com", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      linkedinUrl: "https://facebook.com/joao",
    });
    expect(r.success).toBe(false);
  });

  test("rejects invalid instagram handle", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      instagramHandle: "user name!",
    });
    expect(r.success).toBe(false);
  });

  test("rejects icpScore above 100", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      icpScore: 101,
    });
    expect(r.success).toBe(false);
  });

  test("rejects icpScore below 0", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      icpScore: -1,
    });
    expect(r.success).toBe(false);
  });

  test("rejects state with 3 letters", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      state: "SPP",
    });
    expect(r.success).toBe(false);
  });

  test("rejects unknown prospect status", () => {
    const r = createContactSchema.safeParse({
      orgSlug: "x",
      name: "João",
      prospectStatus: "aguardando",
    });
    expect(r.success).toBe(false);
  });
});

describe("updateContactSchema", () => {
  test("requires id", () => {
    const r = updateContactSchema.safeParse({ orgSlug: "x", name: "Y" });
    expect(r.success).toBe(false);
  });

  test("accepts partial update with companyId null (clear company)", () => {
    const r = updateContactSchema.safeParse({
      orgSlug: "x",
      id: UUID,
      companyId: null,
    });
    expect(r.success).toBe(true);
  });
});

describe("deleteContactSchema", () => {
  test("rejects non-uuid", () => {
    expect(deleteContactSchema.safeParse({ orgSlug: "x", id: "no" }).success).toBe(false);
  });
});
