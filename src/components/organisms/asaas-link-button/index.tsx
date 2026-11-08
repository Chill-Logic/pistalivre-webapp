import { Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { errorMessage } from "@/helpers/api-error";
import { useLinkAsaasCustomer } from "@/hooks/api/gestao/customers/useAsaasCustomerMutations";
import { formatCpf } from "@/utils/document";

type AsaasLinkButtonProps = {
  customerId: string;
  customerName: string;
  document: string;
  asaasCustomerId: string;
  /** Icon only, with the label as a hint (tight table cells). */
  compact?: boolean;
};

/**
 * Links the customer to the same CPF in Asaas, after a confirmation. Lives
 * inside clickable rows: clicks (also from the dialog, a portal) stop here.
 */
export function AsaasLinkButton({
  customerId,
  customerName,
  document,
  asaasCustomerId,
  compact = false,
}: AsaasLinkButtonProps) {
  const link = useLinkAsaasCustomer();
  const [open, setOpen] = useState(false);
  const label = `Vincular ${customerName} ao Asaas`;
  const button = (
    <Button
      variant="outline"
      size="sm"
      aria-label={label}
      className={compact ? "w-9 px-0 md:w-8" : undefined}
    >
      <Link2 />
      {!compact && "Vincular"}
    </Button>
  );

  const dialog = (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        compact ? <TooltipTrigger asChild>{button}</TooltipTrigger> : button
      }
      title="Vincular ao Asaas?"
      description={`${customerName} (CPF ${formatCpf(document)}) passa a usar o cliente do Asaas com o mesmo CPF: cobranças, pagamentos e notas fiscais casam com este cadastro.`}
      confirmLabel="Vincular"
      isPending={link.isPending}
      onConfirm={() =>
        link.mutate(
          { customerId, asaasCustomerId },
          {
            onSuccess: () => setOpen(false),
            onError: (error) => toast.error(errorMessage(error)),
          },
        )
      }
    />
  );

  return (
    <Box className="contents" onClick={(event) => event.stopPropagation()}>
      {compact ? (
        <Tooltip>
          {dialog}
          <TooltipContent>Vincular ao Asaas</TooltipContent>
        </Tooltip>
      ) : (
        dialog
      )}
    </Box>
  );
}
