import { Text } from "@/components/atoms/text";
import { TextLink } from "@/components/molecules/text-link";
import { ROUTES } from "@/constants/routes";

/** When a provider call fails: where its credentials are checked. */
export function IntegrationsHelp() {
  return (
    <Text inline size={null}>
      Verifique as credenciais em{" "}
      <TextLink to={ROUTES.company}>Empresa → Integrações</TextLink>.
    </Text>
  );
}
