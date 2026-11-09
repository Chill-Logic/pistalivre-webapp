import { CirclePlay, CircleStop } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
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
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { DateField } from "@/components/molecules/date-field";
import { PartnerContractStatusBadge } from "@/components/molecules/partner-contract-status-badge";
import { errorMessage, toApiError } from "@/helpers/api-error";
import { contractInputOf, currentVehicles } from "@/helpers/partner";
import { useUpdatePartnerContract } from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import { usePartnerContractProposals } from "@/hooks/api/gestao/partners/usePartners";
import type { PartnerContract } from "@/types/partner";
import { todayInBrasilia } from "@/utils/date";
import { formatCalendarDate } from "@/utils/format";
import { pluralize } from "@/utils/text";

/**
 * Draft → Ativar (needs a vehicle and the partner's acceptance of a version
 * with exactly these terms) → Encerrar (needs the end day). Of a draft the
 * partner only sees the proposal; once active, the terms are locked.
 */
export function PartnerContractStatusCard({
  contract,
}: {
  contract: PartnerContract;
}) {
  const update = useUpdatePartnerContract(contract.id);
  const [activateOpen, setActivateOpen] = useState(false);
  const isDraft = contract.status === "DRAFT";
  const proposals = usePartnerContractProposals(isDraft ? contract.id : "");
  const hasVehicles = contract.vehicles.length > 0;
  const accepted = Boolean(proposals.data?.acceptedMatchesTerms);
  const canActivate = hasVehicles && accepted;

  const activate = () =>
    update.mutate(contractInputOf(contract, { status: "ACTIVE" }), {
      onSuccess: () => {
        toast.success("Contrato ativado");
        setActivateOpen(false);
      },
      onError: (error) => toast.error(errorMessage(error)),
    });

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Situação</CardTitle>
        <PartnerContractStatusBadge status={contract.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        {contract.status === "DRAFT" && (
          <>
            <Text tone="muted">
              Rascunho: o parceiro vê só a proposta enviada. Com o aceite dele,
              ative o contrato.
            </Text>
            {!hasVehicles ? (
              <Text size="xs" tone="muted">
                Para ativar, inclua ao menos um veículo.
              </Text>
            ) : (
              !proposals.isPending &&
              !accepted && (
                <Text size="xs" tone="muted">
                  Para ativar, o parceiro precisa aceitar a proposta com estes
                  termos.
                </Text>
              )
            )}
            <ConfirmDialog
              open={activateOpen}
              onOpenChange={setActivateOpen}
              trigger={
                <Button className="w-full sm:w-auto" disabled={!canActivate}>
                  <CirclePlay />
                  Ativar contrato
                </Button>
              }
              title={`Ativar ${contract.code}?`}
              description={`O parceiro passa a ver ${contract.vehicles.length === 1 ? "o veículo" : `os ${contract.vehicles.length} veículos`} deste contrato na área dele, desde o dia em que cada um entrou. Depois de ativo, um veículo só sai registrando a saída.`}
              confirmLabel="Ativar"
              isPending={update.isPending}
              onConfirm={activate}
            />
          </>
        )}
        {contract.status === "ACTIVE" && (
          <>
            <Text tone="muted">
              Ativo com{" "}
              {pluralize(
                currentVehicles(contract).length,
                "veículo",
                "veículos",
              )}
              . O parceiro acompanha as locações na área dele. Os termos estão
              travados: um veículo novo entra num contrato novo.
            </Text>
            <EndContractDialog contract={contract} />
          </>
        )}
        {contract.status === "ENDED" && (
          <Text tone="muted">
            Encerrado
            {contract.endDate && ` em ${formatCalendarDate(contract.endDate)}`}.
            O parceiro continua vendo o histórico até essa data.
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

function EndContractDialog({ contract }: { contract: PartnerContract }) {
  const update = useUpdatePartnerContract(contract.id);
  const [open, setOpen] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<{ endDate?: string; form?: string }>({});

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setEndDate(contract.endDate ?? todayInBrasilia());
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!endDate) {
      setErrors({ endDate: "Informe o fim" });
      return;
    }
    if (endDate < contract.startDate) {
      setErrors({ endDate: "O fim vem antes do início" });
      return;
    }
    setErrors({});
    update.mutate(contractInputOf(contract, { status: "ENDED", endDate }), {
      onSuccess: () => {
        toast.success("Contrato encerrado");
        setOpen(false);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        setErrors({
          endDate: apiError.fields?.endDate,
          form: apiError.fields?.endDate ? undefined : apiError.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <CircleStop />
          Encerrar contrato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Encerrar {contract.code}?</DialogTitle>
        <DialogDescription>
          O parceiro continua vendo o histórico dos veículos até o dia do fim, e
          elas ficam livres para outro contrato.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <DateField
            label="Fim do contrato"
            value={endDate}
            onChange={setEndDate}
            error={errors.endDate}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={update.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={update.isPending}
            >
              {update.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Encerrar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function PartnerContractStatusCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <Skeleton shape="text" className="w-20 text-base" />
        <Skeleton shape="pill" className="h-5 w-16" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Box className="space-y-2">
          <Skeleton shape="text" className="w-full text-sm" />
          <Skeleton shape="text" className="w-2/3 text-sm" />
        </Box>
        <Skeleton className="h-11 w-40 md:h-9" />
      </CardContent>
    </Card>
  );
}
