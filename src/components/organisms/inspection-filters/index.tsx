import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { InspectionFilters as Filters } from "@/types/inspection";

type InspectionFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPerformedByChange: (value: string) => void;
};

export function InspectionFilters({
  filters,
  onSearch,
  onTypeChange,
  onPerformedByChange,
}: InspectionFiltersProps) {
  const { options } = useLabels();

  return (
    <Row className="gap-y-2">
      <Col md={6}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar por placa, veículo ou locação"
        />
      </Col>
      <Col span={6} md={3}>
        <FilterSelect
          label="Tipo"
          value={filters.type}
          allLabel="Todos os tipos"
          options={options(LABEL_MAPS.inspectionType)}
          onChange={onTypeChange}
        />
      </Col>
      <Col span={6} md={3}>
        <FilterSelect
          label="Feita por"
          value={filters.performedBy}
          allLabel="Todos"
          options={options(LABEL_MAPS.inspectionActor)}
          onChange={onPerformedByChange}
        />
      </Col>
    </Row>
  );
}
