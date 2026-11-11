import { useCallback, useEffect, useRef, useState } from "react";
import { toApiError } from "@/helpers/api-error";
import { aiService } from "@/services/api/gestao/ai.service";
import type { AiAttachment } from "@/types/ai";

/** Same limits as the server (it checks again, by the bytes). */
export const AI_ATTACHMENT_ACCEPT =
  "image/jpeg,image/png,image/webp,application/pdf";
const IMAGE_MAX = 5 * 1024 * 1024;
const PDF_MAX = 15 * 1024 * 1024;
export const AI_ATTACHMENTS_PER_MESSAGE = 5;

export type PendingAttachment = {
  key: string;
  name: string;
  isPdf: boolean;
  /** Local preview of an image (revoked when it goes away). */
  previewUrl: string | null;
  status: "uploading" | "ready" | "error";
  progress: number;
  error: string | null;
  uploaded: AiAttachment | null;
};

let counter = 0;

/** Why a file can't go (before uploading), or null. */
function rejectReason(file: File): string | null {
  const name = file.name.toLowerCase();
  if (file.type === "image/heic" || /\.(heic|heif)$/.test(name)) {
    return "Foto em HEIC: envie em JPG (no iPhone: Ajustes › Câmera › Formatos › Mais compatível).";
  }
  const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
  const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (!isPdf && !isImage) return "Só imagem (JPG, PNG, WebP) ou PDF.";
  if (file.size > (isPdf ? PDF_MAX : IMAGE_MAX)) {
    return isPdf ? "PDF acima de 15 MB." : "Imagem acima de 5 MB.";
  }
  return null;
}

/**
 * Files attached to the next chat message: each one uploads the moment it
 * comes in (paste, drop or the clip), so it's ready by the time the person
 * finishes typing. The message then carries only the ids.
 */
export function useAiAttachments() {
  const [items, setItems] = useState<PendingAttachment[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const patch = (key: string, change: Partial<PendingAttachment>) =>
    setItems((list) =>
      list.map((item) => (item.key === key ? { ...item, ...change } : item)),
    );

  const add = useCallback((files: File[]) => {
    setNotice(null);
    const room = AI_ATTACHMENTS_PER_MESSAGE - itemsRef.current.length;
    if (files.length > room) {
      setNotice(`No máximo ${AI_ATTACHMENTS_PER_MESSAGE} anexos por mensagem.`);
    }
    files.slice(0, Math.max(room, 0)).forEach((file) => {
      const key = `a${++counter}`;
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      const reason = rejectReason(file);
      const item: PendingAttachment = {
        key,
        name: file.name || (isPdf ? "documento.pdf" : "imagem.png"),
        isPdf,
        previewUrl: !isPdf && !reason ? URL.createObjectURL(file) : null,
        status: reason ? "error" : "uploading",
        progress: 0,
        error: reason,
        uploaded: null,
      };
      setItems((list) => [...list, item]);
      if (reason) return;
      aiService
        .uploadAttachment(file, (progress) => patch(key, { progress }))
        .then((uploaded) =>
          patch(key, { status: "ready", progress: 1, uploaded }),
        )
        .catch((failure) =>
          patch(key, { status: "error", error: toApiError(failure).message }),
        );
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((list) => {
      const gone = list.find((item) => item.key === key);
      if (gone?.previewUrl) URL.revokeObjectURL(gone.previewUrl);
      return list.filter((item) => item.key !== key);
    });
  }, []);

  /** The message went: the list starts over (previews stay with the message). */
  const take = useCallback(() => {
    const ready = itemsRef.current.filter((item) => item.status === "ready");
    setItems([]);
    setNotice(null);
    return ready;
  }, []);

  useEffect(
    () => () => {
      itemsRef.current.forEach(
        (item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl),
      );
    },
    [],
  );

  return {
    items,
    notice,
    add,
    remove,
    take,
    uploading: items.some((item) => item.status === "uploading"),
    readyCount: items.filter((item) => item.status === "ready").length,
  };
}
