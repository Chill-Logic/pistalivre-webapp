import { CircleCheck, CircleHelp, CircleX } from "lucide-react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import type { InspectionCheck } from "@/types/inspection";
import { cn } from "@/utils/cn";

const CHECK_STATE = {
  ok: { icon: CircleCheck, className: "text-success-foreground", text: "OK" },
  fail: { icon: CircleX, className: "text-destructive", text: "Com problema" },
  unanswered: {
    icon: CircleHelp,
    className: "text-muted-foreground",
    text: "Sem resposta",
  },
};

/** Yes/no checks of the inspection, with the inspector's note. */
export function InspectionChecksCard({
  checks,
}: {
  checks: InspectionCheck[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Itens verificados</CardTitle>
      </CardHeader>
      <CardContent>
        {checks.length === 0 ? (
          <Text tone="muted">Esta vistoria não tem itens a verificar.</Text>
        ) : (
          <List className="divide-y">
            {checks.map((check) => {
              const state =
                CHECK_STATE[
                  check.ok === null ? "unanswered" : check.ok ? "ok" : "fail"
                ];
              const Icon = state.icon;
              return (
                <ListItem
                  key={check.key}
                  className="flex items-start gap-3 py-3"
                >
                  <Icon
                    className={cn("mt-0.5 size-5 shrink-0", state.className)}
                    aria-hidden
                  />
                  <Box className="min-w-0 flex-1">
                    <Text weight="medium">{check.label}</Text>
                    <Text size="xs" tone="muted">
                      {state.text}
                      {check.note && ` · ${check.note}`}
                    </Text>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

const CHECK_ROWS = 3;

export function InspectionChecksCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-32 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y">
          {Array.from({ length: CHECK_ROWS }, (_, index) => (
            <Box key={index} className="flex items-start gap-3 py-3">
              <Skeleton shape="circle" className="size-5 shrink-0" />
              <Box className="min-w-0 flex-1 space-y-2">
                <Skeleton shape="text" className="w-1/2 text-sm" />
                <Skeleton shape="text" className="w-1/4 text-xs" />
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
