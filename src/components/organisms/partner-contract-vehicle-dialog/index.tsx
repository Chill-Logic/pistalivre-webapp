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
import { MoneyField } from "@/components/molecules/money-field";
import { SegmentedField } from "@/components/molecules/segmented-field";
import {
  RemoteCombobox,
  type RemoteOption,
} from "@/components/molecules/remote-combobox";
import { LABEL_MAPS } from "@/constants/label-maps";
import { PARTNER_OFFER_RATE_PERIODS } from "@/constants/partner";
import { toApiError } from "@/helpers/api-error";
import { partnerVehicleName } from "@/helpers/partner";
import { usePartnerContractVehicles } from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import { useLabels } from "@/hooks/ui/useLabels";
import { useVehicleOptions } from "@/hooks/ui/useRemoteOptions";
import type {
  PartnerContract,
  PartnerContractVehicle,
  PartnerOfferRatePeriod,
} from "@/types/partner";
import { todayInBrasilia } from "@/utils/date";

/** add = include a vehicle; edit = correct value/dates; leave = record the exit. */
type Mode = "add" | "edit" | "leave";

type Errors = {
  vehicleId?: string;
  acquisitionValue?: string;
  offerRate?: string;
  offerRatePeriod?: string;
  joinedAt?: string;
  leftAt?: string;
  form?: string;
};

type PartnerContractVehicleDialogProps = {
  contract: PartnerContract;
  mode: Mode;
  /** The vehicle's link (edit and leave). */
  link?: PartnerContractVehicle;
  trigger: ReactNode;
};

const TITLES: Record<Mode, string> = {
  add: "Incluir veículo",
  edit: "Corrigir veículo",
  leave: "Registrar saída",
};

/**
 * A vehicle in the partner's contract: which one, what the partner paid for it,
 * the rent the company intends to offer (value + period) and the window in which it is theirs (entry, exit). A vehicle sits in one open
 * contract at a time (409 on the picker).
 */
