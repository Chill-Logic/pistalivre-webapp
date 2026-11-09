import { ROUTES } from "@/constants/routes";
import type { SectionTab } from "@/components/molecules/section-tabs";

/** Tabs of Integrações: everyone connects; the admin also manages. */
export const INTEGRATION_TABS: (SectionTab & { adminOnly?: boolean })[] = [
  { label: "Conectar", to: ROUTES.integrations, end: true },
  { label: "Permissões", to: ROUTES.integrationsPermissions, adminOnly: true },
  { label: "Aplicativos", to: ROUTES.integrationsApps, adminOnly: true },
];

export type AiProviderKey = "claude" | "chatgpt" | "gemini" | "other";

/** One way of using a provider (CLI, desktop, web, API): steps + what to paste. */
export type AiGuide = {
  title: string;
  steps: string[];
  /** `{url}` is replaced by the MCP address. */
  code?: string;
};

export type AiProvider = {
  key: AiProviderKey;
  name: string;
  guides: AiGuide[];
};

/**
 * How to connect each AI to the system's MCP. Menus change name over time:
 * the essentials are the address and that the app signs in with OAuth (the
 * person approves with their own login, on our consent screen).
 */
export const AI_PROVIDERS: AiProvider[] = [
  {
    key: "claude",
    name: "Claude",
    guides: [
      {
        title: "Claude Code (terminal)",
        steps: [
          "Rode o comando abaixo no terminal.",
          "Dentro do Claude Code, digite /mcp, escolha “pista-livre” e “Authenticate”.",
          "O navegador abre a tela do sistema: entre com o seu login e clique em Autorizar.",
        ],
        code: "claude mcp add --transport http pista-livre {url}",
      },
      {
        title: "Claude no navegador ou no aplicativo de desktop",
        steps: [
          "Abra Configurações › Conectores e clique em “Adicionar conector personalizado”.",
          "Dê um nome (ex.: Pista Livre) e cole o endereço abaixo.",
          "Clique em Conectar: a tela do sistema abre, entre com o seu login e autorize.",
          "Na conversa, ative o conector Pista Livre no menu de ferramentas.",
        ],
        code: "{url}",
      },
      {
        title: "API da Anthropic (desenvolvedores)",
        steps: [
          "O seu aplicativo faz o OAuth do sistema (PKCE) e recebe um access token.",
          "Mande o servidor MCP na chamada da Messages API, com o token, como no exemplo.",
          "O token dura 1 hora; renove com o refresh token.",
        ],
        code: `{
  "model": "claude-opus-5-5",
  "max_tokens": 4096,
  "mcp_servers": [
    { "type": "url", "url": "{url}", "name": "pista-livre", "authorization_token": "<access token>" }
  ],
  "tools": [{ "type": "mcp_toolset", "mcp_server_name": "pista-livre" }],
  "messages": [{ "role": "user", "content": "Quais locações estão ativas?" }]
}
// cabeçalho: anthropic-beta: mcp-client-2025-11-20`,
      },
    ],
  },
  {
    key: "chatgpt",
    name: "ChatGPT",
    guides: [
      {
        title: "ChatGPT no navegador",
        steps: [
          "Abra Configurações › Plugins (antes “Conectores”) › Avançado e ative o modo desenvolvedor — planos Plus, Pro, Business, Enterprise ou Edu.",
          "Escolha “Adicionar servidor MCP personalizado”, dê um nome e cole o endereço abaixo; autenticação: OAuth.",
          "A tela do sistema abre: entre com o seu login e autorize.",
          "Na conversa, escolha o conector Pista Livre nas ferramentas.",
        ],
        code: "{url}",
      },
      {
        title: "Codex (terminal)",
        steps: [
          "Rode o comando abaixo para adicionar o servidor.",
          "Rode o login: o navegador abre a tela do sistema para você autorizar.",
        ],
        code: "codex mcp add pista-livre --url {url}\ncodex mcp login pista-livre",
      },
      {
        title: "API da OpenAI (desenvolvedores)",
        steps: [
          "O seu aplicativo faz o OAuth do sistema (PKCE) e recebe um access token.",
          "Na Responses API, mande o servidor como ferramenta do tipo mcp, com o token.",
        ],
        code: `{
  "model": "<modelo>",
  "tools": [{
    "type": "mcp",
    "server_label": "pista-livre",
    "server_url": "{url}",
    "authorization": "<access token>",
    "require_approval": "never"
  }],
  "input": "Quais locações estão ativas?"
}`,
      },
    ],
  },
  {
    key: "gemini",
    name: "Gemini",
    guides: [
      {
        title: "Gemini no navegador (onde estiver liberado)",
        steps: [
          "No Gemini pelo navegador, abra Configurações › Apps conectados e adicione um app personalizado com o endereço abaixo.",
          "A tela do sistema abre: entre com o seu login e autorize. Depois o app funciona também no celular.",
          "Atenção: o Google ainda libera isso só para alguns países, idiomas e planos. Se a opção não aparecer, use o Gemini CLI abaixo.",
        ],
        code: "{url}",
      },
      {
        title: "Gemini CLI (terminal)",
        steps: [
          "Acrescente o servidor no arquivo ~/.gemini/settings.json, como abaixo.",
          "Abra o Gemini CLI e rode /mcp auth pista-livre: o navegador abre a tela do sistema para você autorizar.",
        ],
        code: `{
  "mcpServers": {
    "pista-livre": { "httpUrl": "{url}" }
  }
}`,
      },
      {
        title: "API do Gemini (desenvolvedores)",
        steps: [
          "Use um cliente MCP (o SDK oficial de MCP) apontando para o endereço abaixo, com o access token do OAuth no cabeçalho Authorization.",
          "Passe a sessão MCP como ferramenta na chamada do Gemini (o SDK do Gemini aceita sessões MCP).",
        ],
        code: "{url}",
      },
    ],
  },
  {
    key: "other",
    name: "Outro cliente MCP",
    guides: [
      {
        title: "Qualquer cliente compatível (Cursor, VS Code, MCP Inspector…)",
        steps: [
          "Adicione um servidor MCP do tipo HTTP (Streamable HTTP) com o endereço abaixo.",
          "O cliente descobre o OAuth sozinho e abre a tela do sistema: entre com o seu login e autorize.",
          "Se o cliente pedir, o escopo é mcp:tools.",
        ],
        code: "{url}",
      },
    ],
  },
];

