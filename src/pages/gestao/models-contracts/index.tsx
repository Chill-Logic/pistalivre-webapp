import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  ContractTemplateList,
  ContractTemplateListSkeleton,
} from "@/components/organisms/contract-template-list";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { ROUTES } from "@/constants/routes";
import { useContractTemplates } from "@/hooks/api/gestao/templates/useContractTemplates";

export function ModelsContractsPage() {
  const templates = useContractTemplates();
  return (
    <Box className="space-y-4 md:space-y-6">
      <Box className="flex justify-end">
        <Button asChild>
          <Link to={ROUTES.contractTemplateNew}>
            <Plus />
            Novo modelo
          </Link>
        </Button>
      </Box>
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
