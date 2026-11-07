import { useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  CustomerForm,
  CustomerFormSkeleton,
} from "@/components/organisms/customer-form";
import { ROUTES, routeTo } from "@/constants/routes";
import { useLead } from "@/hooks/api/gestao/crm/useLead";
import { useBackToList } from "@/hooks/ui/useBackToList";
import { maskPhone } from "@/utils/masks";

/**
 * New customer. With ?lead=<id> it converts a lead: name/phone/e-mail come
 * prefilled and the lead is linked (WON) when the customer is created.
 */
export function CustomerNewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const leadId = params.get("lead") ?? "";
  const lead = useLead(leadId);
  const backTo = useBackToList(
    leadId ? routeTo.lead(leadId) : ROUTES.customers,
  );
  const waitingLead = Boolean(leadId) && lead.isPending;

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label={leadId ? "Lead" : "Clientes"} />
      <PageHeader title="Novo cliente" />
      {waitingLead ? (
        <SkeletonRegion label="Carregando dados do lead…">
          <CustomerFormSkeleton />
        </SkeletonRegion>
      ) : (
        <CustomerForm
          leadId={leadId || undefined}
          prefill={
            lead.data
              ? {
                  name: lead.data.name,
                  email: lead.data.email ?? "",
                  phone: lead.data.phone ? maskPhone(lead.data.phone) : "",
                }
              : undefined
          }
          cancelTo={backTo}
          onSaved={(customer) =>
            navigate(routeTo.customer(customer.id), { replace: true })
          }
        />
      )}
    </Box>
  );
}
