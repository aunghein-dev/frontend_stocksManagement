// src/lib/classes/LocalizationMem.ts

export interface LocalizationMemInterface {
  lang: string;
}

const LANG_KEY = "langsave-doorpos.mm.com";

class LocalizationMem {
  private lang: LocalizationMemInterface = {
    lang: "",
  };

  constructor() {
    this.loadLocalizationMem();
  }

  private saveLocalizationMem() {
    localStorage.setItem(LANG_KEY, JSON.stringify(this.lang));
  }

  private loadLocalizationMem() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.lang === "string") {
          this.lang = { lang: parsed.lang };
        }
      }
    } catch {
      this.lang = { lang: "" };
    }
  }

  getLocalizationMem(): LocalizationMemInterface {
    return this.lang;
  }

  setLocalizationMem(lang: LocalizationMemInterface) {
    this.lang = lang;
    this.saveLocalizationMem();
  }

  clearLocalizationMem() {
    this.lang = { lang: "" };
    this.saveLocalizationMem();
  }
}

export default LocalizationMem;
