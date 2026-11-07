import { Download, Eye, FileText, Image as ImageIcon } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import type { ReactNode } from "react";
import type { DocumentFile } from "@/types/document";
import { formatDate, formatFileSize } from "@/utils/format";

type DocumentItemProps = {
  document: DocumentFile;
  /** Shown instead of the file name (e.g. the inspection photo's label). */
  title?: string;
  onView: () => void;
  onDownload: () => void;
  isViewing: boolean;
  isDownloading: boolean;
  /** Extra buttons after view/download (edit, delete). */
  actions?: ReactNode;
};

export function DocumentItem({
  document,
  title,
  onView,
  onDownload,
  isViewing,
  isDownloading,
  actions,
}: DocumentItemProps) {
  const Icon = document.contentType.startsWith("image/") ? ImageIcon : FileText;
  const meta = [
    document.category?.name,
    formatFileSize(document.size),
    formatDate(document.createdAt),
  ].filter(Boolean);

  return (
    <Box className="flex items-center gap-3 py-3">
      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <Box className="min-w-0 flex-1">
        <Text weight="medium" truncate>
          {title ?? document.fileName}
        </Text>
        <Text size="xs" tone="muted" truncate>
          {meta.join(" · ")}
        </Text>
      </Box>
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
      {actions}
    </Box>
  );
}
