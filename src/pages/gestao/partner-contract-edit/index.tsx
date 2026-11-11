import { FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
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
import { isNotFound } from "@/helpers/api-error";
import { calculatorGroupsOf } from "@/helpers/partner-calculator";
import { usePartnerContract } from "@/hooks/api/gestao/partners/usePartners";

/** Editing a draft contract's terms, with the calculator (starting from its vehicles). */
export function PartnerContractEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const contract = usePartnerContract(id);
  const [terms, setTerms] = useState<CalculatorTerms | null>(null);
  const data = contract.data;
  const back = data ? routeTo.partnerContract(id) : ROUTES.partners;

  return (
    <PartnerContractFormLayout
      header={
        <Box className="space-y-2">
          <BackLink to={back} label={data?.code ?? "Contrato"} />
          <PageHeader
            title={data ? `Editar ${data.code}` : "Editar contrato"}
          />
        </Box>
      }
      form={
        contract.isPending ? (
          <SkeletonRegion label="Carregando o contrato…">
            <PartnerContractFormSkeleton />
          </SkeletonRegion>
        ) : contract.isError ? (
          isNotFound(contract.error) ? (
            <EmptyState
              icon={FileText}
              title="Contrato não encontrado"
              description="Ele pode ter sido excluído."
            />
          ) : (
            <QueryError
              error={contract.error}
              onRetry={() => contract.refetch()}
            />
          )
        ) : contract.data.status !== "DRAFT" ? (
          <EmptyState
            icon={FileText}
            title="Só o rascunho é editável"
            description="Depois de ativo, os termos do contrato não mudam por aqui."
          />
        ) : (
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <PartnerContractForm
                partnerId={contract.data.partner.id}
                contract={contract.data}
                onTermsChange={(values) => setTerms(values as CalculatorTerms)}
                onCancel={() => navigate(back)}
                onDone={() => navigate(back, { replace: true })}
              />
            </CardContent>
          </Card>
        )
      }
      calculator={
        data ? (
          <PartnerContractCalculator
            key={data.id}
            terms={terms}
            initialGroups={calculatorGroupsOf(data)}
          />
        ) : null
      }
    />
  );
}
