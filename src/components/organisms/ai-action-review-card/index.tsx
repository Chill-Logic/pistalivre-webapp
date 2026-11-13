import { Check, X } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { ExternalLink } from "@/components/atoms/external-link";
import { Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DocumentItem } from "@/components/molecules/document-item";
import { InfoItem } from "@/components/molecules/info-item";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { AiActionItem, AiActionStatus } from "@/types/ai";
import { formatDateTime } from "@/utils/format";

/** Details the server marks as a warning (similar records already in the system). */
const WARNING_PREFIX = "Atenção";
/** Long values take the whole row. */
const WIDE = new Set(["Descrição", "Observações", "Serviços", "Anexos", "Veículo"]);

const STATUS: Record<AiActionStatus, { label: string; variant: "neutral" | "success" | "warning" | "error" | "outline" }> = {
  PENDING: { label: "Aguardando você", variant: "warning" },
  RUNNING: { label: "Executando", variant: "neutral" },
  DONE: { label: "Feita", variant: "success" },
  FAILED: { label: "Falhou", variant: "error" },
  CANCELLED: { label: "Cancelada", variant: "outline" },
  EXPIRED: { label: "Expirou", variant: "outline" },
};

const show = (value: unknown) =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : JSON.stringify(value);

const resultLink = (result: unknown) => {
  const link = (result as { link?: unknown } | null)?.link;
  return typeof link === "string" ? link : null;
};

type AiActionReviewCardProps = {
  action: AiActionItem;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirming?: boolean;
  cancelling?: boolean;
};

/**
 * One write the AI proposed: what it will do (the server's own preview),
 * the files that go with it, and — while pending — Confirmar / Cancelar.
 * Decided ones show the outcome and a link to the record.
 */
export function AiActionReviewCard({ action, onConfirm, onCancel, confirming = false, cancelling = false }: AiActionReviewCardProps) {
  const { view, download } = useFileActions();
  const status = STATUS[action.status];
  const entries = Object.entries(action.details).filter(([, value]) => value != null && value !== "");
  const warnings = entries.filter(([label]) => label.startsWith(WARNING_PREFIX));
  const fields = entries.filter(([label]) => !label.startsWith(WARNING_PREFIX));
  const link = resultLink(action.result);
  const pending = action.status === "PENDING";
  const busy = confirming || cancelling;

  return (
    <Card>
      <CardHeader className="space-y-2">
        <Box className="flex flex-wrap items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Badge variant="outline">{action.toolTitle}</Badge>
          <Badge variant="outline">
            {action.channel === "mcp" ? `MCP${action.app ? ` · ${action.app}` : ""}` : "Chat do sistema"}
          </Badge>
        </Box>
        <CardTitle className="text-base leading-snug">{action.summary}</CardTitle>
        <Text size="xs" tone="muted">
          Pedida em {formatDateTime(action.createdAt)}
          {pending ? ` · expira ${formatDateTime(action.expiresAt)}` : ""}
          {action.decidedAt ? ` · decidida em ${formatDateTime(action.decidedAt)}` : ""}
        </Text>
      </CardHeader>
      <CardContent className="space-y-4">
        {warnings.map(([label, value]) => (
          <Alert key={label} variant="warning">
            {label}: {show(value)}
          </Alert>
        ))}
        <Row as="dl" className="gap-y-3">
          {fields.map(([label, value]) => (
            <InfoItem key={label} label={label} sm={WIDE.has(label) ? 12 : 6}>
              {show(value)}
            </InfoItem>
          ))}
        </Row>

        {action.files.length > 0 && (
          <Box className="space-y-1">
            <Text size="sm" weight="medium">
              Arquivos
            </Text>
            <Box className="divide-y rounded-md border">
              {action.files.map((file) => (
                <DocumentItem
                  key={file.id}
                  document={file}
                  onView={() => view.mutate(file)}
                  onDownload={() => download.mutate(file)}
                  isViewing={view.isPending && view.variables?.id === file.id}
                  isDownloading={download.isPending && download.variables?.id === file.id}
                />
              ))}
            </Box>
          </Box>
        )}

        {action.error && <Alert>{action.error}</Alert>}

        {link && (
          <ExternalLink href={link} className="text-sm">
            Abrir no sistema
          </ExternalLink>
        )}

        {pending && (
          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onCancel} disabled={busy}>
              {cancelling ? <Spinner /> : <X className="size-4" aria-hidden />}
              Cancelar
            </Button>
            <Button onClick={onConfirm} disabled={busy}>
              {confirming ? <Spinner className="text-primary-foreground" /> : <Check className="size-4" aria-hidden />}
              Confirmar
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/** A card's shape while the list loads. */
export function AiActionReviewCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Box className="flex gap-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-36" />
        </Box>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Box className="flex justify-end gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </Box>
      </CardContent>
    </Card>
  );
}
