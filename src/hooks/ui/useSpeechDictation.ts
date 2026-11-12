import { useCallback, useEffect, useRef, useState } from "react";

/** The bits of the Web Speech API we use (not in TypeScript's DOM lib). */
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
};
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  "not-allowed":
    "Libere o microfone para este site nas permissões do navegador.",
  "service-not-allowed":
    "Libere o microfone para este site nas permissões do navegador.",
  "audio-capture": "Nenhum microfone encontrado.",
  network: "Sem conexão: o ditado precisa de internet.",
};

/**
 * Dictation with the browser's speech recognition (pt-BR): `onText` gets the
 * text so far (final + what is being heard) on top of `base`, live. Chrome,
 * Edge and Safari; elsewhere `supported` is false. The audio goes to the
 * browser's own service (Google / Apple) — nothing passes through our server.
 */
export function useSpeechDictation(onText: (text: string) => void) {
  const Ctor = recognitionCtor();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  const stop = useCallback(() => recognition.current?.stop(), []);

  const start = useCallback(
    (base: string) => {
      if (!Ctor || recognition.current) return;
      setError(null);
      const r = new Ctor();
      r.lang = "pt-BR";
      r.continuous = true;
      r.interimResults = true;
      const prefix = base.trim() ? `${base.trimEnd()} ` : "";
      let finals = "";
      r.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) finals += result[0].transcript;
          else interim += result[0].transcript;
        }
        onTextRef.current(`${prefix}${finals}${interim}`.replace(/\s+/g, " "));
      };
      r.onerror = (event) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          setError(ERRORS[event.error] ?? "O ditado parou. Tente de novo.");
        }
      };
      r.onend = () => {
        recognition.current = null;
        setListening(false);
      };
      recognition.current = r;
      setListening(true);
      r.start();
    },
    [Ctor],
  );

  // Leaving the chat stops the microphone.
  useEffect(() => () => recognition.current?.abort(), []);

  return { supported: Boolean(Ctor), listening, error, start, stop };
}
