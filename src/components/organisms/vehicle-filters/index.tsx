import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { VehicleFilters as Filters, VehicleType } from "@/types/vehicle";

type VehicleFiltersProps = {
  filters: Filters;
  types: VehicleType[];
  isLoadingTypes?: boolean;
  onSearch: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function VehicleFilters({
  filters,
  types,
  isLoadingTypes = false,
  onSearch,
  onTypeChange,
  onStatusChange,
}: VehicleFiltersProps) {
  const { options } = useLabels();

  return (
    <Row className="gap-y-2">
      <Col md={6}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar por placa, marca ou modelo"
        />
      </Col>
      <Col sm={6} md={3}>
        <FilterSelect
          label="Tipo"
          value={filters.type}
          allLabel="Todos os tipos"
          options={types.map((type) => ({
            value: type.slug,
            label: type.name,
          }))}
          isLoading={isLoadingTypes}
          onChange={onTypeChange}
        />
      </Col>
      <Col sm={6} md={3}>
        <FilterSelect
          label="Situação"
          value={filters.status}
          allLabel="Todas as situações"
          options={options(LABEL_MAPS.vehicleStatus)}
          onChange={onStatusChange}
        />
      </Col>
    </Row>
  );
}
