import { useEffect, useRef } from "react";
import {
  PartnerContractCalculator,
  type CalculatorTerms,
} from "@/components/organisms/partner-contract-calculator";
import {
  calculatorGroupsOf,
  calculatorTermsOf,
  scenarioFillOf,
  scenarioKey,
} from "@/helpers/partner-calculator";
import { useSavePartnerCalculator } from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import type { PartnerCalculatorScenario, PartnerContract } from "@/types/partner";

/** Saves the scenario after the person stops typing in the calculator. */
const SCENARIO_SAVE_MS = 800;

type PartnerContractLiveCalculatorProps = {
  contract: PartnerContract;
  /** The form's terms as typed (none = the saved ones). */
  terms?: CalculatorTerms | null;
};

/**
 * "Quanto o parceiro recebe?" of a saved contract: starts from the scenario
 * saved on it (the Livrinho's, or the last one typed), follows the server when
 * it changes, and saves what the PERSON changes (debounced) — the assistant
 * reads the same scenario.
 */
export function PartnerContractLiveCalculator({ contract, terms }: PartnerContractLiveCalculatorProps) {
  const save = useSavePartnerCalculator(contract.id);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onScenarioChange = (scenario: PartnerCalculatorScenario) => {
    clearTimeout(timer.current);
    // The calculator just took what the server has (the assistant's change):
    // saving it back would only echo — and echo again on the next update.
    if (scenarioKey(scenario) === scenarioKey(contract.calculatorScenario)) return;
    timer.current = setTimeout(() => save.mutate(scenario), SCENARIO_SAVE_MS);
  };

  return (
    <PartnerContractCalculator
      terms={terms ?? calculatorTermsOf(contract)}
      initialGroups={contract.calculatorScenario ? undefined : calculatorGroupsOf(contract)}
      fill={scenarioFillOf(contract.calculatorScenario)}
      onScenarioChange={onScenarioChange}
    />
  );
}
