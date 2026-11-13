import { Paperclip, X } from "lucide-react";
import { useRef } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { FileInput } from "@/components/atoms/file-input";
import { AttachDropZone } from "@/components/molecules/attach-drop-zone";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { formatFileSize } from "@/utils/format";

type FilePickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
  /** Same list the API accepts (PDF, images, office). */
  accept?: string;
  disabled?: boolean;
  /** One file only (e.g. replacing a document): a new pick replaces it. */
  multiple?: boolean;
};

const DEFAULT_ACCEPT =
  "application/pdf,image/*,.doc,.docx,.xls,.xlsx,.odt,.ods";

/**
 * "Anexar arquivos" + the chosen files, each removable. Besides the button,
 * a file can be dragged onto it or pasted (Ctrl+V), like in the chat.
 */
export function FilePicker({
  files,
  onChange,
  label = "Anexar arquivos",
  accept = DEFAULT_ACCEPT,
  disabled = false,
  multiple = true,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (picked: File[]) =>
    onChange(multiple ? [...files, ...picked] : picked.slice(0, 1));

  return (
    <Box className="space-y-2">
      <FileInput
        ref={inputRef}
        multiple={multiple}
        accept={accept}
        onChange={(event) => {
          add(Array.from(event.target.files ?? []));
          // Picking the same file again must fire `change` again.
          event.target.value = "";
        }}
      />
      <AttachDropZone onFiles={add} disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip />
          {label}
        </Button>
      </AttachDropZone>
      {files.length > 0 && (
        <List className="space-y-1">
          {files.map((file, index) => (
            <ListItem
              key={`${file.name}-${index}`}
              className="flex items-center gap-2"
            >
              <Text size="sm" truncate className="min-w-0 flex-1">
                {file.name}
              </Text>
              <Text size="xs" tone="muted">
                {formatFileSize(file.size)}
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remover ${file.name}`}
                disabled={disabled}
                onClick={() => onChange(files.filter((_, i) => i !== index))}
              >
                <X />
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
