import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { LangCode } from "../lib/i18n";
import { t, LANG_LIST } from "../lib/i18n";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: Parameters<typeof t>[1]) => string;
  isRTL: boolean;
  langList: typeof LANG_LIST;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key as string,
  isRTL: false,
  langList: LANG_LIST,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = (typeof localStorage !== "undefined" && localStorage.getItem("airtwin_lang")) as LangCode | null;
  const [lang, setLangState] = useState<LangCode>(stored ?? "en");

  const setLang = (l: LangCode) => {
    setLangState(l);
    localStorage.setItem("airtwin_lang", l);
  };

  const isRTL = LANG_LIST.find((l) => l.code === lang)?.rtl ?? false;

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const translate = (key: Parameters<typeof t>[1]) => t(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translate, isRTL, langList: LANG_LIST }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
