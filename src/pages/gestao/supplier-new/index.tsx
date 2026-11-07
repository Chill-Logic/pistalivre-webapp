import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SupplierForm } from "@/components/organisms/supplier-form";
import { ROUTES, routeTo } from "@/constants/routes";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function SupplierNewPage() {
  const navigate = useNavigate();
  const backTo = useBackToList(ROUTES.suppliers);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Fornecedores" />
      <PageHeader title="Novo fornecedor" />
      <SupplierForm
        cancelTo={backTo}
        onSaved={(supplier) =>
          navigate(routeTo.supplier(supplier.id), { replace: true })
        }
      />
    </Box>
  );
}
