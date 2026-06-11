import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LEAD_CAPTURE_ORG_SLUG, LEAD_SOURCES, tagColorFor } from "@/lib/leads/sources";
import { logError } from "@/lib/logger";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const bodySchema = z.object({
  source: z.string().min(1).max(80),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(40).optional(),
  // honeypot anti-bot: campo escondido que humano nunca preenche
  website: z.string().optional(),
});

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const token = process.env.LEAD_CAPTURE_TOKEN;
  if (!token) {
    logError("leads.capture", new Error("LEAD_CAPTURE_TOKEN não configurado"));
    return NextResponse.json({ ok: false, error: "Serviço indisponível" }, { status: 503, headers: CORS });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (provided !== token) {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401, headers: CORS });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400, headers: CORS });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos" }, { status: 400, headers: CORS });
  }
  const { source, name, email, phone, website } = parsed.data;

  // Honeypot: bot preencheu o campo escondido → finge sucesso e descarta.
  if (website && website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { headers: CORS });
  }

  const sourceCfg = LEAD_SOURCES[source];
  if (!sourceCfg) {
    return NextResponse.json({ ok: false, error: "Origem desconhecida" }, { status: 400, headers: CORS });
  }

  const cleanEmail = email && email.length > 0 ? email.toLowerCase() : null;
  const cleanPhone = phone && phone.length > 0 ? phone : null;
  if (!cleanEmail && !cleanPhone) {
    return NextResponse.json(
      { ok: false, error: "Informe pelo menos email ou telefone" },
      { status: 400, headers: CORS },
    );
  }
  const contactName = name && name.length > 0 ? name : (cleanEmail?.split("@")[0] ?? "Lead");

  try {
    const supabase = createServiceClient();

    // 1) Descobre a org pelo slug
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", LEAD_CAPTURE_ORG_SLUG)
      .maybeSingle();
    if (orgErr || !org) {
      logError("leads.capture.org", orgErr);
      return NextResponse.json({ ok: false, error: "Workspace não encontrado" }, { status: 500, headers: CORS });
    }
    const orgId = org.id;

    // 2) Contato — deduplica por email se houver
    let contactId: string | null = null;
    if (cleanEmail) {
      const { data: existing } = await supabase
        .from("contacts")
        .select("id")
        .eq("organization_id", orgId)
        .ilike("email", cleanEmail)
        .maybeSingle();
      contactId = existing?.id ?? null;
    }
    if (!contactId) {
      const { data: created, error: cErr } = await supabase
        .from("contacts")
        .insert({
          organization_id: orgId,
          name: contactName,
          email: cleanEmail,
          phone: cleanPhone,
          notes: `Lead capturado via landing page: ${sourceCfg.label}`,
        })
        .select("id")
        .single();
      if (cErr || !created) {
        logError("leads.capture.contact", cErr);
        return NextResponse.json({ ok: false, error: "Erro ao salvar contato" }, { status: 500, headers: CORS });
      }
      contactId = created.id;
    }

    // 3) Tags — cria se não existir e aplica no contato
    for (const tagName of sourceCfg.tags) {
      let tagId: string | null = null;
      const { data: existingTag } = await supabase
        .from("tags")
        .select("id")
        .eq("organization_id", orgId)
        .eq("name", tagName)
        .maybeSingle();
      tagId = existingTag?.id ?? null;
      if (!tagId) {
        const { data: newTag, error: tErr } = await supabase
          .from("tags")
          .insert({ organization_id: orgId, name: tagName, color: tagColorFor(tagName) })
          .select("id")
          .single();
        if (tErr || !newTag) {
          logError("leads.capture.tag", tErr);
          continue; // não bloqueia o lead por causa de uma tag
        }
        tagId = newTag.id;
      }
      const { error: linkErr } = await supabase.from("contact_tag_links").upsert(
        {
          contact_id: contactId,
          tag_id: tagId,
          organization_id: orgId,
          applied_by_kind: "automation",
        },
        { onConflict: "contact_id,tag_id", ignoreDuplicates: true },
      );
      if (linkErr) logError("leads.capture.link", linkErr);
    }

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (err) {
    logError("leads.capture.unexpected", err);
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500, headers: CORS });
  }
}
