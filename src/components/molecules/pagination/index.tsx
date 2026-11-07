import { ChevronLeft, ChevronRight } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { rangeLabel, totalPages } from "@/helpers/pagination";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const pages = totalPages(total, pageSize);

  return (
    <Box className="flex items-center justify-between gap-4">
      <Text tone="muted">{rangeLabel(page, pageSize, total)}</Text>
      <Box className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Próxima página"
        >
          <ChevronRight />
        </Button>
      </Box>
    </Box>
  );
}
