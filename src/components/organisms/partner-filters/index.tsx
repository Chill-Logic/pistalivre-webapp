import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import type { PartnerFilters as Filters } from "@/types/partner";

const ACTIVE_OPTIONS = [
  { value: "true", label: "Ativos" },
  { value: "false", label: "Inativos" },
];

type PartnerFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onActiveChange: (value: string) => void;
};

export function PartnerFilters({
  filters,
  onSearch,
  onActiveChange,
}: PartnerFiltersProps) {
  return (
    <Row className="gap-y-2">
      <Col md={8} lg={9}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar parceiro"
        />
      </Col>
      <Col md={4} lg={3}>
        <FilterSelect
          label="Situação"
          value={filters.active}
          allLabel="Ativos e inativos"
          options={ACTIVE_OPTIONS}
          onChange={onActiveChange}
        />
      </Col>
    </Row>
  );
}