export function PartnerContractVehicleDialog({
  contract,
  mode,
  link,
  trigger,
}: PartnerContractVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<RemoteOption | null>(null);
  const [acquisitionValue, setAcquisitionValue] = useState<number | null>(null);
  const [offerRate, setOfferRate] = useState<number | null>(null);
  const [offerRatePeriod, setOfferRatePeriod] = useState<
    PartnerOfferRatePeriod | ""
  >("");
  const { label } = useLabels();
  const periodOptions = PARTNER_OFFER_RATE_PERIODS.map((period) => ({
    value: period,
    label: label(LABEL_MAPS.ratePeriod, period),
  }));
  const [joinedAt, setJoinedAt] = useState("");
  const [leftAt, setLeftAt] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const { add, update } = usePartnerContractVehicles(contract.id);
  const picker = useVehicleOptions();
  const inContract = contract.vehicles
    .filter((vehicle) => !vehicle.leftAt)
    .map((vehicle) => vehicle.vehicleId);
  const options = picker.options.filter(
    (option) => !inContract.includes(option.value),
  );
  const save = mode === "add" ? add : update;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    const today = todayInBrasilia();
    setPicked(null);
    setAcquisitionValue(link?.acquisitionValue ?? null);
    setOfferRate(link?.offerRate ?? null);
    // Motofrete rents by the week: the common case when nothing was saved.
    setOfferRatePeriod(link?.offerRatePeriod ?? "WEEKLY");
    setJoinedAt(
      link?.joinedAt ??
        (today < contract.startDate ? contract.startDate : today),
    );
    setLeftAt(link?.leftAt ?? (mode === "leave" ? today : ""));
    setErrors({});
    picker.setSearch("");
  };

  const onError = (error: unknown) => {
    const apiError = toApiError(error);
    const fields = apiError.fields ?? {};
    const placed =
      fields.vehicleId ||
      fields.acquisitionValue ||
      fields.offerRate ||
      fields.offerRatePeriod ||
      fields.joinedAt ||
      fields.leftAt;
    setErrors({
      vehicleId: fields.vehicleId,
      acquisitionValue: fields.acquisitionValue,
      offerRate: fields.offerRate,
      offerRatePeriod: fields.offerRatePeriod,
      joinedAt: fields.joinedAt,
      leftAt: fields.leftAt,
      form: placed ? undefined : apiError.message,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {
      vehicleId: mode === "add" && !picked ? "Escolha o veículo" : undefined,
      offerRate:
        mode !== "leave" && !offerRate
          ? "Informe por quanto a locação será oferecida"
          : undefined,
      offerRatePeriod:
        mode !== "leave" && !offerRatePeriod
          ? "Escolha a recorrência"
          : undefined,
      joinedAt: !joinedAt
        ? "Informe a entrada"
        : joinedAt < contract.startDate
          ? "Antes do início do contrato"
          : undefined,
      leftAt:
        mode === "leave" && !leftAt
          ? "Informe a saída"
          : leftAt && joinedAt && leftAt < joinedAt
            ? "Antes da entrada"
            : undefined,
    };
    if (
      found.vehicleId ||
      found.offerRate ||
      found.offerRatePeriod ||
      found.joinedAt ||
      found.leftAt
    ) {
      setErrors(found);
      return;
    }
    setErrors({});
    const done = (message: string) => () => {
      toast.success(message);
      setOpen(false);
    };

    if (mode === "add") {
      add.mutate(
        {
          vehicleId: picked?.value ?? "",
          acquisitionValue,
          offerRate: offerRate ?? 0,
          offerRatePeriod: offerRatePeriod || "WEEKLY",
          joinedAt,
        },
        { onSuccess: () => setOpen(false), onError },
      );
      return;
    }
    update.mutate(
      {
        linkId: link?.id ?? "",
        input: {
          acquisitionValue,
          // "Registrar saída" resends what is saved (old links may lack it).
          offerRate: offerRate ?? 0,
          offerRatePeriod: offerRatePeriod || "WEEKLY",
          joinedAt,
          leftAt: leftAt || null,
        },
      },
      {
        onSuccess: done(
          mode === "leave" ? "Saída registrada" : "Veículo atualizado",
        ),
        onError,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>
          {link ? `${TITLES[mode]}: ${partnerVehicleName(link)}` : TITLES[mode]}
        </DialogTitle>
        <DialogDescription>
          {mode === "leave"
            ? "O parceiro mantém o histórico do veículo até o dia da saída, e ele fica livre para outro contrato."
            : "O parceiro vê o veículo a partir do dia da entrada (num contrato ativo)."}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          {mode === "add" && (
            <RemoteCombobox
              label="Veículo"
              value={picked?.value ?? ""}
              selectedLabel={picked?.label}
              options={options}
              isLoading={picker.isLoading}
              search={picker.search}
              onSearchChange={picker.setSearch}
              onChange={(option) => {
                setPicked(option);
                setErrors((current) => ({ ...current, vehicleId: undefined }));
              }}
              placeholder="Escolha o veículo"
              searchPlaceholder="Placa, marca ou modelo…"
              error={errors.vehicleId}
            />
          )}
          {mode !== "leave" && (
            <>
              <Row className="gap-y-4">
                <Col sm={5}>
                  <MoneyField
                    label="Locação oferecida"
                    value={offerRate}
                    onChange={(value) => {
                      setOfferRate(value);
                      setErrors((current) => ({
                        ...current,
                        offerRate: undefined,
                      }));
                    }}
                    error={errors.offerRate}
                  />
                </Col>
                <Col sm={7}>
                  <SegmentedField
                    label="Recorrência"
                    value={offerRatePeriod}
                    options={periodOptions}
                    onChange={(value) => {
                      setOfferRatePeriod(value as PartnerOfferRatePeriod);
                      setErrors((current) => ({
                        ...current,
                        offerRatePeriod: undefined,
                      }));
                    }}
                    error={errors.offerRatePeriod}
                  />
                </Col>
              </Row>
              <MoneyField
                label="Valor de aquisição (opcional)"
                value={acquisitionValue}
                onChange={setAcquisitionValue}
                error={errors.acquisitionValue}
              />
              <DateField
                label="Entrada no contrato"
                value={joinedAt}
                onChange={setJoinedAt}
                error={errors.joinedAt}
              />
            </>
          )}
          {(mode === "leave" ||
            (mode === "edit" && contract.status !== "DRAFT")) && (
            <DateField
              label={
                mode === "leave" ? "Saída do contrato" : "Saída (opcional)"
              }
              value={leftAt}
              onChange={setLeftAt}
              clearable={mode === "edit"}
              placeholder="Ainda no contrato"
              error={errors.leftAt}
            />
          )}
          {mode === "leave" &&
            (errors.joinedAt || errors.offerRate || errors.offerRatePeriod) && (
              <Alert>
                {errors.joinedAt || errors.offerRate || errors.offerRatePeriod}
              </Alert>
            )}
          {errors.form && <Alert>{errors.form}</Alert>}
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
              {mode === "add"
                ? "Incluir"
                : mode === "leave"
                  ? "Registrar saída"
                  : "Salvar"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
