import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { RentalFilters as Filters } from "@/types/rental";

type RentalFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function RentalFilters({
  filters,
  onSearch,
  onStatusChange,
}: RentalFiltersProps) {
  const { options } = useLabels();

  return (
    <Row className="gap-y-2">
      <Col md={8}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar por código, cliente ou placa"
        />
      </Col>
      <Col md={4}>
        <FilterSelect
          label="Situação"
          value={filters.status}
          allLabel="Todas as situações"
          options={options(LABEL_MAPS.rentalStatus)}
          onChange={onStatusChange}
        />
      </Col>
    </Row>
  );
}
