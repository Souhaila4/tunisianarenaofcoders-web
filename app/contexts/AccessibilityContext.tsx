"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "../lib/translations";

const STORAGE_KEY = "aoc_accessibility";

type State = {
  lang: Lang;
  zoom: number;
  highContrast: boolean;
};

const defaultState: State = {
  lang: "en",
  zoom: 0,
  highContrast: false,
};

function loadState(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s) as Partial<State>;
      return {
        lang: parsed.lang ?? defaultState.lang,
        zoom: Math.min(3, Math.max(0, Number(parsed.zoom) ?? 0)),
        highContrast: Boolean(parsed.highContrast),
      };
    }
  } catch {}
  return defaultState;
}

function saveState(state: State) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

type ContextValue = State & {
  setLang: (lang: Lang) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setHighContrast: (on: boolean) => void;
};

const AccessibilityContext = createContext<ContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(defaultState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveState(state);
    document.documentElement.lang = state.lang === "ar" ? "ar" : state.lang === "fr" ? "fr" : "en";
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.documentElement.style.fontSize = `${100 + state.zoom * 15}%`;
    document.body.classList.toggle("a11y-high-contrast", state.highContrast);
  }, [state, mounted]);

  const setLang = (lang: Lang) => setState((s) => ({ ...s, lang }));
  const setZoom = (z: number) => setState((s) => ({ ...s, zoom: Math.min(3, Math.max(0, z)) }));
  const zoomIn = () => setState((s) => ({ ...s, zoom: Math.min(3, s.zoom + 1) }));
  const zoomOut = () => setState((s) => ({ ...s, zoom: Math.max(0, s.zoom - 1) }));
  const setHighContrast = (highContrast: boolean) => setState((s) => ({ ...s, highContrast }));

  const value: ContextValue = {
    ...state,
    setLang,
    setZoom,
    zoomIn,
    zoomOut,
    setHighContrast,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
