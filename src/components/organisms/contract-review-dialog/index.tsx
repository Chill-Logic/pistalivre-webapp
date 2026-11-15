import { TriangleAlert } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/atoms/dialog";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import type { ContractReview } from "@/types/contract";

type ContractReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** null while it loads. */
  review: ContractReview | null;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  /** Extra choices before confirming (e.g. the signing channel). */
  children?: ReactNode;
};

/**
 * The review is part of the flow, not a good intention: the rental's main
 * terms (what was agreed), the places where the contract text says something
 * else, and "Revisei os termos" — the button only unlocks after it. Born from
 * LOC-C59FGOHL (a monthly rental whose contract said "por semana").
 */
export function ContractReviewDialog({
  open,
  onOpenChange,
  title,
  review,
  confirmLabel,
  busy = false,
  onConfirm,
  children,
}: ContractReviewDialogProps) {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);
  const issues = review?.issues ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <Box className="space-y-1">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Confira se o contrato bate com o que foi combinado na locação.
          </DialogDescription>
        </Box>

        {!review ? (
          <Box className="space-y-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} shape="text" className="w-full text-sm" />
            ))}
          </Box>
        ) : (
          <>
            <List className="divide-y rounded-lg border">
              {review.summary.map((item) => (
                <ListItem
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 px-3 py-2"
                >
                  <Text size="xs" tone="muted" className="shrink-0">
                    {item.label}
                  </Text>
                  <Text weight="medium" className="text-right">
                    {item.value}
                  </Text>
                </ListItem>
              ))}
            </List>

            {issues.length > 0 ? (
              <Alert variant="warning" className="space-y-2">
                <Text weight="semibold" className="flex items-center gap-2">
                  <TriangleAlert className="size-4 shrink-0" aria-hidden />O
                  texto do contrato não bate com a locação
                </Text>
                <List className="list-disc space-y-1 pl-5">
                  {issues.map((issue) => (
                    <ListItem key={issue.code + issue.message}>
                      {issue.message}
                    </ListItem>
                  ))}
                </List>
              </Alert>
            ) : (
              <Text size="xs" tone="muted">
                A conferência automática não achou diferença entre o texto e a
                locação.
              </Text>
            )}

            {children}

            <CheckboxField
              label={
                issues.length > 0
                  ? "Revisei os termos e quero seguir mesmo com os avisos acima"
                  : "Revisei os termos do contrato"
              }
              hint="Fica registrado quem revisou e quando."
              checked={checked}
              onChange={setChecked}
            />
          </>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {issues.length > 0 ? "Voltar e corrigir" : "Voltar"}
          </Button>
          <Button onClick={onConfirm} disabled={!review || !checked || busy}>
            {busy && <Spinner />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
