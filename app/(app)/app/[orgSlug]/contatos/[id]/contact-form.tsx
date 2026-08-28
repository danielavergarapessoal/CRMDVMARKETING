"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CompanyCombobox, type CompanyOption } from "@/components/forms/company-combobox";
import { TextField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { deleteContactAction, updateContactAction } from "@/lib/contacts/actions";
import {
  PROSPECT_STATUS_LABELS,
  PROSPECT_STATUS_ORDER,
  type ProspectStatus,
} from "@/lib/contacts/prospect";

const formSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120),
  email: z.string().max(200).optional(),
  phone: z.string().max(40).optional(),
  title: z.string().max(120).optional(),
  companyId: z.string().nullable(),
  linkedinUrl: z.string().max(300).optional(),
  instagramHandle: z.string().max(60).optional(),
  city: z.string().max(120).optional(),
  state: z.string().max(2).optional(),
  specialty: z.string().max(120).optional(),
  icpScore: z.number().int().min(0).max(100).nullable(),
  prospectStatus: z.enum(PROSPECT_STATUS_ORDER).nullable(),
  listSource: z.string().max(200).optional(),
});
type FormValues = z.infer<typeof formSchema>;

type Props = {
  orgSlug: string;
  canDelete: boolean;
  companies: CompanyOption[];
  contact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    title: string | null;
    companyId: string | null;
    linkedinUrl: string | null;
    instagramHandle: string | null;
    city: string | null;
    state: string | null;
    specialty: string | null;
    icpScore: number | null;
    prospectStatus: ProspectStatus | null;
    listSource: string | null;
  };
};

export function ContactForm({ orgSlug, canDelete, companies, contact }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contact.name,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      title: contact.title ?? "",
      companyId: contact.companyId,
      linkedinUrl: contact.linkedinUrl ?? "",
      instagramHandle: contact.instagramHandle ?? "",
      city: contact.city ?? "",
      state: contact.state ?? "",
      specialty: contact.specialty ?? "",
      icpScore: contact.icpScore,
      prospectStatus: contact.prospectStatus,
      listSource: contact.listSource ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const r = await updateContactAction({
        orgSlug,
        id: contact.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        title: values.title,
        companyId: values.companyId,
        linkedinUrl: values.linkedinUrl,
        instagramHandle: values.instagramHandle,
        city: values.city,
        state: values.state,
        specialty: values.specialty,
        icpScore: values.icpScore,
        prospectStatus: values.prospectStatus,
        listSource: values.listSource,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Contato atualizado");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Apagar esse contato? Essa ação não pode ser desfeita.")) return;
    startDelete(async () => {
      const r = await deleteContactAction({ orgSlug, id: contact.id });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Contato apagado");
      router.push(`/app/${orgSlug}/contatos`);
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TextField name="name" control={form.control} label="Nome" />
        <TextField name="title" control={form.control} label="Cargo" description="Opcional" />
        <div className="space-y-1.5">
          <label className="font-medium text-sm">Empresa</label>
          <Controller
            name="companyId"
            control={form.control}
            render={({ field }) => (
              <CompanyCombobox
                options={companies}
                value={field.value}
                onChange={field.onChange}
                placeholder="Sem empresa (contato solto)"
              />
            )}
          />
        </div>
        <TextField name="phone" control={form.control} label="Telefone" description="Opcional" />
        <TextField
          name="email"
          control={form.control}
          label="E-mail"
          description="Opcional"
          inputProps={{ type: "email" }}
        />

        <div className="space-y-4 border-t border-border/60 pt-4">
          <span className="label-mono">/ prospecção</span>

          <Controller
            name="prospectStatus"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <span className="font-medium text-sm">Status de prospecção</span>
                <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-input p-1 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => field.onChange(null)}
                    className={`rounded-sm px-2 py-1 text-xs transition-colors ${
                      field.value === null
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Não é prospect
                  </button>
                  {PROSPECT_STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => field.onChange(s)}
                      className={`rounded-sm px-2 py-1 text-xs transition-colors ${
                        s === field.value
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {PROSPECT_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  Quem tem status entra no funil de prospecção. Leads das landing pages ficam em
                  "Não é prospect".
                </p>
              </div>
            )}
          />

          <TextField
            name="linkedinUrl"
            control={form.control}
            label="LinkedIn"
            description="Link completo do perfil (ex.: https://www.linkedin.com/in/nome)"
            inputProps={{ type: "url", placeholder: "https://www.linkedin.com/in/..." }}
          />
          <TextField
            name="instagramHandle"
            control={form.control}
            label="Instagram"
            description="Usuário do perfil (com ou sem @)"
            inputProps={{ placeholder: "@usuario" }}
          />

          <div className="grid grid-cols-[1fr_90px] gap-3">
            <TextField name="city" control={form.control} label="Cidade" />
            <TextField
              name="state"
              control={form.control}
              label="UF"
              inputProps={{ maxLength: 2, placeholder: "SP" }}
            />
          </div>

          <TextField
            name="specialty"
            control={form.control}
            label="Especialidade"
            description="Ex.: Cardiologia, Dermatologia, Clínica de estética"
          />

          <Controller
            name="icpScore"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <label htmlFor="contact-icp-score" className="font-medium text-sm">
                  Score ICP (0–100)
                </label>
                <input
                  id="contact-icp-score"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                />
                <p className="text-muted-foreground text-xs">
                  Quanto esse contato parece com o cliente ideal. Vazio = ainda não avaliado.
                </p>
                {fieldState.error && (
                  <p className="text-destructive text-xs">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <TextField
            name="listSource"
            control={form.control}
            label="Origem da lista"
            description="De qual lista/busca esse prospect veio (ex.: LinkedIn Cardiologistas SP)"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {canDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              <Trash2Icon className="h-3.5 w-3.5" />
              {deleting ? "Apagando..." : "Apagar"}
            </Button>
          ) : (
            <div />
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
