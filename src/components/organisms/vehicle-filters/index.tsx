import { Select } from "@/components/atoms/select";
import { SearchInput } from "@/components/molecules/search-input";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_OPTIONS,
} from "@/constants/labels";
import type { VehicleFilters as Filters } from "@/types/vehicle";

type VehicleFiltersProps = {
  filters: Filters;
  onSearch: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function VehicleFilters({
  filters,
  onSearch,
  onTypeChange,
  onStatusChange,
}: VehicleFiltersProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_10rem_10rem]">
      <SearchInput
        value={filters.q}
        onSearch={onSearch}
        placeholder="Buscar por placa, marca ou modelo"
      />
      <Select
        value={filters.type}
        onChange={(event) => onTypeChange(event.target.value)}
        aria-label="Tipo"
      >
        <option value="">Todos os tipos</option>
        {VEHICLE_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Select
        value={filters.status}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Situação"
      >
        <option value="">Todas as situações</option>
        {Object.entries(VEHICLE_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
