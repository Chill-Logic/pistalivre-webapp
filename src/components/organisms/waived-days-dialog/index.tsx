import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { toApiError } from "@/helpers/api-error";
import {
  useAddWaivedDay,
  useRemoveWaivedDay,
} from "@/hooks/api/gestao/rentals/useBillingMutations";
import type { WaivedDay } from "@/types/billing";
import { formatCalendarDate } from "@/utils/format";

/**
 * Specific days waived on the DAILY rent (e.g. discounted for a repair the
 * renter paid): the automation skips them and they do not count as due.
 */
export function WaivedDaysDialog({
  rentalId,
  days,
}: {
  rentalId: string;
  days: WaivedDay[];
}) {
  const add = useAddWaivedDay(rentalId);
  const remove = useRemoveWaivedDay(rentalId);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [showInReport, setShowInReport] = useState(false);
  const [error, setError] = useState<{ date?: string; form?: string }>({});

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!date) {
      setError({ date: "Escolha o dia" });
      return;
    }
    add.mutate(
      {
        date,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
        showInReport,
      },
      {
        onSuccess: () => {
          setDate("");
          setReason("");
          setShowInReport(false);
          setError({});
        },
        onError: (err) => {
          const apiError = toApiError(err);
          setError(
            apiError.fields?.date
              ? { date: apiError.fields.date }
              : { form: apiError.message },
          );
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Dias abonados{days.length ? ` (${days.length})` : ""}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Dias abonados</DialogTitle>
        <DialogDescription>
          Dias em que a diária não é cobrada (por exemplo, descontados por uma
          manutenção que o locatário pagou). A cobrança automática pula esses
          dias e eles não contam no devido.
        </DialogDescription>
        {days.length > 0 ? (
          <Box className="divide-y rounded-md border">
            {days.map((day) => (
              <Box key={day.date} className="flex items-center gap-3 px-3 py-2">
                <Box className="min-w-0 flex-1">
                  <Text weight="medium">{formatCalendarDate(day.date)}</Text>
                  {day.reason && (
                    <Text size="xs" tone="muted">
                      {day.reason}
                      {day.showInReport ? " · aparece no relatório" : ""}
                    </Text>
                  )}
                </Box>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  aria-label={`Desfazer abono de ${formatCalendarDate(day.date)}`}
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate(day.date, {
                      onError: (err) =>
                        setError({ form: toApiError(err).message }),
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Text tone="muted">Nenhum dia abonado.</Text>
        )}
        <Form
          onSubmit={onSubmit}
          noValidate
          className="space-y-3 border-t pt-4"
        >
          <DateField
            label="Dia"
            value={date}
            onChange={(value) => {
              setDate(value);
              setError({});
            }}
            error={error.date}
          />
          <FormField
            label="Motivo (opcional)"
            placeholder="Ex.: manutenção paga pelo locatário"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <CheckboxField
            label="Mostrar o motivo no relatório do cliente"
            checked={showInReport}
            onChange={setShowInReport}
          />
          {error.form && <Alert>{error.form}</Alert>}
          <DialogFooter>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Spinner className="text-primary-foreground" />}
              Abonar dia
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
