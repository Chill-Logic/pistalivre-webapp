import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Signature } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { queryKeys } from "@/constants/query-keys";
import { routeTo } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import { customersService } from "@/services/api/gestao/customers.service";
import { signaturesService } from "@/services/api/gestao/signatures.service";
import type { DocumentFile } from "@/types/document";
import type { RentalDetail } from "@/types/rental";
import { onlyDigits } from "@/utils/masks";

/**
 * "Enviar para assinatura" straight from the rental's contract: creates the
 * signature request with this PDF and the customer already as the lessee,
 * then opens it to add who else signs and send. Nothing reaches the
 * provider here — only "Solicitar assinatura(s)", on the request.
 */
export function ContractSignatureStart({
  rental,
  document,
}: {
  rental: RentalDetail;
  document: DocumentFile;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const start = useMutation({
    mutationFn: async () => {
      const signature = await signaturesService.create(
        document.id,
        `Contrato ${rental.code} · ${rental.customer.name}`,
      );
      try {
        const customer = await customersService.get(rental.customer.id);
        await signaturesService.setSigners(signature.id, [
          {
            name: customer.name,
            email: customer.email ?? "",
            phone: customer.phone ? onlyDigits(customer.phone) : undefined,
            documentation: customer.document
              ? onlyDigits(customer.document)
              : undefined,
            order: 1,
            role: "LESSEE",
            notify: "EMAIL",
            customerId: customer.id,
          },
        ]);
        return { id: signature.id, signerAdded: true };
      } catch {
        // The request exists anyway: the person adds the customer there.
        return { id: signature.id, signerAdded: false };
      }
    },
    onSuccess: ({ id, signerAdded }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      toast.success(
        signerAdded
          ? "Pedido criado com o cliente. Inclua quem mais assina e solicite."
          : "Pedido criado. Inclua os signatários e solicite.",
      );
      navigate(routeTo.signature(id));
    },
    onError: (failure) => toast.error(toApiError(failure).message),
  });

  return (
    <Button
      type="button"
      size="sm"
      onClick={() => start.mutate()}
      disabled={start.isPending}
    >
      {start.isPending ? (
        <Spinner className="text-primary-foreground" />
      ) : (
        <Signature />
      )}
      Enviar para assinatura
    </Button>
  );
}
