import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
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
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { customerDebtsKey } from "@/hooks/api/gestao/customer-debts/useCustomerDebts";
import { useLabels } from "@/hooks/ui/useLabels";
import { useCustomerOptions } from "@/hooks/ui/useRemoteOptions";
import { customerDebtsService } from "@/services/api/gestao/customer-debts.service";
import type { CustomerDebtOrigin } from "@/types/customer-debt";
import { todayInBrasilia } from "@/utils/date";

const ORIGINS: CustomerDebtOrigin[] = [
  "DAMAGES",
  "TRAFFIC_FINE",
  "CLAIM",
  "SETTLEMENT",
  "OTHER",
];

type PassOnCostDialogProps = {
  /** The cost of ours being passed on — one of them. */
  source: { maintenanceId: string } | { expenseId: string };
  /** Pre-filled from the source; all editable. */
  defaults: {
    amount: number | null;
    description: string;
    /** yyyy-mm-dd */
    incurredAt: string;
    origin?: CustomerDebtOrigin;
    customer?: { id: string; name: string } | null;
  };
  /** What to refresh after saving (the source's screen). */
  invalidate: QueryKey;
  trigger: ReactNode;
};

/**
 * "Cobrar do cliente": a maintenance or expense of ours becomes a debt of the
 * customer, linked to it. From then on it is a debt like any other — paid
 * down by the rent's debt share, paid directly or charged by link.
 */
export function PassOnCostDialog({
  source,
  defaults,
  invalidate,
  trigger,
}: PassOnCostDialogProps) {
  const { label } = useLabels();
  const queryClient = useQueryClient();
  const customers = useCustomerOptions();
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState({ id: "", name: "" });
  const [origin, setOrigin] = useState<CustomerDebtOrigin>("DAMAGES");
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [incurredAt, setIncurredAt] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      customerDebtsService.create(customer.id, {
        origin,
        description: description.trim() || null,
        amount: amount ?? 0,
        incurredAt,
        startsAt,
        notes: null,
        ...source,
      }),
    onSuccess: (view) => {
      queryClient.setQueryData(customerDebtsKey(customer.id), view);
      void queryClient.invalidateQueries({ queryKey: invalidate });
      toast.success(`Débito lançado para ${customer.name}`);
      setOpen(false);
    },
    onError: (err) => setError(toApiError(err).message),
  });

  const onOpenChange = (next: boolean) => {
    if (save.isPending) return;
    setOpen(next);
    if (!next) return;
    setCustomer(defaults.customer ?? { id: "", name: "" });
    setOrigin(defaults.origin ?? "DAMAGES");
    setAmount(defaults.amount);
    setDescription(defaults.description);
    setIncurredAt(defaults.incurredAt);
    setStartsAt(todayInBrasilia());
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!customer.id) return setError("Escolha o cliente");
    if (!amount || amount <= 0) return setError("Informe o valor");
    if (!incurredAt || !startsAt) return setError("Informe as datas");
    setError(null);
    save.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="lg">
        <DialogTitle>Cobrar do cliente</DialogTitle>
        <DialogDescription>
          Vira um débito do cliente, ligado a este lançamento. Ele paga com a
          parte da diária para débitos, à vista ou pelo link de cobrança do
          saldo devedor.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col md={6}>
              <RemoteCombobox
                label="Cliente"
                value={customer.id}
                selectedLabel={customer.name}
                options={customers.options}
                isLoading={customers.isLoading}
                search={customers.search}
                onSearchChange={customers.setSearch}
                onChange={(option) =>
                  setCustomer({ id: option.value, name: option.label })
                }
                placeholder="Selecione o cliente"
                searchPlaceholder="Buscar por nome ou CPF…"
              />
            </Col>
            <Col md={3}>
              <SelectField
                label="Origem"
                value={origin}
                options={ORIGINS.map((key) => ({
                  value: key,
                  label: label(LABEL_MAPS.customerDebtOrigin, key),
                }))}
                onChange={(value) => setOrigin(value as CustomerDebtOrigin)}
              />
            </Col>
            <Col md={3}>
              <MoneyField label="Valor" value={amount} onChange={setAmount} />
            </Col>
            <Col>
              <FormField
                label="Descrição (aparece para o cliente)"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Col>
            <Col md={6}>
              <DateField
                label="Dia do fato"
                value={incurredAt}
                onChange={setIncurredAt}
              />
            </Col>
            <Col md={6}>
              <DateField
                label="Abate a partir de"
                value={startsAt}
                onChange={setStartsAt}
              />
            </Col>
          </Row>
          {error && <Alert>{error}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={save.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Spinner className="text-primary-foreground" />}
              Lançar débito
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
