import { Car, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { TextLink } from "@/components/molecules/text-link";
import { PartnerContractVehicleDialog } from "@/components/organisms/partner-contract-vehicle-dialog";
import { routeTo } from "@/constants/routes";
import { offerRateText } from "@/helpers/partner";
import { usePartnerContractVehicles } from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import type { PartnerContract } from "@/types/partner";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

/**
 * The contract's vehicles with the window each is the partner's. Draft: include,
 * correct, remove (a mistake). Active (terms locked): only record the exit — a
 * new vehicle is a new contract. Ended: read only.
 */
export function PartnerContractVehiclesCard({
  contract,
}: {
  contract: PartnerContract;
}) {
  const { remove } = usePartnerContractVehicles(contract.id);
  const isDraft = contract.status === "DRAFT";
  const isEnded = contract.status === "ENDED";
  const ordered = [...contract.vehicles].sort(
    (a, b) =>
      Number(Boolean(a.leftAt)) - Number(Boolean(b.leftAt)) ||
      a.joinedAt.localeCompare(b.joinedAt),
  );

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">
          Veículos
          {contract.vehicles.length > 0 && (
            <Text inline size="sm" tone="muted" weight="normal">
              {" "}
              ({contract.vehicles.length})
            </Text>
          )}
        </CardTitle>
        {isDraft && (
          <PartnerContractVehicleDialog
            contract={contract}
            mode="add"
            trigger={
              <Button size="sm">
                <Plus />
                Incluir veículo
              </Button>
            }
          />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {contract.status === "ACTIVE" && (
          <Text size="xs" tone="muted">
            Contrato ativo: os veículos não mudam mais. Um veículo novo entra
            num contrato novo.
          </Text>
        )}
        {ordered.length === 0 ? (
          <EmptyState
            icon={Car}
            title="Nenhum veículo"
            description="Inclua os veículos do parceiro para ativar o contrato."
          />
        ) : (
          <List className="divide-y">
            {ordered.map((link) => {
              const plate = link.plate
                ? formatPlate(link.plate)
                : "Veículo removido";
              const offer = offerRateText(link.offerRate, link.offerRatePeriod);
              return (
                <ListItem
                  key={link.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Box className="min-w-0 space-y-1">
                    <Box className="flex flex-wrap items-center gap-2">
                      <Text weight="semibold">
                        <TextLink to={routeTo.vehicle(link.vehicleId)}>
                          {plate}
                        </TextLink>
                      </Text>
                      {link.leftAt && <Badge variant="outline">Saiu</Badge>}
                    </Box>
                    {link.label && (
                      <Text size="xs" tone="muted" truncate>
                        {link.label}
                      </Text>
                    )}
                    <Text size="sm" className="tabular-nums">
                      {offer ? (
                        <>
                          <Text inline size={null} tone="muted">
                            Locação oferecida{" "}
                          </Text>
                          <Text
                            inline
                            size={null}
                            weight="semibold"
                            className="whitespace-nowrap"
                          >
                            {offer}
                          </Text>
                        </>
                      ) : (
                        <Text inline size={null} tone="destructive">
                          Locação oferecida não informada
                        </Text>
                      )}
                    </Text>
                    <Text size="xs" tone="muted" className="tabular-nums">
                      Entrou em {formatCalendarDate(link.joinedAt)}
                      {link.leftAt &&
                        ` · saiu em ${formatCalendarDate(link.leftAt)}`}
                      {link.acquisitionValue !== null &&
                        ` · aquisição ${formatCurrency(link.acquisitionValue)}`}
                    </Text>
                  </Box>
                  {!isEnded && (
                    <Box className="-ml-2 flex shrink-0 flex-wrap items-center gap-1 sm:ml-0">
                      {isDraft && (
                        <PartnerContractVehicleDialog
                          contract={contract}
                          mode="edit"
                          link={link}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Corrigir ${plate}`}
                            >
                              <Pencil />
                              Corrigir
                            </Button>
                          }
                        />
                      )}
                      {!isDraft && !link.leftAt && (
                        <PartnerContractVehicleDialog
                          contract={contract}
                          mode="leave"
                          link={link}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <LogOut />
                              Registrar saída
                            </Button>
                          }
                        />
                      )}
                      {isDraft && (
                        <ConfirmDialog
                          destructive
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 />
                              Remover
                            </Button>
                          }
                          title={`Remover ${plate} do contrato?`}
                          description="O contrato ainda é rascunho, então o veículo sai sem deixar histórico."
                          confirmLabel="Remover"
                          isPending={
                            remove.isPending && remove.variables === link.id
                          }
                          onConfirm={() => remove.mutate(link.id)}
                        />
                      )}
                    </Box>
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export function PartnerContractVehiclesCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <Skeleton shape="text" className="w-16 text-base" />
        <Skeleton className="h-9 w-32 md:h-8" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1].map((index) => (
          <Box key={index} className="space-y-2">
            <Skeleton shape="text" className="w-24 text-sm" />
            <Skeleton shape="text" className="w-48 text-xs" />
            <Skeleton shape="text" className="w-52 text-sm" />
            <Skeleton shape="text" className="w-56 text-xs" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
