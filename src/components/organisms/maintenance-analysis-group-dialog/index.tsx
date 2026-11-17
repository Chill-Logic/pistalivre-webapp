import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Row } from "@/components/atoms/grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/atoms/dialog";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import {
  analysisRowPath,
  formatFleetMonths,
  formatKm,
  formatMeasure,
} from "@/helpers/maintenance-analysis";
import { useMaintenanceAnalysisGroup } from "@/hooks/api/gestao/maintenances/useMaintenanceAnalysis";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  AnalysisRow,
  MaintenanceAnalysisFilters,
} from "@/types/maintenance-analysis";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type MaintenanceAnalysisGroupDialogProps = {
  filters: MaintenanceAnalysisFilters;
  row: AnalysisRow | null;
  fleetWide: boolean;
  onClose: () => void;
};

const RECORD_LABEL = {
  vehicle: "Abrir o veículo",
  customer: "Abrir o cliente",
  rental: "Abrir a locação",
};

/** One line of the analysis: its rulers and the maintenances behind it. */
export function MaintenanceAnalysisGroupDialog({
  filters,
  row,
  fleetWide,
  onClose,
}: MaintenanceAnalysisGroupDialogProps) {
  const group = useMaintenanceAnalysisGroup(filters, row?.key ?? null);
  const { label } = useLabels();
  const recordPath = row ? analysisRowPath(row) : null;

  return (
    <Dialog open={row != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg">
        {row && (
          <>
            <Box className="space-y-1">
              <DialogTitle>{row.label}</DialogTitle>
              <DialogDescription>
                {[
                  row.detail,
                  `${formatCalendarDate(filters.from)} a ${formatCalendarDate(filters.to)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </DialogDescription>
            </Box>

            <Row as="dl" className="gap-y-3">
              <InfoItem span={6} md={3} label="Custo">
                {formatCurrency(row.cost)}
              </InfoItem>
              <InfoItem span={6} md={3} label="R$ por veículo-mês">
                {formatMeasure(row.costPerVehicleMonth, "costPerVehicleMonth")}
                {!fleetWide && (
                  <Text size="xs" tone="muted">
                    {formatFleetMonths(row.fleetMonths, filters)}
                  </Text>
                )}
              </InfoItem>
              <InfoItem span={6} md={3} label="R$ por km">
                {formatMeasure(row.costPerKm, "costPerKm")}
                {!fleetWide && row.km > 0 && (
                  <Text size="xs" tone="muted">
                    {formatKm(row.km)}
                  </Text>
                )}
              </InfoItem>
              <InfoItem span={6} md={3} label="% da receita">
                {formatMeasure(row.revenueShare, "revenueShare")}
                {!fleetWide && (
                  <Text size="xs" tone="muted">
                    de {formatCurrency(row.revenue)}
                  </Text>
                )}
              </InfoItem>
            </Row>

            {group.isError ? (
              <QueryError error={group.error} onRetry={() => group.refetch()} />
            ) : group.isPending ? (
              <SkeletonRegion label="Carregando as manutenções…">
                <Box className="space-y-2">
                  {Array.from(
                    { length: Math.min(Math.max(row.count, 1), 4) },
                    (_, index) => (
                      <Box
                        key={index}
                        className="flex justify-between gap-3 rounded-md border p-3"
                      >
                        <Box className="space-y-1">
                          <Skeleton shape="text" className="w-40" />
                          <Skeleton shape="text" className="w-56 text-xs" />
                        </Box>
                        <Skeleton shape="text" className="w-16" />
                      </Box>
                    ),
                  )}
                </Box>
              </SkeletonRegion>
            ) : !group.data.maintenances?.length ? (
              <Text tone="muted" className="py-4 text-center">
                Nenhuma manutenção nesta linha no período.
              </Text>
            ) : (
              <List className="space-y-2">
                {group.data.maintenances.map((m) => (
                  <ListItem key={m.id}>
                    <Link
                      to={routeTo.maintenance(m.id)}
                      className="flex items-start justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-accent/50"
                    >
                      <Box className="min-w-0 space-y-0.5">
                        <Text weight="medium" truncate>
                          {formatCalendarDate(m.performedAt)} · {m.plate} ·{" "}
                          {label(LABEL_MAPS.maintenanceType, m.type)}
                        </Text>
                        <Text size="xs" tone="muted" truncate>
                          {[
                            m.services
                              .map((s) =>
                                label(LABEL_MAPS.maintenanceService, s),
                              )
                              .join(", ") || m.description,
                            m.provider,
                            m.customerName,
                            label(LABEL_MAPS.maintenancePayer, m.payer),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      </Box>
                      <Text weight="medium" className="shrink-0 tabular-nums">
                        {m.cost == null ? "Sem valor" : formatCurrency(m.cost)}
                      </Text>
                    </Link>
                  </ListItem>
                ))}
              </List>
            )}

            <DialogFooter>
              {recordPath && (
                <Button asChild variant="outline">
                  <Link to={recordPath}>
                    {row.link && RECORD_LABEL[row.link.kind]}
                    <ChevronRight />
                  </Link>
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
