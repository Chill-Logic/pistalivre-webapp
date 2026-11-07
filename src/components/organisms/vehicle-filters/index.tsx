import { Box } from "@/components/atoms/box";
import { FilterSelect } from "@/components/molecules/filter-select";
import { SearchInput } from "@/components/molecules/search-input";
import { VEHICLE_STATUS_LABELS } from "@/constants/labels";
import { optionsFromLabels } from "@/helpers/select";
import type { VehicleFilters as Filters, VehicleType } from "@/types/vehicle";

const STATUS_OPTIONS = optionsFromLabels(VEHICLE_STATUS_LABELS);

type VehicleFiltersProps = {
  filters: Filters;
  types: VehicleType[];
  onSearch: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function VehicleFilters({
  filters,
  types,
  onSearch,
  onTypeChange,
  onStatusChange,
}: VehicleFiltersProps) {
  return (
    <Box className="grid gap-2 sm:grid-cols-[1fr_11rem_11rem]">
      <SearchInput
        value={filters.q}
        onSearch={onSearch}
        placeholder="Buscar por placa, marca ou modelo"
      />
      <FilterSelect
        label="Tipo"
        value={filters.type}
        allLabel="Todos os tipos"
        options={types.map((type) => ({ value: type.slug, label: type.name }))}
        onChange={onTypeChange}
      />
      <FilterSelect
        label="Situação"
        value={filters.status}
        allLabel="Todas as situações"
        options={STATUS_OPTIONS}
        onChange={onStatusChange}
      />
    </Box>
  );
}
