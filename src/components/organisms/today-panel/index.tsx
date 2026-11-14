import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { TextLink } from "@/components/molecules/text-link";
import { ROUTES, routeTo } from "@/constants/routes";
import { vehicleName } from "@/helpers/vehicle";
import { useFinanceToCollect } from "@/hooks/api/gestao/finance/useFinanceToCollect";
import { useVehicles } from "@/hooks/api/gestao/vehicles/useVehicles";
import type { VehicleFilters } from "@/types/vehicle";
import { formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";
import { pluralize } from "@/utils/text";

/** How many rows each list shows before "ver todas". */
const ROWS = 5;

const IDLE_FILTERS: VehicleFilters = {
  page: 1,
  pageSize: ROWS,
  q: "",
  type: "",
  status: "AVAILABLE",
};

const lateLabel = (daysLate: number) =>
  daysLate === 0
    ? "vence hoje"
    : `${pluralize(daysLate, "dia", "dias")} de atraso`;

/**
 * "Hoje" at the top of the dashboard: what to do now, not charts. Who to
 * charge (today and overdue, the server's queue and total), vehicles standing
 * still, and new leads waiting for a call. Each block leads to its screen.
 */
export function TodayPanel({ newLeads }: { newLeads: number }) {
  const toCollect = useFinanceToCollect();
  const idle = useVehicles(IDLE_FILTERS);
  const charges = (toCollect.data?.days ?? []).flatMap((day) =>
    day.items.map((item) => ({ item, daysLate: day.daysLate })),
  );

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-lg">Hoje</CardTitle>
      </CardHeader>
      <CardContent>
        <Row className="gap-y-6">
          <Col lg={7} className="space-y-3">
            <Box className="flex items-baseline justify-between gap-2">
              <Text weight="semibold">Para cobrar</Text>
              {toCollect.data && toCollect.data.count > 0 && (
                <Text size="xs" tone="muted">
                  {formatCurrency(toCollect.data.total)} em{" "}
                  {pluralize(toCollect.data.count, "cobrança", "cobranças")}
                </Text>
              )}
            </Box>
            {toCollect.isPending ? (
              <TodayRowsSkeleton />
            ) : charges.length === 0 ? (
              <Text tone="muted">Nada vencido nem vencendo hoje.</Text>
            ) : (
              <List className="divide-y">
                {charges.slice(0, ROWS).map(({ item, daysLate }) => (
                  <ListItem
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <Box className="min-w-0">
                      {item.rental ? (
                        <TextLink
                          to={routeTo.rental(item.rental.id)}
                          className="block truncate decoration-transparent hover:decoration-primary"
                        >
                          {item.customer?.name ?? item.rental.code}
                        </TextLink>
                      ) : (
                        <Text truncate weight="medium">
                          {item.customer?.name ?? item.label ?? "Cobrança"}
                        </Text>
                      )}
                      <Text
                        size="xs"
                        tone={daysLate > 0 ? "destructive" : "muted"}
                      >
                        {lateLabel(daysLate)}
                      </Text>
                    </Box>
                    <Text weight="semibold" className="shrink-0">
                      {formatCurrency(item.amounts.amount)}
                    </Text>
                  </ListItem>
                ))}
              </List>
            )}
            {charges.length > ROWS && (
              <TextLink to={ROUTES.finance} className="inline-block text-sm">
                Ver todas no Financeiro
              </TextLink>
            )}
          </Col>
          <Col lg={5} className="space-y-3 lg:border-l lg:pl-6">
            <Box className="flex items-baseline justify-between gap-2">
              <Text weight="semibold">Veículos parados</Text>
              {idle.data && idle.data.total > 0 && (
                <Text size="xs" tone="muted">
                  {pluralize(idle.data.total, "disponível", "disponíveis")}
                </Text>
              )}
            </Box>
            {idle.isPending ? (
              <TodayRowsSkeleton />
            ) : !idle.data || idle.data.items.length === 0 ? (
              <Text tone="muted">A frota toda está rodando.</Text>
            ) : (
              <List className="divide-y">
                {idle.data.items.map((vehicle) => (
                  <ListItem
                    key={vehicle.id}
                    className="flex items-center gap-3 py-2"
                  >
                    <TextLink
                      to={routeTo.vehicle(vehicle.id)}
                      className="shrink-0 decoration-transparent hover:decoration-primary"
                    >
                      {formatPlate(vehicle.plate)}
                    </TextLink>
                    <Text truncate tone="muted">
                      {vehicleName(vehicle)}
                    </Text>
                  </ListItem>
                ))}
              </List>
            )}
            {newLeads > 0 && (
              <Text size="sm" className="border-t pt-3">
                <TextLink to={ROUTES.crm}>
                  {pluralize(newLeads, "lead novo", "leads novos")}
                </TextLink>{" "}
                esperando contato
              </Text>
            )}
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}

function TodayRowsSkeleton() {
  return (
    <Box className="space-y-3 py-1">
      {[0, 1, 2].map((index) => (
        <Box key={index} className="flex justify-between gap-3">
          <Skeleton shape="text" className="w-40 text-sm" />
          <Skeleton shape="text" className="w-16 text-sm" />
        </Box>
      ))}
    </Box>
  );
}

export function TodayPanelSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 md:pb-3">
        <Skeleton shape="text" className="w-16 text-lg" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-6">
          <Col lg={7}>
            <TodayRowsSkeleton />
          </Col>
          <Col lg={5}>
            <TodayRowsSkeleton />
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
