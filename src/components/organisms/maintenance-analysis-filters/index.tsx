import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { DateRangeField } from "@/components/molecules/date-range-field";
import { SelectField } from "@/components/molecules/select-field";
import {
  ANALYSIS_DIMENSION_OPTIONS,
  ANALYSIS_SORT_OPTIONS,
  NATURAL_SORT_LABEL,
} from "@/constants/maintenance-analysis";
import type {
  AnalysisDimension,
  AnalysisSort,
  MaintenanceAnalysisFilters as Filters,
} from "@/types/maintenance-analysis";
import { todayInBrasilia } from "@/utils/date";

type MaintenanceAnalysisFiltersProps = {
  filters: Filters;
  sort: AnalysisSort;
  onDimensionChange: (dimension: AnalysisDimension) => void;
  onPeriodChange: (period: { start: string; end: string }) => void;
  onSortChange: (sort: AnalysisSort) => void;
};

/** Period, "Agrupar por" and "Ordenar por" of the maintenance analysis. */
export function MaintenanceAnalysisFilters({
  filters,
  sort,
  onDimensionChange,
  onPeriodChange,
  onSortChange,
}: MaintenanceAnalysisFiltersProps) {
  const natural = NATURAL_SORT_LABEL[filters.dimension];
  const sortOptions = natural
    ? [{ value: "natural", label: natural }, ...ANALYSIS_SORT_OPTIONS]
    : ANALYSIS_SORT_OPTIONS;

  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <Row className="gap-y-4">
          <Col md={12} lg={5}>
            <DateRangeField
              label="Período"
              start={filters.from}
              end={filters.to}
              max={todayInBrasilia()}
              onChange={onPeriodChange}
            />
          </Col>
          <Col md={6} lg={4}>
            <SelectField
              label="Agrupar por"
              value={filters.dimension}
              options={ANALYSIS_DIMENSION_OPTIONS}
              onChange={(value) =>
                onDimensionChange(value as AnalysisDimension)
              }
            />
          </Col>
          <Col md={6} lg={3}>
            <SelectField
              label="Ordenar por"
              value={sort}
              options={sortOptions}
              onChange={(value) => onSortChange(value as AnalysisSort)}
            />
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
