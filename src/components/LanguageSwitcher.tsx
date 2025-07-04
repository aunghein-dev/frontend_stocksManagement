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
  { code: "en", name: "EN", flag: "🇬🇧" },
  { code: "my", name: "MM", flag: "🇲🇲" },
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
        className="inline-flex items-center pl-3 py-2.5 rounded-md border-[1px] border-gray-200 bg-white font-medium text-gray-700 hover:bg-gray-100 max-w-24 min-w-24 text-sm"
      >
        <span className="mr-2 text-xl leading-none">{currentLang.flag}</span>
        <span id="language-switcher-label">{currentLang.name}</span>
        <svg
          className="ml-2 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`language-option-${locale}`}
          className="absolute right-0 mt-1 w-24 rounded-sm 
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
                <span className="text-lg leading-none">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
