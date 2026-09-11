"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteContactsBulkAction } from "@/lib/contacts/bulk-actions";
import {
  type ContactFilters,
  contactSource,
  DIAGNOSIS_TAG,
  EMPTY_FILTERS,
  filterContacts,
  SOURCE_LABELS,
} from "@/lib/contacts/filters";
import type { ContactWithCompany } from "@/lib/contacts/queries";
import { getContactColumns } from "./contact-columns";

type Props = {
  orgSlug: string;
  contacts: ContactWithCompany[];
  initialDiagnosis?: boolean;
  canDelete?: boolean;
};
export function ContactsTable({
  orgSlug,
  contacts,
  canDelete = false,
  initialDiagnosis = false,
}: Props) {
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    tag: initialDiagnosis ? DIAGNOSIS_TAG : "",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [review, setReview] = useState<ContactWithCompany[] | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const filtered = filterContacts(contacts, filters);
  const active = filtered.filter((c) => selected.has(c.id));
  const tags = [
    ...new Set([DIAGNOSIS_TAG, ...contacts.flatMap((c) => c.tags.map((t) => t.name))]),
  ].sort();
  function change(patch: Partial<ContactFilters>) {
    setFilters({ ...filters, ...patch });
    setSelected(new Set());
  }
  function toggle(ids: string[], checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }
  const columns: ColumnDef<ContactWithCompany>[] = [
    ...(canDelete
      ? [
          {
            id: "selection",
            header: ({ table }) => {
              const ids = table.getRowModel().rows.map((r) => r.original.id);
              return (
                <input
                  type="checkbox"
                  aria-label="Selecionar esta página"
                  checked={ids.length > 0 && ids.every((id) => selected.has(id))}
                  onChange={(e) => toggle(ids, e.target.checked)}
                />
              );
            },
            cell: ({ row }) => (
              <input
                type="checkbox"
                aria-label={`Selecionar ${row.original.name}`}
                checked={selected.has(row.original.id)}
                onChange={(e) => toggle([row.original.id], e.target.checked)}
              />
            ),
          } satisfies ColumnDef<ContactWithCompany>,
        ]
      : []),
    ...getContactColumns(orgSlug),
    {
      id: "source",
      header: "Origem",
      cell: ({ row }) => SOURCE_LABELS[contactSource(row.original)],
    },
  ];
  function remove() {
    if (!review || confirmation !== "EXCLUIR") return;
    const ids = review.map((c) => c.id);
    startTransition(async () => {
      try {
        const result = await deleteContactsBulkAction({ orgSlug, ids, confirmation: "EXCLUIR" });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(`${result.deleted} contato(s) excluído(s).`);
        setReview(null);
        setSelected(new Set());
        router.refresh();
      } catch {
        toast.error(
          "Não foi possível confirmar a exclusão. Atualize a página antes de tentar novamente.",
        );
      }
    });
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => change({ ...EMPTY_FILTERS, tag: DIAGNOSIS_TAG })}>
          Diagnóstico de Maturidade
        </Button>
        <Button variant="outline" onClick={() => change({ ...EMPTY_FILTERS, source: "dv" })}>
          Inseridos pela DV
        </Button>
        <Button variant="outline" onClick={() => change(EMPTY_FILTERS)}>
          Limpar filtros
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label htmlFor="contact-search" className="space-y-1 text-sm">
          Buscar
          <Input
            id="contact-search"
            value={filters.search}
            placeholder="Nome, e-mail, telefone ou empresa"
            onChange={(e) => change({ search: e.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          Origem
          <select
            className="h-9 w-full rounded-md border bg-background px-2"
            value={filters.source}
            onChange={(e) => change({ source: e.target.value as ContactFilters["source"] })}
          >
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Etiqueta
          <select
            className="h-9 w-full rounded-md border bg-background px-2"
            value={filters.tag}
            onChange={(e) => change({ tag: e.target.value })}
          >
            <option value="">Todas as etiquetas</option>
            {tags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Condição
          <select
            className="h-9 w-full rounded-md border bg-background px-2"
            disabled={!filters.tag}
            value={filters.tagMode}
            onChange={(e) => change({ tagMode: e.target.value as ContactFilters["tagMode"] })}
          >
            <option value="include">Possui a etiqueta</option>
            <option value="exclude">Não possui a etiqueta</option>
          </select>
        </label>
      </div>
      <p className="text-sm text-muted-foreground">
        {filtered.length} de {contacts.length} contatos encontrados. Origem não identificada indica
        ausência de registro suficiente; não significa cadastro pela DV.
      </p>
      {canDelete && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm" aria-live="polite">
            {active.length} selecionado(s)
          </span>
          <Button
            variant="outline"
            disabled={!filtered.length}
            onClick={() => setSelected(new Set(filtered.map((c) => c.id)))}
          >
            Selecionar todos os {filtered.length} resultados
          </Button>
          <Button
            variant="outline"
            disabled={!active.length}
            onClick={() => setSelected(new Set())}
          >
            Limpar seleção
          </Button>
          <Button
            variant="destructive"
            disabled={!active.length || active.length > 500}
            onClick={() => {
              setReview([...active]);
              setConfirmation("");
            }}
          >
            Excluir selecionados
          </Button>
          {active.length > 500 && (
            <p className="text-sm">Selecione até 500 contatos por exclusão.</p>
          )}
        </div>
      )}
      <DataTable
        key={JSON.stringify(filters)}
        columns={columns}
        data={filtered}
        empty={<p className="p-8 text-center">Nenhum contato corresponde aos filtros.</p>}
      />
      <Dialog
        open={review !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setReview(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir {review?.length} contatos?</DialogTitle>
            <DialogDescription>
              A exclusão é permanente. Serão removidos os contatos selecionados, suas etiquetas,
              vínculos e registros de prospecção. Empresas e negociações permanecem; tarefas e
              conversas perdem o vínculo com esses contatos.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-48 overflow-y-auto text-sm">
            {review?.map((c) => (
              <li key={c.id}>
                {c.name} — {c.email || c.companyName || "Sem e-mail ou empresa"}
              </li>
            ))}
          </ul>
          <label htmlFor="delete-confirmation" className="space-y-2 text-sm">
            Digite EXCLUIR para confirmar
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              disabled={pending}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={pending} onClick={() => setReview(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending || confirmation !== "EXCLUIR"}
              onClick={remove}
            >
              {pending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
