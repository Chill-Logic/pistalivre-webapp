import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { SectionTabs } from "@/components/molecules/section-tabs";
import {
  ContractTemplateList,
  ContractTemplateListSkeleton,
} from "@/components/organisms/contract-template-list";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { MODEL_TABS } from "@/constants/models";
import { useContractTemplates } from "@/hooks/api/gestao/templates/useContractTemplates";

export function ModelsContractsPage() {
  const templates = useContractTemplates();
  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Modelos" />
      <SectionTabs tabs={MODEL_TABS} label="Tipos de modelo" />
      <QueryBoundary
        query={templates}
        label="Carregando modelos…"
        skeleton={<ContractTemplateListSkeleton />}
      >
        {(data) => <ContractTemplateList templates={data} />}
      </QueryBoundary>
    </Box>
  );
}
