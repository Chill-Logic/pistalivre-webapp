import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Signature } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { SelectField } from "@/components/molecules/select-field";
import { ContractReviewDialog } from "@/components/organisms/contract-review-dialog";
import { queryKeys } from "@/constants/query-keys";
import { routeTo } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import { contractsService } from "@/services/api/gestao/contracts.service";
import { customersService } from "@/services/api/gestao/customers.service";
import { signaturesService } from "@/services/api/gestao/signatures.service";
import type { ContractReview } from "@/types/contract";
import type { DocumentFile } from "@/types/document";
import type { RentalDetail } from "@/types/rental";
import { onlyDigits } from "@/utils/masks";

type Channel = "WHATSAPP" | "EMAIL";

const CHANNELS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "E-mail" },
];

/**
 * "Enviar para assinatura" straight from the rental's contract. First the
 * review: the agreed terms, where the frozen text differs, how the lessee is
 * told (WhatsApp by default when there is a phone — the public lives on it)
 * and "Revisei os termos". Then it creates the signature request with the
 * customer already as the lessee and opens it to add who else signs. Nothing
 * reaches the provider here — only "Solicitar assinatura(s)", on the request.
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
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState<ContractReview | null>(null);
  const [channel, setChannel] = useState<Channel>("WHATSAPP");

  const openReview = async () => {
    setReview(null);
    setOpen(true);
    try {
      const data = await contractsService.reviewDocument(rental.id, document.id);
      setReview(data);
      setChannel(data.signer?.channel ?? "EMAIL");
    } catch (failure) {
      setOpen(false);
      toast.error(toApiError(failure).message);
    }
  };

  const start = useMutation({
    mutationFn: async () => {
      const signature = await signaturesService.create(
        document.id,
        `Contrato ${rental.code} · ${rental.customer.name}`,
        true,
      );
      try {
        const customer = await customersService.get(rental.customer.id);
        await signaturesService.setSigners(signature.id, [
          {
            name: customer.name,
            email: customer.email ?? "",
            phone: customer.phone ? onlyDigits(customer.phone) : undefined,
            documentation: customer.document ? onlyDigits(customer.document) : undefined,
            order: 1,
            role: "LESSEE",
            notify: channel,
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
      setOpen(false);
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

  const contact =
    channel === "WHATSAPP"
      ? review?.signer?.phone
        ? `Vai para o WhatsApp ${review.signer.phone}.`
        : "O cliente não tem telefone no cadastro."
      : review?.signer?.email
        ? `Vai para o e-mail ${review.signer.email}.`
        : "O cliente não tem e-mail no cadastro.";

  return (
    <>
      <Button type="button" size="sm" onClick={() => void openReview()}>
        <Signature />
        Enviar para assinatura
      </Button>
      <ContractReviewDialog
        open={open}
        onOpenChange={(next) => {
          if (!start.isPending) setOpen(next);
        }}
        title="Revisar antes de enviar para assinatura"
        review={review}
        confirmLabel="Criar pedido de assinatura"
        busy={start.isPending}
        onConfirm={() => start.mutate()}
      >
        <SelectField
          label="Como o cliente recebe o contrato"
          value={channel}
          options={CHANNELS}
          onChange={(value) => setChannel(value as Channel)}
        />
        <Text size="xs" tone="muted" className="-mt-2">
          {contact}
        </Text>
      </ContractReviewDialog>
    </>
  );
}
