import { useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext";
import { getTranslations } from "../lib/getTranslation";


export function useTranslation() {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    let isMounted = true;

    getTranslations(locale).then((msgs) => {
      if (isMounted) setMessages(msgs);
    });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  function t(key: string): string {
    if (!messages) return ""; 
    return messages[key] || key;
  }

  return { t, locale, isReady: !!messages };
}
