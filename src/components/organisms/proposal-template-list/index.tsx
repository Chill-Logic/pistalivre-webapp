import { FileText, Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { ProposalTemplateDeleteButton } from "@/components/organisms/proposal-template-delete-button";
import { ROUTES, routeTo } from "@/constants/routes";
import type { ProposalTemplateSummary } from "@/types/template";
import { pluralize } from "@/utils/text";

/** Proposal templates: active or not, with their optional clauses. */
export function ProposalTemplateList({
  templates,
}: {
  templates: ProposalTemplateSummary[];
}) {
  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum modelo de proposta"
        description="O modelo é a minuta apresentada ao lead antes do contrato."
        action={
          <Button asChild size="sm">
            <Link to={ROUTES.proposalTemplateNew}>
              <Plus />
              Novo modelo
            </Link>
          </Button>
        }
      />
    );
  }
  return (
    <Row as="ul" className="gap-y-6">
      {templates.map((template) => (
        <Col as="li" key={template.id} md={6} xl={4}>
          <Card className="flex h-full flex-col gap-3 p-4">
            <Box className="flex-1 space-y-2">
              <Box className="flex items-start justify-between gap-2">
                <Text
                  size="base"
                  weight="semibold"
                  className="min-w-0 break-words"
                >
                  {template.name}
                </Text>
                <Badge variant={template.active ? "success" : "outline"}>
                  {template.active ? "Ativo" : "Inativo"}
                </Badge>
              </Box>
              <Text size="xs" tone="muted">
                Versão {template.version} ·{" "}
                {template.clauses.length === 0
                  ? "sem cláusulas opcionais"
                  : pluralize(
                      template.clauses.length,
                      "cláusula opcional",
                      "cláusulas opcionais",
                    )}
              </Text>
            </Box>
            <Box className="flex justify-end gap-2 border-t pt-3">
              <ProposalTemplateDeleteButton
                templateId={template.id}
                name={template.name}
              />
              <Button asChild variant="outline" size="sm">
                <Link to={routeTo.editProposalTemplate(template.id)}>
                  <Pencil />
                  Editar
                </Link>
              </Button>
            </Box>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export function ProposalTemplateListSkeleton() {
  return (
    <Row className="gap-y-6">
      {[0, 1].map((index) => (
        <Col key={index} md={6} xl={4}>
          <Card className="flex flex-col gap-3 p-4">
            <Box className="space-y-2">
              <Skeleton shape="text" className="w-2/3 text-base" />
              <Skeleton shape="text" className="w-1/2 text-xs" />
            </Box>
            <Box className="flex justify-end gap-2 border-t pt-3">
              <Skeleton className="h-9 w-20 md:h-8" />
              <Skeleton className="h-9 w-20 md:h-8" />
            </Box>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
