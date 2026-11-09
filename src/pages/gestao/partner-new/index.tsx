import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { AdminOnly } from "@/components/organisms/admin-only";
import { PartnerForm } from "@/components/organisms/partner-form";
import { PARTNERS_ADMIN_ONLY } from "@/constants/partner";
import { ROUTES, routeTo } from "@/constants/routes";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function PartnerNewPage() {
  const navigate = useNavigate();
  const backTo = useBackToList(ROUTES.partners);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Parceiros" />
      <PageHeader title="Novo parceiro" />
      <AdminOnly description={PARTNERS_ADMIN_ONLY}>
        <PartnerForm
          cancelTo={backTo}
          onSaved={(partner) =>
            navigate(routeTo.partner(partner.id), { replace: true })
          }
        />
      </AdminOnly>
    </Box>
  );
}
