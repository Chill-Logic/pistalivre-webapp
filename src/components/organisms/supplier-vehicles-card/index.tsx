import { CarFront } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import type { SupplierVehicleLink } from "@/types/supplier";
import { formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

/** Linked vehicles with the amount PER vehicle (what the projection counts). */
export function SupplierVehiclesCard({
  links,
}: {
  links: SupplierVehicleLink[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Veículos vinculados</CardTitle>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <EmptyState icon={CarFront} title="Nenhum veículo vinculado" />
        ) : (
          <List className="divide-y">
            {links.map((link) => (
              <ListItem
                key={link.linkId}
                className="flex items-center justify-between gap-3 py-3"
              >
                <Box className="min-w-0">
                  <Text weight="medium">
                    <TextLink to={routeTo.vehicle(link.vehicle.id)}>
                      {formatPlate(link.vehicle.plate)}
                    </TextLink>
                  </Text>
                  <Text size="xs" tone="muted" truncate>
                    {link.vehicle.label}
                  </Text>
                </Box>
                <Box className="flex shrink-0 items-center gap-2">
                  {!link.active && <Badge variant="outline">Inativo</Badge>}
                  <Text weight="semibold" className="tabular-nums">
                    {formatCurrency(link.monthlyAmount)}
                    <Text inline size="xs" tone="muted" weight="normal">
                      {" "}
                      / mês
                    </Text>
                  </Text>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
