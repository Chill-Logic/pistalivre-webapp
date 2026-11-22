import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { CalculatorScenarioValues } from "@/components/organisms/partner-contract-calculator";
import type { ContractFormValues } from "@/components/organisms/partner-contract-form/schema";
import {
  decodeContractScenario,
  encodeContractScenario,
  SCENARIO_PARAM,
  type SharedContractScenario,
} from "@/helpers/contract-scenario-link";

const WRITE_DELAY_MS = 400;

/**
 * Keeps the contract simulation being edited in `?cenario=` (replace, no
 * history entry), like the Projections link. `initial` is what the URL
 * brought when the page opened: the page starts from it instead of the saved
 * contract. Terms equal to `savedTerms` are left out, so an untouched screen
 * keeps a clean URL.
 */
export function useContractScenarioUrl(savedTerms: ContractFormValues | null) {
  const [params, setParams] = useSearchParams();
  const [initial] = useState<SharedContractScenario | null>(() =>
    decodeContractScenario(params.get(SCENARIO_PARAM)),
  );
  const current = useRef<SharedContractScenario>({ v: 1, ...initial });
  const timer = useRef<number | undefined>(undefined);
  const savedKey = savedTerms ? JSON.stringify(savedTerms) : null;

  const write = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const { terms, calc } = current.current;
      const value = terms || calc ? encodeContractScenario(current.current) : null;
      setParams(
        (now) => {
          const next = new URLSearchParams(now);
          if (value) next.set(SCENARIO_PARAM, value);
          else next.delete(SCENARIO_PARAM);
          return next;
        },
        { replace: true },
      );
    }, WRITE_DELAY_MS);
  }, [setParams]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const setTerms = useCallback(
    (terms: ContractFormValues) => {
      const same = savedKey !== null && JSON.stringify(terms) === savedKey;
      current.current = { ...current.current, terms: same ? undefined : terms };
      write();
    },
    [savedKey, write],
  );

  const setCalc = useCallback(
    (calc: CalculatorScenarioValues) => {
      current.current = { ...current.current, calc };
      write();
    },
    [write],
  );

  return { initial, setTerms, setCalc };
}
