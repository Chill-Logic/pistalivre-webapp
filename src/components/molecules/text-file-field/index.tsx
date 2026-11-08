import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { FileInput } from "@/components/atoms/file-input";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";

type TextFileFieldProps = {
  label: string;
  /** The file's content, read as text in the browser ("" = none chosen). */
  value: string;
  onChange: (text: string) => void;
  accept?: string;
  /** A file is already stored: choosing none keeps it. */
  isSet?: boolean;
  hint?: ReactNode;
  error?: string;
  disabled?: boolean;
};

/**
 * A file sent as its TEXT (e.g. a PEM certificate): read here, never
 * uploaded as a file. Shows only the chosen name, never the content.
 */
export function TextFileField({
  label,
  value,
  onChange,
  accept,
  isSet = false,
  hint,
  error,
  disabled,
}: TextFileFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [readError, setReadError] = useState<string | null>(null);
  const message = readError ?? error;

  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <FileInput
        id={id}
        ref={inputRef}
        accept={accept}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          // Picking the same file again must fire `change` again.
          event.target.value = "";
          if (!file) return;
          try {
            onChange(await file.text());
            setFileName(file.name);
            setReadError(null);
          } catch {
            setReadError("Não foi possível ler o arquivo");
          }
        }}
      />
      <Box className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          {value || isSet ? "Trocar arquivo" : "Escolher arquivo"}
        </Button>
        {value ? (
          <Box className="flex min-w-0 items-center gap-1">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <Text size="sm" truncate className="min-w-0">
              {fileName}
            </Text>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remover ${fileName}`}
              disabled={disabled}
              onClick={() => {
                onChange("");
                setFileName("");
              }}
            >
              <X />
            </Button>
          </Box>
        ) : (
          isSet && (
            <Text size="xs" tone="success" className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5" />
              Arquivo guardado. Envie outro só para substituir.
            </Text>
          )
        )}
      </Box>
      {hint && (
        <Text size="xs" tone="muted">
          {hint}
        </Text>
      )}
      {message && <Text tone="destructive">{message}</Text>}
    </Box>
  );
}
