import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { MaintenanceFilters as Filters } from "@/types/maintenance";

type MaintenanceFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onTypeChange: (value: string) => void;
};

export function MaintenanceFilters({
  filters,
  onSearch,
  onTypeChange,
}: MaintenanceFiltersProps) {
  const { options } = useLabels();

  return (
    <Row className="gap-y-2">
      <Col md={8}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar por placa, locação ou oficina"
        />
      </Col>
      <Col md={4}>
        <FilterSelect
          label="Tipo"
          value={filters.type}
          allLabel="Todos os tipos"
          options={options(LABEL_MAPS.maintenanceType)}
          onChange={onTypeChange}
        />
      </Col>
    </Row>
  );
}
