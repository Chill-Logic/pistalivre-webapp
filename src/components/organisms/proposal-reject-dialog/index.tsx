import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useRejectProposal } from "@/hooks/api/gestao/proposals/useProposalMutations";

/** Records the refusal (with a lead, a note goes on its trail). */
export function ProposalRejectDialog({ proposalId }: { proposalId: string }) {
  const reject = useRejectProposal(proposalId);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<{ reason?: string; form?: string }>({});

  const onOpenChange = (next: boolean) => {
    if (reject.isPending) return;
    setOpen(next);
    if (next) {
      setReason("");
      setError({});
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError({ reason: "Conte por que recusou" });
      return;
    }
    reject.mutate(reason.trim(), {
      onSuccess: () => setOpen(false),
      onError: (err) => {
        const apiError = toApiError(err);
        setError(
          apiError.fields?.reason
            ? { reason: apiError.fields.reason }
            : { form: apiError.message },
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <X />
          Recusar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Recusar proposta</DialogTitle>
        <DialogDescription>
          Registra a recusa. Você pode ajustar e emitir outra proposta.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <TextareaField
            label="Motivo"
            placeholder="Por que recusou? (ex.: valor acima do esperado)"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError({});
            }}
            error={error.reason}
            disabled={reject.isPending}
          />
          {error.form && <Alert>{error.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={reject.isPending}
              >
                Voltar
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
              Registrar recusa
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
