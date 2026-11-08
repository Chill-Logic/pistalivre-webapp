import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { RentStatementPanel } from "@/components/organisms/rent-statement-panel";
import { routeTo } from "@/constants/routes";

/** The renter's own rent statement (same model as the PDF). */
export function PortalRentalStatementPage() {
  const { id = "" } = useParams();

  return (
    <Box className="space-y-4">
      <BackLink to={routeTo.portalRental(id)} label="Locação" />
      <PageHeader title="Extrato" />
      <RentStatementPanel scope="portal" rentalId={id} />
    </Box>
  );
}
