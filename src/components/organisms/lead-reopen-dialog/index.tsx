import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
import { routeTo } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import { useLeadActions } from "@/hooks/api/gestao/crm/useLeadActions";

type LeadReopenDialogProps = {
  leadId: string;
  trigger: ReactNode;
};

/**
 * Reopening a lost/won lead does NOT change it: the API creates a copy with
 * the reason, and we go there. The original stays as it was, in the chain.
 */
export function LeadReopenDialog({ leadId, trigger }: LeadReopenDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; form?: string }>({});
  const { reopen } = useLeadActions(leadId);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setReason("");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) {
      setErrors({ reason: "Informe o motivo da retomada" });
      return;
    }
    setErrors({});
    reopen.mutate(reason.trim(), {
      onSuccess: (copy) => {
        setOpen(false);
        navigate(routeTo.lead(copy.id));
      },
      onError: (error) => {
        const apiError = toApiError(error);
        setErrors({
          reason: apiError.fields?.reason,
          form: apiError.fields?.reason ? undefined : apiError.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Retomar lead</DialogTitle>
        <DialogDescription>
          Abre uma nova tentativa com os mesmos dados. Esta fica como está, no
          histórico, com o motivo de perda.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <TextareaField
            label="Por que retomar?"
            placeholder="Ex.: voltou a procurar depois de tirar a CNH"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setErrors({});
            }}
            error={errors.reason}
            disabled={reopen.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={reopen.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={reopen.isPending}>
              {reopen.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Retomar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
