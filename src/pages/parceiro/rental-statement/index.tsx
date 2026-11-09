import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { RentStatementPanel } from "@/components/organisms/rent-statement-panel";
import { routeTo } from "@/constants/routes";

/**
 * The rent statement of a rental on the partner's vehicle, as the customer
 * sees it — cut by the server to the partner's window, without the
 * customer's own debts.
 */
export function PartnerRentalStatementPage() {
  const { id = "" } = useParams();

  return (
    <Box className="space-y-4">
      <BackLink to={routeTo.partnerAreaRental(id)} label="Locação" />
      <PageHeader title="Extrato" />
      <RentStatementPanel scope="partner" rentalId={id} />
    </Box>
  );
}
