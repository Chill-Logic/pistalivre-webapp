import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { DebtForm } from "@/components/organisms/debt-form";
import { ROUTES, routeTo } from "@/constants/routes";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function DebtNewPage() {
  const navigate = useNavigate();
  const backTo = useBackToList(ROUTES.financeDebts);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Débitos" />
      <PageHeader title="Nova dívida" />
      <DebtForm
        cancelTo={backTo}
        onSaved={(debt) => navigate(routeTo.debt(debt.id), { replace: true })}
      />
    </Box>
  );
}
