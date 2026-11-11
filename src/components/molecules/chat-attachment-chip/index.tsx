import { AlertCircle, FileText, ImageIcon, X } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Image } from "@/components/atoms/image";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

type ChatAttachmentChipProps = {
  name: string;
  isPdf: boolean;
  previewUrl: string | null;
  status: "uploading" | "ready" | "error";
  /** 0..1 while uploading. */
  progress?: number;
  error?: string | null;
  /** Absent once the message was sent (the chip just shows what went). */
  onRemove?: () => void;
};

/** A file in the chat: thumbnail (or PDF icon), name, upload state, remove. */
export function ChatAttachmentChip({
  name,
  isPdf,
  previewUrl,
  status,
  progress = 0,
  error,
  onRemove,
}: ChatAttachmentChipProps) {
  return (
    <Box
      className={cn(
        "flex w-56 max-w-full items-center gap-2 rounded-lg border bg-card p-1.5 pr-1",
        status === "error" && "border-destructive/60",
      )}
      title={error ?? name}
    >
      <Box className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {previewUrl ? (
          <Image src={previewUrl} alt="" className="size-full object-cover" />
        ) : status === "error" ? (
          <AlertCircle className="size-5 text-destructive" aria-hidden />
        ) : isPdf ? (
          <FileText className="size-5 text-muted-foreground" aria-hidden />
        ) : (
          <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
        )}
        {status === "uploading" && (
          <Box className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Spinner />
          </Box>
        )}
      </Box>
      <Box className="min-w-0 flex-1">
        <Text size="xs" truncate className="font-medium">
          {name}
        </Text>
        <Text
          size="xs"
          truncate
          tone={status === "error" ? undefined : "muted"}
          className={cn(status === "error" && "text-destructive")}
        >
          {status === "uploading"
            ? `Enviando… ${Math.round(progress * 100)}%`
            : status === "error"
              ? (error ?? "Não foi possível enviar")
              : isPdf
                ? "PDF"
                : "Imagem"}
        </Text>
      </Box>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={`Remover ${name}`}
          onClick={onRemove}
        >
          <X />
        </Button>
      )}
    </Box>
  );
}
