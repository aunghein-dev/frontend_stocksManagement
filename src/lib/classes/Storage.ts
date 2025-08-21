// Optional imperative helper that can coexist with the zustand store.
// Uses the SAME localStorage key, and can read either the plain object
// or the zustand-persisted object shape.

export type StorageInfo = {
  limitStorageKb: number;
  limitStorageTxt: string;
  longName: string;
};

// Keep this in sync with src/store/useStorage.ts
const STORAGE_KEY = "cloudstorage-doorpos.mm.com";

const DEFAULT_STORAGE: StorageInfo = {
  limitStorageKb: 512000,
  limitStorageTxt: "500 MB",
  longName: "Free Plan",
};

export default class StorageManager {
  private remember: StorageInfo = { ...DEFAULT_STORAGE };

  constructor() {
    this.loadStorage();
  }

  private saveStorage() {
    // Save plain object — zustand will overwrite its own structure anyway
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.remember));
  }

  private loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.remember = { ...DEFAULT_STORAGE };
        return;
      }

      const parsed = JSON.parse(raw);

      // Support zustand-persist shape: { state: { storage: StorageInfo }, version: number }
      if (parsed && typeof parsed === "object" && "state" in parsed && parsed.state?.storage) {
        this.remember = parsed.state.storage as StorageInfo;
        return;
      }

      // Support plain object shape directly saved by this class
      if (
        parsed &&
        typeof parsed === "object" &&
        "limitStorageKb" in parsed &&
        "limitStorageTxt" in parsed &&
        "longName" in parsed
      ) {
        this.remember = parsed as StorageInfo;
        return;
      }

      // Fallback
      this.remember = { ...DEFAULT_STORAGE };
    } catch {
      this.remember = { ...DEFAULT_STORAGE };
    }
  }

  getStorage(): StorageInfo {
    return this.remember;
  }

  setStorage(next: StorageInfo) {
    this.remember = next;
    this.saveStorage();
  }

  clearStorage() {
    this.remember = { ...DEFAULT_STORAGE };
    this.saveStorage();
  }
}
