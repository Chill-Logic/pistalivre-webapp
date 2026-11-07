import { Folder } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { pluralize } from "@/utils/text";

type FolderCardProps = {
  label: string;
  count: number;
  onOpen: () => void;
};

export function FolderCard({ label, count, onOpen }: FolderCardProps) {
  return (
    <Button
      variant="outline"
      onClick={onOpen}
      className="h-auto w-full justify-start gap-3 bg-card p-4 text-left md:h-auto"
    >
      <Folder className="size-5 shrink-0 text-primary" aria-hidden />
      <Text
        inline
        size={null}
        className="min-w-0 flex-1 whitespace-normal break-words"
      >
        {label}
      </Text>
      <Text inline size="xs" tone="muted" className="shrink-0">
        {pluralize(count, "arquivo", "arquivos")}
      </Text>
    </Button>
  );
}
