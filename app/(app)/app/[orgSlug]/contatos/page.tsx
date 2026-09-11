import { requireOrgMember } from "@/lib/auth/guards";
import { getCompanies } from "@/lib/companies/queries";
import { getContactsWithCompany } from "@/lib/contacts/queries";
import { ContactsTable } from "./contacts-table";
import { NewContactDialog } from "./new-contact-dialog";

type Props = { params: Promise<{ orgSlug: string }>; searchParams: Promise<{ tag?: string }> };

export const metadata = { title: "Contatos" };

export default async function ContatosPage({ params, searchParams }: Props) {
  const { orgSlug } = await params;
  const initialDiagnosis = (await searchParams).tag === "diagnostico";
  const { org, role } = await requireOrgMember({ orgSlug });

  const [contacts, companies] = await Promise.all([
    getContactsWithCompany(org.id),
    getCompanies(org.id),
  ]);

  const companyOptions = companies.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="label-mono">/ contatos</span>
          <h1 className="font-semibold text-3xl tracking-tight">Contatos</h1>
          <p className="text-muted-foreground text-sm">
            Pessoas que você fala (dentro ou fora de empresas).
          </p>
        </div>
        <NewContactDialog orgSlug={orgSlug} companies={companyOptions} />
      </div>

      <ContactsTable
        initialDiagnosis={initialDiagnosis}
        orgSlug={orgSlug}
        contacts={contacts}
        canDelete={role === "owner" || role === "admin"}
      />
    </div>
  );
}
