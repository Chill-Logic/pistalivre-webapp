import { Wrench } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  BarListCard,
  BarListCardSkeleton,
} from "@/components/organisms/bar-list-card";
import { MaintenanceAnalysisFilters } from "@/components/organisms/maintenance-analysis-filters";
import { MaintenanceAnalysisGroupDialog } from "@/components/organisms/maintenance-analysis-group-dialog";
import {
  MaintenanceAnalysisTable,
  MaintenanceAnalysisTableSkeleton,
} from "@/components/organisms/maintenance-analysis-table";
import {
  MaintenanceRateKpis,
  MaintenanceRateKpisSkeleton,
} from "@/components/organisms/maintenance-rate-kpis";
import { QueryError } from "@/components/organisms/query-error";
import {
  ANALYSIS_DIMENSION_OPTIONS,
  ANALYSIS_SORT_OPTIONS,
} from "@/constants/maintenance-analysis";
import { ROUTES } from "@/constants/routes";
import {
  analysisBarItems,
  kmCoverageHint,
  sortAnalysisRows,
} from "@/helpers/maintenance-analysis";
import { useMaintenanceAnalysis } from "@/hooks/api/gestao/maintenances/useMaintenanceAnalysis";
import { useMaintenanceAnalysisFilters } from "@/hooks/ui/useMaintenanceAnalysisFilters";
import type { AnalysisRow } from "@/types/maintenance-analysis";

/**
 * Taxa de manutenção: the maintenance cost cut by any dimension (moto,
 * modelo, cliente, mês…) and read by four rulers computed on the server.
 */
export function MaintenanceAnalysisPage() {
  const { filters, sort, setDimension, setPeriod, setSort } =
    useMaintenanceAnalysisFilters();
  const analysis = useMaintenanceAnalysis(filters);
  const [open, setOpen] = useState<AnalysisRow | null>(null);
  const data = analysis.data;
  const rows = data ? sortAnalysisRows(data.rows, sort) : [];
  const dimensionLabel =
    ANALYSIS_DIMENSION_OPTIONS.find((o) => o.value === filters.dimension)
      ?.label ?? "";
  const measureLabel =
    ANALYSIS_SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Custo";

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Taxa de manutenção"
        actions={
          <Button asChild variant="outline">
            <Link to={ROUTES.maintenances}>
              <Wrench />
              Manutenções
            </Link>
          </Button>
        }
      />
      <MaintenanceAnalysisFilters
        filters={filters}
        sort={sort}
        onDimensionChange={setDimension}
        onPeriodChange={setPeriod}
        onSortChange={setSort}
      />

      {analysis.isError ? (
        <QueryError error={analysis.error} onRetry={() => analysis.refetch()} />
      ) : !data ? (
        <SkeletonRegion label="Carregando a taxa de manutenção…">
          <Box className="space-y-4 md:space-y-6">
            <MaintenanceRateKpisSkeleton />
            <Row className="gap-y-4">
              <Col lg={7}>
                <BarListCardSkeleton rows={4} />
              </Col>
              <Col lg={5}>
                <BarListCardSkeleton rows={3} />
              </Col>
            </Row>
            <MaintenanceAnalysisTableSkeleton />
          </Box>
        </SkeletonRegion>
      ) : (
        <>
          <MaintenanceRateKpis
            totals={data.totals}
            kmCoverage={data.kmCoverage}
          />
          <Row className="items-stretch gap-y-4">
            <Col lg={7}>
              <BarListCard
                title={`${sort === "natural" ? "Custo" : measureLabel} por ${dimensionLabel.split(" (")[0].toLowerCase()}`}
                items={analysisBarItems(rows, sort)}
                empty="Sem valores para comparar."
              />
            </Col>
            <Col lg={5}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">
                    Como a conta é feita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <List className="space-y-2">
                    <ListItem>
                      <Text size="sm" tone="muted">
                        <Text inline weight="medium" tone="foreground">
                          R$ por moto-mês:
                        </Text>{" "}
                        o custo dividido pelos meses que as motos da linha
                        ficaram na frota.
                      </Text>
                    </ListItem>
                    <ListItem>
                      <Text size="sm" tone="muted">
                        <Text inline weight="medium" tone="foreground">
                          R$ por km:
                        </Text>{" "}
                        só onde há leitura de odômetro (vistoria ou manutenção)
                        — {kmCoverageHint(data.kmCoverage).toLowerCase()}.
                      </Text>
                    </ListItem>
                    <ListItem>
                      <Text size="sm" tone="muted">
                        <Text inline weight="medium" tone="foreground">
                          % da receita:
                        </Text>{" "}
                        o custo sobre o aluguel recebido no período (sem
                        caução).
                      </Text>
                    </ListItem>
                    {data.fleetWide && (
                      <ListItem>
                        <Text size="sm" tone="muted">
                          Nesta visão as linhas não repartem a frota: o
                          denominador de cada uma é o da frota inteira.
                          {filters.dimension === "service" &&
                            " Uma manutenção com vários serviços tem o custo dividido igualmente entre eles."}
                        </Text>
                      </ListItem>
                    )}
                    {(filters.dimension === "customer" ||
                      filters.dimension === "rental" ||
                      filters.dimension === "tenure") && (
                      <ListItem>
                        <Text size="sm" tone="muted">
                          Manutenção sem locação ligada entra na locação que
                          rodava na moto naquele dia; dias sem locação ficam em
                          "Sem locação (moto parada)".
                        </Text>
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Col>
          </Row>
          {rows.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Nada no período"
              description="Nenhuma manutenção nem veículo na frota entre essas datas. Aumente o período."
            />
          ) : (
            <MaintenanceAnalysisTable
              dimension={filters.dimension}
              rows={rows}
              sort={sort}
              fleetWide={data.fleetWide}
              isRefreshing={analysis.isPlaceholderData}
              onOpen={setOpen}
            />
          )}
          <MaintenanceAnalysisGroupDialog
            filters={filters}
            row={open}
            fleetWide={data.fleetWide}
            onClose={() => setOpen(null)}
          />
        </>
      )}
    </Box>
  );
}
