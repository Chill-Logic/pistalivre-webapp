import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { CustomerFilters as Filters } from "@/types/customer";

const TEST_OPTIONS = [
  { value: "test", label: "Só de teste" },
  { value: "all", label: "Reais e de teste" },
];

const APP_OPTIONS = [
  { value: "pwa", label: "Usa o app" },
  { value: "browser", label: "Só navegador" },
];

type CustomerFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTestChange: (value: string) => void;
  onAppChange: (value: string) => void;
};

export function CustomerFilters({
  filters,
  onSearch,
  onStatusChange,
  onTestChange,
  onAppChange,
}: CustomerFiltersProps) {
  const { label } = useLabels();
  // The API filters by lowercase scope; the labels come from the catalog.
  const statusOptions = [
    { value: "active", label: label(LABEL_MAPS.customerStatus, "ACTIVE") },
    { value: "prospect", label: label(LABEL_MAPS.customerStatus, "PROSPECT") },
  ];

  return (
    <Row className="gap-y-2">
      <Col>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar por nome, e-mail ou CPF"
        />
      </Col>
      <Col sm={4}>
        <FilterSelect
          label="Situação"
          value={filters.status}
          allLabel="Todas as situações"
          options={statusOptions}
          onChange={onStatusChange}
        />
      </Col>
      <Col sm={4}>
        <FilterSelect
          label="Clientes de teste"
          value={filters.test}
          allLabel="Só clientes reais"
          options={TEST_OPTIONS}
          onChange={onTestChange}
        />
      </Col>
      <Col sm={4}>
        <FilterSelect
          label="App"
          value={filters.app}
          allLabel="App: todos"
          options={APP_OPTIONS}
          onChange={onAppChange}
        />
      </Col>
    </Row>
  );
}
