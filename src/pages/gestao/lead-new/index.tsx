import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { LeadForm, LeadFormSkeleton } from "@/components/organisms/lead-form";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { ROUTES, routeTo } from "@/constants/routes";
import { useCrmOptions } from "@/hooks/api/gestao/crm/useCrmOptions";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function LeadNewPage() {
  const navigate = useNavigate();
  const backTo = useBackToList(ROUTES.crm);
  const options = useCrmOptions();

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="CRM" />
      <PageHeader title="Novo lead" />
      <QueryBoundary
        query={options}
        label="Carregando formulário…"
        skeleton={<LeadFormSkeleton />}
      >
        {(data) => (
          <LeadForm
            options={data}
            cancelTo={backTo}
            onSaved={(lead) => navigate(routeTo.lead(lead.id), { replace: true })}
          />
        )}
      </QueryBoundary>
    </Box>
  );
}
