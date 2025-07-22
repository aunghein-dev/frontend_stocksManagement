"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import LocalizationMem from "@/lib/classes/LocalizationMem";

type Locale = "en" | "my";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const localizationStorage = new LocalizationMem();

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Fix hydration mismatch by updating state only on client
  useEffect(() => {
    const stored = localizationStorage.getLocalizationMem().lang;
    if (stored === "my" || stored === "en") {
      setLocaleState(stored);
    }
    setIsHydrated(true); // indicate that client-side match is now ready
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localizationStorage.setLocalizationMem({ lang: newLocale });
  };

  // Optionally delay rendering until hydration is complete
  if (!isHydrated) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within a LocaleProvider");
  return context;
};
