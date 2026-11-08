import { Unlink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { MoneyInput } from "@/components/molecules/money-input";
import { TextLink } from "@/components/molecules/text-link";
import { VehicleSupplierDialog } from "@/components/organisms/vehicle-supplier-dialog";
import { routeTo } from "@/constants/routes";
import { errorMessage } from "@/helpers/api-error";
import { useVehicleSupplierLinks } from "@/hooks/api/gestao/vehicles/useVehicleSupplierLinks";
import type { VehicleSupplierLink } from "@/types/vehicle";

type VehicleSuppliersCardProps = {
  vehicleId: string;
  links: VehicleSupplierLink[];
};

/**
 * "Custos fixos do veículo": the VEHICLE-scope fixed costs linked to it,
 * each with its amount per month (what the projection counts), editable in
 * place; link a new one or unlink.
 */
export function VehicleSuppliersCard({
  vehicleId,
  links,
}: VehicleSuppliersCardProps) {
  return (
    <CollapsibleCard
      title="Custos fixos do veículo"
      count={links.length}
      storageKey="vehicle-suppliers"
      actions={
        <VehicleSupplierDialog
          vehicleId={vehicleId}
          linkedSupplierIds={links.map((link) => link.supplier.id)}
        />
      }
    >
      {links.length === 0 ? (
        <Text tone="muted">
          Nenhum custo fixo vinculado. Rastreador, seguro e afins entram aqui,
          com o valor por mês deste veículo.
        </Text>
      ) : (
        <List className="divide-y">
          {links.map((link) => (
            <VehicleSupplierRow
              key={`${link.linkId}-${link.monthlyAmount}`}
              vehicleId={vehicleId}
              link={link}
            />
          ))}
        </List>
      )}
    </CollapsibleCard>
  );
}

/** One linked fixed cost: name, amount per month (edit + save), unlink. */
function VehicleSupplierRow({
  vehicleId,
  link,
}: {
  vehicleId: string;
  link: VehicleSupplierLink;
}) {
  const { save, unlink } = useVehicleSupplierLinks(vehicleId);
  const [amount, setAmount] = useState<number | null>(link.monthlyAmount);
  const name = link.supplier.name;
  const changed = amount !== link.monthlyAmount;

  const onSave = () => {
    if (amount === null || amount < 0) {
      toast.error("Informe o valor por mês");
      return;
    }
    save.mutate(
      { supplierId: link.supplier.id, monthlyAmount: amount },
      {
        onSuccess: () => toast.success("Valor atualizado"),
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  };

  return (
    <ListItem className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <Box className="min-w-0 flex-1 basis-40">
        <Text weight="medium" className="break-words">
          <TextLink to={routeTo.supplier(link.supplier.id)}>{name}</TextLink>
        </Text>
        {!link.active && (
          <Badge variant="outline" className="mt-1">
            Inativo
          </Badge>
        )}
      </Box>
      <Box className="flex items-center gap-1">
        <MoneyInput
          label={`Valor por mês de ${name}`}
          value={amount}
          onChange={setAmount}
          className="h-9 w-32 md:h-9"
        />
        <Text size="xs" tone="muted" className="mr-1">
          / mês
        </Text>
        <Button
          size="sm"
          variant={changed ? "default" : "outline"}
          disabled={!changed || save.isPending}
          onClick={onSave}
        >
          {save.isPending && <Spinner className="text-primary-foreground" />}
          Salvar
        </Button>
        <ConfirmDialog
          destructive
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label={`Desvincular ${name}`}
            >
              <Unlink />
            </Button>
          }
          title={`Desvincular ${name}?`}
          description="Este custo fixo deixa de contar para o veículo na projeção."
          confirmLabel="Desvincular"
          isPending={unlink.isPending}
          onConfirm={() => unlink.mutate(link.supplier.id)}
        />
      </Box>
    </ListItem>
  );
}

export function VehicleSuppliersCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-48 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y">
          {Array.from({ length: 2 }, (_, index) => (
            <Box
              key={index}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3"
            >
              <Skeleton shape="text" className="w-40 flex-1 basis-40 text-sm" />
              <Box className="flex items-center gap-1">
                <Skeleton className="h-9 w-32" />
                <Skeleton shape="text" className="w-8 text-xs" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="size-9" />
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
