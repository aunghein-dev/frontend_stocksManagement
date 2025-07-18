"use client";
import { useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext";
import { getTranslations } from "../lib/getTranslation";

export function useTranslation() {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    getTranslations(locale).then(setMessages);
  }, [locale]);

  function t(key: string) {
    return messages[key] || key;
  }

  return { t, locale };
}
