import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { CodeBlock } from "@/components/atoms/code-block";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/atoms/dialog";
import { Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { auditChannel, auditEvent } from "@/helpers/ai-audit";
import { useAiAuditEntry } from "@/hooks/api/gestao/ai/useAi";
import { formatDateTime } from "@/utils/format";

type AiAuditDetailProps = {
  id: string | null;
  onClose: () => void;
  toolTitle: (name: string) => string;
};

const pretty = (value: unknown) => (value == null ? "—" : JSON.stringify(value, null, 2));

/** One audited event in full: who, through what, from where, input and output. */
export function AiAuditDetail({ id, onClose, toolTitle }: AiAuditDetailProps) {
  const entry = useAiAuditEntry(id);
  const data = entry.data;
  return (
    <Dialog open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
        <DialogTitle>{data ? auditEvent(data, toolTitle) : "Evento da auditoria"}</DialogTitle>
        <DialogDescription>{data ? formatDateTime(data.createdAt) : "Carregando…"}</DialogDescription>
        {!data ? (
          <Box className="space-y-2" aria-busy>
            <Skeleton shape="text" className="w-2/3" />
            <Skeleton className="h-32" />
          </Box>
        ) : (
          <Box className="space-y-4">
            <Row as="dl" className="gap-y-3">
              <InfoItem span={6} md={4} label="Resultado">
                <Badge variant={data.ok ? "success" : "error"}>{data.ok ? "Sucesso" : "Falha"}</Badge>
              </InfoItem>
              <InfoItem span={6} md={4} label="Canal">
                {auditChannel(data)}
              </InfoItem>
              <InfoItem span={6} md={4} label="Duração">
                {data.durationMs} ms
              </InfoItem>
              <InfoItem span={6} md={4} label="Pessoa">
                {data.userName ?? (data.userId ? "Usuário removido" : "—")}
              </InfoItem>
              <InfoItem span={6} md={4} label="Aplicativo">
                {data.clientName ?? (data.channel === "chat" ? "Chat do sistema" : "—")}
              </InfoItem>
              <InfoItem span={6} md={4} label="IP">
                {data.ip ?? "—"}
              </InfoItem>
              <InfoItem label="Programa (user agent)">{data.userAgent ?? "—"}</InfoItem>
              {data.error && <InfoItem label="Erro">{data.error}</InfoItem>}
            </Row>
            <Box className="space-y-1">
              <Text size="sm" weight="medium">
                Entrada
              </Text>
              <CodeBlock className="max-h-72 overflow-y-auto">{pretty(data.input)}</CodeBlock>
            </Box>
            <Box className="space-y-1">
              <Text size="sm" weight="medium">
                Saída
              </Text>
              <CodeBlock className="max-h-96 overflow-y-auto">{pretty(data.output)}</CodeBlock>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
