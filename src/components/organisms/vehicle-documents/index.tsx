import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { DocumentItem } from "@/components/molecules/document-item";
import { useFileActions } from "@/hooks/api/files/useFileActions";
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
          <p className="text-sm text-muted-foreground">
            Nenhum documento anexado.
          </p>
        ) : (
          <div className="divide-y">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
