import { Camera, RefreshCw, X } from "lucide-react";
import { useRef } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { FileInput } from "@/components/atoms/file-input";
import { Image } from "@/components/atoms/image";
import { Text } from "@/components/atoms/text";
import { useObjectUrl } from "@/hooks/ui/useObjectUrl";
import { cn } from "@/utils/cn";

type PhotoSlotProps = {
  label: string;
  required: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: boolean;
  disabled?: boolean;
};

/**
 * One photo of the inspection. On the phone the button opens the camera
 * (`capture`); the gallery stays one tap away. Shows what was taken.
 */
export function PhotoSlot({
  label,
  required,
  file,
  onChange,
  error = false,
  disabled = false,
}: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useObjectUrl(file);

  return (
    <Box
      className={cn(
        "space-y-2 rounded-md border p-2",
        error && "border-destructive",
      )}
    >
      <FileInput
        ref={inputRef}
        accept="image/*"
        capture="environment"
        aria-label={label}
        onChange={(event) => {
          onChange(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      <Box className="flex items-center justify-between gap-2">
        <Text size="sm" weight="medium" className="min-w-0 truncate">
          {label}
          {!required && (
            <Text inline size="xs" tone="muted">
              {" "}
              (opcional)
            </Text>
          )}
        </Text>
        {file && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remover foto: ${label}`}
            disabled={disabled}
            onClick={() => onChange(null)}
          >
            <X />
          </Button>
        )}
      </Box>
      {preview ? (
        <Button
          type="button"
          variant="ghost"
          className="relative h-auto w-full overflow-hidden p-0 md:h-auto"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          aria-label={`Trocar foto: ${label}`}
        >
          <Image
            src={preview}
            alt={label}
            className="aspect-[4/3] w-full rounded object-cover"
          />
          <RefreshCw className="absolute bottom-2 right-2 size-5 rounded-full bg-background/80 p-1" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="aspect-[4/3] h-auto w-full flex-col gap-1 border-dashed text-muted-foreground md:h-auto"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="size-6" />
          Tirar foto
        </Button>
      )}
    </Box>
  );
}
