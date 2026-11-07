import { Col, Row } from "@/components/atoms/grid";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { UserFilters as Filters } from "@/types/user";

type UserFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onRoleChange: (value: string) => void;
};

export function UserFilters({
  filters,
  onSearch,
  onRoleChange,
}: UserFiltersProps) {
  const { options } = useLabels();
  return (
    <Row className="gap-y-2">
      <Col md={8}>
        <SearchInput
          value={filters.q}
          onSearch={onSearch}
          placeholder="Buscar por nome ou e-mail"
        />
      </Col>
      <Col md={4}>
        <FilterSelect
          label="Perfil"
          value={filters.role}
          allLabel="Todos os perfis"
          options={options(LABEL_MAPS.userRole)}
          onChange={onRoleChange}
        />
      </Col>
    </Row>
  );
}
