import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { paymentCardsService } from "@/services/api/gestao/payment-cards.service";

export function usePaymentCards() {
  return useQuery({
    queryKey: queryKeys.paymentCards.all,
    queryFn: paymentCardsService.list,
  });
}
