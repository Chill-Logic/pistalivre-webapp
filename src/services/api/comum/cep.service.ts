import axios from "axios";
import { onlyDigits } from "@/utils/masks";

export type CepAddress = {
  addressLine: string;
  neighborhood: string;
  city: string;
  state: string;
};

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

/** Address by CEP (ViaCEP, public). null when the CEP does not exist. */
export const cepService = {
  async lookup(cep: string): Promise<CepAddress | null> {
    const { data } = await axios.get<ViaCepResponse>(
      `https://viacep.com.br/ws/${onlyDigits(cep)}/json/`,
      { timeout: 8_000 },
    );
    if (data.erro) return null;
    return {
      addressLine: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  },
};
