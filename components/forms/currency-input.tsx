"use client";
import { useState } from "react";
import { formatBrlInput, parseBrlInput } from "@/lib/deals/currency";

type Props = {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
};
export function CurrencyInput({ id, value, onChange, onBlur }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && Number.isNaN(parseBrlInput(draft));
  return (
    <>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={draft ?? formatBrlInput(value)}
        placeholder="16.500,00"
        aria-invalid={invalid}
        aria-describedby={id + "-help"}
        onChange={(e) => {
          const text = e.target.value;
          setDraft(text);
          onChange(parseBrlInput(text));
        }}
        onBlur={() => {
          if (!invalid) setDraft(null);
          onBlur?.();
        }}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
      />
      <p
        id={id + "-help"}
        className={invalid ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
      >
        {invalid
          ? "Informe um valor como 16.500,00."
          : "Use o formato brasileiro. Ex.: 16.500,00 = dezesseis mil e quinhentos reais."}
      </p>
    </>
  );
}
