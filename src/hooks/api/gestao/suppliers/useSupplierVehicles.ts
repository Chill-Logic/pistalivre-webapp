import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { suppliersService } from "@/services/api/gestao/suppliers.service";
import type { SupplierDetail } from "@/types/supplier";

/**
 * Vehicle links of a VEHICLE-scope supplier. Every route answers with the
 * whole detail, so it replaces the cached one (the list's vehicle count goes
 * stale and is refetched).
 */
export function useSupplierVehicles(supplierId: string) {
  const queryClient = useQueryClient();
  const onSuccess = (supplier: SupplierDetail) => {
    queryClient.setQueryData(queryKeys.suppliers.detail(supplierId), supplier);
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.suppliers.all, "list"],
    });
    // The vehicle's page lists its fixed costs too.
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.vehicles.all, "detail"],
    });
  };

  const link = useMutation({
    mutationFn: (input: { vehicleId: string; monthlyAmount: number }) =>
      suppliersService.linkVehicle(
        supplierId,
        input.vehicleId,
        input.monthlyAmount,
      ),
    onSuccess,
  });

  const unlink = useMutation({
    mutationFn: (vehicleId: string) =>
      suppliersService.unlinkVehicle(supplierId, vehicleId),
    onSuccess: (supplier) => {
      onSuccess(supplier);
      toast.success("Veículo desvinculado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const propagate = useMutation({
    mutationFn: (input: { monthlyAmount: number; vehicleIds?: string[] }) =>
      suppliersService.propagate(
        supplierId,
        input.monthlyAmount,
        input.vehicleIds,
      ),
    onSuccess: (supplier) => {
      onSuccess(supplier);
      toast.success("Valores atualizados");
    },
  });

  return { link, unlink, propagate };
}
