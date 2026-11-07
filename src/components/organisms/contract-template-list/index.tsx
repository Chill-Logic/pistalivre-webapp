import { ChevronRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { routeTo } from "@/constants/routes";
import type { ContractTemplate } from "@/types/template";
import { formatDateTime } from "@/utils/format";

export function ContractTemplateList({
  templates,
}: {
  templates: ContractTemplate[];
}) {
  if (templates.length === 0) {
    return <EmptyState icon={FileText} title="Nenhum modelo de contrato" />;
  }
  return (
    <Row as="ul" className="gap-y-6">
      {templates.map((template) => (
        <Col as="li" key={template.id} md={6} xl={4}>
          <Link
            to={routeTo.contractTemplate(template.id)}
            className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
              <Box className="min-w-0 flex-1 space-y-2">
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
                  Versão {template.version} · atualizado em{" "}
                  {formatDateTime(template.updatedAt)}
                </Text>
              </Box>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
}

export function ContractTemplateListSkeleton() {
  return (
    <Row className="gap-y-6">
      {[0, 1].map((index) => (
        <Col key={index} md={6} xl={4}>
          <Card className="space-y-2 p-4">
            <Skeleton shape="text" className="w-2/3 text-base" />
            <Skeleton shape="text" className="w-1/2 text-xs" />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
