import { http } from "@/services/http/client";
import type {
  CardAnticipation,
  CardFeeBand,
  CardFeeSettings,
} from "@/types/card-fees";

/** Configurações › Juros do cartão (the payment link's card interest). */
export const cardFeesService = {
  async get() {
    const { data } = await http.get<CardFeeSettings>("/settings/card-fees");
    return data;
  },
  /** bands null = back to the default rates; anticipation left out = unchanged. */
  async save(bands: CardFeeBand[] | null, anticipation?: CardAnticipation) {
    const { data } = await http.put<CardFeeSettings>("/settings/card-fees", {
      bands,
      anticipation,
    });
    return data;
  },
};
