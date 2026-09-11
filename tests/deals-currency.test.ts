import { describe, expect, test } from "vitest";
import { parseBrlInput, formatBrlInput } from "@/lib/deals/currency";
describe("currency used by proposal and deal forms", () => {
  test.each([
    ["16.500", 16500],
    ["16.500,00", 16500],
    ["16500", 16500],
    ["16500,50", 16500.5],
    ["16,50", 16.5],
    ["16.50", 16.5],
    ["1.234.567,89", 1234567.89],
    ["0", 0],
    ["", null],
    ["R$ 16.500,00", 16500],
  ])("parses %s as %s", (input, expected) => expect(parseBrlInput(input as string)).toBe(expected));
  test.each(["abc", "1.2.3", "16,500", "-10", "1e3"])("rejects ambiguous/invalid %s", (input) =>
    expect(parseBrlInput(input)).toBeNaN());
  test("renders existing saved values without reinterpreting decimals", () => {
    expect(formatBrlInput(16.5)).toBe("16,50");
    expect(formatBrlInput(16500)).toBe("16.500,00");
  });
});
