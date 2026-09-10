import { useCallback, useEffect } from "react";

interface UseSpeechSynthesisResult {
  speak: (text: string, onEnd?: () => void) => void;
  cancel: () => void;
}

// Thin wrapper around window.speechSynthesis. Callers must wait for `onEnd` before starting to
// listen for an answer — recognizing the device's own speaker output as input is a real failure
// mode on some devices, so TTS and STT are never run concurrently in this loop.
export const useSpeechSynthesis = (): UseSpeechSynthesisResult => {
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Stop talking if the component unmounts mid-utterance.
  useEffect(() => cancel, [cancel]);

  return { speak, cancel };
};
