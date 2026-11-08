import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { RentStatementPanel } from "@/components/organisms/rent-statement-panel";
import { routeTo } from "@/constants/routes";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";

/** The rent statement on screen, for the staff to check before exporting. */
export function RentalStatementPage() {
  const { id = "" } = useParams();
  const rental = useRental(id);

  return (
    <Box className="space-y-4">
      <BackLink
        to={routeTo.rental(id)}
        label={rental.data?.code ?? "Locação"}
      />
      <PageHeader title="Extrato" />
      <RentStatementPanel scope="staff" rentalId={id} />
    </Box>
  );
}
