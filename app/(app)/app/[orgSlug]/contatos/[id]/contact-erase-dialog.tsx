"use client";

import { ShieldAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type EraseContactSummary, eraseContactDataAction } from "@/lib/contacts/erase-action";
import { ERASE_CONFIRMATION } from "@/lib/contacts/schemas";

type Props = { orgSlug: string; contactId: string; contactName: string };

export function ContactEraseDialog({ orgSlug, contactId, contactName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [summary, setSummary] = useState<EraseContactSummary | null>(null);
  const [pending, startTransition] = useTransition();

  function finish() {
    router.push(`/app/${orgSlug}/contatos`);
    router.refresh();
  }

  function handleOpenChange(next: boolean) {
    // Depois de apagado o contato não existe mais: fechar leva pra lista.
    if (!next && summary) {
      finish();
      return;
    }
    setOpen(next);
    if (!next) setTyped("");
  }

  function handleErase() {
    startTransition(async () => {
      try {
        const r = await eraseContactDataAction({
          orgSlug,
          id: contactId,
          confirmation: ERASE_CONFIRMATION,
        });
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        setSummary(r.data);
      } catch {
        toast.error("Não consegui falar com o servidor. Atualize a página (F5) e tente de novo.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive">
            <ShieldAlertIcon className="h-3.5 w-3.5" />
            Excluir dados do titular (LGPD)
          </Button>
        }
      />
      <DialogContent>
        {summary ? (
          <>
            <DialogHeader>
              <DialogTitle>Dados excluídos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <p>
                Tudo que o CRM guardava de <strong>{contactName}</strong> foi apagado em{" "}
                {new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}. Guarde este
                resumo como comprovante do atendimento ao pedido.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>1 contato (com etiquetas e vínculos com negociações)</li>
                <li>{summary.submissions} ficha(s) de diagnóstico/pesquisa</li>
                <li>
                  {summary.conversations} conversa(s) e {summary.messages} mensagem(ns)
                </li>
                <li>{summary.tasks} tarefa(s)</li>
              </ul>
              <div className="rounded-md border border-border/60 bg-muted/40 p-3">
                <p className="font-medium">Ainda falta apagar, fora do CRM:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>a página do lead no Notion</li>
                  <li>os e-mails de aviso e de laudo na caixa da equipe</li>
                  <li>o registro de envio no Resend</li>
                </ul>
              </div>
              <Button onClick={finish}>Concluir</Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Excluir dados do titular</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <p>
                Use quando a pessoa pedir a exclusão dos dados (LGPD). Apaga de verdade, sem volta,
                tudo de <strong>{contactName}</strong>: contato, fichas de diagnóstico, etiquetas,
                tarefas e as conversas com todas as mensagens — inclusive conversas do mesmo
                telefone que ainda não estavam ligadas ao contato.
              </p>
              <div className="space-y-1.5">
                <label htmlFor="erase-confirmation" className="font-medium">
                  Para confirmar, digite {ERASE_CONFIRMATION}
                </label>
                <Input
                  id="erase-confirmation"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={pending}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleErase}
                  disabled={pending || typed.trim() !== ERASE_CONFIRMATION}
                >
                  {pending ? "Excluindo…" : "Excluir definitivamente"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
