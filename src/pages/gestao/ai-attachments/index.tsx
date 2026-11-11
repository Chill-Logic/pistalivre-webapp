import { useQueryClient } from "@tanstack/react-query";
import { Camera, FileUp, Upload } from "lucide-react";
import { useEffect, useRef, type ChangeEvent } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { DropArea } from "@/components/atoms/drop-area";
import { FileInput } from "@/components/atoms/file-input";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ChatAttachmentChip } from "@/components/molecules/chat-attachment-chip";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { queryKeys } from "@/constants/query-keys";
import {
  AI_ATTACHMENT_ACCEPT,
  useAiAttachments,
  useRecentAiAttachments,
} from "@/hooks/api/gestao/ai/useAiAttachments";
import { formatDateTime } from "@/utils/format";

/**
 * "Enviar documentos para a IA": where a person sends photos and PDFs (CNH,
 * RG, comprovante, ficha) when using the AI from outside the system (Claude,
 * ChatGPT… by MCP), which can't upload files. Paste, drop or pick; the AI
 * then sees them with listar_anexos_enviados and files them in the customer.
 */
export function AiAttachmentsPage() {
  const queryClient = useQueryClient();
  const recent = useRecentAiAttachments();
  const attachments = useAiAttachments();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { add, take } = attachments;

  // Ctrl+V anywhere on the page attaches what's in the clipboard.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length) add(files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [add]);

  // Once everything uploaded, the list below has it: the queue clears.
  const settled =
    attachments.items.length > 0 &&
    attachments.items.every((item) => item.status === "ready");
  useEffect(() => {
    if (!settled) return;
    take();
    void queryClient.invalidateQueries({
      queryKey: queryKeys.ai.attachments(),
    });
  }, [settled, take, queryClient]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    add(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  return (
    <Box className="space-y-4">
      <PageHeader title="Enviar documentos para a IA" />
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <DropArea
            onFiles={add}
            className="space-y-4 rounded-md border border-dashed p-4 md:p-6"
            overlay={
              <Box className="flex flex-col items-center gap-1 text-primary">
                <Upload className="size-6" aria-hidden />
                <Text weight="semibold">Solte para enviar</Text>
              </Box>
            }
          >
            <FileInput
              ref={cameraRef}
              accept="image/*"
              capture="environment"
              aria-label="Tirar foto do documento"
              onChange={onChange}
            />
            <FileInput
              ref={fileRef}
              accept={AI_ATTACHMENT_ACCEPT}
              multiple
              aria-label="Escolher arquivos"
              onChange={onChange}
            />
            <Text size="sm" tone="muted">
              Usando a IA fora do sistema (Claude, ChatGPT…)? Ela não consegue
              enviar arquivos para cá: envie aqui a CNH, o RG, o comprovante ou
              a ficha da locação — cole (Ctrl+V), arraste para cá ou escolha.
              Depois peça à IA para guardar os documentos no cadastro do
              cliente.
            </Text>
            <Box className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="md:hidden"
                onClick={() => cameraRef.current?.click()}
              >
                <Camera />
                Tirar foto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
              >
                <FileUp />
                Escolher arquivos
              </Button>
            </Box>
            {attachments.items.length > 0 && (
              <Box className="flex flex-wrap gap-2">
                {attachments.items.map((item) => (
                  <ChatAttachmentChip
                    key={item.key}
                    name={item.name}
                    isPdf={item.isPdf}
                    previewUrl={item.previewUrl}
                    status={item.status}
                    progress={item.progress}
                    error={item.error}
                    onRemove={() => attachments.remove(item.key)}
                  />
                ))}
              </Box>
            )}
            {attachments.notice && (
              <Text size="xs" tone="muted">
                {attachments.notice}
              </Text>
            )}
          </DropArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Enviados nos últimos 7 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recent.isPending ? (
            <SkeletonRegion label="Carregando documentos…">
              <RecentSkeleton />
            </SkeletonRegion>
          ) : recent.isError ? (
            <QueryError error={recent.error} onRetry={() => recent.refetch()} />
          ) : recent.data.length === 0 ? (
            <Text size="sm" tone="muted">
              Nada enviado ainda (ou tudo já foi guardado em cadastros).
            </Text>
          ) : (
            <List className="flex flex-wrap gap-2">
              {recent.data.map((file) => (
                <ListItem key={file.id} className="space-y-1">
                  <ChatAttachmentChip
                    name={file.fileName}
                    isPdf={file.contentType === "application/pdf"}
                    previewUrl={null}
                    status="ready"
                  />
                  {file.createdAt && (
                    <Text size="xs" tone="muted">
                      {formatDateTime(file.createdAt)}
                    </Text>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

function RecentSkeleton() {
  return (
    <Box className="flex flex-wrap gap-2">
      {[0, 1, 2].map((index) => (
        <Box key={index} className="space-y-1">
          <Skeleton className="h-14 w-56" />
          <Skeleton shape="text" className="w-24 text-xs" />
        </Box>
      ))}
    </Box>
  );
}
