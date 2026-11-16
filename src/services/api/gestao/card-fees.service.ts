import { http } from "@/services/http/client";
import type { CardFeeBand, CardFeeSettings } from "@/types/card-fees";

/** Configurações › Juros do cartão (the payment link's card interest). */
export const cardFeesService = {
  async get() {
    const { data } = await http.get<CardFeeSettings>("/settings/card-fees");
    return data;
  },
  /** null = back to the default rates. */
  async save(bands: CardFeeBand[] | null) {
    const { data } = await http.put<CardFeeSettings>("/settings/card-fees", { bands });
    return data;
  },
};
