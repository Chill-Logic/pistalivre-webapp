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
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useSetSkipWeekdays } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useLabels } from "@/hooks/ui/useLabels";

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Weekdays the DAILY rent does not charge (e.g. Sunday): the automation
 * jumps straight to the next day that charges.
 */
export function SkipWeekdaysDialog({
  rentalId,
  skipWeekdays,
}: {
  rentalId: string;
  skipWeekdays: number[];
}) {
  const { label } = useLabels();
  const save = useSetSkipWeekdays(rentalId);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number[]>(skipWeekdays);
  const [error, setError] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    if (save.isPending) return;
    setOpen(next);
    if (!next) return;
    setPicked(skipWeekdays);
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate([...picked].sort(), {
      onSuccess: () => setOpen(false),
      onError: (err) => {
        const apiError = toApiError(err);
        setError(apiError.fields?.weekdays ?? apiError.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          Alterar dias sem cobrança
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Dias sem cobrança</DialogTitle>
        <DialogDescription>
          Nos dias marcados a diária não é cobrada: a cobrança automática pula
          direto para o próximo dia.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-3">
            {WEEKDAYS.map((day) => (
              <Col key={day} span={6}>
                <CheckboxField
                  label={label(LABEL_MAPS.weekday, day)}
                  checked={picked.includes(day)}
                  onChange={(checked) => {
                    setPicked((current) =>
                      checked
                        ? [...current, day]
                        : current.filter((d) => d !== day),
                    );
                    setError(null);
                  }}
                  disabled={save.isPending}
                />
              </Col>
            ))}
          </Row>
          {error && <Alert>{error}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={save.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
