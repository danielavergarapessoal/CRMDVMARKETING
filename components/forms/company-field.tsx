"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCompanyAction } from "@/lib/companies/actions";
import { CompanyCombobox, type CompanyOption } from "./company-combobox";

type Props = {
  orgSlug: string;
  options: CompanyOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  allowClear?: boolean;
};
export function CompanyField({ orgSlug, options, value, onChange, ...rest }: Props) {
  const [added, setAdded] = useState<CompanyOption[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const all = [...options, ...added.filter((a) => !options.some((o) => o.id === a.id))];
  function create() {
    const clean = name.trim();
    if (!clean) return;
    const existing = all.find(
      (o) => o.name.trim().toLocaleLowerCase("pt-BR") === clean.toLocaleLowerCase("pt-BR"),
    );
    if (existing) {
      onChange(existing.id);
      setOpen(false);
      toast.success("Empresa existente selecionada. Salve o cadastro para vincular.");
      return;
    }
    start(async () => {
      try {
        const r = await createCompanyAction({ orgSlug, name: clean });
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        if (r.data) {
          setAdded((a) => [...a, { id: r.data!.id, name: clean }]);
          onChange(r.data.id);
          setOpen(false);
          setName("");
          toast.success("Empresa cadastrada. Salve o cadastro para vincular.");
        }
      } catch {
        toast.error(
          "Não foi possível confirmar o cadastro. Confira a lista antes de tentar novamente.",
        );
      }
    });
  }
  return (
    <>
      <CompanyCombobox
        {...rest}
        options={all}
        value={value}
        onChange={onChange}
        onCreateNew={() => setOpen(true)}
      />
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Cadastrar empresa aqui
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!pending) setOpen(v);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar empresa</DialogTitle>
            <DialogDescription>
              A empresa ficará selecionada neste cadastro. As outras informações preenchidas serão
              preservadas.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="inline-company-name">Nome da empresa</label>
          <Input
            id="inline-company-name"
            value={name}
            maxLength={200}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                create();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" disabled={pending || !name.trim()} onClick={create}>
              {pending ? "Cadastrando..." : "Cadastrar e selecionar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
