import { Col, Row } from "@/components/atoms/grid";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { periodPresets } from "@/helpers/statement";
import { useLabels } from "@/hooks/ui/useLabels";

type StatementFiltersProps = {
  period: string;
  source: string;
  onPeriodChange: (value: string) => void;
  onSourceChange: (value: string) => void;
};

export function StatementFilters({
  period,
  source,
  onPeriodChange,
  onSourceChange,
}: StatementFiltersProps) {
  const { options } = useLabels();
  const presets = periodPresets().map(({ value, label }) => ({ value, label }));

  return (
    <Row className="gap-y-2">
      <Col sm={6} md={4}>
        <SelectField
          label="Período"
          value={period}
          options={presets}
          onChange={onPeriodChange}
        />
      </Col>
      <Col sm={6} md={4}>
        <SelectField
          label="Conta"
          value={source}
          options={[
            { value: "ALL", label: "Todas as contas" },
            ...options(LABEL_MAPS.statementSource),
          ]}
          onChange={(value) => onSourceChange(value === "ALL" ? "" : value)}
        />
      </Col>
    </Row>
  );
}
