import { Send } from "lucide-react";
import { useState } from "react";
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
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useSendSignature } from "@/hooks/api/gestao/signatures/useSignatureMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SignatureDetail } from "@/types/signature";
import { formatDate } from "@/utils/format";

/**
 * "Solicitar assinatura(s)": the ONLY call that talks to the provider — it
 * creates the envelope and really notifies the signers (e-mail/WhatsApp).
 * Everything is reviewed here first; after it the settings are frozen.
 * Disabled while the draft has blockers (the server checks them again).
 */
export function SignatureSendDialog({
  signature,
}: {
  signature: SignatureDetail;
}) {
  const { label } = useLabels();
  const send = useSendSignature(signature.id);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blocked = signature.blockers.length > 0;
  const ordered = [...signature.signers].sort((a, b) => a.order - b.order);

  const onOpenChange = (next: boolean) => {
    if (send.isPending) return;
    setOpen(next);
    if (next) setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={blocked}
          title={
            blocked
              ? "Resolva o que falta (aviso acima) para poder enviar"
              : undefined
          }
        >
          <Send />
          Solicitar assinatura(s)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Solicitar assinatura(s)?</DialogTitle>
        <DialogDescription>
          Confira antes de enviar. Ao confirmar, o documento vai para o
          Clicksign e os signatários são avisados de verdade. Depois disso a
          configuração não pode mais ser alterada por aqui.
        </DialogDescription>
        <Box className="space-y-3">
          <Box>
            <Text size="xs" tone="muted">
              Documento
            </Text>
            <Text weight="medium">{signature.name}</Text>
          </Box>
          <Box>
            <Text size="xs" tone="muted">
              Ordem de assinatura
            </Text>
            <List className="divide-y">
              {ordered.map((signer, index) => (
                <ListItem key={signer.id} className="py-2">
                  <Text weight="medium">
                    {index + 1}. {signer.name}
                  </Text>
                  <Text size="xs" tone="muted">
                    {signer.email} · {label(LABEL_MAPS.signerRole, signer.role)}{" "}
                    · convite por{" "}
                    {label(LABEL_MAPS.signerChannel, signer.notify)}
                  </Text>
                </ListItem>
              ))}
            </List>
          </Box>
          <Text size="xs" tone="muted">
            Prazo:{" "}
            {signature.deadlineAt
              ? formatDate(signature.deadlineAt)
              : "sem prazo"}{" "}
            · lembrete a cada {signature.remindInterval}{" "}
            {signature.remindInterval === 1 ? "dia" : "dias"}
          </Text>
          {error && <Alert>{error}</Alert>}
        </Box>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={send.isPending}>
              Voltar
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={send.isPending}
            onClick={() =>
              send.mutate(idempotency.key, {
                onSuccess: () => {
                  idempotency.renew();
                  setOpen(false);
                },
                onError: (err) => setError(toApiError(err).message),
              })
            }
          >
            {send.isPending && <Spinner className="text-primary-foreground" />}
            Enviar para assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
