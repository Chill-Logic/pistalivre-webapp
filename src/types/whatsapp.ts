/** "open" = paired; "connecting"/"close" = needs a QR; "none" = no number yet. */
export type WhatsAppState = "open" | "connecting" | "close" | "none" | "unknown";

/** The Livrinho's bot in the WhatsApp bridge, as Integrações › WhatsApp shows it. */
export type WhatsAppBot = {
  name: string;
  connector: string;
  backendUrl: string | null;
  hasBackendToken: boolean;
  allowedGroupIds: string[];
  /** Text prefixes that call the bot; @mention and reply always do. */
  triggers: string[];
  active: boolean;
  /** Answers private chats (only the team). */
  directMessages: boolean;
  number: { phone: string | null; createdAt: string } | null;
  state: WhatsAppState;
};

export type WhatsAppStatus = {
  /** Bridge address and bot key filled in (Integrações › Conectar). */
  configured: boolean;
  /** The bridge holds a token of ours and calls this system. */
  linked: boolean;
  bot: WhatsAppBot | null;
};

export type WhatsAppQr = { connected: boolean; phone: string | null; qr: string | null };

export type WhatsAppGroup = { id: string; subject: string; size: number | null };

export type WhatsAppSettings = {
  allowedGroupIds?: string[];
  triggers?: string[];
  active?: boolean;
  directMessages?: boolean;
};
