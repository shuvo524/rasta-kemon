"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LangContext, type Lang } from "@/lib/i18n";

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("rasta-kemon-lang");
      if (saved === "bn" || saved === "en") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("rasta-kemon-lang", l);
    } catch {
      /* ignore */
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}
