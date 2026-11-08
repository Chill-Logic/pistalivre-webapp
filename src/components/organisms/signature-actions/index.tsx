import { Ban, CheckCircle2, Link2Off, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Spinner } from "@/components/atoms/spinner";
import { ROUTES } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import { useSignatureAction } from "@/hooks/api/gestao/signatures/useSignatureMutations";
import type { SignatureDetail } from "@/types/signature";

type ActionKind = "cancel" | "confirmSigned" | "unlink" | "remove";

type ConfirmActionProps = {
  signatureId: string;
  action: ActionKind;
  trigger: string;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /** After a delete/unlink the record is gone: back to the list. */
  leaves?: boolean;
};

/** A button + a dialog that says the REAL effect at the provider first. */
function ConfirmAction({
  signatureId,
  action,
  trigger,
  icon,
  title,
  description,
  confirmLabel,
  destructive = false,
  leaves = false,
}: ConfirmActionProps) {
  const run = useSignatureAction(signatureId, action);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (run.isPending) return;
        setOpen(next);
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={destructive ? "text-destructive" : undefined}
          aria-label={
            trigger === "Excluir" ? "Excluir pedido de assinatura" : undefined
          }
        >
          {icon}
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {error && <Alert>{error}</Alert>}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={run.isPending}>
              Voltar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={run.isPending}
            onClick={() =>
              run.mutate(undefined, {
                onSuccess: () => {
                  setOpen(false);
                  if (leaves) navigate(ROUTES.signatures, { replace: true });
                },
                onError: (err) => setError(toApiError(err).message),
              })
            }
          >
            {run.isPending && <Spinner className="text-primary-foreground" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * What a request allows depends on its status AND its origin, because the
 * effect at the provider differs (same rules as the management app):
 * - draft: nothing exists there yet, deleting is local and harmless;
 * - sent: try to close the envelope (the provider refuses once it is
 *   running — then only "unlink" is left);
 * - unlink: drops the link here and leaves the envelope alive.
 */
export function SignatureActions({
  signature,
}: {
  signature: SignatureDetail;
}) {
  const isDraft = signature.status === "DRAFT";
  const isSent = signature.status === "SENT";
  const imported = signature.source === "IMPORTED";
  const id = signature.id;

  return (
    <Box className="flex flex-wrap justify-end gap-2">
      {(isDraft || isSent) && (
        <ConfirmAction
          signatureId={id}
          action="confirmSigned"
          trigger="Confirmar assinatura"
          icon={<CheckCircle2 />}
          title="Confirmar que já foi assinado?"
          description="Registra a assinatura aqui: use quando o contrato foi assinado fora do sistema (papel, WhatsApp). Nada é enviado ao Clicksign. Se for um contrato de locação, a locação vai para “Assinada”, o cadastro vira cliente e o lead é fechado como ganho."
          confirmLabel="Confirmar assinatura"
        />
      )}
      {isDraft && (
        <ConfirmAction
          signatureId={id}
          action="remove"
          trigger="Excluir"
          icon={<Trash2 />}
          title="Excluir este rascunho?"
          description="Nada foi enviado ao Clicksign ainda, então isto some só com a configuração feita aqui. O PDF continua anexado."
          confirmLabel="Excluir rascunho"
          destructive
          leaves
        />
      )}
      {isSent && !imported && (
        <ConfirmAction
          signatureId={id}
          action="cancel"
          trigger="Cancelar assinatura"
          icon={<Ban />}
          title="Cancelar a assinatura?"
          description="Encerra o envelope no Clicksign e marca o pedido como cancelado. Se o envelope já estiver em andamento, o provedor não permite cancelar pela API; nesse caso a mensagem explica o que fazer."
          confirmLabel="Cancelar assinatura"
          destructive
        />
      )}
      {isSent && (
        <ConfirmAction
          signatureId={id}
          action="unlink"
          trigger="Desvincular"
          icon={<Link2Off />}
          title="Desfazer o vínculo?"
          description={
            imported
              ? "Remove este pedido daqui. O envelope segue exatamente como está no Clicksign: ninguém é avisado e nenhuma assinatura é perdida. Use quando o vínculo foi feito com o PDF errado; depois é só vincular de novo."
              : "Remove este pedido daqui, mas o envelope continua ativo no Clicksign e ficará sem acompanhamento no sistema. Prefira “Cancelar assinatura”; use isto só se o provedor recusar o cancelamento."
          }
          confirmLabel="Desvincular"
          destructive
          leaves
        />
      )}
      {!isDraft && !isSent && (
        <ConfirmAction
          signatureId={id}
          action="remove"
          trigger="Excluir"
          icon={<Trash2 />}
          title="Excluir este pedido?"
          description="O ciclo já terminou. Isto apaga o histórico de assinatura guardado aqui (quem assinou e quando); o PDF continua anexado e o envelope segue no Clicksign."
          confirmLabel="Excluir pedido"
          destructive
          leaves
        />
      )}
    </Box>
  );
}
