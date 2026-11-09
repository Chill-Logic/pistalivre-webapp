import { Bot, ShieldAlert } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { MonthSwitcher } from "@/components/molecules/month-switcher";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AiUsageList } from "@/components/organisms/ai-usage-list";
import {
  AiUsageSummary,
  AiUsageSummarySkeleton,
} from "@/components/organisms/ai-usage-summary";
import { AiUsageTable } from "@/components/organisms/ai-usage-table";
import {
  BarListCard,
  BarListCardSkeleton,
} from "@/components/organisms/bar-list-card";
import {
  ColumnChartCard,
  ColumnChartCardSkeleton,
} from "@/components/organisms/column-chart-card";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { CHART_COLORS } from "@/constants/chart";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { LABEL_MAPS } from "@/constants/label-maps";
import { ROUTES } from "@/constants/routes";
import {
  useAiUsageList,
  useAiUsageSummary,
} from "@/hooks/api/gestao/ai-usage/useAiUsage";
import { useAiUsageFilters } from "@/hooks/ui/useAiUsageFilters";
import { useLabels } from "@/hooks/ui/useLabels";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";
import type { AiUsageSlice, AiUsageSummary as Summary } from "@/types/ai-usage";
import type { BarItem } from "@/types/chart";
import { formatUsd } from "@/utils/format";
import { formatShortMonth } from "@/utils/month";
import { pluralize } from "@/utils/text";

const COST_SERIES = [{ key: "cost", name: "Custo (US$)", color: CHART_COLORS[0] }];

/**
 * Uso da IA (admin only): what each AI call cost — the month's bill, the
 * last 6 months, by task / model / person, and every call. Costs in USD,
 * computed by the server when each call was recorded.
 */
export function AiUsagePage() {
  const { isAdmin } = useUserPermissions();
  const { filters, setMonth, setPage, setPageSize } = useAiUsageFilters();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const summary = useAiUsageSummary(filters.month, isAdmin);
  const calls = useAiUsageList(filters, isDesktop);

  return (
    <Box className="space-y-4 md:space-y-6">
      <BackLink to={ROUTES.company} label="Empresa" />
      <PageHeader title="Uso da IA" />
      {!isAdmin ? (
        <EmptyState
          icon={ShieldAlert}
          title="Só administradores"
          description="O uso e o custo da IA ficam visíveis só para administradores."
        />
      ) : (
        <>
          <MonthSwitcher month={filters.month} onChange={setMonth} />
          {summary.isError ? (
            <QueryError error={summary.error} onRetry={() => summary.refetch()} />
          ) : summary.isPending ? (
            <AiUsageSkeleton />
          ) : summary.data.totals.calls === 0 && summary.data.months.every((m) => m.calls === 0) ? (
            <EmptyState
              icon={Bot}
              title="Nenhuma chamada de IA ainda"
              description="Cada personalização de contrato ou proposta aparece aqui, com tokens e custo."
            />
          ) : (
            <>
              <AiUsageOverview summary={summary.data} />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Chamadas do mês</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calls.isError ? (
                    <QueryError error={calls.error} onRetry={() => calls.refetch()} />
                  ) : !calls.isPending && calls.total === 0 ? (
                    <EmptyState icon={Bot} title="Nenhuma chamada neste mês" />
                  ) : calls.mode === "pages" ? (
                    <AiUsageTable
                      entries={calls.items}
                      isLoading={calls.isPending}
                      isRefreshing={calls.isRefreshing}
                    />
                  ) : (
                    <AiUsageList
                      entries={calls.items}
                      isLoading={calls.isPending}
                      isRefreshing={calls.isRefreshing}
                    />
                  )}
                  <ListFooter result={calls} onPageChange={setPage} onPageSizeChange={setPageSize} />
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </Box>
  );
}

function AiUsageOverview({ summary }: { summary: Summary }) {
  const { label } = useLabels();
  const bars = (slices: AiUsageSlice[], name: (slice: AiUsageSlice) => string): BarItem[] =>
    slices.map((slice) => ({
      key: slice.key,
      label: name(slice),
      value: slice.costUsd,
      display: `${formatUsd(slice.costUsd)} · ${pluralize(slice.calls, "chamada", "chamadas")}`,
    }));

  return (
    <>
      <AiUsageSummary totals={summary.totals} />
      <Row className="items-stretch gap-y-4">
        <Col lg={6}>
          <ColumnChartCard
            title="Últimos 6 meses"
            groups={summary.months.map((m) => ({
              key: m.month,
              label: formatShortMonth(m.month),
              values: { cost: m.costUsd },
            }))}
            series={COST_SERIES}
            format={formatUsd}
          />
        </Col>
        <Col lg={6}>
          <BarListCard
            title="Por tarefa"
            items={bars(summary.bySession, (s) => label(LABEL_MAPS.aiSessionType, s.key))}
            empty="Nenhuma chamada neste mês."
          />
        </Col>
        <Col lg={6}>
          <BarListCard
            title="Por modelo"
            items={bars(summary.byModel, (s) =>
              s.label ? `${s.key} · ${label(LABEL_MAPS.aiProvider, s.label)}` : s.key,
            )}
            empty="Nenhuma chamada neste mês."
          />
        </Col>
        <Col lg={6}>
          <BarListCard
            title="Por pessoa"
            items={bars(summary.byUser, (s) => s.label ?? "Usuário removido")}
            empty="Nenhuma chamada neste mês."
          />
        </Col>
      </Row>
    </>
  );
}

function AiUsageSkeleton() {
  return (
    <SkeletonRegion label="Carregando uso da IA…">
      <Box className="space-y-4 md:space-y-6">
        <AiUsageSummarySkeleton />
        <Row className="gap-y-4">
          <Col lg={6}>
            <ColumnChartCardSkeleton />
          </Col>
          <Col lg={6}>
            <BarListCardSkeleton rows={3} />
          </Col>
        </Row>
      </Box>
    </SkeletonRegion>
  );
}
