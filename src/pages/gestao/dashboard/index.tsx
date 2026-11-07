import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  BarListCard,
  BarListCardSkeleton,
} from "@/components/organisms/bar-list-card";
import { BirthdayBanner } from "@/components/organisms/birthday-banner";
import {
  ColumnChartCard,
  ColumnChartCardSkeleton,
} from "@/components/organisms/column-chart-card";
import {
  DashboardKpis,
  DashboardKpisSkeleton,
} from "@/components/organisms/dashboard-kpis";
import { QueryError } from "@/components/organisms/query-error";
import {
  VehicleMaintenanceRanking,
  VehicleMaintenanceRankingSkeleton,
} from "@/components/organisms/vehicle-maintenance-ranking";
import { DashboardLayout } from "@/components/templates/dashboard-layout";
import {
  MONTHLY_ACTIVITY_SERIES,
  MONTHLY_COST_SERIES,
} from "@/constants/chart";
import { LABEL_MAPS } from "@/constants/label-maps";
import {
  costByVehicleItems,
  fleetItems,
  funnelItems,
  funnelStages,
  leadSourceItems,
  maintenanceServiceItems,
  maintenanceTypeItems,
  monthlyGroups,
  overdueByPurposeItems,
  topDebtorItems,
  vehiclesWithActivity,
} from "@/helpers/dashboard";
import { useDashboard } from "@/hooks/api/gestao/dashboard/useDashboard";
import { useLabels } from "@/hooks/ui/useLabels";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

export function DashboardPage() {
  const dashboard = useDashboard();
  const { label, map } = useLabels();
  const data = dashboard.data;

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Painel" />
      {dashboard.isPending && (
        <SkeletonRegion label="Carregando painel…">
          <DashboardLayout
            kpis={<DashboardKpisSkeleton />}
            overdueByPurpose={<BarListCardSkeleton rows={2} />}
            topDebtors={<BarListCardSkeleton rows={3} />}
            funnel={<BarListCardSkeleton rows={6} />}
            leadSources={<BarListCardSkeleton rows={3} />}
            fleet={<BarListCardSkeleton rows={4} />}
            maintenanceTypes={<BarListCardSkeleton rows={3} />}
            monthlyActivity={<ColumnChartCardSkeleton />}
            monthlyCost={<ColumnChartCardSkeleton />}
            costByVehicle={<BarListCardSkeleton rows={4} />}
            services={<BarListCardSkeleton rows={4} />}
            ranking={<VehicleMaintenanceRankingSkeleton />}
          />
        </SkeletonRegion>
      )}
      {dashboard.isError && (
        <QueryError
          error={dashboard.error}
          onRetry={() => dashboard.refetch()}
        />
      )}
      {data && (
        <DashboardLayout
          banner={<BirthdayBanner birthdays={data.birthdays} />}
          kpis={<DashboardKpis dashboard={data} />}
          overdueByPurpose={
            <BarListCard
              title="Inadimplência por finalidade"
              items={overdueByPurposeItems(data, label)}
              empty="Nenhuma cobrança vencida."
              summary={`${pluralize(data.delinquency.overdue.count, "cobrança vencida", "cobranças vencidas")} em aberto · ${pluralize(data.delinquency.paid.lateCount, "paga", "pagas")} com atraso`}
            />
          }
          topDebtors={
            <BarListCard
              title="Maiores devedores"
              items={topDebtorItems(data)}
              empty="Sem devedores no momento."
            />
          }
          funnel={
            <BarListCard
              title="Funil de leads"
              items={funnelItems(
                data,
                funnelStages(map(LABEL_MAPS.leadStatus)),
                label,
              )}
              empty="Nenhum lead no funil."
            />
          }
          leadSources={
            <BarListCard
              title="Leads por origem"
              items={leadSourceItems(data)}
              empty="Sem leads ainda."
            />
          }
          fleet={
            <BarListCard
              title="Frota por situação"
              items={fleetItems(data, label)}
              empty="Nenhum veículo cadastrado."
            />
          }
          maintenanceTypes={
            <BarListCard
              title="Manutenções por tipo"
              items={maintenanceTypeItems(data)}
              empty="Nenhuma manutenção registrada."
            />
          }
          monthlyActivity={
            <ColumnChartCard
              title="Manutenções e vistorias por mês"
              groups={monthlyGroups(data)}
              series={MONTHLY_ACTIVITY_SERIES}
              format={String}
            />
          }
          monthlyCost={
            <ColumnChartCard
              title="Gasto com manutenção por mês"
              groups={monthlyGroups(data)}
              series={MONTHLY_COST_SERIES}
              format={formatCurrency}
            />
          }
          costByVehicle={
            <BarListCard
              title="Gasto de manutenção por veículo"
              items={costByVehicleItems(data)}
              empty="Sem gastos registrados."
            />
          }
          services={
            <BarListCard
              title="Serviços mais feitos"
              items={maintenanceServiceItems(data)}
              empty="Sem serviços registrados."
            />
          }
          ranking={
            <VehicleMaintenanceRanking
              vehicles={vehiclesWithActivity(data)}
              idleCount={
                data.analytics.vehicleRanking.length -
                vehiclesWithActivity(data).length
              }
            />
          }
        />
      )}
    </Box>
  );
}
