import { useCallback } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/helpers/clipboard";

/** Copy with feedback ("Pix copiado"). */
export function useCopy() {
  return useCallback(async (text: string, successMessage: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success(successMessage);
    else toast.error("Não foi possível copiar. Copie manualmente.");
  }, []);
}
