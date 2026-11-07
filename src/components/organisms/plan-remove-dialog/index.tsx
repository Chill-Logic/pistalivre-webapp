import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { usePlanRemoval } from "@/hooks/api/gestao/plans/usePlanRemoval";
import type { Plan } from "@/types/plan";

/**
 * "Excluir" that steers to "Desativar": deleting drops the reference of every
 * lead that chose the plan, while deactivating only takes it off the
 * questionnaire. An already inactive plan only offers deleting.
 */
export function PlanRemoveDialog({ plan }: { plan: Plan }) {
  const [open, setOpen] = useState(false);
  const { deactivate, remove } = usePlanRemoval(plan);
  const isPending = deactivate.isPending || remove.isPending;
  const close = { onSuccess: () => setOpen(false) };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Excluir {plan.name}?</DialogTitle>
        <DialogDescription>
          {plan.active
            ? "Os leads que escolheram este plano perdem a referência a ele. Para só tirá-lo do questionário e manter o histórico, desative em vez de excluir."
            : "Os leads que escolheram este plano perdem a referência a ele. Isso não pode ser desfeito."}
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant={plan.active ? "outline" : "destructive"}
            className={plan.active ? "text-destructive" : undefined}
            onClick={() => remove.mutate(undefined, close)}
            disabled={isPending}
          >
            {remove.isPending && <Spinner />}
            Excluir mesmo assim
          </Button>
          {plan.active && (
            <Button
              onClick={() => deactivate.mutate(undefined, close)}
              disabled={isPending}
            >
              {deactivate.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Desativar (recomendado)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
