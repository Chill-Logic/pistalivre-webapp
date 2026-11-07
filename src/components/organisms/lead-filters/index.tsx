import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import type { LeadFilters as Filters } from "@/types/crm";

const TEST_OPTIONS = [
  { value: "test", label: "Só de teste" },
  { value: "all", label: "Reais e de teste" },
];

type LeadFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onTestChange: (value: string) => void;
};

export function LeadFilters({
  filters,
  onSearch,
  onTestChange,
}: LeadFiltersProps) {
  return (
    <Row className="gap-y-2">
      <Col md={8}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar por nome, telefone ou e-mail"
        />
      </Col>
      <Col md={4}>
        <FilterSelect
          label="Leads de teste"
          value={filters.test}
          allLabel="Só leads reais"
          options={TEST_OPTIONS}
          onChange={onTestChange}
        />
      </Col>
    </Row>
  );
}
