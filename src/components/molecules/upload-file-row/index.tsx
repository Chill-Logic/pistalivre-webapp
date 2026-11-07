import { CircleCheck, X } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import type { DocumentCategory } from "@/types/document";
import { formatFileSize } from "@/utils/format";

export type UploadRowState = "idle" | "sending" | "sent" | "failed";

type UploadFileRowProps = {
  file: File;
  categories: DocumentCategory[];
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onRemove: () => void;
  state: UploadRowState;
  error?: string;
  disabled?: boolean;
};

/** One file waiting to be sent: its kind, size, state and remove. */
export function UploadFileRow({
  file,
  categories,
  categoryId,
  onCategoryChange,
  onRemove,
  state,
  error,
  disabled = false,
}: UploadFileRowProps) {
  return (
    <Box className="space-y-2 rounded-md border p-3">
      <Box className="flex items-center gap-2">
        <Box className="min-w-0 flex-1">
          <Text size="sm" weight="medium" truncate>
            {file.name}
          </Text>
          <Text size="xs" tone="muted">
            {formatFileSize(file.size)}
          </Text>
        </Box>
        {state === "sending" && <Spinner aria-label="Enviando" />}
        {state === "sent" && (
          <CircleCheck className="size-5 text-success" aria-label="Enviado" />
        )}
        {state !== "sending" && state !== "sent" && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remover ${file.name}`}
            disabled={disabled}
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </Box>
      {categories.length > 0 && (
        <Select
          value={categoryId || undefined}
          onValueChange={onCategoryChange}
          disabled={disabled || state === "sent"}
        >
          <SelectTrigger aria-label={`Tipo de ${file.name}`}>
            <SelectValue placeholder="Tipo do documento" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {error && (
        <Text size="xs" tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
