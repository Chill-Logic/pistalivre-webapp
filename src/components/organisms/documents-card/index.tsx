import type { QueryKey } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { DocumentItem } from "@/components/molecules/document-item";
import { DocumentEditDialog } from "@/components/organisms/document-edit-dialog";
import { DocumentUploadDialog } from "@/components/organisms/document-upload-dialog";
import { useDocumentMutations } from "@/hooks/api/gestao/documents/useDocumentMutations";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DocumentFile, DocumentOwner } from "@/types/document";

type DocumentsCardProps = {
  documents: DocumentFile[];
  title?: string;
  empty?: string;
  /**
   * Who the documents belong to + the query that lists them. Present = the
   * staff can send, edit and delete; absent = read-only (view/download).
   */
  manage?: { owner: DocumentOwner; invalidate: QueryKey };
};

/** Documents of any owner (vehicle, customer…), with view/download. */
export function DocumentsCard({
  documents,
  title = "Documentos",
  empty = "Nenhum documento anexado.",
  manage,
}: DocumentsCardProps) {
  const { view, download } = useFileActions();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {manage && (
          <DocumentUploadDialog
            owner={manage.owner}
            invalidate={manage.invalidate}
          />
        )}
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <Text tone="muted">{empty}</Text>
        ) : (
          <Box className="divide-y">
            {documents.map((document) => (
              <DocumentItem
                key={document.id}
                document={document}
                onView={() => view.mutate(document)}
                onDownload={() => download.mutate(document)}
                isViewing={view.isPending && view.variables?.id === document.id}
                isDownloading={
                  download.isPending && download.variables?.id === document.id
                }
                actions={
                  manage && (
                    <ManageDocumentActions document={document} {...manage} />
                  )
                }
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/** Edit (name/kind) and delete buttons of one document. */
export function ManageDocumentActions({
  document,
  owner,
  invalidate,
}: {
  document: DocumentFile;
  owner: DocumentOwner;
  invalidate: QueryKey;
}) {
  const { remove } = useDocumentMutations(owner, invalidate);
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <DocumentEditDialog
        document={document}
        owner={owner}
        invalidate={invalidate}
      />
      <ConfirmDialog
        destructive
        open={confirming}
        onOpenChange={setConfirming}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={`Excluir ${document.fileName}`}
          >
            <Trash2 />
          </Button>
        }
        title="Excluir documento?"
        description={`"${document.fileName}" é apagado de vez. Documento em assinatura não pode ser excluído.`}
        confirmLabel="Excluir documento"
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(document.id, { onSuccess: () => setConfirming(false) })
        }
      />
    </>
  );
}

const DOCUMENT_ROWS = 2;

export function DocumentsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y">
          {Array.from({ length: DOCUMENT_ROWS }, (_, index) => (
            <Box key={index} className="flex items-center gap-3 py-3">
              <Skeleton className="size-5 shrink-0" />
              <Box className="min-w-0 flex-1 space-y-2">
                <Skeleton shape="text" className="w-1/2 text-sm" />
                <Skeleton shape="text" className="w-1/3 text-xs" />
              </Box>
              <Skeleton className="size-9 shrink-0" />
              <Skeleton className="size-9 shrink-0" />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
