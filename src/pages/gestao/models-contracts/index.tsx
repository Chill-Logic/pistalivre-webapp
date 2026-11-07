import { Box } from "@/components/atoms/box";
import {
  ContractTemplateList,
  ContractTemplateListSkeleton,
} from "@/components/organisms/contract-template-list";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { useContractTemplates } from "@/hooks/api/gestao/templates/useContractTemplates";

export function ModelsContractsPage() {
  const templates = useContractTemplates();
  return (
    <Box className="space-y-4 md:space-y-6">
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
