import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { errorMessage } from "@/helpers/api-error";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { projectionsService } from "@/services/api/gestao/projections.service";
import type {
  ProjectionExtra,
  ProjectionRow,
  ProjectionSeed,
  ProjectionState,
  ProjectionTotals,
} from "@/types/projection";

const COMPUTE_DELAY_MS = 400;

/**
 * The scenario being edited: local state, recomputed by the API a moment
 * after each change (debounced), with the shareable `?sim=` kept in the URL
 * — the same link format as the management app.
 */
export function useProjectionScenario(seed: ProjectionSeed) {
  const [, setParams] = useSearchParams();
  const [state, setState] = useState<ProjectionState>(seed.state);
  const [totals, setTotals] = useState<ProjectionTotals>(seed.totals);
  const [sim, setSim] = useState(seed.sim);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebouncedValue(state, COMPUTE_DELAY_MS);
  const first = useRef(true);

  const compute = useMutation({
    mutationFn: (next: ProjectionState) => projectionsService.compute(next),
    onSuccess: (result) => {
      setTotals(result.totals);
      setSim(result.sim);
      setError(null);
      setParams(
        (current) => {
          const params = new URLSearchParams(current);
          params.set("sim", result.sim);
          return params;
        },
        { replace: true },
      );
    },
    onError: (failure) => setError(errorMessage(failure)),
  });
  const { mutate } = compute;

  useEffect(() => {
    // The seed already came computed.
    if (first.current) {
      first.current = false;
      return;
    }
    mutate(debounced);
  }, [debounced, mutate]);

  const patch = useCallback(
    (next: Partial<ProjectionState>) =>
      setState((current) => ({ ...current, ...next })),
    [],
  );

  const patchRow = useCallback(
    (id: string, next: Partial<ProjectionRow>) =>
      setState((current) => ({
        ...current,
        rows: current.rows.map((row) =>
          row.id === id ? { ...row, ...next } : row,
        ),
      })),
    [],
  );

  /** "Aplicar a todos": the base rent/maintenance on every real vehicle. */
  const applyBaseToAll = useCallback(
    () =>
      setState((current) => ({
        ...current,
        rows: current.rows.map((row) => ({
          ...row,
          rent: current.rent,
          maint: current.maint,
        })),
      })),
    [],
  );

  const addExtra = useCallback(
    () =>
      setState((current) => ({
        ...current,
        extras: [
          ...current.extras,
          {
            label: "Veículo adicional",
            qty: 1,
            active: true,
            rent: current.rent,
            maint: current.maint,
            suppliers: 0,
            finance: 0,
            // Hypothetical: the installment runs the whole horizon.
            financeMonths: null,
          },
        ],
      })),
    [],
  );

  const patchExtra = useCallback(
    (index: number, next: Partial<ProjectionExtra>) =>
      setState((current) => ({
        ...current,
        extras: current.extras.map((extra, i) =>
          i === index ? { ...extra, ...next } : extra,
        ),
      })),
    [],
  );

  const removeExtra = useCallback(
    (index: number) =>
      setState((current) => ({
        ...current,
        extras: current.extras.filter((_, i) => i !== index),
      })),
    [],
  );

  return {
    state,
    totals,
    sim,
    error,
    /** Numbers on screen are from a previous version of the scenario. */
    isComputing: compute.isPending || debounced !== state,
    patch,
    patchRow,
    applyBaseToAll,
    addExtra,
    patchExtra,
    removeExtra,
  };
}
