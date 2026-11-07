import { useMemo, useState } from "react";
import type { RemoteOption } from "@/components/molecules/remote-combobox";
import { useCustomers } from "@/hooks/api/gestao/customers/useCustomers";
import { useVehicles } from "@/hooks/api/gestao/vehicles/useVehicles";
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
