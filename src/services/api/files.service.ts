import { resolveFileUrl } from "@/helpers/files";
import { http } from "@/services/http/client";

export const filesService = {
  /** Authenticated download: the bearer header is why this is not a link. */
  async download(path: string) {
    const { data } = await http.get<Blob>(resolveFileUrl(path), {
      responseType: "blob",
      timeout: 120_000,
    });
    return data;
  },
};
