import { Col, Row } from "@/components/atoms/grid";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { DateRangeField } from "@/components/molecules/date-range-field";
import { CUSTOM_PERIOD, periodOptions } from "@/helpers/statement";
import { todayInBrasilia } from "@/utils/date";
import { useLabels } from "@/hooks/ui/useLabels";

type StatementFiltersProps = {
  period: string;
  source: string;
  /** The range being queried (shown in the calendar when custom). */
  start: string;
  end: string;
  onPeriodChange: (value: string) => void;
  onRangeChange: (range: { start: string; end: string }) => void;
  onSourceChange: (value: string) => void;
};

export function StatementFilters({
  period,
  source,
  start,
  end,
  onPeriodChange,
  onRangeChange,
  onSourceChange,
}: StatementFiltersProps) {
  const { options } = useLabels();
  const presets = periodOptions();

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
      {period === CUSTOM_PERIOD && (
        <Col sm={6} md={4}>
          <DateRangeField
            label="Intervalo"
            start={start}
            end={end}
            max={todayInBrasilia()}
            onChange={onRangeChange}
          />
        </Col>
      )}
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
