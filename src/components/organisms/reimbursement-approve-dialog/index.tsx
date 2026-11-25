import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { CreatableCombobox } from "@/components/molecules/creatable-combobox";
import { DateField } from "@/components/molecules/date-field";
import { EmptyState } from "@/components/molecules/empty-state";
import { FormField } from "@/components/molecules/form-field";
import { MaintenanceCandidateOption } from "@/components/molecules/maintenance-candidate-option";
import { MoneyField } from "@/components/molecules/money-field";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useApproveReimbursement } from "@/hooks/api/gestao/reimbursements/useApproveReimbursement";
import { useReimbursementMaintenanceCandidates } from "@/hooks/api/gestao/reimbursements/useReimbursementMaintenanceCandidates";
import { useMaintenanceProviders } from "@/hooks/api/gestao/maintenances/useMaintenanceProviders";
import { useLabels } from "@/hooks/ui/useLabels";
import { useVehicleOptions } from "@/hooks/ui/useRemoteOptions";
import { Wrench } from "lucide-react";
import type {
  ReimbursementApprovalLink,
  StaffReimbursement,
} from "@/types/staff-reimbursement";
import { todayInBrasilia } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

type Mode = ReimbursementApprovalLink["mode"];

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "EXISTING", label: "Já registrada" },
  { value: "NEW", label: "Registrar agora" },
  { value: "NONE", label: "Não é manutenção" },
];

type NewMaintenance = {
  vehicleId: string;
  vehicleLabel: string;
  type: string;
  performedAt: string;
  services: string[];
  mileage: string;
  cost: number | null;
  provider: string;
  description: string;
};

type Errors = {
  maintenanceId?: string;
  vehicleId?: string;
  performedAt?: string;
  services?: string;
  mileage?: string;
  reason?: string;
  paidAt?: string;
  paidAmount?: string;
  form?: string;
};

/**
 * Approving says what the refund pays: a maintenance already registered,
 * one registered now from the request (its receipts go along) or "not a
 * maintenance", with the reason. Nothing is sent: if the pix was already
 * made by hand, "Já paguei por fora" records it in the same step.
 */
