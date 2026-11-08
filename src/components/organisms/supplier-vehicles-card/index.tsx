import { CarFront, Link2, Pencil, Plus, Unlink } from "lucide-react";
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
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { TextLink } from "@/components/molecules/text-link";
import { SupplierPropagateDialog } from "@/components/organisms/supplier-propagate-dialog";
import { SupplierVehicleDialog } from "@/components/organisms/supplier-vehicle-dialog";
import { routeTo } from "@/constants/routes";
import { useSupplierVehicles } from "@/hooks/api/gestao/suppliers/useSupplierVehicles";
import type { SupplierVehicleLink } from "@/types/supplier";
import { formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

type SupplierVehiclesCardProps = {
  supplierId: string;
  /** The supplier's base amount: suggested for new links and propagation. */
  baseAmount: number;
  links: SupplierVehicleLink[];
};

/**
 * Linked vehicles with the amount PER vehicle (what the projection counts):
 * link, change the amount, unlink, or propagate one amount to many.
 */
export function SupplierVehiclesCard({
  supplierId,
  baseAmount,
  links,
}: SupplierVehiclesCardProps) {
  const { unlink } = useSupplierVehicles(supplierId);
  const linkedIds = links.map((link) => link.vehicle.id);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Veículos vinculados</CardTitle>
        <Box className="flex flex-wrap gap-2">
          {links.length > 0 && (
            <SupplierPropagateDialog
              supplierId={supplierId}
              defaultAmount={baseAmount}
              links={links}
              trigger={
                <Button variant="outline" size="sm">
                  <Link2 />
                  Propagar valor
                </Button>
              }
            />
          )}
          <SupplierVehicleDialog
            supplierId={supplierId}
            defaultAmount={baseAmount}
            linkedVehicleIds={linkedIds}
            trigger={
              <Button size="sm">
                <Plus />
                Vincular veículo
              </Button>
            }
          />
        </Box>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <EmptyState icon={CarFront} title="Nenhum veículo vinculado" />
        ) : (
          <List className="divide-y">
            {links.map((link) => {
              const plate = formatPlate(link.vehicle.plate);
              return (
                <ListItem
                  key={link.linkId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <Box className="min-w-0">
                    <Text weight="medium">
                      <TextLink to={routeTo.vehicle(link.vehicle.id)}>
                        {plate}
                      </TextLink>
                    </Text>
                    <Text size="xs" tone="muted" truncate>
                      {link.vehicle.label}
                    </Text>
                  </Box>
                  <Box className="flex shrink-0 items-center gap-1">
                    {!link.active && <Badge variant="outline">Inativo</Badge>}
                    <Text weight="semibold" className="mr-1 tabular-nums">
                      {formatCurrency(link.monthlyAmount)}
                      <Text inline size="xs" tone="muted" weight="normal">
                        {" "}
                        / mês
                      </Text>
                    </Text>
                    <SupplierVehicleDialog
                      supplierId={supplierId}
                      defaultAmount={baseAmount}
                      linkedVehicleIds={linkedIds}
                      vehicle={{
                        id: link.vehicle.id,
                        label: plate,
                        monthlyAmount: link.monthlyAmount,
                      }}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Alterar valor de ${plate}`}
                        >
                          <Pencil />
                        </Button>
                      }
                    />
                    <ConfirmDialog
                      destructive
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          aria-label={`Desvincular ${plate}`}
                        >
                          <Unlink />
                        </Button>
                      }
                      title={`Desvincular ${plate}?`}
                      description="Este custo fixo deixa de contar para o veículo na projeção."
                      confirmLabel="Desvincular"
                      isPending={
                        unlink.isPending && unlink.variables === link.vehicle.id
                      }
                      onConfirm={() => unlink.mutate(link.vehicle.id)}
                    />
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
