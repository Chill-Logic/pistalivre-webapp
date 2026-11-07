import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { ContractTemplateForm } from "@/components/organisms/contract-template-form";
import { ROUTES, routeTo } from "@/constants/routes";

export function ContractTemplateNewPage() {
  const navigate = useNavigate();
  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.models} label="Modelos" />
      <PageHeader title="Novo modelo de contrato" />
      <ContractTemplateForm
        cancelTo={ROUTES.models}
        onSaved={(template) =>
          navigate(routeTo.contractTemplate(template.id), { replace: true })
        }
      />
    </Box>
  );
}
