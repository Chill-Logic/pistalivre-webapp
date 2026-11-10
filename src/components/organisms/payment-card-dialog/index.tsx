import { useState, type FormEvent, type ReactNode } from "react";
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
import { FormField } from "@/components/molecules/form-field";
import { RemoteCombobox, type RemoteOption } from "@/components/molecules/remote-combobox";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { usePaymentCardWrites } from "@/hooks/api/gestao/payment-cards/usePaymentCardWrites";
import { useLabels } from "@/hooks/ui/useLabels";
import { useUserOptions } from "@/hooks/ui/useRemoteOptions";
import type { PaymentCard, PaymentCardHolder } from "@/types/payment-card";
import { parsePercentInput, percentInputOf } from "@/utils/percent";

type PaymentCardDialogProps = {
  trigger: ReactNode;
  /** Present = edit; absent = new. */
  card?: PaymentCard;
};

type Field = "name" | "lastDigits" | "holderUserId" | "foreignSurchargePercent";
type Errors = Partial<Record<Field, string>> & { form?: string };

const FIELDS: Field[] = ["name", "lastDigits", "holderUserId", "foreignSurchargePercent"];

function initialState(card?: PaymentCard) {
  return {
    name: card?.name ?? "",
    lastDigits: card?.lastDigits ?? "",
    holderType: card?.holderType ?? ("COMPANY" as PaymentCardHolder),
    holder: card?.holder
      ? ({ value: card.holder.id, label: card.holder.name } as RemoteOption)
      : null,
    surcharge: percentInputOf(card?.foreignSurchargePercent ?? null),
    active: card?.active ?? true,
  };
}

/**
 * A card bills are paid with: name, last 4 digits (never the number), whose it
 * is (the company's or a team member's) and the IOF + spread it charges on a
 * foreign-currency purchase — what converts a cost in US$/€ to reais.
 */
export function PaymentCardDialog({ trigger, card }: PaymentCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(() => initialState(card));
  const [errors, setErrors] = useState<Errors>({});
  const { save } = usePaymentCardWrites();
  const { options } = useLabels();
  const users = useUserOptions();

  const set = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors({});
  };

  const onOpenChange = (next: boolean) => {
    if (save.isPending) return;
    setOpen(next);
    if (!next) return;
    setState(initialState(card));
    setErrors({});
    users.setSearch("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    const surcharge = parsePercentInput(state.surcharge);
    if (!state.name.trim()) next.name = "Informe o nome";
    if (state.lastDigits && !/^\d{4}$/.test(state.lastDigits)) {
      next.lastDigits = "Use os 4 últimos dígitos";
    }
    if (state.holderType === "USER" && !state.holder) {
      next.holderUserId = "Escolha de quem é o cartão";
    }
    if (surcharge !== null && (Number.isNaN(surcharge) || surcharge < 0 || surcharge > 100)) {
      next.foreignSurchargePercent = "Percentual inválido";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    save.mutate(
      {
        id: card?.id,
        input: {
          name: state.name.trim(),
          lastDigits: state.lastDigits || null,
          holderType: state.holderType,
          holderUserId: state.holderType === "USER" ? (state.holder?.value ?? null) : null,
          foreignSurchargePercent: surcharge ?? 0,
          active: state.active,
        },
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const api = toApiError(error);
          const fields = api.fields ?? {};
          const placed = FIELDS.some((field) => fields[field]);
          setErrors({ ...fields, form: placed ? undefined : api.message });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogTitle>{card ? `Editar ${card.name}` : "Novo cartão"}</DialogTitle>
        <DialogDescription>
          Só os 4 últimos dígitos, para reconhecer o cartão. O acréscimo é o que
          ele cobra numa compra em dólar ou euro (IOF + spread).
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col md={8}>
              <FormField
                label="Nome"
                placeholder="Ex.: Nubank PJ"
                maxLength={60}
                value={state.name}
                onChange={(event) => set("name", event.target.value)}
                error={errors.name}
                disabled={save.isPending}
              />
            </Col>
            <Col md={4}>
              <FormField
                label="Final (opcional)"
                placeholder="1234"
                inputMode="numeric"
                maxLength={4}
                value={state.lastDigits}
                onChange={(event) => set("lastDigits", event.target.value.replace(/\D/g, ""))}
                error={errors.lastDigits}
                disabled={save.isPending}
              />
            </Col>
            <Col>
              <SegmentedField
                label="De quem é"
                value={state.holderType}
                options={options(LABEL_MAPS.paymentCardHolder)}
                onChange={(value) => set("holderType", value as PaymentCardHolder)}
                disabled={save.isPending}
              />
            </Col>
            {state.holderType === "USER" && (
              <Col>
                <RemoteCombobox
                  label="Pessoa da equipe"
                  value={state.holder?.value ?? ""}
                  selectedLabel={state.holder?.label}
                  options={users.options}
                  isLoading={users.isLoading}
                  search={users.search}
                  onSearchChange={users.setSearch}
                  onChange={(option) => set("holder", option)}
                  placeholder="Escolha a pessoa"
                  searchPlaceholder="Nome ou e-mail…"
                  error={errors.holderUserId}
                />
              </Col>
            )}
            <Col md={6}>
              <FormField
                label="Acréscimo em compra internacional (%)"
                placeholder="Ex.: 4,38"
                inputMode="decimal"
                value={state.surcharge}
                onChange={(event) => set("surcharge", event.target.value)}
                error={errors.foreignSurchargePercent}
                disabled={save.isPending}
              />
            </Col>
            {card && (
              <Col>
                <CheckboxField
                  label="Ativo"
                  hint="Cartão inativo sai das opções; o que já foi pago com ele continua."
                  checked={state.active}
                  onChange={(checked) => set("active", checked)}
                  disabled={save.isPending}
                />
              </Col>
            )}
          </Row>
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={save.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Spinner className="text-primary-foreground" />}
              {card ? "Salvar" : "Cadastrar cartão"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
