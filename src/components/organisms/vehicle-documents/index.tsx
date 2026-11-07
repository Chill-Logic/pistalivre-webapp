import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { DocumentItem } from "@/components/molecules/document-item";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DocumentFile } from "@/types/document";

export function VehicleDocuments({ documents }: { documents: DocumentFile[] }) {
  const { view, download } = useFileActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <Text tone="muted">Nenhum documento anexado.</Text>
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
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

const DOCUMENT_ROWS = 2;

export function VehicleDocumentsSkeleton() {
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
