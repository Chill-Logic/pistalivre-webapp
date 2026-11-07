import { Check, FileText, Link2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { FormField } from "@/components/molecules/form-field";
import { PageHeader } from "@/components/molecules/page-header";
import {
  ProjectionVehicleCard,
  ProjectionVehicleCardSkeleton,
} from "@/components/molecules/projection-vehicle-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  ProjectionBaseCard,
  ProjectionBaseCardSkeleton,
} from "@/components/organisms/projection-base-card";
import {
  ProjectionTotalsCard,
  ProjectionTotalsSkeleton,
} from "@/components/organisms/projection-totals";
import { QueryError } from "@/components/organisms/query-error";
import { copyToClipboard } from "@/helpers/clipboard";
import { useProjectionReport } from "@/hooks/api/gestao/projections/useProjectionReport";
import { useProjectionSeed } from "@/hooks/api/gestao/projections/useProjectionSeed";
import { useProjectionScenario } from "@/hooks/ui/useProjectionScenario";
import type { ProjectionSeed } from "@/types/projection";
import { formatPlate } from "@/utils/plate";

/**
 * "Projeção de Faturamento, Lucro e Despesas": starts from the real fleet and
 * costs; every edit is recomputed by the API (the same math as the
 * accountant's PDF). The scenario lives in `?sim=`, shareable.
 */
export function ProjectionsPage() {
  const [params] = useSearchParams();
  // Read once: later `?sim=` updates come from our own edits.
  const [initialSim] = useState(() => params.get("sim") ?? "");
  const seed = useProjectionSeed(initialSim);

  if (seed.isPending) {
    return (
      <Box className="space-y-4 md:space-y-6">
        <PageHeader title="Projeções" />
        <SkeletonRegion label="Montando o cenário…" className="space-y-6">
          <ProjectionBaseCardSkeleton />
          <ProjectionTotalsSkeleton />
          <Row className="gap-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Col key={index} md={6} xl={4}>
                <ProjectionVehicleCardSkeleton />
              </Col>
            ))}
          </Row>
        </SkeletonRegion>
      </Box>
    );
  }
  if (seed.isError) {
    return (
      <Box className="space-y-4 md:space-y-6">
        <PageHeader title="Projeções" />
        <QueryError error={seed.error} onRetry={() => seed.refetch()} />
      </Box>
    );
  }
  return <ProjectionScenario seed={seed.data} />;
}

function ProjectionScenario({ seed }: { seed: ProjectionSeed }) {
  const scenario = useProjectionScenario(seed);
  const report = useProjectionReport();
  const [copied, setCopied] = useState(false);
  const { state, totals } = scenario;
  const vehicles = new Map(seed.vehicles.map((v) => [v.id, v]));
  const lines = new Map(totals.real.map((line) => [line.key, line]));
  const sums = {
    revenue: totals.revenue,
    costs: totals.costs,
    maintenance: totals.maintenance,
  };

  const copyLink = async () => {
    if (!(await copyToClipboard(window.location.href))) {
      toast.error("Não foi possível copiar o link");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader
        title="Projeções"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check /> : <Link2 />}
              {copied ? "Copiado" : "Copiar link"}
            </Button>
            <Button
              size="sm"
              disabled={report.isPending || scenario.isComputing}
              onClick={() => report.mutate(scenario.sim)}
            >
              {report.isPending ? (
                <Spinner className="text-primary-foreground" />
              ) : (
                <FileText />
              )}
              <Text inline size={null} className="hidden sm:inline">
                Relatório para o contador
              </Text>
              <Text inline size={null} className="sm:hidden">
                Relatório
              </Text>
            </Button>
          </>
        }
      />

      <ProjectionBaseCard
        state={state}
        onChange={scenario.patch}
        onApplyToAll={scenario.applyBaseToAll}
        companyDebtsMonthly={seed.companyDebtsMonthly}
      />

      {scenario.error && <Alert>{scenario.error}</Alert>}

      <ProjectionTotalsCard
        totals={totals}
        worstVehicle={seed.worstVehicle}
        isStale={scenario.isComputing}
      />

      <Box className="space-y-3">
        <Heading level={2} variant="section">
          Frota atual
        </Heading>
        {state.rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum veículo na frota"
            description="Adicione veículos abaixo para simular."
          />
        ) : (
          <Row as="ul" className="gap-y-4">
            {state.rows.map((row) => {
              const vehicle = vehicles.get(row.id);
              return (
                <Col as="li" key={row.id} md={6} xl={4}>
                  <ProjectionVehicleCard
                    header={
                      <>
                        <Text weight="semibold" mono>
                          {vehicle ? formatPlate(vehicle.plate) : "—"}
                        </Text>
                        <Text size="xs" tone="muted" truncate>
                          {vehicle?.label}
                        </Text>
                      </>
                    }
                    values={row}
                    onChange={(next) => scenario.patchRow(row.id, next)}
                    line={lines.get(row.id)}
                    totals={sums}
                  />
                </Col>
              );
            })}
          </Row>
        )}
      </Box>

      <Box className="space-y-3">
        <Box className="flex items-center justify-between gap-2">
          <Heading level={2} variant="section">
            Veículos a adquirir
          </Heading>
          <Button variant="outline" size="sm" onClick={scenario.addExtra}>
            <Plus />
            Adicionar veículo
          </Button>
        </Box>
        {state.extras.length === 0 ? (
          <Text size="sm" tone="muted">
            Nenhum veículo adicional. Use “Adicionar veículo” para simular
            aquisições.
          </Text>
        ) : (
          <Row as="ul" className="gap-y-4">
            {state.extras.map((extra, index) => (
              <Col as="li" key={index} md={6} xl={4}>
                <ProjectionVehicleCard
                  header={
                    <FormField
                      label="Nome"
                      value={extra.label}
                      onChange={(event) =>
                        scenario.patchExtra(index, {
                          label: event.target.value,
                        })
                      }
                    />
                  }
                  values={extra}
                  onChange={(next) => scenario.patchExtra(index, next)}
                  line={totals.extra[index]}
                  totals={sums}
                  footer={
                    <Box className="flex items-center justify-between gap-2">
                      <Box className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Menos"
                          disabled={extra.qty <= 1}
                          onClick={() =>
                            scenario.patchExtra(index, { qty: extra.qty - 1 })
                          }
                        >
                          −
                        </Button>
                        <Text className="w-16 text-center tabular-nums">
                          {extra.qty} un.
                        </Text>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Mais"
                          onClick={() =>
                            scenario.patchExtra(index, { qty: extra.qty + 1 })
                          }
                        >
                          +
                        </Button>
                      </Box>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => scenario.removeExtra(index)}
                      >
                        <Trash2 />
                        Remover
                      </Button>
                    </Box>
                  }
                />
              </Col>
            ))}
          </Row>
        )}
      </Box>
    </Box>
  );
}
