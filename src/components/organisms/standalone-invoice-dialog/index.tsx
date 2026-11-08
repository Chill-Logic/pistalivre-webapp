import { FileText } from "lucide-react";
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
import { MoneyField } from "@/components/molecules/money-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import {
  CustomerRentalPicker,
  type CustomerRentalValue,
} from "@/components/organisms/customer-rental-picker";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useCreateStandaloneInvoice } from "@/hooks/api/gestao/invoices/useInvoiceMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";

type Errors = {
  customerId?: string;
  rentalId?: string;
  value?: string;
  description?: string;
  form?: string;
};

/** NFS-e for a customer, rental optional (dated today by Asaas). */
export function StandaloneInvoiceDialog({
  customer,
}: {
  /** Fixed customer (customer record). Omit to pick one (Financeiro). */
  customer?: { id: string; name: string };
}) {
  const create = useCreateStandaloneInvoice();
  const idempotency = useIdempotencyKey();
  const blank: CustomerRentalValue = {
    customerId: customer?.id ?? "",
    customerName: customer?.name ?? "",
    rentalId: "",
  };
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(blank);
  const [value, setValue] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (!next) return;
    setTarget(blank);
    setValue(null);
    setDescription("");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!target.customerId) next.customerId = "Escolha o cliente";
    if (!value || value <= 0) next.value = "Informe o valor";
    if (!description.trim()) next.description = "Descreva o serviço";
    setErrors(next);
    if (Object.keys(next).length > 0 || !value) return;
    create.mutate(
      {
        key: idempotency.key,
        input: {
          customerId: target.customerId,
          ...(target.rentalId ? { rentalId: target.rentalId } : {}),
          value,
          description: description.trim(),
        },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          const placed = Object.keys(fields).length > 0;
          setErrors({
            ...fields,
            form: placed ? undefined : moneyErrorMessage(error),
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText />
          Emitir NF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Emitir nota fiscal</DialogTitle>
        <DialogDescription>
          A nota é emitida para o cliente; vincular a uma locação é opcional.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <CustomerRentalPicker
            value={target}
            onChange={(next) => {
              setTarget(next);
              setErrors({});
            }}
            lockCustomer={Boolean(customer)}
            customerError={errors.customerId}
            rentalError={errors.rentalId}
            disabled={create.isPending}
          />
          <MoneyField
            label="Valor"
            value={value}
            onChange={(next) => {
              setValue(next);
              setErrors({});
            }}
            error={errors.value}
          />
          <TextareaField
            label="Descrição do serviço"
            placeholder="Ex.: Locação de veículo — competência 08/2026"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors({});
            }}
            error={errors.description}
            disabled={create.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={create.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Emitir NF
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
