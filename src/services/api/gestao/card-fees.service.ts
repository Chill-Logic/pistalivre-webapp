import { http } from "@/services/http/client";
import type {
  CardAnticipation,
  CardFeeBand,
  CardFeeSettings,
} from "@/types/card-fees";
import type { CardInstallmentOption } from "@/types/payment-link";

/** Configurações › Juros do cartão (the payment link's card interest). */
export const cardFeesService = {
  async get() {
    const { data } = await http.get<CardFeeSettings>("/settings/card-fees");
    return data;
  },
  /** The table applied to an amount WITHOUT saving (the server does the math). */
  async preview(input: {
    bands: CardFeeBand[];
    anticipation: CardAnticipation;
    amount: number;
    /** Pass the anticipation on in the example (default: no, like a new charge). */
    passAnticipation: boolean;
  }) {
    const { data } = await http.post<{
      amount: number;
      options: CardInstallmentOption[];
    }>("/settings/card-fees/preview", input);
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
