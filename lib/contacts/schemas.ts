import { z } from "zod";
import { PROSPECT_STATUS_ORDER } from "./prospect";

const optionalEmail = z
  .string()
  .max(200, "E-mail muito longo")
  .refine((v) => v === "" || z.email().safeParse(v).success, "E-mail inválido")
  .optional();

const optionalPhone = z.string().max(40, "Telefone muito longo").optional();
const optionalTitle = z.string().max(120, "Cargo muito longo").optional();
const optionalNotes = z.string().max(5000, "Anotações muito longas").optional();
const optionalCompanyId = z.guid().nullable().optional();

// ————— Campos de prospecção outbound —————

const optionalLinkedinUrl = z
  .string()
  .max(300, "URL muito longa")
  .refine(
    (v) => v === "" || /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(v),
    "Cole o link completo do perfil (começa com https://www.linkedin.com/)",
  )
  .optional();

const optionalInstagramHandle = z
  .string()
  .max(60, "Usuário muito longo")
  .refine(
    (v) => v === "" || /^@?[A-Za-z0-9._]+$/.test(v),
    "Usuário do Instagram inválido (só letras, números, ponto e underline)",
  )
  .optional();

const optionalCity = z.string().max(120, "Cidade muito longa").optional();

const optionalState = z
  .string()
  .refine((v) => v === "" || /^[A-Za-z]{2}$/.test(v), "UF com 2 letras (ex.: SP)")
  .optional();

const optionalSpecialty = z.string().max(120, "Especialidade muito longa").optional();

const optionalIcpScore = z
  .number()
  .int("Score deve ser número inteiro")
  .min(0, "Score mínimo é 0")
  .max(100, "Score máximo é 100")
  .nullable()
  .optional();

const optionalProspectStatus = z.enum(PROSPECT_STATUS_ORDER).nullable().optional();

const optionalListSource = z.string().max(200, "Origem da lista muito longa").optional();

const prospectFields = {
  linkedinUrl: optionalLinkedinUrl,
  instagramHandle: optionalInstagramHandle,
  city: optionalCity,
  state: optionalState,
  specialty: optionalSpecialty,
  icpScore: optionalIcpScore,
  prospectStatus: optionalProspectStatus,
  listSource: optionalListSource,
};

export const createContactSchema = z.object({
  orgSlug: z.string(),
  name: z.string().min(1, "Nome obrigatório").max(120, "Nome muito longo"),
  email: optionalEmail,
  phone: optionalPhone,
  title: optionalTitle,
  companyId: optionalCompanyId,
  notes: optionalNotes,
  ...prospectFields,
});
export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = z.object({
  orgSlug: z.string(),
  id: z.guid(),
  name: z.string().min(1).max(120).optional(),
  email: optionalEmail,
  phone: optionalPhone,
  title: optionalTitle,
  companyId: optionalCompanyId,
  notes: optionalNotes,
  ...prospectFields,
});
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const deleteContactSchema = z.object({
  orgSlug: z.string(),
  id: z.guid(),
});
export type DeleteContactInput = z.infer<typeof deleteContactSchema>;
