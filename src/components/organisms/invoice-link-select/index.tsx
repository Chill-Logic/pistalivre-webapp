import { Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useLinkInvoice } from "@/hooks/api/gestao/invoices/useInvoiceMutations";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Invoice } from "@/types/invoice";
import type { RentalListItem } from "@/types/rental";

/** Links a loose NF of the customer to one of the customer's rentals. */
export function InvoiceLinkSelect({
  invoice,
  rentals,
}: {
  invoice: Invoice;
  rentals: Pick<RentalListItem, "id" | "code" | "status">[];
}) {
  const { label } = useLabels();
  const link = useLinkInvoice();
  const [rentalId, setRentalId] = useState("");

  if (rentals.length === 0) return null;

  return (
    <Box className="flex items-end gap-2">
      <Box className="w-48">
        <SelectField
          label="Vincular à locação"
          value={rentalId}
          placeholder="Escolha a locação"
          options={rentals.map((rental) => ({
            value: rental.id,
            label: `${rental.code} · ${label(LABEL_MAPS.rentalStatus, rental.status)}`,
          }))}
          onChange={setRentalId}
          disabled={link.isPending}
        />
      </Box>
      <Button
        variant="outline"
        size="sm"
        disabled={!rentalId || link.isPending}
        aria-label={`Vincular ${invoice.number ? `NF ${invoice.number}` : "nota fiscal"} à locação`}
        onClick={() =>
          link.mutate(
            { id: invoice.id, rentalId },
            { onError: (error) => toast.error(moneyErrorMessage(error)) },
          )
        }
      >
        <Link2 />
        Vincular
      </Button>
    </Box>
  );
}
