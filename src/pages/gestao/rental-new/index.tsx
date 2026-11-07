import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { RentalForm } from "@/components/organisms/rental-form";
import { ROUTES, routeTo } from "@/constants/routes";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function RentalNewPage() {
  const navigate = useNavigate();
  const backTo = useBackToList(ROUTES.rentals);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Locações" />
      <PageHeader title="Nova locação" />
      <RentalForm
        cancelTo={backTo}
        onSaved={(rental) =>
          navigate(routeTo.rental(rental.id), { replace: true })
        }
      />
    </Box>
  );
}
