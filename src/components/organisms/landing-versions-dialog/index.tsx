import { History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { errorMessage } from "@/helpers/api-error";
import { useLandingVersions } from "@/hooks/api/gestao/landing/useLandingPage";
import { useLandingWrites } from "@/hooks/api/gestao/landing/useLandingWrites";
import type { LandingPageState } from "@/types/landing";
import { formatDateTime } from "@/utils/format";

/**
 * The last publications. Restoring one puts it in the DRAFT (the site does
 * not change until someone publishes again).
 */
export function LandingVersionsDialog({ onRestored }: { onRestored: (state: LandingPageState) => void }) {
  const [open, setOpen] = useState(false);
  const versions = useLandingVersions(open);
  const { restore } = useLandingWrites();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <History />
          Versões
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80dvh] overflow-y-auto">
        <DialogTitle>Versões publicadas</DialogTitle>
        <DialogDescription>
          Restaurar leva a versão para o rascunho; o site só muda quando você publicar de novo.
        </DialogDescription>
        {versions.isPending ? (
          <Box className="space-y-2">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </Box>
        ) : versions.isError ? (
          <Text tone="destructive">{errorMessage(versions.error)}</Text>
        ) : !versions.data.length ? (
          <Text tone="muted">Nenhuma publicação ainda.</Text>
        ) : (
          <List className="divide-y rounded-md border">
            {versions.data.map((version, index) => (
              <ListItem key={version.id} className="flex items-center justify-between gap-3 p-3">
                <Box className="min-w-0">
                  <Text weight="medium">
                    {formatDateTime(version.publishedAt)}
                    {index === 0 && " · no ar"}
                  </Text>
                  <Text size="xs" tone="muted">
                    {version.publishedBy ? `por ${version.publishedBy.name}` : "—"}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={restore.isPending}
                  onClick={() =>
                    restore.mutate(version.id, {
                      onSuccess: (state) => {
                        toast.success("Versão restaurada no rascunho");
                        setOpen(false);
                        onRestored(state);
                      },
                      onError: (error) => toast.error(errorMessage(error)),
                    })
                  }
                >
                  {restore.isPending && restore.variables === version.id && <Spinner />}
                  Restaurar
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
