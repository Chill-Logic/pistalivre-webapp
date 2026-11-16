import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { publicPayService } from "@/services/api/cliente/public-pay.service";
import type { CardPaymentInput } from "@/types/payment-link";

/**
 * The checkout. While open it checks every 10 s: the PIX is paid in the bank
 * app, and the page turns into "Pago" by itself.
 */
export function usePublicPay(token: string) {
  return useQuery({
    queryKey: queryKeys.publicPay(token),
    queryFn: () => publicPayService.get(token),
    refetchInterval: (query) => (query.state.data?.state === "OPEN" ? 10_000 : false),
    retry: false,
  });
}

export function usePayWithCard(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CardPaymentInput) => publicPayService.payWithCard(token, input),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.publicPay(token), data),
  });
}
