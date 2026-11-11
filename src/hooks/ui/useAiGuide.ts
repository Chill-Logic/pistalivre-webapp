import { useSyncExternalStore } from "react";

/** What the highlight points at: a section anchor, a CSS selector, or a field by its label. */
export type AiGuideTarget = {
  anchor?: string;
  selector?: string;
  label?: string;
};

export type AiGuideSpot = {
  target: AiGuideTarget;
  title: string;
  text: string;
  /** "2 de 4" in a tour. */
  step?: { index: number; total: number };
  /** The main button ("Próximo", "Preencher tudo"…); absent = only "Fechar". */
  next?: { label: string; run: () => void };
  /** The page to be on first (a tour across screens). */
  route?: string;
};

type Listener = () => void;
let current: AiGuideSpot | null = null;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((listener) => listener());
let onClose: (() => void) | null = null;

/**
 * The assistant's guide on the screen: one highlight at a time (a section or a
 * field, with a bubble saying what it is), and tours made of them across
 * screens. Lives outside React so the chat, the forms and the overlay share it.
 */
export const aiGuide = {
  show(spot: AiGuideSpot, close?: () => void) {
    current = spot;
    onClose = close ?? null;
    emit();
  },
  clear() {
    const close = onClose;
    current = null;
    onClose = null;
    emit();
    close?.();
  },
  /** One step per place, "Próximo" moves on; the overlay navigates to each route. */
  tour(steps: Omit<AiGuideSpot, "step" | "next">[]) {
    const go = (index: number) => {
      const step = steps[index];
      if (!step) return aiGuide.clear();
      const last = index === steps.length - 1;
      aiGuide.show({
        ...step,
        step:
          steps.length > 1
            ? { index: index + 1, total: steps.length }
            : undefined,
        next: last ? undefined : { label: "Próximo", run: () => go(index + 1) },
      });
    };
    go(0);
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => current,
};

export function useAiGuideSpot() {
  return useSyncExternalStore(aiGuide.subscribe, aiGuide.get, aiGuide.get);
}

/**
 * The element a target means on the page now (null = not rendered yet). The
 * section anchor wins; the selector/label are the fallback, used only once
 * `fallback` is allowed (the section may still be loading its data).
 */
export function findGuideTarget(
  target: AiGuideTarget,
  fallback = true,
): HTMLElement | null {
  if (target.anchor) {
    const el = document.querySelector<HTMLElement>(
      `[data-ai-anchor="${CSS.escape(target.anchor)}"]`,
    );
    if (el) return el;
    if (!fallback) return null;
  }
  if (target.selector) {
    const el = document.querySelector<HTMLElement>(target.selector);
    if (el) return el;
  }
  if (target.label) {
    const wanted = target.label.trim().toLowerCase();
    const label = Array.from(
      document.querySelectorAll<HTMLElement>("label"),
    ).find((el) => el.textContent?.trim().toLowerCase() === wanted);
    if (label) return label.parentElement ?? label;
  }
  return null;
}

/** Events from the screen back to the chat (a proposal saved through its form). */
export type AiChatEvent = {
  type: "fulfilled";
  actionId: string;
  summary: string;
  result: unknown;
};
const chatListeners = new Set<(event: AiChatEvent) => void>();
export const aiChatEvents = {
  emit(event: AiChatEvent) {
    chatListeners.forEach((listener) => listener(event));
  },
  subscribe(listener: (event: AiChatEvent) => void) {
    chatListeners.add(listener);
    return () => {
      chatListeners.delete(listener);
    };
  },
};
