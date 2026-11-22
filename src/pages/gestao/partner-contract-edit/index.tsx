import { Check, FileText, Link2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
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
import { contractFormDefaults } from "@/components/organisms/partner-contract-form/schema";
import { QueryError } from "@/components/organisms/query-error";
import { PartnerContractFormLayout } from "@/components/templates/partner-contract-form-layout";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { copyToClipboard } from "@/helpers/clipboard";
import { calculatorGroupsOf, scenarioFillOf } from "@/helpers/partner-calculator";
import { usePartnerContract } from "@/hooks/api/gestao/partners/usePartners";
import { useContractScenarioUrl } from "@/hooks/ui/useContractScenarioUrl";

/**
 * Editing a draft contract's terms, with the calculator (starting from its
 * saved scenario). What is being simulated stays in `?cenario=`: "Copiar
 * link" shares the same terms and numbers, and nothing is saved until
 * "Salvar contrato".
 */
export function PartnerContractEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const contract = usePartnerContract(id);
  const [terms, setTerms] = useState<CalculatorTerms | null>(null);
  const data = contract.data;
  const back = data ? routeTo.partnerContract(id) : ROUTES.partners;
  const savedTerms = useMemo(() => (data ? contractFormDefaults(data) : null), [data]);
  const scenarioUrl = useContractScenarioUrl(savedTerms);
  const shared = scenarioUrl.initial;
  const [copied, setCopied] = useState(false);
  const calculatorFill = useMemo(
    () =>
      shared?.calc
        ? { key: "link", ...shared.calc }
        : scenarioFillOf(data?.calculatorScenario),
    // The starting point only: later saves don't reset what is being simulated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.id],
  );

  const copyLink = async () => {
    if (!(await copyToClipboard(window.location.href))) {
      toast.error("Não foi possível copiar o link");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PartnerContractFormLayout
      header={
        <Box className="space-y-2">
          <BackLink to={back} label={data?.code ?? "Contrato"} />
          <PageHeader
            title={data ? `Editar ${data.code}` : "Editar contrato"}
            actions={
              data?.status === "DRAFT" ? (
                <Button variant="outline" size="sm" onClick={copyLink}>
                  {copied ? <Check /> : <Link2 />}
                  {copied ? "Copiado" : "Copiar link"}
                </Button>
              ) : undefined
            }
          />
          {shared && (
            <Alert variant="info" role="note">
              Simulação aberta por link: os valores abaixo ainda não estão
              salvos no contrato. “Salvar contrato” grava estes termos.
            </Alert>
          )}
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
                initialValues={shared?.terms}
                onTermsChange={(values) => {
                  setTerms(values as CalculatorTerms);
                  scenarioUrl.setTerms(values);
                }}
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
            fill={calculatorFill}
            onScenarioChange={scenarioUrl.setCalc}
          />
        ) : null
      }
    />
  );
}
