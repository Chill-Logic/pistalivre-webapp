import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Heading } from "@/components/atoms/heading";
import { HtmlPreview } from "@/components/atoms/html-preview";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { previewHtml } from "@/helpers/html";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ContractTemplateDetail } from "@/types/template";

/**
 * The template as written: highlighted {{variables}} are filled when a
 * contract is generated; the caution clause slot takes one of the variants.
 */
export function ContractTemplatePreview({
  template,
}: {
  template: ContractTemplateDetail;
}) {
  const { label } = useLabels();
  const clauses = Object.entries(template.caucaoClauses).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );

  return (
    <Box className="space-y-6">
      <Card>
        <CardHeader>
          <Box className="flex flex-wrap items-start justify-between gap-2">
            <Heading className="min-w-0 break-words">{template.name}</Heading>
            <Badge variant={template.active ? "success" : "outline"}>
              {template.active ? "Ativo" : "Inativo"} · v{template.version}
            </Badge>
          </Box>
        </CardHeader>
        <CardContent className="space-y-4">
          <HtmlPreview html={previewHtml(template.bodyHtml)} />
          <Text className="border-t pt-3" size="xs" tone="muted">
            Os campos destacados são preenchidos com os dados da locação ao
            gerar o contrato.
          </Text>
        </CardContent>
      </Card>
      {clauses.map(([type, html]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="text-base">
              Cláusula de caução · {label(LABEL_MAPS.cautionType, type)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HtmlPreview html={previewHtml(html)} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export function ContractTemplatePreviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-1/2 text-2xl" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton
            key={index}
            shape="text"
            className={index % 3 === 2 ? "w-2/3 text-sm" : "w-full text-sm"}
          />
        ))}
      </CardContent>
    </Card>
  );
}
