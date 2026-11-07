import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SupplierFilters as Filters } from "@/types/supplier";

const ACTIVE_OPTIONS = [
  { value: "true", label: "Ativos" },
  { value: "false", label: "Inativos" },
];

type SupplierFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onScopeChange: (value: string) => void;
  onActiveChange: (value: string) => void;
};

export function SupplierFilters({
  filters,
  onSearch,
  onScopeChange,
  onActiveChange,
}: SupplierFiltersProps) {
  const { options } = useLabels();
  return (
    <Row className="gap-y-2">
      <Col md={6}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar fornecedor"
        />
      </Col>
      <Col sm={6} md={3}>
        <FilterSelect
          label="Escopo"
          value={filters.scope}
          allLabel="Empresa e veículo"
          options={options(LABEL_MAPS.supplierScope)}
          onChange={onScopeChange}
        />
      </Col>
      <Col sm={6} md={3}>
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
