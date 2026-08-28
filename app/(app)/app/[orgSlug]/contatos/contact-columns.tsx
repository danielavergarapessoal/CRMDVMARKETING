"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { TagChip } from "@/components/app/tag-chip";
import { Badge } from "@/components/ui/badge";
import { PROSPECT_STATUS_LABELS } from "@/lib/contacts/prospect";
import type { ContactWithCompany } from "@/lib/contacts/queries";

export function getContactColumns(orgSlug: string): ColumnDef<ContactWithCompany>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <Link
          href={`/app/${orgSlug}/contatos/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "title",
      header: "Cargo / Especialidade",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.title ?? row.original.specialty ?? "—"}</span>
      ),
    },
    {
      accessorKey: "companyName",
      header: "Empresa",
      cell: ({ row }) => <span className="text-sm">{row.original.companyName ?? "—"}</span>,
    },
    {
      id: "tags",
      header: "Etiquetas",
      cell: ({ row }) => {
        const tags = row.original.tags;
        if (tags.length === 0) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="flex max-w-[260px] flex-wrap gap-1">
            {tags.map((t) => (
              <TagChip key={t.name} name={t.name} color={t.color} />
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "prospect_status",
      header: "Prospecção",
      cell: ({ row }) => {
        const status = row.original.prospect_status;
        if (!status) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <Badge variant={status === "reuniao_marcada" ? "default" : "outline"}>
            {PROSPECT_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.phone ?? "—"}</span>,
    },
    {
      accessorKey: "email",
      header: "E-mail",
      cell: ({ row }) => <span className="text-sm">{row.original.email ?? "—"}</span>,
    },
  ];
}
