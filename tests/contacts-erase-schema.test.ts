import { describe, expect, it } from "vitest";
import { ERASE_CONFIRMATION, eraseContactSchema } from "@/lib/contacts/schemas";

const id = "f2d67a7d-a5dd-486a-a0fe-7afe86e6d26e";

describe("eraseContactSchema (exclusão LGPD)", () => {
  it("aceita com a frase de confirmação exata", () => {
    const r = eraseContactSchema.safeParse({
      orgSlug: "crmdv",
      id,
      confirmation: ERASE_CONFIRMATION,
    });
    expect(r.success).toBe(true);
  });

  it("recusa sem a frase, com frase errada ou em minúsculas", () => {
    expect(eraseContactSchema.safeParse({ orgSlug: "crmdv", id }).success).toBe(false);
    expect(
      eraseContactSchema.safeParse({ orgSlug: "crmdv", id, confirmation: "EXCLUIR" }).success,
    ).toBe(false);
    expect(
      eraseContactSchema.safeParse({ orgSlug: "crmdv", id, confirmation: "excluir dados" }).success,
    ).toBe(false);
  });

  it("recusa id que não é UUID", () => {
    const r = eraseContactSchema.safeParse({
      orgSlug: "crmdv",
      id: "123",
      confirmation: ERASE_CONFIRMATION,
    });
    expect(r.success).toBe(false);
  });
});
