"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import { useLocale } from "../context/LocaleContext";

// Language list with `as const` to infer literal types
const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "my", name: "မြန်မာ", flag: "🇲🇲" },
] as const;

// Infer types from LANGUAGES
type Language = typeof LANGUAGES[number];
type Locale = Language["code"];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale() as {
    locale: Locale;
    setLocale: (locale: Locale) => void;
  };

  const [open, setOpen] = useState(false);
  const listboxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        listboxRef.current &&
        !listboxRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Keyboard navigation on button
  const onButtonKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      const firstOption = listboxRef.current?.querySelector(
        '[role="option"]'
      ) as HTMLElement | null;
      firstOption?.focus();
    }
  }, []);

  // Keyboard navigation in listbox
  const onOptionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, index: number) => {
      const options = listboxRef.current?.querySelectorAll('[role="option"]');
      if (!options) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = options[(index + 1) % options.length] as HTMLElement;
        next.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev =
          options[(index - 1 + options.length) % options.length] as HTMLElement;
        prev.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const lang = LANGUAGES[index];
        if (lang.code !== locale) {
          setLocale(lang.code);
        }
        setOpen(false);
        buttonRef.current?.focus();
      }
    },
    [locale, setLocale]
  );

  // Select language on click
  function onSelect(langCode: Locale) {
    if (langCode !== locale) {
      setLocale(langCode);
    }
    setOpen(false);
    buttonRef.current?.focus();
  }

  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <div className="relative inline-block text-left">
        <button
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="language-switcher-label"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className="inline-flex items-center rounded-full border-[1px] border-gray-200 bg-white font-medium text-gray-700 hover:bg-gray-100 px-2 py-2 justify-center cursor-pointer"
      >
        <span className="text-3xl leading-none translate-y-[1px]"> {/* <--- Add translate-y for visual adjustment */}
          {currentLang.flag}
        </span>
      </button>

      {open && (
        <div
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`language-option-${locale}`}
          className="absolute -right-3 top-15 w-26 rounded-sm 
                    bg-gray-50 z-60 p-0 border-[0.5px] border-gray-300 shadow-md"
        >
          {LANGUAGES.map((lang, i) => {
            const active = lang.code === locale;
            return (
              <div
                id={`language-option-${lang.code}`}
                key={lang.code}
                role="option"
                tabIndex={0}
                aria-selected={active}
                onClick={() => onSelect(lang.code)}
                onKeyDown={(e) => onOptionKeyDown(e, i)}
                className={`cursor-pointer select-none 
                            rounded-[2px]
                            px-4 py-2 flex items-center space-x-1 text-sm  ${
                  active
                    ? "bg-blue-200 text-blue-600"
                    : "text-gray-900"
                }`}
              >
                <span className="text-lg leading-none mr-2">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
