import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { routeTo } from "@/constants/routes";
import { errorMessage } from "@/helpers/api-error";
import { portalService } from "@/services/api/cliente/portal.service";

/** "Pagar" in the portal: opens our checkout of that charge (PIX, or card when it accepts). */
export function useChargeCheckout() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: portalService.chargePayLink,
    onSuccess: ({ token }) => navigate(routeTo.portalPay(token)),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
