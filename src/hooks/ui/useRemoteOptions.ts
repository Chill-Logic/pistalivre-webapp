import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { RemoteOption } from "@/components/molecules/remote-combobox";
import { useCustomers } from "@/hooks/api/gestao/customers/useCustomers";
import { useVehicles } from "@/hooks/api/gestao/vehicles/useVehicles";
import { queryKeys } from "@/constants/query-keys";
import { suppliersService } from "@/services/api/gestao/suppliers.service";
import { usersService } from "@/services/api/gestao/users.service";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { vehicleName } from "@/helpers/vehicle";
import { formatCpf } from "@/utils/document";
import { formatPlate } from "@/utils/plate";

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

/** Vehicle search for pickers. */
export function useVehicleOptions() {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const vehicles = useVehicles({
    page: 1,
    pageSize: PICKER_SIZE,
    q,
    type: "",
    status: "",
  });
  const options = useMemo<RemoteOption[]>(
    () =>
      (vehicles.data?.items ?? []).map((vehicle) => ({
        value: vehicle.id,
        label: `${formatPlate(vehicle.plate)} · ${vehicleName(vehicle)}`,
        detail: vehicle.activeRental
          ? `Com ${vehicle.activeRental.customer.name}`
          : `${vehicle.type.name} · ${vehicle.year}`,
      })),
    [vehicles.data],
  );
  return { search, setSearch, options, isLoading: vehicles.isFetching };
}

/** Supplier search for pickers (e.g. a debt's lender). */
export function useSupplierOptions() {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const filters = {
    page: 1,
    pageSize: PICKER_SIZE,
    q,
    scope: "",
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
  return { search, setSearch, options, isLoading: suppliers.isFetching };
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
