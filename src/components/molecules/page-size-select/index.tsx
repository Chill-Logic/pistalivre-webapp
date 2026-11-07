import { Box } from "@/components/atoms/box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Text } from "@/components/atoms/text";
import { PAGE_SIZE_OPTIONS } from "@/constants/pagination";

type PageSizeSelectProps = {
  value: number;
  onChange: (size: number) => void;
};

/** "Itens por página" (desktop pagination). */
export function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
  return (
    <Box className="flex items-center gap-2">
      <Text size="sm" tone="muted" className="whitespace-nowrap">
        Por página
      </Text>
      <Select
        value={String(value)}
        onValueChange={(next) => onChange(Number(next))}
      >
        <SelectTrigger aria-label="Itens por página" className="h-9 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Box>
  );
}
