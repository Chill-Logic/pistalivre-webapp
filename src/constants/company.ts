/** Providers with a live "Testar conexão" (the API answers 422 for others). */
export const TESTABLE_INTEGRATIONS = ["clicksign", "inter", "ai"] as const;

/** What the test exercises, shown next to the button. */
export const INTEGRATION_TEST_HINTS: Record<string, string> = {
  inter: "Testa o certificado, a chave e o OAuth ao vivo, com o que está salvo.",
  clicksign:
    "Faz uma leitura na API com o que está salvo. Separa token errado de usuário de API não configurado no painel.",
  ai: "Faz uma pergunta curta ao modelo com o provedor, o modelo e a chave salvos.",
};

/**
 * Suggested Inter callback: the production backend (the Next sugeria
 * `${APP_URL}/api/webhooks/inter`). It must be public, so never localhost.
 */
export const INTER_WEBHOOK_SUGGESTED_URL =
  "https://pistalivrelocacoes.com.br/api/webhooks/inter";
