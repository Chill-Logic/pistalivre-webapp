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
import { Spinner } from "@/components/atoms/spinner";
import { DateField } from "@/components/molecules/date-field";
import { MoneyField } from "@/components/molecules/money-field";
import {
  RemoteCombobox,
  type RemoteOption,
} from "@/components/molecules/remote-combobox";
import { toApiError } from "@/helpers/api-error";
import { partnerVehicleName } from "@/helpers/partner";
import { usePartnerContractVehicles } from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import { useVehicleOptions } from "@/hooks/ui/useRemoteOptions";
import type { PartnerContract, PartnerContractVehicle } from "@/types/partner";
import { todayInBrasilia } from "@/utils/date";

/** add = include a moto; edit = correct value/dates; leave = record the exit. */
type Mode = "add" | "edit" | "leave";

type Errors = {
  vehicleId?: string;
  acquisitionValue?: string;
  joinedAt?: string;
  leftAt?: string;
  form?: string;
};

type PartnerContractVehicleDialogProps = {
  contract: PartnerContract;
  mode: Mode;
  /** The moto's link (edit and leave). */
  link?: PartnerContractVehicle;
  trigger: ReactNode;
};

const TITLES: Record<Mode, string> = {
  add: "Incluir moto",
  edit: "Corrigir moto",
  leave: "Registrar saída",
};

/**
 * A moto in the partner's contract: which one, what the partner paid for it
 * and the window in which it is theirs (entry, exit). A moto sits in one open
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
      fields.vehicleId || fields.acquisitionValue || fields.joinedAt || fields.leftAt;
    setErrors({
      vehicleId: fields.vehicleId,
      acquisitionValue: fields.acquisitionValue,
      joinedAt: fields.joinedAt,
      leftAt: fields.leftAt,
      form: placed ? undefined : apiError.message,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {
      vehicleId: mode === "add" && !picked ? "Escolha a moto" : undefined,
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
    if (found.vehicleId || found.joinedAt || found.leftAt) {
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
        { vehicleId: picked?.value ?? "", acquisitionValue, joinedAt },
        { onSuccess: () => setOpen(false), onError },
      );
      return;
    }
    update.mutate(
      {
        linkId: link?.id ?? "",
        input: { acquisitionValue, joinedAt, leftAt: leftAt || null },
      },
      {
        onSuccess: done(mode === "leave" ? "Saída registrada" : "Moto atualizada"),
        onError,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogTitle>
          {link ? `${TITLES[mode]}: ${partnerVehicleName(link)}` : TITLES[mode]}
        </DialogTitle>
        <DialogDescription>
          {mode === "leave"
            ? "O parceiro mantém o histórico da moto até o dia da saída, e ela fica livre para outro contrato."
            : "O parceiro vê a moto a partir do dia da entrada (num contrato ativo)."}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          {mode === "add" && (
            <RemoteCombobox
              label="Moto"
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
              placeholder="Escolha a moto"
              searchPlaceholder="Placa, marca ou modelo…"
              error={errors.vehicleId}
            />
          )}
          {mode !== "leave" && (
            <>
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
          {(mode === "leave" || (mode === "edit" && contract.status !== "DRAFT")) && (
            <DateField
              label={mode === "leave" ? "Saída do contrato" : "Saída (opcional)"}
              value={leftAt}
              onChange={setLeftAt}
              clearable={mode === "edit"}
              placeholder="Ainda no contrato"
              error={errors.leftAt}
            />
          )}
          {mode === "leave" && errors.joinedAt && <Alert>{errors.joinedAt}</Alert>}
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={save.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Spinner className="text-primary-foreground" />}
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
