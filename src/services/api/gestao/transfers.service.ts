import { http } from "@/services/http/client";
import type { Transfer } from "@/types/transfer";

/** Pix already sent by the platform: read-only history, nothing is emitted. */
export const transfersService = {
  async list() {
    const { data } = await http.get<{ items: Transfer[] }>(
      "/finance/transfers",
    );
    return data.items;
  },
};
