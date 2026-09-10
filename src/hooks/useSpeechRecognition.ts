import { useCallback, useEffect, useRef, useState } from "react";

// webkitSpeechRecognition (Chrome/Edge) / SpeechRecognition aren't in lib.dom.d.ts's stable
// surface across TS lib versions, so this file declares the minimal shape it actually uses rather
// than pulling in a third-party @types package for a browser-only, non-standard API.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultLike[];
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

const getSpeechRecognitionCtor = (): SpeechRecognitionCtor | undefined =>
  window.SpeechRecognition || window.webkitSpeechRecognition;

export const isSpeechRecognitionSupported = () =>
  typeof window !== "undefined" && Boolean(getSpeechRecognitionCtor());

interface UseSpeechRecognitionResult {
  isListening: boolean;
  finalTranscript: string;
  interimTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

// Manual turn-taking only: continuous + interim results feed a live-captions UI, and the caller
// stops listening explicitly (a "done answering" button) rather than this hook guessing at
// silence — auto-silence-detection is unreliable and deliberately out of scope for this loop.
export const useSpeechRecognition = (): UseSpeechRecognitionResult => {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionCtor();

    if (!RecognitionCtor) {
      setError("Speech recognition isn't supported in this browser.");
      return;
    }

    setError(null);
    setInterimTranscript("");

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += `${transcript} `;
        } else {
          interim += transcript;
        }
      }

      if (finalChunk) {
        setFinalTranscript((prev) => `${prev} ${finalChunk}`.trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      setError(`Mic error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  // Release the mic if the component unmounts mid-listen (e.g. navigating away).
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    finalTranscript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  };
};
