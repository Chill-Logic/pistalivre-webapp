import type { CalculatorScenarioValues } from "@/components/organisms/partner-contract-calculator";
import type { ContractFormValues } from "@/components/organisms/partner-contract-form/schema";

/**
 * A partner contract simulation carried in the URL (`?cenario=`), so a link
 * opens the same terms and calculator — nothing is saved until someone clicks
 * "Salvar contrato". Only what differs from the saved contract goes in.
 */
export type SharedContractScenario = {
  v: 1;
  terms?: ContractFormValues;
  calc?: CalculatorScenarioValues;
};

export const SCENARIO_PARAM = "cenario";

/** JSON → base64url (UTF-8 safe: the values carry accented text). */
export function encodeContractScenario(scenario: SharedContractScenario): string {
  const bytes = new TextEncoder().encode(JSON.stringify(scenario));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The scenario from the URL, or null when absent or broken (a bad link opens the saved contract). */
export function decodeContractScenario(value: string | null): SharedContractScenario | null {
  if (!value) return null;
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SharedContractScenario;
    if (!parsed || parsed.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}
