import { Download, Eye, FileText, Image } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import type { DocumentFile } from "@/types/document";
import { formatDate, formatFileSize } from "@/utils/format";

type DocumentItemProps = {
  document: DocumentFile;
  onView: () => void;
  onDownload: () => void;
  isViewing: boolean;
  isDownloading: boolean;
};

export function DocumentItem({
  document,
  onView,
  onDownload,
  isViewing,
  isDownloading,
}: DocumentItemProps) {
  const Icon = document.contentType.startsWith("image/") ? Image : FileText;

  return (
    <div className="flex items-center gap-3 py-3">
      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{document.fileName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[
            document.category?.name,
            formatFileSize(document.size),
            formatDate(document.createdAt),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onView}
        disabled={isViewing}
        aria-label={`Visualizar ${document.fileName}`}
      >
        {isViewing ? <Spinner /> : <Eye />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDownload}
        disabled={isDownloading}
        aria-label={`Baixar ${document.fileName}`}
      >
        {isDownloading ? <Spinner /> : <Download />}
      </Button>
    </div>
  );
}
