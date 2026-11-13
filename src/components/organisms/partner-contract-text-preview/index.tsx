import { FileText } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { HtmlPreview } from "@/components/atoms/html-preview";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { previewHtml } from "@/helpers/html";
import { cn } from "@/utils/cn";

type PartnerContractTextPreviewProps = {
  html: string | null | undefined;
  /** What the terms still lack for a text. */
  missing: string[];
  loading: boolean;
  refreshing: boolean;
  /** Back to "Termos" (where the contract is saved). */
  onEditTerms: () => void;
};

/**
 * "Novo contrato" › Contrato: the text the terms typed so far produce, read
 * only. It becomes the living draft (editable, with the Livrinho) once the
 * terms are saved.
 */
export function PartnerContractTextPreview({
  html,
  missing,
  loading,
  refreshing,
  onEditTerms,
}: PartnerContractTextPreviewProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        <Alert variant="info" role="note" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Text>
            Prévia gerada dos termos, ainda sem as motos. Depois de salvar os termos, o texto fica editável aqui, com o
            Livrinho ajustando as cláusulas.
          </Text>
          <Button type="button" variant="outline" size="sm" onClick={onEditTerms} className="shrink-0">
            Voltar aos termos
          </Button>
        </Alert>
        {loading ? (
          <Box className="space-y-3" aria-busy>
            <Skeleton className="mx-auto h-5 w-2/3" />
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} shape="text" className={cn("text-sm", i % 3 === 2 ? "w-3/4" : "w-full")} />
            ))}
          </Box>
        ) : html ? (
          <Box className={cn("rounded-lg border bg-background p-4 transition-opacity md:p-8", refreshing && "opacity-60")}>
            <HtmlPreview html={previewHtml(html)} />
          </Box>
        ) : (
          <EmptyState
            icon={FileText}
            title="Faltam termos para montar o texto"
            description={missing.length ? `Preencha: ${missing.join(", ")}.` : "Preencha os termos do contrato."}
          />
        )}
      </CardContent>
    </Card>
  );
}
