import { Plus } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
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
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { MoneyField } from "@/components/molecules/money-field";
import {
  RemoteCombobox,
  type RemoteOption,
} from "@/components/molecules/remote-combobox";
import { TextLink } from "@/components/molecules/text-link";
import { ROUTES, routeTo } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import { partnerVehicleName } from "@/helpers/partner";
import { vehicleName } from "@/helpers/vehicle";
import { usePartnerContractVehicles } from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";
import { useVehicleOptions } from "@/hooks/ui/useRemoteOptions";
import type { PartnerContract, PartnerContractVehicle } from "@/types/partner";
import { todayInBrasilia } from "@/utils/date";
import { formatPlate } from "@/utils/plate";

/** add = include a vehicle; edit = correct value/dates; leave = record the exit. */
type Mode = "add" | "edit" | "leave";

type Errors = {
  vehicleId?: string;
  acquisitionValue?: string;
  /** Weekly and/or monthly offer (one message for the pair). */
  offer?: string;
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
  /** add: open on arrival with this vehicle chosen (back from "Cadastrar"). */
  presetVehicleId?: string | null;
  /** Called once the preset was used (the page clears `?incluir=`). */
  onPresetUsed?: () => void;
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
  presetVehicleId,
  onPresetUsed,
}: PartnerContractVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<RemoteOption | null>(null);
  const [acquisitionValue, setAcquisitionValue] = useState<number | null>(null);
  // The offer per recurrence (one or both; reference values, adjustable).
  const [offerWeekly, setOfferWeekly] = useState<number | null>(null);
  const [offerMonthly, setOfferMonthly] = useState<number | null>(null);
  const [joinedAt, setJoinedAt] = useState("");
  const [leftAt, setLeftAt] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const { add, update } = usePartnerContractVehicles(contract.id);
  // Only the partner's own vehicles can enter its contract.
  const picker = useVehicleOptions({ owner: contract.partnerId });
  const newVehicleUrl = `${ROUTES.vehicleNew}?${new URLSearchParams({
    proprietario: contract.partnerId,
    titular: contract.type === "INVESTMENT" ? "empresa" : contract.partnerId,
    voltar: routeTo.partnerContract(contract.id),
  }).toString()}`;
  const preset = useVehicle(mode === "add" ? (presetVehicleId ?? "") : "");
  const [presetUsed, setPresetUsed] = useState(false);
  const presetNotified = useRef(false);
  // Tell the page once (it clears `?incluir=`), outside the render.
  useEffect(() => {
    if (!presetUsed || presetNotified.current) return;
    presetNotified.current = true;
    onPresetUsed?.();
  }, [presetUsed, onPresetUsed]);
  const inContract = contract.vehicles
    .filter((vehicle) => !vehicle.leftAt)
    .map((vehicle) => vehicle.vehicleId);
  const options = picker.options.filter(
    (option) => !inContract.includes(option.value),
  );
  const save = mode === "add" ? add : update;

  const onOpenChange = (next: boolean, initial: RemoteOption | null = null) => {
    setOpen(next);
    if (!next) return;
    const today = todayInBrasilia();
    setPicked(initial);
    setAcquisitionValue(link?.acquisitionValue ?? null);
    // Older links only have the single pair: it is the value of its recurrence.
    setOfferWeekly(
      link?.offerWeekly ??
        (link?.offerRatePeriod === "WEEKLY" ? link.offerRate : null),
    );
    setOfferMonthly(
      link?.offerMonthly ??
        (link?.offerRatePeriod === "MONTHLY" ? link.offerRate : null),
    );
    setJoinedAt(
      link?.joinedAt ??
        (today < contract.startDate ? contract.startDate : today),
    );
    setLeftAt(link?.leftAt ?? (mode === "leave" ? today : ""));
    setErrors({});
    picker.setSearch("");
  };

  // Back from "Cadastrar novo veículo": open with it chosen (once).
  if (preset.data && !presetUsed) {
    setPresetUsed(true);
    onOpenChange(true, {
      value: preset.data.id,
      label: `${formatPlate(preset.data.plate)} · ${vehicleName(preset.data)}`,
    });
  }

  const onError = (error: unknown) => {
    const apiError = toApiError(error);
    const fields = { ...apiError.fields };
    // The ownership rule (422) is about the chosen vehicle: show it there.
    if (mode === "add" && apiError.status === 422 && !fields.vehicleId) {
      const other =
        fields.acquisitionValue ||
        fields.offerWeekly ||
        fields.offerMonthly ||
        fields.offerRate ||
        fields.joinedAt;
      if (!other) fields.vehicleId = apiError.message;
    }
    const offer = fields.offerWeekly || fields.offerMonthly || fields.offerRate;
    const placed =
      fields.vehicleId ||
      fields.acquisitionValue ||
      offer ||
      fields.joinedAt ||
      fields.leftAt;
    setErrors({
      vehicleId: fields.vehicleId,
      acquisitionValue: fields.acquisitionValue,
      offer,
      joinedAt: fields.joinedAt,
      leftAt: fields.leftAt,
      form: placed ? undefined : apiError.message,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {
      vehicleId: mode === "add" && !picked ? "Escolha o veículo" : undefined,
      offer:
        mode !== "leave" && !offerWeekly && !offerMonthly
          ? "Informe o valor semanal, o mensal ou os dois"
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
      found.offer ||
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
          offerWeekly,
          offerMonthly,
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
          // "Registrar saída" resends what is saved.
          offerWeekly,
          offerMonthly,
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
      <DialogContent size={mode === "leave" ? "sm" : "lg"}>
        <DialogTitle>
          {link ? `${TITLES[mode]}: ${partnerVehicleName(link)}` : TITLES[mode]}
        </DialogTitle>
        <DialogDescription>
          {mode === "leave"
            ? "O parceiro mantém o histórico do veículo até o dia da saída, e ele fica livre para outro contrato."
            : "O parceiro vê o veículo a partir do dia da entrada (num contrato ativo)."}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          {/* Wide form: vehicle and offer in one line, value and dates in the next. */}
          <Row className="gap-y-4">
            {mode === "add" && (
              <Col lg={4} className="space-y-1">
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
                    setErrors((current) => ({
                      ...current,
                      vehicleId: undefined,
                    }));
                  }}
                  placeholder="Escolha o veículo"
                  searchPlaceholder="Placa, marca ou modelo…"
                  error={errors.vehicleId}
                  emptyContent={
                    picker.search ? (
                      "Nenhum veículo deste parceiro com essa busca."
                    ) : (
                      <Box className="space-y-2 px-3">
                        <Text size="sm">
                          Este parceiro ainda não tem veículo.
                        </Text>
                        <TextLink to={newVehicleUrl}>
                          Cadastrar novo veículo
                        </TextLink>
                      </Box>
                    )
                  }
                />
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                >
                  <Link to={newVehicleUrl}>
                    <Plus />
                    Cadastrar novo veículo
                  </Link>
                </Button>
              </Col>
            )}
            {mode !== "leave" && (
              <>
                <Col md={6} lg={4}>
                  <MoneyField
                    label="Locação semanal"
                    value={offerWeekly}
                    onChange={(value) => {
                      setOfferWeekly(value);
                      setErrors((current) => ({ ...current, offer: undefined }));
                    }}
                    error={errors.offer}
                  />
                </Col>
                <Col md={6} lg={4}>
                  <MoneyField
                    label="Locação mensal"
                    value={offerMonthly}
                    onChange={(value) => {
                      setOfferMonthly(value);
                      setErrors((current) => ({ ...current, offer: undefined }));
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Text size="sm" tone="muted">
                    Preencha um ou os dois. São valores de referência: o
                    contrato diz que podem ser reajustados, qualquer que seja a
                    recorrência.
                  </Text>
                </Col>
                <Col md={6} lg={4}>
                  <MoneyField
                    label="Valor de aquisição (opcional)"
                    value={acquisitionValue}
                    onChange={setAcquisitionValue}
                    error={errors.acquisitionValue}
                  />
                </Col>
                <Col md={6} lg={3}>
                  <DateField
                    label="Entrada no contrato"
                    value={joinedAt}
                    onChange={setJoinedAt}
                    error={errors.joinedAt}
                  />
                </Col>
              </>
            )}
            {(mode === "leave" ||
              (mode === "edit" && contract.status !== "DRAFT")) && (
              <Col {...(mode === "leave" ? {} : { md: 6, lg: 3 })}>
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
              </Col>
            )}
          </Row>
          {mode === "leave" &&
            (errors.joinedAt || errors.offer) && (
              <Alert>{errors.joinedAt || errors.offer}</Alert>
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
