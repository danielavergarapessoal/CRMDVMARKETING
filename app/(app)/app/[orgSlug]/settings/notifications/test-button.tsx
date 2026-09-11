"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { sendNotificationTest } from "@/lib/notifications/test-action";
export function TestNotificationButton({ orgSlug }: { orgSlug: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-2">
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              const r = await sendNotificationTest(orgSlug);
              setMessage(
                r.ok
                  ? "O serviço aceitou o e-mail de teste. Confira a caixa de entrada e o spam do endereço configurado."
                  : (r.error ?? "Não foi possível enviar."),
              );
            } catch {
              setMessage(
                "Não foi possível confirmar o envio. Confira sua caixa antes de tentar novamente.",
              );
            }
          })
        }
      >
        {pending ? "Enviando..." : "Enviar e-mail de teste"}
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
