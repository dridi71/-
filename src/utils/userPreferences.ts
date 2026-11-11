import { HighlightMode } from "../types";

export interface UserPreferences {
  defaultHighlightMode: HighlightMode;
  autoGrammarCheck: boolean;
  ignoreDiacritics: boolean;
  ignoreStopWords: boolean;
  minRepeatThreshold: number;
  fontSize: "normal" | "large" | "huge";
  autoPlayTtsOnInspect: boolean;
  speechRate: number;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultHighlightMode: "frequency",
  autoGrammarCheck: true,
  ignoreDiacritics: true,
  ignoreStopWords: false,
  minRepeatThreshold: 2,
  fontSize: "normal",
  autoPlayTtsOnInspect: false,
  speechRate: 1.0,
};

const STORAGE_KEY = "arabe_texte_analyse_preferences_v1";

/**
 * Loads user preferences from localStorage with safe fallback to defaults
 */
export function loadUserPreferences(): UserPreferences {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_USER_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_USER_PREFERENCES;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...parsed,
    };
  } catch (err) {
    console.warn("Could not load user preferences from localStorage:", err);
    return DEFAULT_USER_PREFERENCES;
  }
}

/**
 * Persists user preferences into localStorage
 */
export function saveUserPreferences(prefs: UserPreferences): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch (err) {
    console.error("Failed to save user preferences to localStorage:", err);
    return false;
  }
}

/**
 * Resets preferences to factory defaults and clears storage entry
 */
export function resetUserPreferences(): UserPreferences {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Could not clear preferences from localStorage:", err);
    }
  }
  return { ...DEFAULT_USER_PREFERENCES };
}
