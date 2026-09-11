import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ guard: vi.fn(), client: vi.fn(), cache: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({ requireOrgRole: mocks.guard }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.cache }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));
import { deleteContactsBulkAction } from "../lib/contacts/bulk-actions";
const id = "11111111-1111-4111-8111-111111111111";
function setup(visible: { id: string }[], error: object | null = null) {
  const read = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data: visible, error: null }),
  };
  const write = {
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue({ data: [{ id }], error }),
  };
  const from = vi.fn().mockReturnValueOnce(read).mockReturnValueOnce(write);
  mocks.client.mockResolvedValue({ from });
  return { read, write, from };
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.guard.mockResolvedValue({ org: { id: "org-a" } });
});
describe("exclusão em lote", () => {
  it("rejeita lista vazia antes de acessar o banco", async () => {
    expect(
      (await deleteContactsBulkAction({ orgSlug: "dv", ids: [], confirmation: "EXCLUIR" })).ok,
    ).toBe(false);
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("rejeita contatos indisponíveis sem excluir", async () => {
    const q = setup([]);
    expect(
      (await deleteContactsBulkAction({ orgSlug: "dv", ids: [id], confirmation: "EXCLUIR" })).ok,
    ).toBe(false);
    expect(q.write.delete).not.toHaveBeenCalled();
  });
  it("exige administrador e restringe leitura e exclusão à organização", async () => {
    const q = setup([{ id }]);
    const r = await deleteContactsBulkAction({
      orgSlug: "dv",
      ids: [id, id],
      confirmation: "EXCLUIR",
    });
    expect(r).toEqual({ ok: true, deleted: 1 });
    expect(mocks.guard).toHaveBeenCalledWith({ orgSlug: "dv", roles: ["owner", "admin"] });
    expect(q.read.eq).toHaveBeenCalledWith("organization_id", "org-a");
    expect(q.write.eq).toHaveBeenCalledWith("organization_id", "org-a");
    expect(q.write.in).toHaveBeenCalledWith("id", [id]);
  });
  it("não informa sucesso quando banco rejeita exclusão", async () => {
    setup([{ id }], { message: "private" });
    const r = await deleteContactsBulkAction({ orgSlug: "dv", ids: [id], confirmation: "EXCLUIR" });
    expect(r.ok).toBe(false);
    expect(JSON.stringify(r)).not.toContain("private");
  });
});
