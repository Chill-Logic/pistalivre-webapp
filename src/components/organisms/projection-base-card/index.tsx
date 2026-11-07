import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { MoneyField } from "@/components/molecules/money-field";
import { MonthsPicker } from "@/components/molecules/months-picker";
import type { ProjectionState } from "@/types/projection";
import { formatCurrency } from "@/utils/format";

type ProjectionBaseCardProps = {
  state: ProjectionState;
  onChange: (next: Partial<ProjectionState>) => void;
  onApplyToAll: () => void;
  /** Part of the company's fixed cost that is loan installments. */
  companyDebtsMonthly: number;
};

/** Scenario base: default rent/maintenance, company overhead, horizon. */
export function ProjectionBaseCard({
  state,
  onChange,
  onApplyToAll,
  companyDebtsMonthly,
}: ProjectionBaseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Base do cenário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Row className="gap-y-4">
          <Col span={6} md={4}>
            <MoneyField
              label="Aluguel semanal"
              value={state.rent}
              onChange={(rent) => onChange({ rent: rent ?? 0 })}
            />
          </Col>
          <Col span={6} md={4}>
            <MoneyField
              label="Manutenção mensal por veículo"
              value={state.maint}
              onChange={(maint) => onChange({ maint: maint ?? 0 })}
            />
          </Col>
          <Col md={4}>
            <MoneyField
              label="Custo fixo da empresa / mês"
              value={state.company}
              onChange={(company) => onChange({ company: company ?? 0 })}
            />
            {companyDebtsMonthly > 0 && (
              <Text size="xs" tone="muted" className="mt-1">
                inclui {formatCurrency(companyDebtsMonthly)} de parcelas de
                empréstimo
              </Text>
            )}
          </Col>
        </Row>
        <MonthsPicker
          value={state.months}
          onChange={(months) => onChange({ months })}
        />
        <Box className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onApplyToAll}
          >
            Aplicar aluguel e manutenção a todos
          </Button>
          <Text size="xs" tone="muted">
            Sobrescreve o aluguel e a manutenção de cada veículo da frota.
          </Text>
        </Box>
      </CardContent>
    </Card>
  );
}

export function ProjectionBaseCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-36 text-base" />
      </CardHeader>
      <CardContent className="space-y-5">
        <Row className="gap-y-4">
          {[6, 6, 12].map((span, index) => (
            <Col key={index} span={span as 6 | 12} md={4} className="space-y-2">
              <Skeleton shape="text" className="w-32 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
        </Row>
        <Box className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24" />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
