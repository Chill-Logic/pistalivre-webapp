import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  PartnerContractCalculator,
  type CalculatorTerms,
} from "@/components/organisms/partner-contract-calculator";
import {
  PartnerContractForm,
  PartnerContractFormSkeleton,
} from "@/components/organisms/partner-contract-form";
import { QueryError } from "@/components/organisms/query-error";
import { PartnerContractFormLayout } from "@/components/templates/partner-contract-form-layout";
import { ROUTES, routeTo } from "@/constants/routes";
import { usePartner } from "@/hooks/api/gestao/partners/usePartners";

/**
 * "Novo contrato" of a partner, as a page: the terms on the left and, beside
 * them, the calculator that answers "quanto o parceiro recebe?" while they're
 * typed. Saving creates the draft and opens it (vehicles, proposal…).
 */
export function PartnerContractNewPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const partner = usePartner(id);
  const [terms, setTerms] = useState<CalculatorTerms | null>(null);
  const back = partner.data ? routeTo.partner(id) : ROUTES.partners;

  return (
    <PartnerContractFormLayout
      header={
        <Box className="space-y-2">
          <BackLink to={back} label={partner.data?.name ?? "Parceiro"} />
          <PageHeader title="Novo contrato" />
        </Box>
      }
      form={
        partner.isPending ? (
          <SkeletonRegion label="Carregando o parceiro…">
            <PartnerContractFormSkeleton />
          </SkeletonRegion>
        ) : partner.isError ? (
          <QueryError error={partner.error} onRetry={() => partner.refetch()} />
        ) : (
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <PartnerContractForm
                partnerId={id}
                onTermsChange={(values) => setTerms(values as CalculatorTerms)}
                onCancel={() => navigate(back)}
                onDone={(contract) =>
                  navigate(routeTo.partnerContract(contract.id), {
                    replace: true,
                  })
                }
              />
            </CardContent>
          </Card>
        )
      }
      calculator={<PartnerContractCalculator terms={terms} />}
    />
  );
}
