import { Download, Eye, Paperclip } from "lucide-react";
import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import type { DocumentAttachment } from "@/types/document";

type AttachmentChipProps = {
  attachment: DocumentAttachment;
  onView: () => void;
  onDownload: () => void;
  isViewing: boolean;
  isDownloading: boolean;
  /** Extra buttons after view/download (rename, delete). */
  actions?: ReactNode;
};

/** A compact file pill under a record (a charge's receipt, a debt's note). */
export function AttachmentChip({
  attachment,
  onView,
  onDownload,
  isViewing,
  isDownloading,
  actions,
}: AttachmentChipProps) {
  return (
    <Box className="inline-flex max-w-full items-center gap-0.5 rounded-md border bg-muted/40 py-0.5 pl-2 pr-0.5">
      <Paperclip
        className="mr-1 size-3.5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <Text size="xs" truncate title={attachment.fileName} className="min-w-0">
        {attachment.fileName}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={onView}
        disabled={isViewing}
        aria-label={`Visualizar ${attachment.fileName}`}
      >
        {isViewing ? <Spinner /> : <Eye />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={onDownload}
        disabled={isDownloading}
        aria-label={`Baixar ${attachment.fileName}`}
      >
        {isDownloading ? <Spinner /> : <Download />}
      </Button>
      {actions}
    </Box>
  );
}
