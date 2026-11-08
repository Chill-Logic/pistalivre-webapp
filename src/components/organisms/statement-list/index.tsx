import { Landmark } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  StatementLine,
  StatementLineSkeleton,
} from "@/components/molecules/statement-line";
import { StatementLineEditDialog } from "@/components/organisms/statement-line-edit-dialog";
import type { StatementLine as Line } from "@/types/statement";
import { cn } from "@/utils/cn";

const SKELETON_ROWS = 6;

type StatementListProps = {
  lines: Line[];
  showSource: boolean;
  isRefreshing?: boolean;
};

export function StatementList({
  lines,
  showSource,
  isRefreshing = false,
}: StatementListProps) {
  if (lines.length === 0) {
    return (
      <EmptyState
        icon={Landmark}
        title="Nenhum lançamento no período"
        description="Escolha outro período ou outra conta."
      />
    );
  }

  return (
    <Card
      aria-busy={isRefreshing}
      className={cn(
        "transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      <CardContent className="divide-y pt-1 md:pt-1">
        {lines.map((line) => (
          <StatementLine
            key={line.key}
            line={line}
            showSource={showSource}
            actions={<StatementLineEditDialog line={line} />}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function StatementListSkeleton() {
  return (
    <Card>
      <CardContent className="divide-y pt-1 md:pt-1">
        <Box>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <StatementLineSkeleton key={index} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
