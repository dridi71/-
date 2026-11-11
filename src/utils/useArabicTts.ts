import { useState, useEffect, useCallback, useRef } from "react";
import { loadUserPreferences } from "./userPreferences";

export interface UseArabicTtsReturn {
  speak: (textToSpeak: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  arabicVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  charIndex: number | null;
  isSupported: boolean;
}

export function useArabicTts(): UseArabicTtsReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(() => {
    try {
      return loadUserPreferences().speechRate || 1.0;
    } catch {
      return 1.0;
    }
  });
  const [arabicVoices, setArabicVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [charIndex, setCharIndex] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter Arabic voices or fallback to all voices
      const arVoices = allVoices.filter((v) => v.lang.toLowerCase().startsWith("ar"));
      
      setArabicVoices(arVoices);

      // Default select the best Arabic voice if available
      if (arVoices.length > 0 && !selectedVoice) {
        // Prefer local or Google/Microsoft voices if present
        const preferred = arVoices.find(
          (v) =>
            v.name.includes("Google") ||
            v.name.includes("Microsoft") ||
            v.name.includes("Maged") ||
            v.name.includes("Tarik") ||
            v.name.includes("Salma")
        ) || arVoices[0];
        setSelectedVoice(preferred);
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCharIndex(null);
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const speak = useCallback(
    (textToSpeak: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        alert("عذراً، متصفحك لا يدعم خاصية تحويل النص إلى كلام (Web Speech API).");
        return;
      }

      if (!textToSpeak || textToSpeak.trim().length === 0) return;

      // Cancel ongoing synthesis
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = selectedVoice?.lang || "ar-SA";
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCharIndex(null);
      };

      utterance.onerror = (err) => {
        console.error("Speech synthesis error:", err);
        setIsPlaying(false);
        setIsPaused(false);
        setCharIndex(null);
      };

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          setCharIndex(event.charIndex);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, speechRate]
  );

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    speechRate,
    setSpeechRate,
    arabicVoices,
    selectedVoice,
    setSelectedVoice,
    charIndex,
    isSupported,
  };
}
