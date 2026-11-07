import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SignatureFilters as Filters } from "@/types/signature";

type SignatureFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function SignatureFilters({
  filters,
  onSearch,
  onStatusChange,
}: SignatureFiltersProps) {
  const { options } = useLabels();
  return (
    <Row className="gap-y-2">
      <Col md={8}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar documento ou signatário"
        />
      </Col>
      <Col md={4}>
        <FilterSelect
          label="Situação"
          value={filters.status}
          allLabel="Todas as situações"
          options={options(LABEL_MAPS.signatureStatus)}
          onChange={onStatusChange}
        />
      </Col>
    </Row>
  );
}