/** Audit channels, in Portuguese (UI vocabulary: the API sends the codes). */
export const AI_AUDIT_CHANNEL_LABELS: Record<string, string> = {
  chat: "Chat do sistema",
  mcp: "MCP",
  oauth: "Autorização (OAuth)",
  admin: "Administração",
};

/** Audit events, in Portuguese; a tool call shows the tool's own title. */
export const AI_AUDIT_METHOD_LABELS: Record<string, string> = {
  message: "Mensagem no chat",
  "tools/call": "Ferramenta",
  "tools/list": "Listou as ferramentas",
  initialize: "Conectou",
  "notifications/initialized": "Conexão confirmada",
  ping: "Ping",
  "rate.limited": "Bloqueado por excesso de chamadas",
  register: "Aplicativo registrado",
  "consent.approve": "Acesso autorizado",
  "consent.deny": "Acesso recusado",
  "token.issue": "Token emitido",
  "token.refresh": "Token renovado",
  "token.revoke": "Token revogado",
  "auth.rejected": "Acesso negado (token inválido)",
  "permissions.role": "Permissões do papel alteradas",
  "permissions.user": "Permissões de uma pessoa alteradas",
  "client.block": "Aplicativo bloqueado",
  "client.unblock": "Aplicativo desbloqueado",
  "grant.revoke": "Autorização revogada",
  "gap.report": "Pergunta sem resposta",
  "action.confirm": "Ação confirmada",
  "action.cancel": "Ação cancelada",
};

/** Why the AI couldn't answer (registrar_pergunta_sem_resposta). */
export const AI_GAP_REASON_LABELS: Record<string, string> = {
  sem_ferramenta: "Sem ferramenta",
  sem_permissao: "Sem permissão",
  dado_insuficiente: "Dado insuficiente",
  sem_motivo: "Sem motivo",
};

/** The always-on tool the AI calls when nothing answers. */
export const AI_GAP_TOOL = "registrar_pergunta_sem_resposta";

/** Auditoria: every event, and the gaps (what went unanswered). */
export const AUDIT_TABS: SectionTab[] = [
  { label: "Eventos", to: ROUTES.audit, end: true },
  { label: "Lacunas", to: ROUTES.auditGaps },
];
