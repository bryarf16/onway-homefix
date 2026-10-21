import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: translations.en,
      },
      ckb: {
        translation: translations.ckb,
      },
    },
    lng: typeof window !== "undefined" ? (localStorage.getItem("homefix_lang") as string) || "en" : "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
