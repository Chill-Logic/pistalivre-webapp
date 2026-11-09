import { Check, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Alert } from "@/components/atoms/alert";
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
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { usePartnerProposalDecision } from "@/hooks/api/parceiro/area/usePartnerProposals";
import type { PartnerAreaProposal } from "@/types/partner-area";

type DecisionProps = { proposal: PartnerAreaProposal };

/** "Aceitar": only after ticking that the contract was read. */
export function PartnerAreaProposalAccept({ proposal }: DecisionProps) {
  const { accept } = usePartnerProposalDecision();
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setAgreed(false);
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!agreed) {
      setError("Marque que leu o contrato e concorda com os termos.");
      return;
    }
    setError(null);
    accept.mutate(
      { contractId: proposal.contractId, versionId: proposal.version.id },
      {
        onSuccess: () => setOpen(false),
        onError: (failure) => {
          const apiError = toApiError(failure);
          // 422 without a field: changed by the company or already decided.
          // Say so and close; the refreshed home shows what it is now.
          if (apiError.status === 422 && !apiError.fields?.note) {
            toast.error(apiError.message);
            setOpen(false);
          } else setError(apiError.message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Check />
          Aceitar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Aceitar a proposta {proposal.code}?</DialogTitle>
        <DialogDescription>
          Você concorda com a versão {proposal.version.number} do contrato, como
          está no PDF. O aceite fica registrado com a data, o IP e o navegador;
          depois a locadora envia o contrato para a assinatura.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <CheckboxField
            label="Li o contrato e concordo com os termos"
            checked={agreed}
            onChange={(value) => {
              setAgreed(value);
              if (value) setError(null);
            }}
          />
          {error && <Alert>{error}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={accept.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!agreed || accept.isPending}>
              {accept.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Aceitar proposta
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** "Recusar": the reason is required (the company reads it). */
export function PartnerAreaProposalReject({ proposal }: DecisionProps) {
  const { reject } = usePartnerProposalDecision();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ note?: string; form?: string }>({});

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setNote("");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const reason = note.trim();
    if (!reason) {
      setErrors({ note: "Conte o motivo da recusa" });
      return;
    }
    setErrors({});
    reject.mutate(
      {
        contractId: proposal.contractId,
        versionId: proposal.version.id,
        note: reason,
      },
      {
        onSuccess: () => setOpen(false),
        onError: (failure) => {
          const apiError = toApiError(failure);
          // 422 without a field: changed by the company or already decided.
          // Say so and close; the refreshed home shows what it is now.
          if (apiError.status === 422 && !apiError.fields?.note) {
            toast.error(apiError.message);
            setOpen(false);
          } else
            setErrors({
              note: apiError.fields?.note,
              form: apiError.fields?.note ? undefined : apiError.message,
            });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <X />
          Recusar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Recusar a proposta {proposal.code}?</DialogTitle>
        <DialogDescription>
          A locadora recebe o seu motivo e pode mandar uma nova versão.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <TextareaField
            label="Motivo da recusa"
            rows={4}
            maxLength={2000}
            placeholder="Ex.: prefiro uma taxa de 10%"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            error={errors.note}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={reject.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={reject.isPending}
            >
              {reject.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Recusar proposta
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
