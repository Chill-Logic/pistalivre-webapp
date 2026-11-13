import { Upload } from "lucide-react";
import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { DropArea } from "@/components/atoms/drop-area";
import { Text } from "@/components/atoms/text";
import { usePasteFiles } from "@/hooks/ui/usePasteFiles";
import { cn } from "@/utils/cn";

type AttachDropZoneProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  /** The buttons (click still works) and whatever goes with them. */
  children: ReactNode;
  /** Under the buttons: how else to attach. Default: drag or Ctrl+V. */
  hint?: string | null;
  /** What the overlay says while a file is dragged over. */
  dropLabel?: string;
  className?: string;
};

/**
 * Where a file is attached in the system: click the button inside, DRAG a
 * file over it, or PASTE it (Ctrl+V of a print or of files copied in the
 * file explorer) — like the Livrinho's chat. The dashed border says it takes
 * files; the paste goes to the area on top (the dialog just opened, or the
 * one under the mouse/focus).
 */
export function AttachDropZone({
  onFiles,
  disabled = false,
  children,
  hint = "ou arraste o arquivo aqui · Ctrl+V cola um print",
  dropLabel = "Solte para anexar",
  className,
}: AttachDropZoneProps) {
  const paste = usePasteFiles(onFiles, !disabled);
  return (
    <DropArea
      onFiles={onFiles}
      disabled={disabled}
      className={cn("rounded-lg", className)}
      overlay={
        <Box className="flex flex-col items-center gap-1 text-primary">
          <Upload className="size-5" aria-hidden />
          <Text size="sm" weight="semibold">
            {dropLabel}
          </Text>
        </Box>
      }
    >
      <Box {...paste} className="space-y-2 rounded-lg border border-dashed p-3">
        {children}
        {hint && (
          <Text size="xs" tone="muted">
            {hint}
          </Text>
        )}
      </Box>
    </DropArea>
  );
}
