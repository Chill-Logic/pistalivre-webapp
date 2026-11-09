import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { RemoteOption } from "@/components/molecules/remote-combobox";
import { useCustomers } from "@/hooks/api/gestao/customers/useCustomers";
import { useRentals } from "@/hooks/api/gestao/rentals/useRentals";
import { useVehicles } from "@/hooks/api/gestao/vehicles/useVehicles";
import { queryKeys } from "@/constants/query-keys";
import { suppliersService } from "@/services/api/gestao/suppliers.service";
import { usersService } from "@/services/api/gestao/users.service";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { vehicleName } from "@/helpers/vehicle";
import { formatCpf } from "@/utils/document";
import { formatPlate } from "@/utils/plate";
import type { SupplierScope } from "@/types/supplier";
import type { VehicleStatus } from "@/types/vehicle";

const PICKER_SIZE = 20;

/** Customer search for pickers (real customers, server-side). */
export function useCustomerOptions() {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const customers = useCustomers({
    page: 1,
    pageSize: PICKER_SIZE,
    q,
    status: "",
    test: "",
  });
  const options = useMemo<RemoteOption[]>(
    () =>
      (customers.data?.items ?? []).map((customer) => ({
        value: customer.id,
        label: customer.name,
        detail: `CPF ${formatCpf(customer.document)}`,
      })),
    [customers.data],
  );
  return { search, setSearch, options, isLoading: customers.isFetching };
}

type VehicleOptionsConfig = {
  /** Only vehicles in this situation (e.g. available for a new rental). */
  status?: VehicleStatus;
  /** Always offered (e.g. the rental's current vehicle, now rented). */
  include?: RemoteOption;
};

/** Vehicle search for pickers. */
export function useVehicleOptions({
  status,
  include,
}: VehicleOptionsConfig = {}) {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const vehicles = useVehicles({
    page: 1,
    pageSize: PICKER_SIZE,
    q,
    type: "",
    status: status ?? "",
  });
  const includeValue = include?.value;
  const includeLabel = include?.label;
  const includeDetail = include?.detail;
  const options = useMemo<RemoteOption[]>(() => {
    const found = (vehicles.data?.items ?? []).map((vehicle) => ({
      value: vehicle.id,
      label: `${formatPlate(vehicle.plate)} · ${vehicleName(vehicle)}`,
      detail: vehicle.activeRental
        ? `Com ${vehicle.activeRental.customer.name}`
        : `${vehicle.type.name} · ${vehicle.year}`,
    }));
    const term = q.trim().toLowerCase();
    const showInclude =
      includeValue !== undefined &&
      includeLabel !== undefined &&
      !found.some((option) => option.value === includeValue) &&
      includeLabel.toLowerCase().includes(term);
    return showInclude
      ? [
          { value: includeValue, label: includeLabel, detail: includeDetail },
          ...found,
        ]
      : found;
  }, [vehicles.data, q, includeValue, includeLabel, includeDetail]);
  return { search, setSearch, options, isLoading: vehicles.isFetching };
}

/**
 * Supplier search for pickers (e.g. a debt's lender). `scope: "VEHICLE"`
 * = only the fixed costs that link to vehicles; `items` keeps each one's
 * base amount (suggested when linking).
 */
export function useSupplierOptions({
  scope = "",
}: { scope?: SupplierScope | "" } = {}) {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const filters = {
    page: 1,
    pageSize: PICKER_SIZE,
    q,
    scope,
    active: "",
  } as const;
  const suppliers = useQuery({
    queryKey: queryKeys.suppliers.list(filters),
    queryFn: () => suppliersService.list(filters),
  });
  const options = useMemo<RemoteOption[]>(
    () =>
      (suppliers.data?.items ?? []).map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
      })),
    [suppliers.data],
  );
  return {
    search,
    setSearch,
    options,
    items: suppliers.data?.items ?? [],
    isLoading: suppliers.isFetching,
  };
}

/** Staff search for pickers (e.g. a partner who lent money). */
export function useUserOptions() {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const filters = { page: 1, pageSize: PICKER_SIZE, q, role: "" } as const;
  const users = useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersService.list(filters),
  });
  const options = useMemo<RemoteOption[]>(
    () =>
      (users.data?.items ?? []).map((user) => ({
        value: user.id,
        label: user.name,
        detail: user.email,
      })),
    [users.data],
  );
  return { search, setSearch, options, isLoading: users.isFetching };
}

/**
 * Rental search for pickers (any situation). Without a typed term it searches
 * `fallback` (e.g. the chosen vehicle's plate), so that vehicle's rentals
 * come first. `items` keeps each rental's vehicle.
 */
export function useRentalOptions({ fallback = "" }: { fallback?: string } = {}) {
  const [search, setSearch] = useState("");
  const typed = useDebouncedValue(search);
  const rentals = useRentals({
    page: 1,
    pageSize: PICKER_SIZE,
    q: typed.trim() || fallback,
    status: "",
  });
  const options = useMemo<RemoteOption[]>(
    () =>
      (rentals.data?.items ?? []).map((rental) => ({
        value: rental.id,
        label: `${rental.code} · ${rental.customer.name}`,
        detail: `${formatPlate(rental.vehicle.plate)} · ${vehicleName(rental.vehicle)}`,
      })),
    [rentals.data],
  );
  return {
    search,
    setSearch,
    options,
    items: rentals.data?.items ?? [],
    isLoading: rentals.isFetching,
  };
}
