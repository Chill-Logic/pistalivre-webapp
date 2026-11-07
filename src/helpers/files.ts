import { apiOrigin } from "@/config/env";

/** Absolute URL for a file path the API returned (`/api/files/<key>`). */
export function resolveFileUrl(path: string) {
  return new URL(path, apiOrigin).toString();
}

/** Save a blob with a file name (the API needs a header, so no plain <a href>). */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/**
 * Open a tab synchronously (inside the click, so popup blockers allow it)
 * and point it at the blob once it arrives.
 */
export async function openBlobInNewTab(load: () => Promise<Blob>) {
  const tab = window.open("", "_blank");
  try {
    const url = URL.createObjectURL(await load());
    if (tab) tab.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    tab?.close();
    throw error;
  }
}
