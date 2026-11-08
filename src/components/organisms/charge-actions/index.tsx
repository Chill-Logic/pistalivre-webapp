import { ChargeDeleteButton } from "@/components/organisms/charge-delete-button";
import { ChargeEditDialog } from "@/components/organisms/charge-edit-dialog";
import { ChargeReferenceDateDialog } from "@/components/organisms/charge-reference-date-dialog";
import { ChargeSettleDialog } from "@/components/organisms/charge-settle-dialog";
import { ChargeSettlementDialog } from "@/components/organisms/charge-settlement-dialog";
import type { Charge } from "@/types/rental";

/**
 * Which buttons a charge gets (same rule as the management app):
 * open → settle, edit, delete; settled by the received pix → nothing to do
 * by hand; manual already paid → correct or delete the entry; paid at
 * Asaas → nothing (the payment lives there). "Referente a": rent only.
 */
export function ChargeActions({ charge }: { charge: Charge }) {
  const open = !charge.amounts.isPaid;
  const reference =
    charge.purpose === "RENT" ? (
      <ChargeReferenceDateDialog charge={charge} />
    ) : null;

  if (open) {
    return (
      <>
        {reference}
        <ChargeSettleDialog charge={charge} />
        <ChargeEditDialog charge={charge} />
        <ChargeDeleteButton charge={charge} />
      </>
    );
  }
  if (
    !charge.settledByReceipt &&
    charge.channel === "manual" &&
    charge.paidAt
  ) {
    return (
      <>
        {reference}
        <ChargeSettlementDialog charge={charge} />
        <ChargeDeleteButton charge={charge} />
      </>
    );
  }
  return reference;
}
