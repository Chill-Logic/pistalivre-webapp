import type { QueryKey } from "@tanstack/react-query";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { DocumentItem } from "@/components/molecules/document-item";
import { DocumentUploadDialog } from "@/components/organisms/document-upload-dialog";
import { ManagedDocumentList } from "@/components/organisms/managed-document-list";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DocumentFile, DocumentOwner } from "@/types/document";

export { ManageDocumentActions } from "@/components/organisms/managed-document-list";

type DocumentsCardProps = {
  documents: DocumentFile[];
  title?: string;
  empty?: string;
  /**
   * Who the documents belong to + the query that lists them. Present = the
   * staff can send, edit, delete (one or several) and make PDFs signable;
   * absent = read-only (view/download).
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
  return (
    <CollapsibleCard
      title={title}
      count={documents.length}
      storageKey={`documents-${manage?.owner.type.toLowerCase() ?? "view"}`}
      actions={
        manage && (
          <DocumentUploadDialog
            owner={manage.owner}
            invalidate={manage.invalidate}
          />
        )
      }
    >
      {documents.length === 0 ? (
        <Text tone="muted">{empty}</Text>
      ) : manage ? (
        <ManagedDocumentList documents={documents} {...manage} />
      ) : (
        <ReadOnlyDocuments documents={documents} />
      )}
    </CollapsibleCard>
  );
}

function ReadOnlyDocuments({ documents }: { documents: DocumentFile[] }) {
  const { view, download } = useFileActions();
  return (
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
        />
      ))}
    </Box>
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
