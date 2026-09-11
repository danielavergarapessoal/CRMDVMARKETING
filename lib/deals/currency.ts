/** Brazilian currency input. A dot before three digits is a thousands separator. */
export function parseBrlInput(text: string): number | null {
  const s = text.trim().replace(/^R\$\s*/, "");
  if (!s) return null;
  const grouped = /^\d{1,3}(\.\d{3})+(,\d{0,2})?$/;
  const comma = /^\d+(,\d{0,2})?$/;
  const decimalDot = /^\d+\.\d{0,2}$/;
  if (grouped.test(s) || comma.test(s)) return Number(s.replaceAll(".", "").replace(",", "."));
  if (decimalDot.test(s)) return Number(s);
  return Number.NaN;
}
export function formatBrlInput(value: number | null): string {
  return value === null || !Number.isFinite(value)
    ? ""
    : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
