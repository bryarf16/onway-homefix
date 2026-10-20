import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations, Language } from "./translations";

interface LanguageContextType {
  lang: Language;
  dir: "ltr" | "rtl";
  isRTL: boolean;
  t: typeof translations.en;
  toggleLanguage: () => Promise<void>;
  setLanguage: (newLang: Language) => Promise<void>;
  alignText: "left" | "right";
  flexRowStyle: { flexDirection: "row" | "row-reverse" };
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ckb", // بە شێوازی بنەڕەتی با کوردی بێت
  dir: "rtl",
  isRTL: true,
  t: translations.ckb,
  toggleLanguage: async () => {},
  setLanguage: async () => {},
  alignText: "right",
  flexRowStyle: { flexDirection: "row-reverse" },
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>("ckb");

  useEffect(() => {
    // هێنانی زمانی سەیڤکراو لە ناو مۆبایلەکە
    const loadSavedLang = async () => {
      try {
        const saved = (await AsyncStorage.getItem("homefix_mobile_lang")) as Language;
        if (saved && (saved === "en" || saved === "ckb")) {
          setLangState(saved);
        }
      } catch (e) {
        console.error("Failed to load language", e);
      }
    };
    loadSavedLang();
  }, []);

  const setLanguage = async (newLang: Language) => {
    setLangState(newLang);
    try {
      await AsyncStorage.setItem("homefix_mobile_lang", newLang);
    } catch (e) {
      console.error("Failed to save language preference", e);
    }
  };

  const toggleLanguage = async () => {
    const nextLang = lang === "en" ? "ckb" : "en";
    await setLanguage(nextLang);
  };

  const t = translations[lang];
  const dir = t.dir as "ltr" | "rtl";
  const isRTL = dir === "rtl";
  const alignText = isRTL ? "right" : "left";
  const flexRowStyle: { flexDirection: "row" | "row-reverse" } = {
    flexDirection: isRTL ? "row-reverse" : "row",
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir,
        isRTL,
        t,
        toggleLanguage,
        setLanguage,
        alignText,
        flexRowStyle,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
