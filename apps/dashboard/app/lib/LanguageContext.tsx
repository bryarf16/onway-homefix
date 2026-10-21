"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "./translations";
import i18n from "./i18n";
import { I18nextProvider, useTranslation } from "react-i18next";

interface LanguageContextType {
  lang: Language;
  t: typeof translations.en;
  toggleLanguage: () => void;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: translations.en,
  toggleLanguage: () => {},
  dir: "ltr",
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("homefix_lang") as Language;
    if (saved && (saved === "en" || saved === "ckb")) {
      setLang(saved);
      i18n.changeLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ckb" : "en";
    setLang(nextLang);
    localStorage.setItem("homefix_lang", nextLang);
    i18n.changeLanguage(nextLang);
  };

  const t = translations[lang];
  const dir = (translations[lang]?.dir || "ltr") as "ltr" | "rtl";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    }
  }, [dir, lang]);

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={{ lang, t, toggleLanguage, dir }}>
        <div dir={dir}>{children}</div>
      </LanguageContext.Provider>
    </I18nextProvider>
  );
};

export const useLanguage = () => useContext(LanguageContext);