"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "./translations";

interface LanguageContextType {
    lang: Language;
    t: typeof translations.en;
    toggleLanguage: () => void;
    dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
    lang: "en",
    t: translations.en,
    toggleLanguage: () => { },
    dir: "ltr",
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState<Language>("en");

    useEffect(() => {
        const saved = localStorage.getItem("homefix_lang") as Language;
        if (saved && (saved === "en" || saved === "ckb")) {
            setLang(saved);
        }
    }, []);

    const toggleLanguage = () => {
        const nextLang = lang === "en" ? "ckb" : "en";
        setLang(nextLang);
        localStorage.setItem("homefix_lang", nextLang);
    };

    const t = translations[lang];
    const dir = t.dir as "ltr" | "rtl";

    useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
    }, [dir, lang]);

    return (
        <LanguageContext.Provider value={{ lang, t, toggleLanguage, dir }}>
            <div dir={dir}>{children}</div>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);