import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, KeyRound, Pencil } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { queryKeys } from "@/constants/query-keys";
import { routeTo } from "@/constants/routes";
import { errorMessage, toApiError } from "@/helpers/api-error";
import { rentalsService } from "@/services/api/gestao/rentals.service";
import type { RentalDetail } from "@/types/rental";
import { todayInBrasilia } from "@/utils/date";

type RentalHandoverDialogProps = {
  rental: Pick<RentalDetail, "id" | "status" | "handoverAt" | "vehicle">;
};

/**
 * "Registrar retirada": the day the customer took the vehicle — the rent
 * counts from it, not from the signature. Activates the rental (vehicle
 * "Alugado"). The exit inspection is optional: a link to do it; if it was
 * done, the server links it. Registering without one is recorded quietly.
 * On an active rental it is "Corrigir retirada" (the date only).
 */
export function RentalHandoverDialog({ rental }: RentalHandoverDialogProps) {
  const queryClient = useQueryClient();
  const correcting = rental.status === "ACTIVE";
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => rentalsService.registerHandover(rental.id, { date }),
    onSuccess: (updated) => {
      queryClient.setQueryData<RentalDetail>(
        queryKeys.rentals.detail(rental.id),
        (previous) => ({ ...updated, documents: previous?.documents ?? [] }),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success(correcting ? "Data da retirada corrigida" : "Retirada registrada");
      setOpen(false);
    },
    onError: (failure) => {
      const apiError = toApiError(failure);
      if (apiError.fields?.date) setError(apiError.fields.date);
      else toast.error(errorMessage(failure));
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (save.isPending) return;
        if (next) {
          setDate(rental.handoverAt?.slice(0, 10) ?? todayInBrasilia());
          setError(null);
        }
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        {correcting ? (
          <Button variant="ghost" size="sm">
            <Pencil />
            Corrigir retirada
          </Button>
        ) : (
          <Button size="sm">
            <KeyRound />
            Registrar retirada
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Box className="space-y-1">
          <DialogTitle>
            {correcting ? "Corrigir a data da retirada" : "Registrar a retirada do veículo"}
          </DialogTitle>
          <DialogDescription>
            O aluguel conta a partir deste dia.
            {!correcting && " A locação fica ativa e o veículo passa a alugado."}
          </DialogDescription>
        </Box>

        <DateField
          label="Data da retirada"
          value={date}
          onChange={(value) => {
            setDate(value);
            setError(null);
          }}
          error={error ?? undefined}
        />

        {!correcting && (
          <Box className="space-y-2 rounded-md border p-3">
            <Text size="sm" weight="medium">
              Vistoria de saída (opcional)
            </Text>
            <Text size="xs" tone="muted">
              Se já fez, ela fica ligada à retirada sozinha.
            </Text>
            <Button asChild variant="outline" size="sm">
              <Link to={routeTo.newInspection(rental.vehicle.id, rental.id)}>
                <ClipboardCheck />
                Fazer vistoria de saída
              </Link>
            </Button>
          </Box>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={save.isPending}>
            Voltar
          </Button>
          <Button onClick={() => save.mutate()} disabled={!date || save.isPending}>
            {save.isPending && <Spinner className="text-primary-foreground" />}
            {correcting ? "Salvar data" : "Registrar retirada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