export function ReimbursementApproveDialog({
  reimbursement,
}: {
  reimbursement: StaffReimbursement;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("NEW");
  const [modeTouched, setModeTouched] = useState(false);
  const [maintenanceId, setMaintenanceId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NewMaintenance>(() =>
    newDraft(reimbursement),
  );
  const [reason, setReason] = useState("");
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [paidAt, setPaidAt] = useState("");
  const [paidAmount, setPaidAmount] = useState<number | null>(
    reimbursement.amount,
  );
  const [paidNote, setPaidNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const approve = useApproveReimbursement(reimbursement.id);
  const candidates = useReimbursementMaintenanceCandidates(
    reimbursement.id,
    open,
  );
  const providers = useMaintenanceProviders();
  const vehicles = useVehicleOptions();
  const { options } = useLabels();
  const list = candidates.data?.candidates ?? [];
  const suggested = list.find((c) => c.match === "exact") ?? list.find((c) => c.match);
  const vehicleFixed = Boolean(reimbursement.vehicle);

  // The likely maintenance is picked for the person (they can change it).
  if (open && !modeTouched && suggested && maintenanceId === null) {
    setMode("EXISTING");
    setMaintenanceId(suggested.id);
  }

  const onOpenChange = (next: boolean) => {
    if (approve.isPending) return;
    setOpen(next);
    if (!next) return;
    setMode("NEW");
    setModeTouched(false);
    setMaintenanceId(null);
    setDraft(newDraft(reimbursement));
    setReason("");
    setAlreadyPaid(false);
    setPaidAt(todayInBrasilia());
    setPaidAmount(reimbursement.amount);
    setPaidNote("");
    setErrors({});
  };

  const patch = (next: Partial<NewMaintenance>) => {
    setDraft((current) => ({ ...current, ...next }));
    setErrors({});
  };

  const toggleService = (code: string, checked: boolean) =>
    patch({
      services: checked
        ? [...draft.services, code]
        : draft.services.filter((c) => c !== code),
    });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    let link: ReimbursementApprovalLink | null = null;
    if (mode === "EXISTING") {
      if (!maintenanceId) next.maintenanceId = "Escolha a manutenção que este reembolso paga";
      else link = { mode, maintenanceId };
    } else if (mode === "NONE") {
      if (reason.trim().length < 3) next.reason = "Diga por que não é manutenção";
      else link = { mode, reason: reason.trim() };
    } else {
      if (!vehicleFixed && !draft.vehicleId) next.vehicleId = "Escolha o veículo";
      if (!draft.performedAt) next.performedAt = "Informe a data da manutenção";
      else if (draft.performedAt > todayInBrasilia()) {
        next.performedAt = "A data não pode ser no futuro";
      }
      if (draft.services.length === 0) next.services = "Marque ao menos um serviço";
      if (draft.mileage && !/^\d+$/.test(draft.mileage)) next.mileage = "Só números";
      link = {
        mode,
        maintenance: {
          ...(vehicleFixed ? {} : { vehicleId: draft.vehicleId }),
          type: draft.type,
          performedAt: draft.performedAt,
          services: draft.services,
          mileage: draft.mileage ? Number(draft.mileage) : null,
          cost: draft.cost,
          provider: draft.provider.trim() || null,
          description: draft.description.trim() || null,
        },
      };
    }
    if (alreadyPaid) {
      if (!paidAt) next.paidAt = "Informe a data do pagamento";
      else if (paidAt > todayInBrasilia()) next.paidAt = "A data não pode ser no futuro";
      if (!paidAmount || paidAmount <= 0) next.paidAmount = "Informe o valor pago";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !link) return;

    approve.mutate(
      {
        link,
        paid:
          alreadyPaid && paidAmount
            ? { paidAt, paidAmount, note: paidNote.trim() || null }
            : null,
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          const known = {
            maintenanceId: fields.maintenanceId,
            vehicleId: fields.vehicleId,
            performedAt: fields.performedAt,
            services: fields.services,
            mileage: fields.mileage,
            reason: fields.reason,
          };
          const anyField = Object.values(known).some(Boolean);
          setErrors({ ...known, form: anyField ? undefined : apiError.message });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Check />
          Aprovar
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogTitle>Aprovar reembolso</DialogTitle>
        <DialogDescription>
          {formatCurrency(reimbursement.amount)} para {reimbursement.customer.name}
          {reimbursement.vehicle ? ` · veículo ${reimbursement.vehicle.plate}` : ""}.
          Diga qual manutenção este reembolso paga. O sistema não envia o pix:
          ele é feito por fora.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-6">
          <SegmentedField
            label="O que este reembolso paga"
            value={mode}
            options={MODE_OPTIONS}
            onChange={(value) => {
              setMode(value as Mode);
              setModeTouched(true);
              setErrors({});
            }}
            disabled={approve.isPending}
          />

          {mode === "EXISTING" && (
            <Box className="space-y-2">
              {candidates.isPending && (
                <Box className="space-y-2" aria-busy>
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </Box>
              )}
              {candidates.isError && (
                <Alert>Não deu para carregar as manutenções do veículo.</Alert>
              )}
              {candidates.data && list.length === 0 && (
                <EmptyState
                  icon={Wrench}
                  title="Nenhuma manutenção sem reembolso perto desta data"
                  description="Use “Registrar agora” para criar a manutenção com os dados e anexos do pedido."
                />
              )}
              {list.map((candidate) => (
                <MaintenanceCandidateOption
                  key={candidate.id}
                  candidate={candidate}
                  selected={maintenanceId === candidate.id}
                  onSelect={() => {
                    setMaintenanceId(candidate.id);
                    setModeTouched(true);
                    setErrors({});
                  }}
                  disabled={approve.isPending}
                />
              ))}
              {errors.maintenanceId && (
                <Text size="xs" tone="destructive">
                  {errors.maintenanceId}
                </Text>
              )}
            </Box>
          )}

          {mode === "NEW" && (
            <Box className="space-y-4">
              <Text size="xs" tone="muted">
                Os anexos do pedido (recibos, fotos) vão junto para a
                manutenção, registrada como paga pelo cliente.
              </Text>
              <Row className="gap-y-4">
                <Col md={6} lg={3}>
                  {vehicleFixed ? (
                    <Box className="space-y-1">
                      <Text size="sm" weight="medium">
                        Veículo
                      </Text>
                      <Text>{reimbursement.vehicle?.plate}</Text>
                      {reimbursement.rental && (
                        <Text size="xs" tone="muted">
                          Locação {reimbursement.rental.code}
                        </Text>
                      )}
                    </Box>
                  ) : (
                    <RemoteCombobox
                      label="Veículo"
                      value={draft.vehicleId}
                      selectedLabel={draft.vehicleLabel}
                      options={vehicles.options}
                      isLoading={vehicles.isLoading}
                      search={vehicles.search}
                      onSearchChange={vehicles.setSearch}
                      onChange={(option) =>
                        patch({ vehicleId: option.value, vehicleLabel: option.label })
                      }
                      placeholder="Selecione o veículo"
                      searchPlaceholder="Buscar por placa, marca ou modelo…"
                      error={errors.vehicleId}
                    />
                  )}
                </Col>
                <Col md={6} lg={3}>
                  <SelectField
                    label="Tipo"
                    value={draft.type}
                    onChange={(type) => patch({ type })}
                    options={options(LABEL_MAPS.maintenanceType)}
                  />
                </Col>
                <Col md={6} lg={3}>
                  <DateField
                    label="Data da manutenção"
                    value={draft.performedAt}
                    onChange={(performedAt) => patch({ performedAt })}
                    error={errors.performedAt}
                  />
                </Col>
                <Col md={6} lg={3}>
                  <MoneyField
                    label="Valor"
                    value={draft.cost}
                    onChange={(cost) => patch({ cost })}
                  />
                </Col>
                <Col md={6} lg={3}>
                  <FormField
                    label="Quilometragem (km)"
                    inputMode="numeric"
                    placeholder="Opcional"
                    value={draft.mileage}
                    onChange={(event) => patch({ mileage: event.target.value })}
                    error={errors.mileage}
                  />
                </Col>
                <Col md={6} lg={9}>
                  <CreatableCombobox
                    label="Oficina / prestador"
                    value={draft.provider}
                    onChange={(provider) => patch({ provider })}
                    options={(providers.data ?? []).map((name) => ({
                      value: name,
                      label: name,
                    }))}
                    placeholder="Selecione ou digite"
                    searchPlaceholder="Buscar ou digitar a oficina…"
                  />
                </Col>
              </Row>
              <Box className="space-y-2">
                <Heading level={3} variant="section">
                  Serviços realizados
                </Heading>
                <Row className="gap-y-3">
                  {options(LABEL_MAPS.maintenanceService).map((service) => (
                    <Col key={service.value} md={6} lg={4}>
                      <CheckboxField
                        label={service.label}
                        checked={draft.services.includes(service.value)}
                        onChange={(checked) => toggleService(service.value, checked)}
                        disabled={approve.isPending}
                      />
                    </Col>
                  ))}
                </Row>
                {errors.services && (
                  <Text size="xs" tone="destructive">
                    {errors.services}
                  </Text>
                )}
              </Box>
              <TextareaField
                label="Descrição"
                value={draft.description}
                onChange={(event) => patch({ description: event.target.value })}
                disabled={approve.isPending}
              />
            </Box>
          )}

          {mode === "NONE" && (
            <TextareaField
              label="Por que não é manutenção"
              placeholder="Ex.: reembolso da taxa do documento do veículo"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setErrors({});
              }}
              error={errors.reason}
              disabled={approve.isPending}
            />
          )}

          <Box className="space-y-4 border-t pt-4">
            <CheckboxField
              label="Já paguei por fora"
              hint="Marque se o pix já foi feito no Asaas ou no banco: o pedido vai direto para pago."
              checked={alreadyPaid}
              onChange={(checked) => {
                setAlreadyPaid(checked);
                setErrors({});
              }}
              disabled={approve.isPending}
            />
            {alreadyPaid && (
              <Row className="gap-y-4">
                <Col md={6} lg={3}>
                  <DateField
                    label="Data do pagamento"
                    value={paidAt}
                    onChange={setPaidAt}
                    error={errors.paidAt}
                  />
                </Col>
                <Col md={6} lg={3}>
                  <MoneyField
                    label="Valor pago"
                    value={paidAmount}
                    onChange={setPaidAmount}
                    error={errors.paidAmount}
                  />
                </Col>
                <Col lg={6}>
                  <FormField
                    label="Observação (opcional)"
                    placeholder="Ex.: pago pelo Inter"
                    value={paidNote}
                    onChange={(event) => setPaidNote(event.target.value)}
                  />
                </Col>
              </Row>
            )}
          </Box>

          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={approve.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={approve.isPending}>
              {approve.isPending && <Spinner className="text-primary-foreground" />}
              {alreadyPaid ? "Aprovar e marcar como pago" : "Aprovar"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** The new maintenance starts from the request: its day, value and reason. */
function newDraft(reimbursement: StaffReimbursement): NewMaintenance {
  return {
    vehicleId: reimbursement.vehicle?.id ?? "",
    vehicleLabel: reimbursement.vehicle?.plate ?? "",
    type: "CORRECTIVE",
    performedAt: todayInBrasilia(new Date(reimbursement.createdAt)),
    services: [],
    mileage: "",
    cost: reimbursement.amount,
    provider: "",
    description: reimbursement.reason,
  };
}
