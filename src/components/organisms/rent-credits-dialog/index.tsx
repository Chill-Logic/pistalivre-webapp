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
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { toApiError } from "@/helpers/api-error";
import {
  useAddRentCredit,
  useRemoveRentCredit,
} from "@/hooks/api/gestao/rentals/useBillingMutations";
import type { RentCredit } from "@/types/billing";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type Errors = {
  date?: string;
  amount?: string;
  reason?: string;
  form?: string;
};

/**
 * Money discounts on the rent (e.g. the renter paid a R$ 50 repair out of
 * pocket and the house took it off the week). They count as payment, in any
 * periodicity (waiving a whole day is daily only).
 */
export function RentCreditsDialog({
  rentalId,
  credits,
}: {
  rentalId: string;
  credits: RentCredit[];
}) {
  const add = useAddRentCredit(rentalId);
  const remove = useRemoveRentCredit(rentalId);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [showInReport, setShowInReport] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!date) next.date = "Escolha o dia";
    if (!amount || amount <= 0) next.amount = "Informe o valor";
    if (!reason.trim()) next.reason = "Diga o motivo";
    setErrors(next);
    if (Object.keys(next).length > 0 || !amount) return;
    add.mutate(
      { date, amount, reason: reason.trim(), showInReport },
      {
        onSuccess: () => {
          setDate("");
          setAmount(null);
          setReason("");
          setShowInReport(false);
        },
        onError: (err) => {
          const apiError = toApiError(err);
          const fields = apiError.fields ?? {};
          const placed = Boolean(fields.date || fields.amount || fields.reason);
          setErrors({ ...fields, form: placed ? undefined : apiError.message });
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Descontos{credits.length ? ` (${credits.length})` : ""}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Descontos no aluguel</DialogTitle>
        <DialogDescription>
          Valor abatido do aluguel (por exemplo, uma manutenção que o locatário
          pagou do bolso). Conta como pagamento.
        </DialogDescription>
        {credits.length > 0 ? (
          <Box className="divide-y rounded-md border">
            {credits.map((credit) => (
              <Box
                key={credit.id}
                className="flex items-center gap-3 px-3 py-2"
              >
                <Box className="min-w-0 flex-1">
                  <Text weight="medium">
                    {formatCurrency(credit.amount)} ·{" "}
                    {formatCalendarDate(credit.date)}
                  </Text>
                  <Text size="xs" tone="muted">
                    {credit.reason}
                    {credit.showInReport ? " · aparece no relatório" : ""}
                  </Text>
                </Box>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  aria-label={`Desfazer desconto de ${formatCalendarDate(credit.date)}`}
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate(credit.id, {
                      onError: (err) =>
                        setErrors({ form: toApiError(err).message }),
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Text tone="muted">Nenhum desconto.</Text>
        )}
        <Form
          onSubmit={onSubmit}
          noValidate
          className="space-y-3 border-t pt-4"
        >
          <Row className="gap-y-3">
            <Col sm={6}>
              <DateField
                label="Dia"
                value={date}
                onChange={(value) => {
                  setDate(value);
                  setErrors({});
                }}
                error={errors.date}
              />
            </Col>
            <Col sm={6}>
              <MoneyField
                label="Valor"
                value={amount}
                onChange={(value) => {
                  setAmount(value);
                  setErrors({});
                }}
                error={errors.amount}
              />
            </Col>
          </Row>
          <FormField
            label="Motivo"
            placeholder="Ex.: manutenção paga pelo locatário"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setErrors({});
            }}
            error={errors.reason}
          />
          <CheckboxField
            label="Mostrar o motivo no relatório do cliente"
            checked={showInReport}
            onChange={setShowInReport}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Spinner className="text-primary-foreground" />}
              Dar desconto
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
