import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { suppliersService } from "@/services/api/gestao/suppliers.service";
import type { SupplierDetail } from "@/types/supplier";

/**
 * Fixed costs of one vehicle, seen from the vehicle: the SAME routes as the
 * supplier's "Veículos vinculados" (`PUT`/`DELETE
 * /suppliers/:id/vehicles/:vehicleId`). They answer with the supplier's
 * detail, which replaces its cache; the vehicle refetches.
 */
export function useVehicleSupplierLinks(vehicleId: string) {
  const queryClient = useQueryClient();
  const onSuccess = (supplier: SupplierDetail) => {
    queryClient.setQueryData(queryKeys.suppliers.detail(supplier.id), supplier);
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.suppliers.all, "list"],
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.vehicles.detail(vehicleId),
    });
  };

  /** Links, or changes the amount of an existing link (same PUT). */
  const save = useMutation({
    mutationFn: (input: { supplierId: string; monthlyAmount: number }) =>
      suppliersService.linkVehicle(
        input.supplierId,
        vehicleId,
        input.monthlyAmount,
      ),
    onSuccess,
  });

  const unlink = useMutation({
    mutationFn: (supplierId: string) =>
      suppliersService.unlinkVehicle(supplierId, vehicleId),
    onSuccess: (supplier) => {
      onSuccess(supplier);
      toast.success("Custo fixo desvinculado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { save, unlink };
}
