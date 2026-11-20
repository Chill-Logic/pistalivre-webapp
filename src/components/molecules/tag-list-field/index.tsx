import { useId, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";

type TagListFieldProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  maxItems?: number;
  maxLength?: number;
};

/** A short list of words: type and press Enter to add, the X removes. */
export function TagListField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  maxItems = 10,
  maxLength = 40,
}: TagListFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const add = () => {
    const item = draft.trim();
    if (!item || value.includes(item) || value.length >= maxItems) return;
    onChange([...value, item]);
    setDraft("");
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      add();
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <Box className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {value.length > 0 && (
        <Box className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge key={item} variant="neutral" className="gap-1 pr-1">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5"
                aria-label={`Remover ${item}`}
                onClick={() => onChange(value.filter((v) => v !== item))}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </Box>
      )}
      <Box className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={value.length >= maxItems}
        />
        <Button type="button" variant="outline" onClick={add} disabled={!draft.trim() || value.length >= maxItems}>
          Adicionar
        </Button>
      </Box>
      {hint && (
        <Text size="xs" tone="muted">
          {hint}
        </Text>
      )}
    </Box>
  );
}
