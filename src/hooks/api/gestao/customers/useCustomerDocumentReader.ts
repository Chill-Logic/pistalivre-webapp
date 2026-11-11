import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { shrinkImage } from "@/helpers/image";
import { customersService } from "@/services/api/gestao/customers.service";

/** Whether "Preencher pelo documento" is available (AI on Anthropic). */
export function useCustomerDocumentReadEnabled() {
  return useQuery({
    queryKey: [...queryKeys.customers.all, "read-document-enabled"],
    queryFn: customersService.readDocumentEnabled,
    staleTime: 5 * 60_000,
  });
}

/**
 * The AI reads a CNH, RG or proof of residence (photos go shrunk: the API
 * takes images up to 5 MB). Errors are left to the caller.
 */
export function useReadCustomerDocument() {
  return useMutation({
    mutationFn: async (file: File) =>
      customersService.readDocument(await shrinkImage(file)),
  });
}
