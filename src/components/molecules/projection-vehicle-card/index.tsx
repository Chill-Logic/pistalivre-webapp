import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { MoneyField } from "@/components/molecules/money-field";
import type { ProjectionLine, ProjectionRow } from "@/types/projection";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

type Editable = Pick<
  ProjectionRow,
  "active" | "rent" | "maint" | "suppliers" | "finance" | "financeMonths"
>;

type ProjectionVehicleCardProps = {
  /** Plate + model, or the editable name of a hypothetical vehicle. */
  header: ReactNode;
  values: Editable;
  onChange: (next: Partial<Editable>) => void;
  /** The API's result for this vehicle (absent until computed). */
  line?: ProjectionLine;
  /** Scenario totals, for the share of revenue/costs/maintenance. */
  totals: { revenue: number; costs: number; maintenance: number };
  /** Extra controls (quantity, remove). */
  footer?: ReactNode;
};

const share = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

/**
 * One vehicle of the scenario: what it brings in and costs (editable) and
 * what it yields. An idle vehicle has no maintenance, only fixed costs.
 */
export function ProjectionVehicleCard({
  header,
  values,
  onChange,
  line,
  totals,
  footer,
}: ProjectionVehicleCardProps) {
  const money = (value: number | null) => value ?? 0;

  return (
    <Card className="h-full">
      <CardContent className="space-y-4 p-4">
        <Box className="flex items-start justify-between gap-2">
          <Box className="min-w-0 flex-1">{header}</Box>
          <CheckboxField
            label="Alugado"
            checked={values.active}
            onChange={(active) => onChange({ active })}
          />
        </Box>
        <Row className="gap-y-3">
          <Col span={6}>
            <MoneyField
              label="Aluguel / semana"
              value={values.rent}
              onChange={(rent) => onChange({ rent: money(rent) })}
            />
          </Col>
          <Col span={6}>
            <MoneyField
              label="Manutenção / mês"
              value={values.maint}
              onChange={(maint) => onChange({ maint: money(maint) })}
            />
          </Col>
          <Col span={6}>
            <MoneyField
              label="Fornecedores / mês"
              value={values.suppliers}
              onChange={(suppliers) =>
                onChange({ suppliers: money(suppliers) })
              }
            />
          </Col>
          <Col span={6}>
            <MoneyField
              label="Financiamento / mês"
              value={values.finance}
              onChange={(finance) => onChange({ finance: money(finance) })}
            />
            {values.finance > 0 && values.financeMonths != null && (
              <Text size="xs" tone="muted" className="mt-1">
                {Math.round(values.financeMonths)}x restante(s)
              </Text>
            )}
          </Col>
        </Row>
        <Box className="space-y-1 rounded-md bg-muted/50 px-3 py-2">
          <Box className="flex items-baseline justify-between gap-2">
            <Text size="xs" tone="muted">
              Faturamento
            </Text>
            <Text size="sm" weight="medium" className="tabular-nums">
              {line ? formatCurrency(line.revenue) : "—"}
            </Text>
          </Box>
          <Box className="flex items-baseline justify-between gap-2">
            <Text size="xs" tone="muted">
              Lucro
              {line && line.revenue > 0
                ? ` (${share(line.result, line.revenue)} de margem)`
                : ""}
            </Text>
            <Text
              size="sm"
              weight="semibold"
              className={cn(
                "tabular-nums",
                line && line.result < 0
                  ? "text-destructive"
                  : "text-success-foreground",
              )}
            >
              {line ? formatCurrency(line.result) : "—"}
            </Text>
          </Box>
          {line && (
            <Text size="xs" tone="muted">
              Participação: faturamento {share(line.revenue, totals.revenue)} ·
              despesas {share(line.cost, totals.costs)} · manutenção{" "}
              {share(line.maintenance, totals.maintenance)}
            </Text>
          )}
        </Box>
        {footer}
      </CardContent>
    </Card>
  );
}

export function ProjectionVehicleCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="space-y-4 p-4">
        <Box className="flex justify-between gap-2">
          <Skeleton shape="text" className="w-40 text-sm" />
          <Skeleton className="h-5 w-20" />
        </Box>
        <Row className="gap-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Col key={index} span={6} className="space-y-2">
              <Skeleton shape="text" className="w-24 text-xs" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
        </Row>
        <Skeleton className="h-16" />
      </CardContent>
    </Card>
  );
}
