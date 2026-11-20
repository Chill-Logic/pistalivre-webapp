import { http } from "@/services/http/client";
import type {
  WhatsAppBot,
  WhatsAppGroup,
  WhatsAppQr,
  WhatsAppSettings,
  WhatsAppStatus,
} from "@/types/whatsapp";

/** Integrações › WhatsApp (ADMIN): the Livrinho's bot in the WhatsApp bridge. */
export const whatsappService = {
  async status() {
    const { data } = await http.get<WhatsAppStatus>("/whatsapp");
    return data;
  },
  /** Hands the bridge a fresh token of ours (the previous one stops). */
  async connect() {
    const { data } = await http.post<WhatsAppStatus>("/whatsapp/connect");
    return data;
  },
  async updateSettings(settings: WhatsAppSettings) {
    const { data } = await http.patch<WhatsAppBot>("/whatsapp", settings);
    return data;
  },
  async qr() {
    const { data } = await http.get<WhatsAppQr>("/whatsapp/qr");
    return data;
  },
  async groups() {
    const { data } = await http.get<{ items: WhatsAppGroup[] }>("/whatsapp/groups");
    return data.items;
  },
  async newNumber(logoutPrevious: boolean) {
    const { data } = await http.post<WhatsAppBot>("/whatsapp/number", { logoutPrevious });
    return data;
  },
  async logout() {
    await http.post("/whatsapp/logout");
  },
};
