import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import {
  useDeleteTestLeads,
  useTestLeadCount,
} from "@/hooks/api/gestao/crm/useTestLeads";
import { pluralize } from "@/utils/text";

/** Typed to unlock the button: deleting every test lead can't be undone. */
const CONFIRM_WORD = "APAGAR";

/**
 * "Apagar leads de teste (n)": only when there are test leads. A strong
 * confirmation (type the word), since it removes them all with their
 * activities and attachments.
 */
export function TestLeadsDeleteButton() {
  const count = useTestLeadCount();
  const remove = useDeleteTestLeads();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const total = count.data ?? 0;
  if (total === 0) return null;

  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setTyped("");
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!confirmed) return;
    remove.mutate(undefined, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          aria-label={`Apagar leads de teste (${total})`}
        >
          <Trash2 />
          <Text inline size={null} className="hidden lg:inline">
            Apagar leads de teste ({total})
          </Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>
          Apagar {pluralize(total, "lead de teste", "leads de teste")}?
        </DialogTitle>
        <DialogDescription>
          Remove todos os leads de teste, com as atividades e os anexos. Leads
          reais e as métricas não mudam. Não dá para desfazer.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            label={`Digite ${CONFIRM_WORD} para confirmar`}
            autoComplete="off"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            disabled={remove.isPending}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={remove.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={!confirmed || remove.isPending}
            >
              {remove.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Apagar leads de teste
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
