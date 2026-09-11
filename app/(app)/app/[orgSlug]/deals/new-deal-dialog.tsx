"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { CompanyOption } from "@/components/forms/company-combobox";
import { CompanyField } from "@/components/forms/company-field";
import { CurrencyInput } from "@/components/forms/currency-input";
import { TextField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createDealAction } from "@/lib/deals/actions";
import { type CreateDealInput, createDealSchema } from "@/lib/deals/schemas";
import { STAGE_LABELS } from "@/lib/deals/stages";

type Props = {
  orgSlug: string;
  companies: CompanyOption[];
  defaultCompanyId?: string;
  contactId?: string;
  contactName?: string;
};

export function NewDealDialog({
  orgSlug,
  companies,
  defaultCompanyId,
  contactId,
  contactName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<CreateDealInput>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      orgSlug,
      companyId: defaultCompanyId ?? "",
      name: contactName ? `Proposta — ${contactName}` : "",
      contactId,
      stage: contactId ? "proposal_sent" : "new",
      value: null,
      expectedCloseDate: null,
    },
  });

  function onSubmit(values: CreateDealInput) {
    startTransition(async () => {
      let r: Awaited<ReturnType<typeof createDealAction>>;
      try {
        r = await createDealAction({ ...values, contactId });
      } catch {
        toast.error(
          "Não foi possível confirmar a criação. Confira as negociações antes de tentar novamente.",
        );
        return;
      }
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Negociação criada");
      form.reset({
        orgSlug,
        companyId: defaultCompanyId ?? "",
        name: contactName ? `Proposta — ${contactName}` : "",
        contactId,
        stage: contactId ? "proposal_sent" : "new",
        value: null,
        expectedCloseDate: null,
      });
      setOpen(false);
      if (r.data?.id) {
        router.push(`/app/${orgSlug}/deals/${r.data.id}`);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (pending) return;
        if (v && defaultCompanyId) form.setValue("companyId", defaultCompanyId);
        setOpen(v);
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <PlusIcon className="h-3.5 w-3.5" />
            {contactId ? "Adicionar proposta" : "Nova negociação"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contactId ? "Adicionar proposta" : "Nova negociação"}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              name="name"
              control={form.control}
              label="Nome da negociação"
              inputProps={{ placeholder: "Ex: Reestruturação financeira 2026" }}
            />
            <div className="space-y-1.5">
              <span className="font-medium text-sm">Empresa *</span>
              <Controller
                name="companyId"
                control={form.control}
                render={({ field }) => (
                  <CompanyField
                    orgSlug={orgSlug}
                    options={companies}
                    value={field.value || null}
                    onChange={(v) => field.onChange(v ?? "")}
                    placeholder="Selecionar empresa..."
                    allowClear={false}
                  />
                )}
              />
            </div>
            <label htmlFor="new-deal-stage" className="block text-sm">
              Etapa
            </label>
            <select
              id="new-deal-stage"
              className="h-9 w-full rounded-md border bg-background px-2"
              {...form.register("stage")}
            >
              {Object.entries(STAGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Controller
              name="value"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <label htmlFor="deal-value" className="font-medium text-sm">
                    Valor (R$)
                  </label>
                  <CurrencyInput
                    id="deal-value"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  <p className="text-muted-foreground text-xs">Opcional</p>
                </div>
              )}
            />
            <TextField
              name="expectedCloseDate"
              control={form.control}
              label="Data esperada de fechamento"
              description="Opcional"
              inputProps={{ type: "date" }}
            />
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Criando..." : "Criar negociação"}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
